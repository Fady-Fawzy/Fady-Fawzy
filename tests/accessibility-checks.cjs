// Targeted contrast/semantics checks; not a claim of complete WCAG conformance.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5501';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.route('**/*', route => /firebase.*compat|firestore.googleapis/.test(route.request().url()) ? route.abort() : route.continue());
    await page.goto(url); await page.locator('#credentials').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#credentialShelf img')].every(img => img.complete && img.naturalWidth));
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
      await page.evaluate(async () => { document.body.offsetHeight; await Promise.allSettled(document.getAnimations().map(animation => animation.finished)); });
      const issues = await page.evaluate(() => {
        const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
        const luminance = color => { const c = color.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126*c[0] + .7152*c[1] + .0722*c[2]; };
        const issues = [];
        for (const el of document.querySelectorAll('main *, header *, footer *')) {
          if (!el.getClientRects().length || ['STYLE','SCRIPT','TEMPLATE'].includes(el.tagName) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const style = getComputedStyle(el); let current = el, background;
          while (current) { const value = rgb(getComputedStyle(current).backgroundColor); if (value.length === 3 || value[3] === 1) { background = value; break; } current = current.parentElement; }
          if (!background) continue;
          const color = rgb(style.color); const a = luminance(color), b = luminance(background); const ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
          const large = parseFloat(style.fontSize) >= 24 || parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700;
          if (ratio < (large ? 3 : 4.5)) issues.push({ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 80), ratio: Number(ratio.toFixed(2)), color: style.color, background });
        }
        return issues;
      });
      assert.deepEqual(issues, [], theme + ' text contrast');
      for (const section of ['project-churn', 'project-nurse', 'credentials', 'contact']) {
        await page.locator('#' + section).scrollIntoViewIfNeeded();
        await page.locator('#' + section).screenshot({ path: path.join(__dirname, '..', '.qa', theme + '-' + section + '.png') });
      }
      await page.locator('[data-credential="ml"]').click();
      await page.waitForFunction(() => document.getElementById('certificateImage').complete && document.getElementById('certificateImage').naturalWidth);
      await page.evaluate(async () => { await Promise.allSettled(document.getAnimations().map(animation => animation.finished)); });
      await page.screenshot({ path: path.join(__dirname, '..', '.qa', theme + '-viewer.png') }); await page.keyboard.press('Escape');
      console.log('PASS visible text contrast / section screenshots: ' + theme);
    }
    const invalid = await page.evaluate(() => ({ images: [...document.querySelectorAll('main img')].filter(img => !img.alt).length, inputs: [...document.querySelectorAll('main input,main textarea')].filter(input => !input.labels?.length).length, internal: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.getAttribute('href').slice(1))).map(a => a.href) }));
    assert.deepEqual(invalid, { images: 0, inputs: 0, internal: [] });
    console.log('PASS image alternatives, form labels, and internal links');
    const local = await page.evaluate(() => [...new Set([...document.querySelectorAll('link[href],script[src],img[src],a[href]')].map(node => node.href || node.src).filter(value => value.startsWith(location.origin)))].filter(value => !value.includes('#')));
    for (const value of local) { const response = await page.request.get(value); assert.equal(response.status(), 200, value); }
    console.log('PASS local asset/link HTTP responses: ' + local.length);
    const blank = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await blank.newPage(); await fallback.goto(url);
    assert.equal(await fallback.locator('[data-project]').count(), 7);
    assert.equal(await fallback.locator('#credentialShelf img').count(), 6);
    assert.match(await fallback.locator('#education').innerText(), /3\.88/);
    assert.ok(await fallback.locator('#experienceList').innerText());
    console.log('PASS readable no-JavaScript content and credential artwork');
    await blank.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
