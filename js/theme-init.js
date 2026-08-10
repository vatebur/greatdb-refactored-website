(() => {
  'use strict';

  let theme;
  try {
    const stored = localStorage.getItem('greatdb-theme');
    theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
