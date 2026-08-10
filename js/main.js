(() => {
  'use strict';

  const script = document.currentScript;
  const siteRoot = script ? new URL('../', script.src) : new URL('./', window.location.href);
  const routes = [
    ['首页', 'index.html', '概览'],
    ['产品', 'products/index.html', 'GreatDB 产品矩阵'],
    ['GreatDB 数据库', 'products/greatdb.html', '核心数据库产品'],
    ['GreatDB Cluster', 'products/cluster.html', '高可用集群'],
    ['GreatDB TDSQL', 'products/tdsql.html', '分布式数据库'],
    ['GreatDB MPP', 'products/mpp.html', '分析型数据库'],
    ['解决方案', 'solutions/index.html', '行业与场景方案'],
    ['客户案例', 'cases/index.html', '真实业务实践'],
    ['文章', 'articles/index.html', '新闻、观点与动态'],
    ['关于我们', 'about/index.html', '公司与团队'],
    ['社区', 'about/community.html', '开发者与生态'],
    ['下载中心', 'downloads/index.html', '产品资料与下载'],
    ['免费试用', 'trial.html', '提交试用需求']
  ];

  function resolve(relativePath) {
    return new URL(relativePath, siteRoot).href;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = button.querySelector('.theme-toggle__label');
      button.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      if (label) label.textContent = theme === 'dark' ? '浅' : '深';
    });
  }

  function initTheme() {
    const stored = localStorage.getItem('greatdb-theme');
    const initial = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('greatdb-theme', next);
      });
    });
  }

  function initNavigation() {
    const current = new URL(window.location.href).pathname.replace(/\/index\.html$/, '/');
    document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach((link) => {
      const target = new URL(link.href).pathname.replace(/\/index\.html$/, '/');
      if (target !== '/' && current.startsWith(target)) link.setAttribute('aria-current', 'page');
      if (target === '/' && current === '/') link.setAttribute('aria-current', 'page');
    });

    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-nav]');
    if (!toggle || !panel) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      panel.dataset.open = String(open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function createSearchDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'cmdk';
    dialog.id = 'site-search-dialog';
    dialog.setAttribute('aria-labelledby', 'site-search-title');
    dialog.innerHTML = `
      <div class="cmdk__panel">
        <div class="cmdk__header">
          <span class="cmdk__mark" aria-hidden="true">G/</span>
          <label class="sr-only" id="site-search-title" for="site-search-input">搜索全站</label>
          <input id="site-search-input" class="cmdk__input" type="search" autocomplete="off" placeholder="搜索产品、方案、案例与文章…">
          <button class="cmdk-close" type="button" data-search-close aria-label="关闭搜索">Esc</button>
        </div>
        <p class="cmdk__status" data-search-status aria-live="polite">输入关键词开始搜索</p>
        <div class="cmdk__results" data-search-results role="listbox" aria-label="搜索结果"></div>
        <div class="cmdk__footer"><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></div>
      </div>`;
    document.body.append(dialog);
    return dialog;
  }

  function initSearch() {
    const triggers = [...document.querySelectorAll('[data-search-trigger]')];
    if (!triggers.length) return;

    const dialog = document.getElementById('site-search-dialog') || createSearchDialog();
    const input = dialog.querySelector('.cmdk__input');
    const results = dialog.querySelector('[data-search-results]');
    const status = dialog.querySelector('[data-search-status]');
    const close = dialog.querySelector('[data-search-close]');
    let catalogue = routes.map(([title, path, description]) => ({ title, path, description, type: '页面' }));
    let articleRequest;
    let activeIndex = 0;
    let visible = [];
    let returnFocus;

    const loadArticles = () => {
      if (articleRequest) return articleRequest;
      status.textContent = '正在载入文章索引…';
      articleRequest = fetch(resolve('articles/data.json'))
        .then((response) => {
          if (!response.ok) throw new Error('Article index unavailable');
          return response.json();
        })
        .then((items) => {
          const articles = items.map((item) => ({
            title: item.title || '未命名文章',
            description: [item.category, item.date].filter(Boolean).join(' · '),
            type: '文章',
            path: `articles/${item.id}.html`
          }));
          catalogue = catalogue.concat(articles);
          status.textContent = '输入关键词开始搜索';
        })
        .catch(() => {
          status.textContent = '文章索引暂时不可用，仍可搜索主要页面。';
        });
      return articleRequest;
    };

    const render = (items) => {
      visible = items.slice(0, 12);
      activeIndex = Math.min(activeIndex, Math.max(visible.length - 1, 0));
      results.replaceChildren();
      visible.forEach((item, index) => {
        const link = document.createElement('a');
        link.className = 'cmdk__item';
        link.href = resolve(item.path);
        link.role = 'option';
        link.id = `site-search-result-${index}`;
        link.setAttribute('aria-selected', String(index === activeIndex));
        link.innerHTML = '<span class="cmdk__result-copy"><strong class="cmdk__item-title"></strong><small></small></span><span class="cmdk__item-kind"></span>';
        link.querySelector('strong').textContent = item.title;
        link.querySelector('small').textContent = item.description;
        link.querySelector('.cmdk__item-kind').textContent = item.type;
        link.addEventListener('pointermove', () => {
          activeIndex = index;
          updateActive();
        });
        results.append(link);
      });
      input.setAttribute('aria-activedescendant', visible.length ? `site-search-result-${activeIndex}` : '');
    };

    const updateActive = () => {
      results.querySelectorAll('.cmdk__item').forEach((item, index) => {
        item.setAttribute('aria-selected', String(index === activeIndex));
      });
      input.setAttribute('aria-activedescendant', visible.length ? `site-search-result-${activeIndex}` : '');
    };

    const search = () => {
      const query = input.value.trim().toLocaleLowerCase('zh-CN');
      if (!query) {
        status.textContent = '输入关键词开始搜索';
        render(catalogue.slice(0, 7));
        return;
      }
      const matches = catalogue.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('zh-CN').includes(query));
      status.textContent = matches.length ? `找到 ${matches.length} 个结果` : '没有找到结果，试试更短的关键词。';
      activeIndex = 0;
      render(matches);
    };

    let debounce;
    input.addEventListener('input', () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(search, 250);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' && visible.length) {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % visible.length;
        updateActive();
      }
      if (event.key === 'ArrowUp' && visible.length) {
        event.preventDefault();
        activeIndex = (activeIndex - 1 + visible.length) % visible.length;
        updateActive();
      }
      if (event.key === 'Enter' && visible[activeIndex]) {
        event.preventDefault();
        window.location.href = resolve(visible[activeIndex].path);
      }
    });

    const open = (trigger) => {
      returnFocus = trigger;
      dialog.showModal();
      document.body.classList.add('is-modal-open');
      input.value = '';
      render(catalogue.slice(0, 7));
      loadArticles().then(search);
      window.requestAnimationFrame(() => input.focus());
    };
    const closeDialog = () => dialog.close();

    triggers.forEach((trigger) => trigger.addEventListener('click', () => open(trigger)));
    close.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) closeDialog();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('is-modal-open');
      if (returnFocus) returnFocus.focus();
    });
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.open) closeDialog(); else open(triggers[0]);
      }
    });
  }

  function initProductTabs() {
    document.querySelectorAll('.products-section').forEach((section) => {
      const tabs = [...section.querySelectorAll('.product-tab[data-product]')];
      const panels = [...section.querySelectorAll('.product-panel[data-product]')];
      if (!tabs.length || !panels.length) return;
      tabs.forEach((tab) => {
        tab.setAttribute('role', 'tab');
        tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
        tab.addEventListener('click', () => {
          const id = tab.dataset.product;
          tabs.forEach((item) => {
            const active = item === tab;
            item.classList.toggle('active', active);
            item.setAttribute('aria-selected', String(active));
            item.tabIndex = active ? 0 : -1;
          });
          panels.forEach((panel) => {
            const active = panel.dataset.product === id;
            panel.classList.toggle('active', active);
            panel.hidden = !active;
          });
        });
      });
    });
  }

  function initTrialForm() {
    const form = document.querySelector('[data-trial-form]');
    if (!form) return;
    const status = form.querySelector('[data-form-status]');
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const helper = field.closest('.field')?.querySelector('.field-helper');
      if (helper) helper.dataset.defaultText = helper.textContent;

      const updateValidity = () => {
        const invalid = field.value.length > 0 && !field.validity.valid;
        const missing = field.required && field.value.length === 0;
        field.setAttribute('aria-invalid', String(invalid || missing));
        if (!helper) return;
        if (invalid || missing) {
          helper.dataset.tone = 'error';
          helper.textContent = field.validity.typeMismatch ? '请填写有效的邮箱地址。' : '此项为必填信息。';
        } else {
          delete helper.dataset.tone;
          helper.textContent = helper.dataset.defaultText;
        }
      };

      field.addEventListener('blur', updateValidity);
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') updateValidity();
      });
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = '请补全必填信息后再提交。';
        return;
      }
      if (status) status.textContent = '此学习版页面未连接申请后台。请通过官方渠道提交试用需求。';
    });
  }

  initTheme();
  initNavigation();
  initSearch();
  initProductTabs();
  initTrialForm();
})();
