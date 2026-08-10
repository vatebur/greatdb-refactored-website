# GreatDB Website Refactor

> 练手项目 · 非官方 · 仅供学习交流

对 [万里开源 GreatDB](https://www.greatdb.com) 官网的一次前端重构实践，采用精确、克制的 **modern-minimal / Cobalt** 设计系统，纯静态实现。

## 预览

本地启动：

```bash
cd refactored-website
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000`

## 设计系统

- **主题** — Cobalt 冷色中性表面，支持浅色和深色模式
- **字体** — Space Grotesk（标题）/ Noto Sans SC（正文）/ JetBrains Mono（机器标签）
- **结构** — Split Studio 首页、Index-First 索引、Workbench 产品页、Long Document 内容页
- **交互** — 全站命令搜索、键盘导航、主题持久化、移动导航和明确的表单状态
- **响应式** — 从 320 px 到 1920 px 的连续布局，无页面级横向滚动

完整规范与跨工具令牌导出见 [`design.md`](design.md)，运行时令牌见 [`tokens.css`](tokens.css)。

## 技术栈

纯前端，无框架无构建工具：

- HTML5 / CSS3（OKLCH 自定义属性、Grid、原生 Dialog）
- 原生 JavaScript（命令搜索、主题、导航和表单状态）
- Node.js 脚本用于内容提取和页面批量生成

## 目录结构

```
├── index.html              # 首页
├── css/                    # 样式文件
│   ├── style.css           # 旧页面兼容层
│   └── hallmark.css        # 当前设计、布局、状态与响应式系统
├── tokens.css              # 主题、字体、间距与交互令牌
├── design.md               # 已锁定的设计系统与跨工具导出
├── js/
│   └── main.js             # 搜索、主题、导航、标签与表单交互
├── components/
│   └── page-template.html  # 页面模板（生成脚本使用）
├── scripts/                # 内容处理脚本
│   ├── extract-content.js  # 从旧站 HTML 提取内容 → JSON
│   ├── generate-pages.js   # 从 JSON + 模板批量生成页面
│   ├── generate-cases.js
│   ├── generate-solutions.js
│   ├── migrate-articles.js
│   └── apply-hallmark-shell.js # 为所有生成页应用共享站点外壳
├── extracted-content/      # 提取的 JSON 内容（406 个文件）
├── assets/                 # 图片、文档等静态资源
├── about/                  # 关于我们
├── products/               # 产品页
├── solutions/              # 解决方案
├── cases/                  # 客户案例
├── news/                   # 新闻动态
├── articles/               # 文章详情
├── community/              # 社区
├── downloads/              # 下载页
├── special/                # 专题页
└── trial.html              # 免费试用页
```

## 内容流水线

```bash
# 1. 从旧站提取内容
node scripts/extract-content.js

# 2. 批量生成页面
node scripts/generate-pages.js

# 3. 仅重新应用共享导航、页脚、字体与资源兜底
node scripts/apply-hallmark-shell.js
```

生成脚本会自动重新应用 Hallmark 站点外壳。生成的内容页不要手动编辑，通过脚本重新生成。

## 浏览器兼容

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- 不支持 IE

## 声明

本项目为个人学习练手项目，与万里开源（GreatDB）官方无关，不用于任何商业用途。网站内容版权归原作者所有。
