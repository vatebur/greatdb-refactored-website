#!/usr/bin/env node
/**
 * Generate solutions pages from backup site.
 * Output: solutions/solution-{id}.html + solutions/index.html updated
 */

const fs = require('fs');
const path = require('path');

const BACKUP = '/root/greatdb/greatdb-website-backup/www.greatdb.com/Home/news/solution_v/id';
const OUT_DIR = path.join(__dirname, '../solutions');

const SOLUTIONS = [
  { id: 592, title: 'GreatDB替代MySQL解决方案', summary: 'GreatDB完美合规替代MySQL，保持高度兼容性' },
  { id: 593, title: 'GreatDB替代Oracle解决方案', summary: 'GreatDB完成Oracle数据库国产化替代' },
  { id: 594, title: '数据库两地三中心解决方案', summary: '高可用灾备解决方案，完美解决各种场景下的灾备切换问题' },
  { id: 595, title: '数据库上云解决方案', summary: '万里GreatDTS迁移评估工具保证数据复制服务的在线迁移特性' },
  { id: 596, title: '多业务数据库整合解决方案', summary: '采用国产化分布式数据库对原来多业务系统的数据库整合' },
  { id: 276, title: '电力监控系统解决方案', summary: '聚焦"卡脖子"技术，加快推进自主研发和技术替代' },
  { id: 234, title: '国家突发事件预警系统', summary: '采用GreatDB分布式数据库支撑国家级预警信息发布管理平台建设' },
  { id: 128, title: '能源行业协同机制信息管理平台解决方案', summary: '实现"一个集群，多个业务库"的支撑目标，降本增效' },
];

function extractContent(id) {
  const file = path.join(BACKUP, `${id}.html`);
  if (!fs.existsSync(file)) return '';
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/class="al_dhx">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="xq_r_r"/);
  if (m) return m[1].trim();
  // fallback: grab from al_dhx to footer
  const idx = html.indexOf('al_dhx">');
  if (idx === -1) return '';
  const end = html.indexOf('<div class="footer">', idx);
  return html.slice(idx + 8, end > 0 ? end : idx + 8 + 20000).trim();
}

function navLinks(currentId) {
  return SOLUTIONS.map(s => `
                <li class="${s.id === currentId ? 'active' : ''}">
                    <a href="solution-${s.id}.html">${s.title}</a>
                </li>`).join('');
}

function generateDetailPage(sol) {
  const content = extractContent(sol.id);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sol.title} - 万里数据库 GreatDB</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/article.css">
    <link rel="stylesheet" href="../css/solution.css">
</head>
<body>
    <div class="grid-overlay"></div>
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="../index.html" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:0.25rem;">
                    <span class="logo-bracket">[</span>
                    <span class="logo-text">GreatDB</span>
                    <span class="logo-bracket">]</span>
                    <span class="logo-cursor">_</span>
                </a>
            </div>
            <ul class="nav-menu">
                <li><a href="../products/index.html" data-text="产品">产品</a></li>
                <li><a href="../solutions/index.html" data-text="解决方案">解决方案</a></li>
                <li><a href="../cases/index.html" data-text="案例">案例</a></li>
                <li><a href="../about/index.html" data-text="关于">关于</a></li>
                <li><a href="https://greatsql.cn" target="_blank" data-text="社区">社区</a></li>
            </ul>
            <button class="theme-toggle" id="themeToggle" aria-label="切换主题">🌙</button>
            <a href="../trial.html" class="nav-cta">
                <span class="cta-text">免费试用</span>
                <span class="cta-arrow">→</span>
            </a>
        </div>
    </nav>

    <main class="solution-main">
        <div class="solution-layout">
            <aside class="solution-sidebar">
                <div class="sidebar-label">解决方案</div>
                <ul class="solution-nav">
                    ${navLinks(sol.id)}
                </ul>
            </aside>
            <div class="solution-content">
                <nav class="article-breadcrumb">
                    <a href="../index.html">首页</a>
                    <span>/</span>
                    <a href="index.html">解决方案</a>
                    <span>/</span>
                    <span>${sol.title}</span>
                </nav>
                <article class="article-body">
                    <div class="article-content solution-article-content">
                        ${content}
                    </div>
                </article>
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
                        <li><a href="../products/centralized.html">安全数据库集中式</a></li>
                        <li><a href="../products/distributed.html">安全数据库分布式</a></li>
                        <li><a href="../products/management.html">数据库管理平台</a></li>
                        <li><a href="../products/migration.html">数据迁移服务平台</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>解决方案</h4>
                    <ul>
                        ${SOLUTIONS.slice(0,4).map(s => `<li><a href="solution-${s.id}.html">${s.title}</a></li>`).join('\n                        ')}
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>关于我们</h4>
                    <ul>
                        <li><a href="../about/index.html">公司介绍</a></li>
                        <li><a href="../about/careers.html">加入我们</a></li>
                        <li><a href="../about/partners.html">合作伙伴</a></li>
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
    <script src="../js/main.js"></script>
</body>
</html>`;
}

// Generate detail pages
for (const sol of SOLUTIONS) {
  fs.writeFileSync(path.join(OUT_DIR, `solution-${sol.id}.html`), generateDetailPage(sol));
}
console.log(`Generated ${SOLUTIONS.length} solution detail pages`);
require('./apply-hallmark-shell').applyAll();
