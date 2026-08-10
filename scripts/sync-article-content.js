#!/usr/bin/env node

/**
 * Fill the local article pages with the corresponding content from greatdb.com.
 *
 * Usage:
 *   node scripts/sync-article-content.js
 *   node scripts/sync-article-content.js news-865 case-1
 *
 * The script intentionally keeps images remote, but makes relative URLs absolute.
 * It removes source-site scripts and presentation attributes so the content follows
 * the refactored website's article design in both light and dark themes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'articles');
const ARTICLE_ASSETS_DIR = path.join(ROOT, 'assets', 'articles');
const DATA_FILE = path.join(ARTICLES_DIR, 'data.json');
const SITE_ORIGIN = 'https://www.greatdb.com';
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;

// Four 2024 source pages still contain expired Toutiao signed URLs. These are
// byte-equivalent public copies from GreatDB's official Sohu account, in the
// same order as the images in each original article.
const IMAGE_FALLBACKS = {
    'news-361': [
        'https://c-csa.cn/u_file/fileUpload/2020-12/30/2020123089197.png',
        'https://c-csa.cn/u_file/fileUpload/2020-12/30/2020123025190.png'
    ],
    'news-387': [
        'https://p3.itc.cn/images03/20220922/ab6f69000d7e4d419b3aef8151d2f57f.png',
        'https://p9.itc.cn/images03/20220922/2b65173f7ea94eab8f935cea8aad449e.png'
    ],
    'news-820': [
        'https://q0.itc.cn/images01/20240930/ff02ff490ab3487e951a22f6f46a1ad9.jpeg',
        'https://q9.itc.cn/images01/20240930/0b09598daf66404a9a1df441d4afd379.jpeg',
        'https://q7.itc.cn/images01/20240930/941630f8c1124f4c8569460a3a964d52.png',
        'https://q0.itc.cn/images01/20240930/dbf879f9951b457a8c33f1367ab24994.png',
        'https://q4.itc.cn/images01/20240930/e35d4b88f4b94e01b616a5714f6dec86.png',
        'https://q9.itc.cn/images01/20240930/cb288f35b05a47ecaa71957241e247af.png'
    ],
    'news-830': [
        'https://q6.itc.cn/images01/20241031/e1c68489acd548ff8a0e976a961c6789.png',
        'https://q8.itc.cn/images01/20241031/d95590ec7c0447f697e393743ae6e035.png',
        'https://q0.itc.cn/images01/20241031/7f74dd05c81946558d45607555216538.jpeg',
        'https://q6.itc.cn/images01/20241031/e0c48852d3b549a98e6d6a4abd08c1a9.png',
        'https://q1.itc.cn/images01/20241031/66060c442917495f8e62f5456858d513.jpeg'
    ],
    'news-831': [
        'https://q9.itc.cn/images01/20241031/9351967f205e4b2ebc835c4be98430cc.png'
    ],
    'news-833': [
        'https://q7.itc.cn/images01/20241031/ef02305e4ae741c68a5de41a7fc96999.jpeg'
    ]
};

function articleUrl(article) {
    const numericId = article.id.replace(/^(news|case)-/, '');
    return article.type === 'case'
        ? `${SITE_ORIGIN}/cases_detail/${numericId}.html`
        : `${SITE_ORIGIN}/Home/news/news_1/id/${numericId}.html`;
}

function decodeEntities(value) {
    const entities = {
        amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '
    };

    return value
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function plainText(html) {
    return decodeEntities(html)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractNews(html) {
    const match = html.match(
        /<div\s+class=["']xq_l_l["'][^>]*>[\s\S]*?<b[^>]*>[^<]*<\/b>([\s\S]*?)<\/div>\s*<\/div>\s*<div\s+class=["']xq_r["']/i
    );
    return match?.[1]?.trim() || '';
}

function extractCase(html) {
    const match = html.match(
        /<div\s+class=["']al_dhx["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<script/i
    );
    return match?.[1]?.trim() || '';
}

function absoluteUrl(value) {
    value = decodeEntities(value);
    if (/^(?:data:|https?:|mailto:|tel:|#)/i.test(value)) {
        return value.replace(/^http:\/\/(?:www\.)?greatdb\.com/i, SITE_ORIGIN);
    }
    if (value.startsWith('//')) return `https:${value}`;
    if (value.startsWith('/')) return `${SITE_ORIGIN}${value}`;
    return value;
}

function imageExtension(url, contentType) {
    const queryFormat = new URL(url).searchParams.get('wx_fmt');
    const pathExtension = new URL(url).pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1];
    const typeExtensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/avif': 'avif',
        'image/bmp': 'bmp'
    };

    const candidate = queryFormat || pathExtension || typeExtensions[contentType?.split(';')[0]] || 'img';
    return candidate.toLowerCase().replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'img';
}

function sanitiseContent(sourceHtml) {
    let html = sourceHtml
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi, '')
        .replace(/\s(?:style|class|id|width|height|title)=("[^"]*"|'[^']*')/gi, '')
        .replace(/\son[a-z]+=("[^"]*"|'[^']*')/gi, '')
        .replace(/<(\/?)section\b[^>]*>/gi, '')
        .replace(/<\/?article\b[^>]*>/gi, '')
        .replace(/<(\/?)font\b[^>]*>/gi, '<$1span>')
        .replace(/\b(src|href)=("|')([^"']+)\2/gi, (_, attr, quote, value) =>
            `${attr}=${quote}${absoluteUrl(value.trim())}${quote}`
        )
        .replace(/<a\b(?![^>]*\brel=)([^>]*)\btarget=("|')_blank\2([^>]*)>/gi, '<a$1target="_blank" rel="noopener noreferrer"$3>')
        .replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>')
        .replace(/<p>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/p>/gi, '')
        .replace(/(?:\r?\n\s*){3,}/g, '\n\n')
        .trim();

    // Some source articles wrap block-level sections in paragraphs. Removing only
    // the empty wrapper pair prevents browsers from producing surprising nesting.
    html = html.replace(/<p>\s*(?=<(?:p|h[1-6]|div|table|ul|ol|blockquote)\b)/gi, '')
        .replace(/(<\/(?:p|h[1-6]|div|table|ul|ol|blockquote)>)\s*<\/p>/gi, '$1')
        .split(/\r?\n/)
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\t/g, '    ');

    return html;
}

async function fetchHtml(url) {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        try {
            const response = await fetch(url, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (compatible; GreatDBContentSync/1.0)',
                    accept: 'text/html,application/xhtml+xml'
                },
                signal: controller.signal
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            lastError = error;
            if (attempt < MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, attempt * 750));
            }
        } finally {
            clearTimeout(timeout);
        }
    }

    throw lastError;
}

async function fetchImage(url) {
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        try {
            const response = await fetch(url, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (compatible; GreatDBContentSync/1.0)',
                    accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8'
                },
                signal: controller.signal
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.startsWith('image/')) throw new Error(`unexpected content type ${contentType || 'unknown'}`);
            const data = Buffer.from(await response.arrayBuffer());
            if (!data.length) throw new Error('image response is empty');
            return { data, contentType };
        } catch (error) {
            lastError = error;
            if (attempt < MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, attempt * 750));
            }
        } finally {
            clearTimeout(timeout);
        }
    }

    throw lastError;
}

async function localiseImages(articleId, content) {
    const urls = [];
    const seen = new Set();
    const imagePattern = /<img\b[^>]*\bsrc=("|')([^"']+)\1[^>]*>/gi;

    for (const match of content.matchAll(imagePattern)) {
        const url = decodeEntities(match[2]).replace(/#.*$/, '');
        if (!/^https?:\/\//i.test(url) || seen.has(url)) continue;
        seen.add(url);
        urls.push(url);
    }

    if (!urls.length) return { content, imageCount: 0 };

    const outputDir = path.join(ARTICLE_ASSETS_DIR, articleId);
    const fallbackUrls = IMAGE_FALLBACKS[articleId] || [];
    const downloaded = await mapConcurrent(urls, async (url, index) => {
        let downloadUrl = url;
        let image;
        try {
            image = await fetchImage(downloadUrl);
        } catch (error) {
            if (!fallbackUrls[index]) throw error;
            downloadUrl = fallbackUrls[index];
            image = await fetchImage(downloadUrl);
        }
        const extension = imageExtension(downloadUrl, image.contentType);
        const filename = `image-${String(index + 1).padStart(3, '0')}.${extension}`;
        return { sourceUrl: url, filename, data: image.data };
    }, 4);

    fs.mkdirSync(outputDir, { recursive: true });
    let localContent = content;
    for (const image of downloaded) {
        const imageStem = image.filename.replace(/\.[^.]+$/, '');
        for (const existing of fs.readdirSync(outputDir)) {
            if (existing.startsWith(`${imageStem}.`) && existing !== image.filename) {
                fs.unlinkSync(path.join(outputDir, existing));
            }
        }
        fs.writeFileSync(path.join(outputDir, image.filename), image.data);
        const localUrl = `../assets/articles/${articleId}/${image.filename}`;
        localContent = localContent.split(image.sourceUrl).join(localUrl);
    }
    localContent = localContent.replace(
        /(\.\.\/assets\/articles\/[^"'#\s]+)#[^"'\s]*/g,
        '$1'
    );

    return { content: localContent, imageCount: downloaded.length };
}

