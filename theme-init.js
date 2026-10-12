// Runs before first paint. Preserve the existing localStorage preference.
(function () {
  try { document.documentElement.dataset.theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch { /* Storage can be unavailable in private contexts. */ }
})();
