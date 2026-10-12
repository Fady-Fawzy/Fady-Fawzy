const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const fixture = require('./firebase-fixture.cjs');
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5501';
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => /firebase.*compat|firestore.googleapis|sweetalert2|formspree|script.google/.test(route.request().url()) ? route.abort() : route.continue());
    await context.addInitScript(fixture);
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await check('ML direction and completed ATR experience connect to six unique certificates', async () => {
      assert.match(await page.locator('#hero').innerText(), /Aspiring Machine Learning Engineer/);
      const ids = await page.locator('#credentialShelf article').evaluateAll(items => items.map(item => item.id));
      assert.equal(ids.length, 6);
      assert.equal(new Set(ids).size, 6);
      assert.equal(ids.filter(id => id === 'credential-depi').length, 1);
      assert.match(await page.locator('#ml-internship').innerText(), /Completed/);
      await page.locator('#ml-internship a[href="#credential-atr"]').click();
      await page.locator('[data-credential="atr"]').click();
      assert.match(await page.locator('#certificateTitle').innerText(), /Summer Internship/);
      assert.match(await page.locator('#certificateDate').innerText(), /1 September.*1 October 2026/);
      await page.keyboard.press('Escape');
      await page.locator('[data-credential="depi-leader"]').click();
      assert.match(await page.locator('#certificateTitle').innerText(), /Team Leader/);
      await page.keyboard.press('Escape');
    });
    await check('hero tool trail exposes four real Python evidence links', async () => {
      assert.equal(await page.locator('#evidenceTrail').count(), 1);
      assert.equal(await page.locator('#evidenceTrail a').count(), 4);
      assert.deepEqual(await page.locator('#evidenceTrail a').evaluateAll(links => links.map(link => link.getAttribute('href'))), ['#credential-python','#credential-fcc','#ml-internship','#project-churn']);
      assert.equal(await page.locator('#project-churn').getAttribute('data-evidence-match'), 'python');
    });
    await check('tool selection synchronizes hero and skills and supports keyboard arrows', async () => {
      await page.locator('#evidenceControls [data-trail="cpp"]').click();
      assert.equal(await page.locator('#skillsTrailControls [data-trail="cpp"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#evidenceTrail a').count(), 2);
      await page.locator('#evidenceControls [data-trail="cpp"]').press('ArrowRight');
      assert.equal(await page.locator('#evidenceControls [data-trail="powerbi"]').getAttribute('aria-pressed'), 'true');
      assert.match(await page.locator('#evidenceTrail').innerText(), /Power BI/);
    });
    await check('evidence links reveal a filtered project', async () => {
      await page.locator('#evidenceControls [data-trail="stm32"]').click();
      await page.locator('[data-filter="software"]').click();
      await page.locator('#evidenceTrail a').click();
      assert.equal(await page.locator('#project-nurse').isVisible(), true);
    });
    await check('archived evidence disappears after a cloud refresh', async () => {
      await page.evaluate(async () => { window.__cloud.projects.legacyNurse = { schemaVersion:2, canonicalId:'nurse', title:'Smart Nurse Robot', archived:true }; await window.PortfolioApp.refresh(); });
      assert.equal(await page.locator('#evidenceTrail a[href="#project-nurse"]').count(), 0);
      assert.match(await page.locator('#evidenceTrail').innerText(), /No visible evidence/);
    });
    await check('pipeline keyboard selection shows input, decision, and output', async () => {
      await page.getByRole('button', { name: 'Raw data', exact: true }).focus(); await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('#pipelineDetail').innerText(), /Input/); assert.match(await page.locator('#pipelineDetail').innerText(), /Decision/); assert.match(await page.locator('#pipelineDetail').innerText(), /Output/);
      assert.equal(await page.locator('[data-stage="1"]').getAttribute('aria-pressed'), 'true');
      await page.keyboard.press('End'); assert.match(await page.locator('#pipelineDetail').innerText(), /FastAPI/);
      assert.equal(await page.locator('.pipeline-sheet').getAttribute('data-stage-index'), '3');
    });
    await page.goto(url + '/portal_fady_9x2k.html');
    await page.locator('#adminEmail').fill('qa@example.com'); await page.locator('#adminPassword').fill('fixture'); await page.locator('#loginForm button').click();
    await page.locator('[data-tab="projects"]').click();
    await check('mobile uses genuine project records with dominant titles and explicit type/status', async () => {
      assert.equal(await page.locator('#projectRecords').count(), 1);
      for (const width of [430,390,360]) {
        await page.setViewportSize({ width, height: 844 });
        const record = page.locator('#projectRecords [data-record="churn"]'); await record.waitFor({ state: 'visible' });
        assert.match(await record.locator('h3').innerText(), /Customer Churn/);
        assert.match(await record.innerText(), /Default project/); assert.match(await record.innerText(), /Visible/);
        assert.ok(await record.locator('h3').evaluate(el => parseFloat(getComputedStyle(el).fontSize)) >= 16);
        for (const button of await record.locator('button').all()) assert.ok((await button.boundingBox()).height >= 44);
        const size = await record.boundingBox(); assert.ok(size.height < 250, 'Record too tall at ' + width);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    });
    await check('mobile archive and restore operate on the identified record', async () => {
      await page.locator('#projectRecords [data-record="nurse"] [data-remove]').click();
      await page.locator('#showArchived').check();
      const record = page.locator('#projectRecords [data-record="nurse"]'); await record.waitFor({ state:'visible' });
      assert.match(await record.innerText(), /Archived/); assert.match(await record.locator('h3').innerText(), /Smart Nurse Robot/);
      await record.locator('[data-restore]').click(); await page.waitForFunction(() => window.__cloud.projects.legacyNurse.archived === false);
      await page.waitForFunction(() => document.activeElement?.dataset.edit === 'nurse');
    });
    await check('custom project delete is differentiated and preserves default projects', async () => {
      const record = page.locator('#projectRecords [data-record="custom"]');
      assert.match(await record.innerText(), /Custom project/); assert.equal(await record.getByRole('button',{name:'Delete',exact:true}).isVisible(), true);
      await record.locator('[data-remove]').click(); await page.waitForFunction(()=>!window.__cloud.projects.custom);
      assert.ok(await page.evaluate(()=>window.__cloud.projects.legacyNurse));
    });
    await check('refined flows produce no runtime exceptions', async()=>assert.deepEqual(errors,[]));
    console.log(passed+' refinement checks passed.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
