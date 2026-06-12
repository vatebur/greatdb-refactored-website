# GreatDB Website Refactor

> 练手项目 · 非官方 · 仅供学习交流

对 [万里开源 GreatDB](https://www.greatdb.com) 官网的一次前端重构实践，采用 **Tech-Brutalist** 设计风格，纯静态实现。

## 预览

本地启动：

```bash
cd refactored-website
python3 -m http.server 8000
```

浏览器打开 `http://localhost:8000`

## 设计风格

- **暗色主题** — 深色背景 `#0a0e14`，青色 `#00ffff` + 品红 `#ff00ff` 霓虹配色
- **字体** — Orbitron（标题）/ Noto Sans SC（正文）/ JetBrains Mono（代码）
- **交互动画** — 3D 数据立方体、卡片倾斜、视差滚动、数字计数
- **响应式** — 桌面 / 平板 / 手机三档适配

## 技术栈

纯前端，无框架无构建工具：

- HTML5 / CSS3（自定义属性、Grid、3D transform）
- 原生 JavaScript（Intersection Observer、requestAnimationFrame）
- Node.js 脚本用于内容提取和页面批量生成

## 目录结构

```
├── index.html              # 首页
├── css/                    # 样式文件
│   └── style.css           # 主样式（设计令牌、布局、动画、响应式）
├── js/
│   └── main.js             # 交互逻辑（计数动画、视差、3D 倾斜）
├── components/
│   └── page-template.html  # 页面模板（生成脚本使用）
├── scripts/                # 内容处理脚本
│   ├── extract-content.js  # 从旧站 HTML 提取内容 → JSON
│   ├── generate-pages.js   # 从 JSON + 模板批量生成页面
│   ├── generate-cases.js
│   ├── generate-solutions.js
│   └── migrate-articles.js
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
```

生成的页面不要手动编辑，通过脚本重新生成。

## 浏览器兼容

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- 不支持 IE

## 声明

本项目为个人学习练手项目，与万里开源（GreatDB）官方无关，不用于任何商业用途。网站内容版权归原作者所有。
