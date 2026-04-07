#!/usr/bin/env node
/**
 * Migrate news + cases from backup site into unified articles system.
 * Output: refactored-website/articles/data.json + articles/{id}.html
 */

const fs = require('fs');
const path = require('path');

const BACKUP = '/root/greatdb/greatdb-website-backup/www.greatdb.com';
const OUT_DIR = path.join(__dirname, '../articles');
const NEWS_DIR = path.join(BACKUP, 'Home/news/news_1/id');
const CASES_DIR = path.join(BACKUP, 'cases_detail');

// News category mapping based on original cid structure
// cid/40 = 公司新闻, cid/41 = 行业前瞻, cid/52 = 解决方案
// We'll detect by content keywords since individual articles don't carry cid
const CASE_CATEGORY_MAP = {
  '金融': 'finance', '电信': 'telecom', '能源': 'energy', '政府': 'government'
};

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function extractNews(file) {
  const html = fs.readFileSync(file, 'utf8');
  const id = 'news-' + path.basename(file, '.html');

  const titleM = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const title = titleM ? stripHtml(titleM[1]) : '';

  const dateM = html.match(/(\d{4}\.\d{2}\.\d{2})/);
  const date = dateM ? dateM[1].replace(/\./g, '-') : '';

  // Extract main content: everything inside xq_l_l div
  const contentM = html.match(/class="xq_l_l">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="xq_r_r"/);
  const content = contentM ? contentM[1].trim() : '';

  // Extract summary (first non-empty paragraph text)
  const summaryM = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const summary = summaryM ? stripHtml(summaryM[1]).slice(0, 120) : '';

  return { id, type: 'news', category: 'news', title, date, summary, content, sourceFile: file };
}

function extractCase(file) {
  const html = fs.readFileSync(file, 'utf8');
  const id = 'case-' + path.basename(file, '.html');

  const titleM = html.match(/<title>(.*?)<\/title>/);
  const title = titleM ? titleM[1].trim() : '';

  // Category from breadcrumb: 典型案例 > 政府 > ...
  const catM = html.match(/典型案例.*?>\s*<a[^>]*>([^<]+)<\/a>/);
  const catZh = catM ? catM[1].trim() : '';
  const category = CASE_CATEGORY_MAP[catZh] || 'case';

  // Content: inside xq_r div
  const contentM = html.match(/class="xq_r">([\s\S]*?)<div class="footer"/);
  const content = contentM ? contentM[1].trim() : '';

  const summaryM = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const summary = summaryM ? stripHtml(summaryM[1]).slice(0, 120) : '';

  return { id, type: 'case', category, categoryZh: catZh, title, date: '', summary, content, sourceFile: file };
}

