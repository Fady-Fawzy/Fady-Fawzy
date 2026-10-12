// No production dependencies. Uses an existing Playwright installation.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5501';
const out = path.join(__dirname, '..', '.qa');
fs.mkdirSync(out, { recursive: true });
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    // Requests that would write to an external service must never escape QA.
    await context.route('**/*', route => {
      const request = route.request();
      if (request.url().startsWith(url)) return route.continue();
      if (/formspree|script.google|firestore.googleapis/.test(request.url())) return route.abort();
      if (/firebase.*compat/.test(request.url())) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await check('correct separate academic records', async () => {
      const education = await page.locator('#education').innerText();
      assert.match(education, /3\.88/); assert.match(education, /3\.94/);
      assert.match(education, /1st/); assert.match(education, /3rd/);
    });
    await check('pipeline explains a selected stage', async () => {
      await page.getByRole('button', { name: 'Serve', exact: true }).click();
      assert.match(await page.locator('#pipelineDetail').innerText(), /FastAPI/);
      await page.getByRole('button', { name: 'Preprocess', exact: true }).click();
      assert.match(await page.locator('#pipelineDetail').innerText(), /ColumnTransformer/);
    });
    await check('all six real certificates open with focus return and Escape', async () => {
      for (const id of ['atr', 'ml', 'python', 'fcc', 'depi', 'depi-leader']) {
        const trigger = page.locator('[data-credential="' + id + '"]');
        await trigger.click();
        await page.locator('#credentialDialog[open]').waitFor();
        await page.waitForFunction(() => document.getElementById('certificateImage').complete && document.getElementById('certificateImage').naturalWidth > 0);
        assert.ok(await page.locator('#certificateImage').evaluate(img => img.complete && img.naturalWidth > 0));
        assert.equal(await page.locator('#certificateVerify').isVisible(), ['ml', 'python', 'fcc'].includes(id));
        await page.keyboard.press('Escape');
        assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
      }
    });
    await check('project category filters work', async () => {
      await page.locator('[data-filter="embedded"]').click();
      assert.equal(await page.locator('[data-project]:visible').count(), 2);
      await page.locator('[data-filter="ai"]').click();
      assert.equal(await page.locator('[data-project]:visible').count(), 1);
      await page.locator('[data-filter="all"]').click();
      assert.equal(await page.locator('[data-project]:visible').count(), 7);
    });
    await check('terminal command input is inert text', async () => {
      await page.locator('body').click({ position: { x: 4, y: 4 } });
      await page.keyboard.type('terminal');
      await page.locator('#devTerminal[open]').waitFor();
      await page.locator('#termInput').fill('<img src=x onerror="window.__injected=1">');
      await page.locator('#termInput').press('Enter');
      assert.equal(await page.locator('#termOutput img').count(), 0);
      assert.match(await page.locator('#termOutput').innerText(), /<img/);
      await page.keyboard.press('Escape');
    });
    await check('theme persists through reload', async () => {
      await page.locator('#themeToggle').click();
      const theme = await page.locator('html').getAttribute('data-theme');
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    });
    await check('offline subscription feedback never claims a confirmed subscription', async () => {
      await page.locator('#newsletterEmail').fill('offline-qa@example.com');
      await page.locator('#newsletterForm button').click();
      await page.waitForFunction(() => document.getElementById('newsletterStatus').textContent.includes('device only'));
      assert.match(await page.locator('#newsletterStatus').innerText(), /No subscription was confirmed/);
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('subscribers'))), ['offline-qa@example.com']);
      await page.evaluate(() => localStorage.setItem('subscribers', '{bad json'));
      await page.locator('#newsletterForm button').click();
      await page.waitForFunction(() => document.getElementById('newsletterStatus').textContent.includes('wasn’t saved'));
      assert.equal(await page.locator('#newsletterForm button').isDisabled(), false);
    });
    await check('both themes fit all seven requested viewport widths', async () => {
      for (const theme of ['light', 'dark']) {
        await page.evaluate(t => document.documentElement.dataset.theme = t, theme);
        for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.locator('#credentials').scrollIntoViewIfNeeded();
          await page.waitForFunction(() => [...document.querySelectorAll('#credentialShelf img')].every(img => img.complete && img.naturalWidth > 0));
          await page.evaluate(() => window.scrollTo(0, 0));
          const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
          assert.ok(dimensions.scroll <= dimensions.width, theme + ' overflow at ' + width + ': ' + dimensions.scroll);
          await page.screenshot({ path: path.join(out, theme + '-' + width + '.png'), fullPage: true });
          if (width === 1440 || width === 390) await page.screenshot({ path: path.join(out, theme + '-' + width + '-opening.png') });
        }
      }
    });
    await check('no runtime exceptions', async () => assert.deepEqual(errors, []));
    await context.close();
    console.log(passed + ' browser checks passed. Screenshots: ' + out);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