async function mapConcurrent(items, worker, concurrency) {
    const results = new Array(items.length);
    let cursor = 0;

    async function run() {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            results[index] = await worker(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
    return results;
}

function injectContent(file, content) {
    const html = fs.readFileSync(file, 'utf8');
    const pattern = /(<div class="article-content">)[\s\S]*(\n\s*<\/div>\s*\n\s*<\/article>)/;
    if (!pattern.test(html)) throw new Error('article-content container not found');

    const indented = content
        .split('\n')
        .map(line => `                    ${line}`)
        .join('\n');
    const updated = html.replace(pattern, (_, opening, closing) =>
        `${opening}\n${indented}${closing}`
    );
    fs.writeFileSync(file, updated);
}

async function main() {
    const requestedIds = new Set(process.argv.slice(2));
    const allArticles = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const articles = requestedIds.size
        ? allArticles.filter(article => requestedIds.has(article.id))
        : allArticles;

    const unknownIds = [...requestedIds].filter(id => !allArticles.some(article => article.id === id));
    if (unknownIds.length) throw new Error(`Unknown article IDs: ${unknownIds.join(', ')}`);
    if (!articles.length) throw new Error('No articles selected');

    console.log(`Fetching ${articles.length} article(s) with concurrency ${CONCURRENCY}...`);

    const results = await mapConcurrent(articles, async article => {
        const url = articleUrl(article);
        try {
            const sourceHtml = await fetchHtml(url);
            const extracted = article.type === 'case' ? extractCase(sourceHtml) : extractNews(sourceHtml);
            const sanitised = sanitiseContent(extracted);
            const localised = await localiseImages(article.id, sanitised);
            const content = localised.content;
            const text = plainText(content);

            if (text.length < 10 && localised.imageCount === 0) {
                throw new Error('extracted content is empty or too short');
            }
            return { article, url, content, text, imageCount: localised.imageCount };
        } catch (error) {
            return { article, url, error };
        }
    }, CONCURRENCY);

    const failures = results.filter(result => result.error);
    if (failures.length) {
        for (const failure of failures) {
            console.error(`FAIL ${failure.article.id} ${failure.url}: ${failure.error.message}`);
        }
        throw new Error(`${failures.length} article(s) could not be fetched; no files were changed`);
    }

    const summaries = new Map();
    for (const result of results) {
        const file = path.join(ARTICLES_DIR, `${result.article.id}.html`);
        injectContent(file, result.content);
        summaries.set(result.article.id, (result.text || result.article.title).slice(0, 120));
        console.log(`OK   ${result.article.id} (${result.text.length} text characters, ${result.imageCount} images)`);
    }

    const updatedData = allArticles.map(article => summaries.has(article.id)
        ? { ...article, summary: summaries.get(article.id) }
        : article
    );
    updatedData.sort((left, right) => {
        const byDate = (right.date || '').localeCompare(left.date || '');
        if (byDate) return byDate;
        const leftId = Number(left.id.replace(/\D/g, ''));
        const rightId = Number(right.id.replace(/\D/g, ''));
        return rightId - leftId;
    });
    fs.writeFileSync(DATA_FILE, `${JSON.stringify(updatedData, null, 2)}\n`);

    console.log(`Updated ${results.length} article page(s) and articles/data.json.`);
}

main().catch(error => {
    console.error(`Content sync failed: ${error.message}`);
    process.exitCode = 1;
});
