const assert = require('node:assert/strict');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const fixture = require('./firebase-fixture.cjs');
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5504';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => /firebase.*compat|firestore.googleapis|formspree|script.google/.test(route.request().url()) ? route.abort() : route.continue());
    await context.addInitScript(fixture);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    assert.equal(await page.locator('#signalStudy').count(), 1, 'Opening has the interactive concept sketch');
    assert.match(await page.locator('#signalCaption').innerText(), /concept sketch/i);
    await page.locator('[data-lens="data"]').click();
    assert.equal(await page.locator('#signalStudy').getAttribute('data-view'), 'data');
    await page.locator('[data-lens="data"]').press('ArrowRight');
    assert.equal(await page.locator('[data-lens="model"]').getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('End');
    assert.equal(await page.locator('#signalStudy').getAttribute('data-view'), 'api');
    assert.match(await page.locator('#signalExplanation').innerText(), /fitted pipeline/i);
    await page.locator('#signalInspect').click();
    assert.equal(await page.locator('.pipeline-sheet').getAttribute('data-stage-index'), '3');
    await page.locator('[data-filter="software"]').click();
    await page.locator('#signalInspect').click();
    assert.equal(await page.locator('#project-churn').isVisible(), true);
    await page.evaluate(async () => {
      window.__cloud.projects.archivedChurn = { schemaVersion: 2, canonicalId: 'churn', title: 'Customer Churn Prediction System', archived: true };
      await window.PortfolioApp.refresh();
    });
    await page.locator('#signalInspect').click();
    assert.equal(new URL(page.url()).hash, '#projects', 'Archived project has a usable fallback');
    assert.deepEqual(errors, []);
    await context.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await noJS.newPage(); await fallback.goto(url);
    assert.equal(await fallback.locator('#signalControls').isVisible(), false);
    assert.equal(await fallback.locator('#signalInspect').isVisible(), true);
    assert.equal(await fallback.locator('#credentialShelf img').count(), 6);
    await noJS.close();
    console.log('PASS concept sketch: views, keyboard, real pipeline handoff, filtered/archived fallback, reduced-motion and no-JS');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
