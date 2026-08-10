#!/usr/bin/env node

/**
 * Applies the shared Hallmark navigation, footer and font layer to generated HTML.
 * This script is intentionally idempotent so generators can call it after writing.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_AREAS = ['about', 'articles', 'cases', 'downloads', 'news', 'products', 'solutions', 'special'];
const FONT_URL = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;500;700;900&family=Space+Grotesk:wght@500;600;700&display=swap';
const LEGACY_LINKS = new Map([
  ['../product.html', '../products/index.html'],
  ['../product/cid/45.html', '../products/centralized.html'],
  ['../product/cid/2.html', '../products/distributed.html'],
  ['../product/cid/3.html', '../products/management.html'],
  ['../product/cid/47.html', '../products/migration.html'],
  ['../news/cid/52.html', '../solutions/index.html'],
  ['../case.html', '../cases/index.html'],
  ['../cases/8.html', '../cases/index.html?cat=finance'],
  ['../cases/9.html', '../cases/index.html?cat=telecom'],
  ['../cases/10.html', '../cases/index.html?cat=energy'],
  ['../cases/7.html', '../cases/index.html?cat=government'],
  ['../about.html', '../about/index.html'],
  ['../about/cid/44.html', '../about/index.html'],
  ['../career.html', '../about/careers.html'],
  ['../about/cid/46.html', '../about/careers.html'],
  ['../about/cid/38.html', '../about/reports.html'],
  ['../news/cid/40.html', '../articles/index.html?cat=news'],
  ['../news/cid/41.html', '../articles/index.html'],
  ['../about/cid/40.html', '../articles/index.html?cat=news'],
  ['../about/cid/41.html', '../articles/index.html'],
  ['../about/cid/37.html', '../about/compatibility.html'],
  ['../partner.html', '../about/partners.html'],
  ['../down.html', '../downloads/index.html'],
  ['../down/cid/49.html', '../downloads/index.html'],
  ['../down/cid/43.html', '../downloads/index.html'],
  ['../Home/mfsy/mfsy.html', '../trial.html']
]);

function shell(base) {
  return `    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <header class="nav">
        <nav class="nav-container" aria-label="主导航">
            <a class="nav-brand" href="${base}index.html" aria-label="GreatDB 首页">
                <span class="brand-mark" aria-hidden="true">G/</span>
                <span>GreatDB</span>
            </a>
            <button class="site-search-trigger" type="button" data-search-trigger aria-label="搜索全站">
                <span class="site-search-trigger__icon" aria-hidden="true"></span>
                <span class="site-search-trigger__text">搜索全站</span>
                <kbd aria-hidden="true">⌘K</kbd>
            </button>
            <ul class="nav-menu">
                <li><a href="${base}products/index.html">产品</a></li>
                <li><a href="${base}solutions/index.html">解决方案</a></li>
                <li><a href="${base}cases/index.html">案例</a></li>
                <li><a href="${base}articles/index.html">文章</a></li>
            </ul>
            <div class="nav-actions">
                <button class="theme-toggle" type="button" data-theme-toggle aria-label="切换到深色模式" aria-pressed="false"><span class="theme-toggle__label">深</span></button>
                <button class="nav-mobile-trigger" type="button" data-menu-toggle aria-controls="mobile-nav" aria-expanded="false"><span class="sr-only">打开导航</span></button>
                <a class="nav-cta" href="${base}trial.html">免费试用 <span aria-hidden="true">→</span></a>
            </div>
        </nav>
        <div class="mobile-nav" id="mobile-nav" data-mobile-nav aria-hidden="true">
            <div class="mobile-nav__inner">
                <a href="${base}products/index.html">产品</a>
                <a href="${base}solutions/index.html">解决方案</a>
                <a href="${base}cases/index.html">案例</a>
                <a href="${base}articles/index.html">文章</a>
                <a href="${base}about/index.html">关于</a>
                <a href="https://greatsql.cn" target="_blank" rel="noopener noreferrer">社区</a>
                <a href="${base}trial.html">免费试用</a>
            </div>
        </div>
    </header>`;
}

function footer(base) {
  return `    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <a class="footer-logo" href="${base}index.html"><span class="brand-mark" aria-hidden="true">G/</span><span>GreatDB</span></a>
                <p class="footer-tagline">面向关键业务的数据基础设施。金融级安全、高性能并发、自主可控。</p>
            </div>
            <nav class="footer-links-inline" aria-label="页脚导航">
                <a href="${base}products/index.html">产品</a>
                <a href="${base}solutions/index.html">解决方案</a>
                <a href="${base}cases/index.html">客户案例</a>
                <a href="${base}downloads/index.html">下载中心</a>
                <a href="${base}about/index.html">关于我们</a>
                <a href="https://greatsql.cn" target="_blank" rel="noopener noreferrer">GreatSQL 社区</a>
            </nav>
        </div>
        <div class="footer-bottom">
            <span>© 2020 北京万里开源软件有限公司</span>
            <span>非官方前端重构学习实践 · 业务专线 400-032-7868</span>
        </div>
    </footer>`;
}

function transform(html, base) {
  let next = html;
  next = next.replace(/content="width=device-width,\s*initial-scale=1(?:\.0)?"/, 'content="width=device-width, initial-scale=1, viewport-fit=cover"');
  next = next.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=[^"']+/, FONT_URL);
  next = next.replace(/\s*<meta http-equiv="X-Frame-Options"[^>]*>/gi, '');
  next = next.replace(/\s*<script>\s*\$\(function\(\)\s*\{[\s\S]*?<\/script>/gi, '');

  if (!/<link\s+rel="icon"/i.test(next)) {
    next = next.replace(/<\/head>/, '    <link rel="icon" href="data:,">\n</head>');
  }

  if (!next.includes('css/hallmark.css')) {
    next = next.replace(/<\/head>/, `    <link rel="stylesheet" href="${base}css/hallmark.css">\n</head>`);
  }

  const legacyNav = /\s*<nav class="nav">[\s\S]*?<\/nav>/;
  if (legacyNav.test(next)) next = next.replace(legacyNav, `\n${shell(base)}`);

  if (!/\bid="main-content"/.test(next)) {
    if (/<main\b/.test(next)) next = next.replace(/<main\b/, '<main id="main-content"');
    else if (/<section class="hero\b/.test(next)) next = next.replace(/<section class="hero\b/, '<section id="main-content" class="hero');
  }

  const footerStart = next.lastIndexOf('<footer class="footer">');
  if (footerStart !== -1) {
    const footerEnd = next.indexOf('</footer>', footerStart);
    const lineStart = next.lastIndexOf('\n', footerStart) + 1;
    const replaceStart = /^\s*$/.test(next.slice(lineStart, footerStart)) ? lineStart : footerStart;
    if (footerEnd !== -1) next = `${next.slice(0, replaceStart)}${footer(base)}${next.slice(footerEnd + 9)}`;
  }
  return next;
}

function localTarget(file, reference) {
  const clean = reference.split(/[?#]/)[0];
  if (!clean || /^(?:https?:|data:|blob:|javascript:|mailto:|tel:|#|\$|\{\{)/i.test(clean)) return null;
  return clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(path.dirname(file), clean);
}

function escapeText(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceMissingAssets(html, file) {
  let next = html;
  if (file.endsWith(path.join('special', 'mysql-57-eol.html'))) {
    next = next.replace(/\s*<style>[\s\S]*?<\/style>/gi, '');
    next = next.replace(/\s+style="[^"]*"/gi, '');
    next = next.replace(/\s+on(?:click|submit)="[^"]*"/gi, '');
  }

  next = next.replace(/href="([^"]+)"/gi, (attribute, reference) => {
    const replacement = LEGACY_LINKS.get(reference);
    return replacement ? `href="${replacement}"` : attribute;
  });

  next = next.replace(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi, (tag, source) => {
    const target = localTarget(file, source);
    if (!target || fs.existsSync(target)) return tag;
    const alt = tag.match(/\balt="([^"]*)"/i)?.[1]?.trim();
    const detail = alt ? ` · ${escapeText(alt)}` : '';
    return `<span class="missing-asset" role="note">原始图示未随学习版存档${detail}</span>`;
  });

  next = next.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (value, quote, source) => {
    const target = localTarget(file, source.trim());
    return target && !fs.existsSync(target) ? 'url("data:,")' : value;
  });
  return next;
}

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(location);
    return entry.isFile() && entry.name.endsWith('.html') ? [location] : [];
  });
}

function applyFile(file, base) {
  const before = fs.readFileSync(file, 'utf8');
  const transformed = transform(before, base);
  const after = base.includes('{{') ? transformed : replaceMissingAssets(transformed, file);
  if (after !== before) fs.writeFileSync(file, after);
  return after !== before;
}

function applyAll() {
  const rootFiles = ['index.html', 'trial.html'].map((name) => path.join(ROOT, name)).filter(fs.existsSync);
  const nestedFiles = PUBLIC_AREAS.flatMap((name) => {
    const directory = path.join(ROOT, name);
    return fs.existsSync(directory) ? collectHtml(directory) : [];
  });
  let changed = 0;
  rootFiles.forEach((file) => { if (applyFile(file, '')) changed += 1; });
  nestedFiles.forEach((file) => { if (applyFile(file, '../')) changed += 1; });

  const template = path.join(ROOT, 'components', 'page-template.html');
  if (fs.existsSync(template) && applyFile(template, '{{BASE_PATH}}')) changed += 1;
  return { changed, total: rootFiles.length + nestedFiles.length + (fs.existsSync(template) ? 1 : 0) };
}

if (require.main === module) {
  const result = applyAll();
  console.log(`Hallmark shell applied to ${result.changed}/${result.total} HTML files.`);
}

module.exports = { applyAll, transform };
