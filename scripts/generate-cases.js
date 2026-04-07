#!/usr/bin/env node
/**
 * Generate cases detail pages from backup site.
 */
const fs = require('fs');
const path = require('path');

const BACKUP = '/root/greatdb/greatdb-website-backup/www.greatdb.com/cases_detail';
const OUT_DIR = path.join(__dirname, '../cases');

const CATEGORIES = [
  { id: 'finance', label: '金融', cases: [
    { id: 4,   title: '全国股份制银行缴费平台系统项目' },
    { id: 587, title: '国有大型商业银行小机下移项目' },
    { id: 218, title: '工商银行MySQL数据库运维服务' },
    { id: 2,   title: '瑞银信订单交易系统' },
    { id: 3,   title: '深交所数据库运维项目' },
  ]},
  { id: 'telecom', label: '电信', cases: [
    { id: 588, title: '运营商SC开关机系统项目' },
    { id: 589, title: '运营商省公司统一接触库项目' },
    { id: 197, title: '运营商智慧中台西藏业务项目' },
    { id: 141, title: '四川移动客流分析系统' },
    { id: 6,   title: '中国移动经分系统' },
  ]},
  { id: 'energy', label: '能源', cases: [
    { id: 5,   title: '国有大型电网公司全业务数据中心项目' },
  ]},
  { id: 'government', label: '政府', cases: [
    { id: 142, title: '西藏自治区投资数据管理平台' },
    { id: 1,   title: '国家突发公共事件预警系统项目' },
    { id: 198, title: '省CA中心PKI/CA 应用系统项目' },
  ]},
];

const ALL_CASES = CATEGORIES.flatMap(c => c.cases.map(cs => ({ ...cs, catId: c.id, catLabel: c.label })));

function extractContent(id) {
  const file = path.join(BACKUP, `${id}.html`);
  if (!fs.existsSync(file)) return '';
  const html = fs.readFileSync(file, 'utf8');
  const idx = html.indexOf('class="al_dhx">');
  if (idx === -1) return '';
  const end = html.indexOf('<div class="footer">', idx);
  return html.slice(idx + 15, end > 0 ? end : idx + 30000).trim();
}

function sidebarLinks(currentId) {
  return CATEGORIES.map(cat => `
            <div class="sidebar-group">
                <div class="sidebar-group-label">${cat.label}</div>
                <ul class="solution-nav">
                    ${cat.cases.map(cs => `
                    <li class="${cs.id === currentId ? 'active' : ''}">
                        <a href="case-${cs.id}.html">${cs.title}</a>
                    </li>`).join('')}
                </ul>
            </div>`).join('');
}

function generateDetailPage(cs) {
  const content = extractContent(cs.id);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cs.title} - 万里数据库 GreatDB</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/article.css">
    <link rel="stylesheet" href="../css/solution.css">
    <link rel="stylesheet" href="../css/cases.css">
</head>
<body>
    <div class="grid-overlay"></div>
    <nav class="nav">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="../index.html" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:0.25rem;">
                    <span class="logo-bracket">[</span><span class="logo-text">GreatDB</span><span class="logo-bracket">]</span><span class="logo-cursor">_</span>
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
            <a href="../trial.html" class="nav-cta"><span class="cta-text">免费试用</span><span class="cta-arrow">→</span></a>
        </div>
    </nav>

    <main class="solution-main">
        <div class="solution-layout">
            <aside class="solution-sidebar">
                <div class="sidebar-label">客户案例</div>
                ${sidebarLinks(cs.id)}
            </aside>
            <div class="solution-content">
                <nav class="article-breadcrumb">
                    <a href="../index.html">首页</a><span>/</span>
                    <a href="index.html">客户案例</a><span>/</span>
                    <span>${cs.catLabel}</span><span>/</span>
                    <span>${cs.title}</span>
                </nav>
                <article class="article-body">
                    <header class="article-header">
                        <div class="article-meta">
                            <span class="article-category">${cs.catLabel}</span>
                        </div>
                        <h1 class="article-title">${cs.title}</h1>
                    </header>
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
                <div class="footer-logo"><span class="logo-bracket">[</span><span class="logo-text">GreatDB</span><span class="logo-bracket">]</span></div>
                <p class="footer-tagline">新一代分布式数据库系统</p>
            </div>
            <div class="footer-links">
                <div class="footer-column"><h4>产品</h4><ul>
                    <li><a href="../products/centralized.html">安全数据库集中式</a></li>
                    <li><a href="../products/distributed.html">安全数据库分布式</a></li>
                    <li><a href="../products/management.html">数据库管理平台</a></li>
                    <li><a href="../products/migration.html">数据迁移服务平台</a></li>
                </ul></div>
                <div class="footer-column"><h4>客户案例</h4><ul>
                    <li><a href="index.html?cat=finance">金融案例</a></li>
                    <li><a href="index.html?cat=telecom">电信案例</a></li>
                    <li><a href="index.html?cat=energy">能源案例</a></li>
                    <li><a href="index.html?cat=government">政府案例</a></li>
                </ul></div>
                <div class="footer-column"><h4>关于我们</h4><ul>
                    <li><a href="../about/index.html">公司介绍</a></li>
                    <li><a href="../about/careers.html">加入我们</a></li>
                    <li><a href="../about/partners.html">合作伙伴</a></li>
                    <li><a href="https://greatsql.cn" target="_blank">开源社区</a></li>
                </ul></div>
                <div class="footer-column"><h4>联系方式</h4><ul>
                    <li>业务专线: 400-032-7868</li>
                    <li>简历投递: hr@greatdb.com</li>
                </ul></div>
            </div>
        </div>
        <div class="footer-bottom"><p>© 2020 北京万里开源软件有限公司 | 京ICP备06057874号</p></div>
    </footer>
    <script src="../js/main.js"></script>
</body>
</html>`;
}

for (const cs of ALL_CASES) {
  fs.writeFileSync(path.join(OUT_DIR, `case-${cs.id}.html`), generateDetailPage(cs));
}
console.log(`Generated ${ALL_CASES.length} case detail pages`);