function generatePage(article) {
  const isCase = article.type === 'case';
  const backPath = '../';
  const categoryLabel = isCase
    ? ({ finance: '金融案例', telecom: '电信案例', energy: '能源案例', government: '政府案例' }[article.category] || '客户案例')
    : '公司新闻';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - 万里数据库 GreatDB</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${backPath}css/style.css">
    <link rel="stylesheet" href="${backPath}css/article.css">
</head>
<body>
    <div class="grid-overlay"></div>
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="${backPath}index.html" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:0.25rem;">
                    <span class="logo-bracket">[</span>
                    <span class="logo-text">GreatDB</span>
                    <span class="logo-bracket">]</span>
                    <span class="logo-cursor">_</span>
                </a>
            </div>
            <ul class="nav-menu">
                <li><a href="${backPath}products/index.html" data-text="产品">产品</a></li>
                <li><a href="${backPath}solutions/index.html" data-text="解决方案">解决方案</a></li>
                <li><a href="${backPath}cases/index.html" data-text="案例">案例</a></li>
                <li><a href="${backPath}about/index.html" data-text="关于">关于</a></li>
                <li><a href="https://greatsql.cn" target="_blank" data-text="社区">社区</a></li>
            </ul>
            <button class="theme-toggle" id="themeToggle" aria-label="切换主题">🌙</button>
            <a href="${backPath}trial.html" class="nav-cta">
                <span class="cta-text">免费试用</span>
                <span class="cta-arrow">→</span>
            </a>
        </div>
    </nav>

    <main class="article-main">
        <div class="article-container">
            <nav class="article-breadcrumb">
                <a href="${backPath}index.html">首页</a>
                <span>/</span>
                <a href="${backPath}articles/index.html">文章</a>
                <span>/</span>
                <span>${categoryLabel}</span>
            </nav>

            <article class="article-body">
                <header class="article-header">
                    <div class="article-meta">
                        <span class="article-category">${categoryLabel}</span>
                        ${article.date ? `<span class="article-date">${article.date}</span>` : ''}
                    </div>
                    <h1 class="article-title">${article.title}</h1>
                </header>
                <div class="article-content">
                    ${article.content}
                </div>
            </article>

            <div class="article-footer">
                <a href="${backPath}articles/index.html" class="btn btn-secondary">← 返回文章列表</a>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <div class="footer-logo">
                    <span class="logo-bracket">[</span><span class="logo-text">GreatDB</span><span class="logo-bracket">]</span>
                </div>
                <p class="footer-tagline">新一代分布式数据库系统</p>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h4>产品</h4>
                    <ul>
                        <li><a href="${backPath}products/centralized.html">安全数据库集中式</a></li>
                        <li><a href="${backPath}products/distributed.html">安全数据库分布式</a></li>
                        <li><a href="${backPath}products/management.html">数据库管理平台</a></li>
                        <li><a href="${backPath}products/migration.html">数据迁移服务平台</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>文章</h4>
                    <ul>
                        <li><a href="${backPath}articles/index.html">全部文章</a></li>
                        <li><a href="${backPath}articles/index.html?cat=news">公司新闻</a></li>
                        <li><a href="${backPath}articles/index.html?cat=case">客户案例</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>关于我们</h4>
                    <ul>
                        <li><a href="${backPath}about/index.html">公司介绍</a></li>
                        <li><a href="${backPath}about/careers.html">加入我们</a></li>
                        <li><a href="${backPath}about/partners.html">合作伙伴</a></li>
                        <li><a href="https://greatsql.cn" target="_blank">开源社区</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>联系方式</h4>
                    <ul>
                        <li>业务专线: 400-032-7868</li>
                        <li>简历投递: hr@greatdb.com</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2020 北京万里开源软件有限公司 | 京ICP备06057874号</p>
        </div>
    </footer>
    <script src="${backPath}js/main.js"></script>
</body>
</html>`;
}

// Main
fs.mkdirSync(OUT_DIR, { recursive: true });

const articles = [];

// Extract news
for (const file of fs.readdirSync(NEWS_DIR)) {
  if (!file.endsWith('.html')) continue;
  try {
    const a = extractNews(path.join(NEWS_DIR, file));
    if (a.title) articles.push(a);
  } catch (e) {
    console.warn('Skip news', file, e.message);
  }
}

// Extract cases
for (const file of fs.readdirSync(CASES_DIR)) {
  if (!file.endsWith('.html')) continue;
  try {
    const a = extractCase(path.join(CASES_DIR, file));
    if (a.title) articles.push(a);
  } catch (e) {
    console.warn('Skip case', file, e.message);
  }
}

// Sort by date desc
articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// Write index JSON (without full content to keep it small)
const index = articles.map(({ id, type, category, categoryZh, title, date, summary }) =>
  ({ id, type, category, categoryZh, title, date, summary })
);
fs.writeFileSync(path.join(OUT_DIR, 'data.json'), JSON.stringify(index, null, 2));

// Generate HTML pages
let generated = 0;
for (const article of articles) {
  const html = generatePage(article);
  fs.writeFileSync(path.join(OUT_DIR, article.id + '.html'), html);
  generated++;
}

console.log(`Done: ${generated} articles (${articles.filter(a=>a.type==='news').length} news, ${articles.filter(a=>a.type==='case').length} cases)`);
console.log(`Index: articles/data.json`);
