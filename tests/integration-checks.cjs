const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const installFixture = require('./firebase-fixture.cjs');
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5501';
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => /firebase.*compat|firestore.googleapis|sweetalert2|formspree|script.google/.test(route.request().url()) ? route.abort() : route.continue());
    await context.addInitScript(installFixture);
    const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => document.querySelectorAll('[data-project]').length === 8);
    await check('live-shaped legacy records cannot overwrite corrected CV facts', async () => {
      const academic = await page.locator('#education').innerText(); assert.match(academic, /3\.88/); assert.match(academic, /3\.94/); assert.doesNotMatch(academic, /3\.89/);
      assert.equal(await page.locator('[data-project]').count(), 8); assert.match(await page.locator('#project-nurse').innerText(), /Thumb-2/);
    });
    await check('cloud text/tags/links cannot execute markup', async () => {
      assert.equal(await page.locator('#projectList script, #projectList img, #projectList svg').count(), 0);
      assert.equal(await page.locator('#projectList a[href^="javascript:"]').count(), 0);
      assert.equal(await page.evaluate(() => window.__injected), undefined);
      assert.match(await page.locator('#project-custom').innerText(), /<img/);
    });
    await check('filters stay active after a cloud refresh inserts another project', async () => {
      await page.locator('[data-filter="software"]').click();
      await page.evaluate(async () => { window.__cloud.projects.extra = { title: 'Added after filtering', category: 'software', year: '2026', description: 'Custom owner project', tags: [] }; await window.PortfolioApp.refresh(); });
      assert.equal(await page.locator('[data-project]:visible').count(), 4);
      assert.equal(await page.locator('[data-filter="software"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#project-churn').isVisible(), false);
    });
    await check('one denied collection does not prevent other successful reads', async () => {
      await page.evaluate(async () => { window.__failCollections = ['stats']; window.__cloud.projects.extra.description = 'Refreshed despite denied stats'; await window.PortfolioApp.refresh(); });
      assert.match(await page.locator('#project-extra').innerText(), /Refreshed despite denied stats/);
    });
    await check('reduced motion removes all running animations', async () => {
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
      assert.deepEqual(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.constructor.name)), []);
    });
    await check('internal links resolve, including filtered project evidence', async () => {
      const broken = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.getAttribute('href').slice(1))).map(a => a.getAttribute('href')));
      assert.deepEqual(broken, []);
      await page.locator('.sketch-outputs a').first().click(); assert.equal(await page.locator('#project-churn').isVisible(), true);
    });
    await check('mobile navigation closes with Escape and restores focus', async () => {
      await page.setViewportSize({ width: 390, height: 844 }); await page.locator('#navToggle').click();
      assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('#navToggle').evaluate(el => document.activeElement === el), true);
    });
    await check('certificate navigation stays in the dialog and DEPI has no verification action', async () => {
      await page.locator('[data-credential="fcc"]').click(); await page.locator('#certificateNext').click();
      assert.match(await page.locator('#certificateTitle').innerText(), /Digital Egypt Pioneers/);
      assert.equal(await page.locator('#certificateVerify').isVisible(), false);
      for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => document.activeElement.closest('#credentialDialog'))); }
      await page.keyboard.press('Escape');
    });
    await check('failed contact requests preserve message and restore submit button', async () => {
      await page.locator('#name').fill('QA visitor'); await page.locator('#email').fill('qa@example.com'); await page.locator('#message').fill('This request is intercepted locally.');
      await page.locator('#contactForm button').click(); await page.waitForFunction(() => document.querySelector('#contactStatus').classList.contains('error'));
      assert.match(await page.locator('#contactStatus').innerText(), /wasn’t sent/); assert.equal(await page.locator('#message').inputValue(), 'This request is intercepted locally.');
      assert.equal(await page.locator('#contactForm button').isDisabled(), false);
    });
    await check('a confirmed contact response clears the form and announces success', async () => {
      await page.route('https://formspree.io/**', route => route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{"ok":true}' }));
      await page.locator('#contactForm button').click();
      await page.waitForFunction(() => document.getElementById('contactStatus').textContent.includes('Message sent'));
      assert.equal(await page.locator('#message').inputValue(), '');
      await page.unroute('https://formspree.io/**');
    });
    await check('newsletter confirmation requires an actual successful persistence result', async () => {
      await page.locator('#newsletterEmail').fill('local-qa@example.com'); await page.locator('#newsletterForm button').click();
      await page.waitForFunction(() => document.getElementById('newsletterStatus').textContent.includes('Subscription saved'));
      assert.ok(await page.evaluate(() => Object.values(window.__cloud.subscribers).some(item => item.email === 'local-qa@example.com')));
    });
    await page.goto(url + '/portal_fady_9x2k.html');
    await check('admin login flow loads safe project/subscriber text', async () => {
      await page.locator('#adminEmail').fill('qa@example.com'); await page.locator('#adminPassword').fill('local-fixture-password'); await page.locator('#loginForm button').click();
      await page.locator('#dashboardWrapper:not(.hide)').waitFor(); await page.waitForFunction(() => document.querySelector('#projectsTableBody').textContent.includes('Customer Churn'));
      assert.equal(await page.locator('#projectsTableBody img, #subscribersTableBody img').count(), 0); assert.equal(await page.evaluate(() => window.__injected), undefined);
      assert.equal(await page.locator('#statGPA').inputValue(), '3.88'); assert.equal(await page.locator('#statCount').inputValue(), '8');
    });
    await check('missing-only seed preserves existing records and is idempotent', async () => {
      await page.locator('#adminMaintenance summary').click();
      const before = await page.evaluate(() => ({ summary: window.__cloud.stats.summary, project: window.__cloud.projects.legacyNurse, languages: window.__cloud.skills.languages }));
      await page.locator('#autoFillBtn').click(); await page.waitForFunction(() => window.__cloud.projects.churn && !document.getElementById('autoFillBtn').disabled);
      const after = await page.evaluate(() => ({ summary: window.__cloud.stats.summary, project: window.__cloud.projects.legacyNurse, languages: window.__cloud.skills.languages })); assert.deepEqual(after, before);
      const inventory = await page.evaluate(() => JSON.stringify(window.__cloud)); await page.locator('#autoFillBtn').click(); await page.waitForFunction(() => !document.getElementById('autoFillBtn').disabled);
      assert.equal(await page.evaluate(() => JSON.stringify(window.__cloud)), inventory);
    });
    await check('subscriber export creates a real JSON download', async () => {
      await page.locator('[data-tab="subscribers"]').click();
      const downloadPromise = page.waitForEvent('download'); await page.locator('#exportSubscribersBtn').click(); const download = await downloadPromise;
      const filename = path.join(__dirname, '..', '.qa', 'subscriber-fixture.json'); await download.saveAs(filename);
      const exported = JSON.parse(require('node:fs').readFileSync(filename, 'utf8'));
      assert.equal(exported[0].email, '<img src=x onerror="window.__injected=3">');
      await page.locator('[data-tab="stats"]').click();
    });
    await check('admin academic saves store both records and omit a manual project count', async () => {
      await page.locator('#statPrepGPA').fill('3.95'); await page.locator('#statsForm button').click();
      await page.waitForFunction(() => window.__cloud.stats.summary.schemaVersion === 2);
      const summary = await page.evaluate(() => window.__cloud.stats.summary); assert.deepEqual(summary.department, { gpa: '3.88', rank: '1st' }); assert.deepEqual(summary.preparatory, { gpa: '3.95', rank: '3rd' });
    });
    await check('admin adds and edits a real project through the form', async () => {
      await page.locator('[data-tab="projects"]').click(); await page.locator('#addProjectBtn').click();
      await page.locator('#projTitle').fill('Local QA project'); await page.locator('#projDesc').fill('Saved only to the fixture'); await page.locator('#projCategory').selectOption('ai'); await page.locator('#projYear').fill('2026'); await page.locator('#projIcon').fill('cpu'); await page.locator('#projTags').fill('Python, Pandas');
      await page.locator('#projectForm button[type="submit"]').click(); await page.waitForFunction(() => document.querySelector('#projectsTableBody').textContent.includes('Local QA project'));
      const row = page.locator('#projectRecords [data-record]:visible, #projectsTableBody tr:visible').filter({ hasText: 'Local QA project' }); await row.getByRole('button', { name: 'Edit', exact: true }).click();
      assert.equal(await page.locator('#projectFormContainer').isVisible(), true);
      await page.locator('#projDesc').fill('Edited in the fixture'); await page.locator('#projectForm button[type="submit"]').click();
      await page.waitForFunction(() => Object.values(window.__cloud.projects).some(p => p.description === 'Edited in the fixture'));
    });
    await check('admin saves expanded skill categories', async () => {
      await page.locator('[data-tab="skills"]').click(); await page.locator('#skillsData').fill('Pandas, Scikit-learn'); await page.locator('#skillsForm button').click();
      await page.waitForFunction(() => window.__cloud.skills.data.schemaVersion === 2);
      assert.deepEqual(await page.evaluate(() => window.__cloud.skills.data.list), ['Pandas', 'Scikit-learn']);
    });
    await check('archive preserves canonical content while hiding it in public rendering', async () => {
      await page.locator('[data-tab="projects"]').click(); await page.locator('[data-remove="nurse"]:visible').click(); await page.waitForFunction(() => window.__cloud.projects.legacyNurse.archived === true);
      const saved = await page.evaluate(() => window.__cloud.projects.legacyNurse); assert.equal(saved.title, 'Smart Nurse Robot'); assert.equal(saved.canonicalId, 'nurse');
      assert.equal(await page.locator('[data-remove="nurse"]').count(), 0);
    });
    await check('an archived canonical project can be restored with its current content', async () => {
      assert.equal(await page.locator('#showArchived').count(), 1);
      await page.locator('#showArchived').check();
      await page.locator('[data-restore="nurse"]:visible').click();
      await page.waitForFunction(() => window.__cloud.projects.legacyNurse.archived === false);
      const restored = await page.evaluate(() => window.PortfolioContent.mergeProjects(Object.entries(window.__cloud.projects).map(([id, data]) => ({ ...data, id }))).find(p => p.id === 'nurse'));
      assert.match(restored.description, /Thumb-2/);
      assert.equal(await page.locator('#statCount').inputValue(), '9');
    });
    await check('admin remains usable at mobile width', async () => {
      const dimensions = await page.evaluate(() => ({ w: innerWidth, s: document.documentElement.scrollWidth })); assert.ok(dimensions.s <= dimensions.w);
      await page.screenshot({ path: path.join(__dirname, '..', '.qa', 'admin-mobile.png'), fullPage: true });
    });
    await check('admin logout hides the dashboard', async () => { await page.locator('#logoutBtn').click(); await page.locator('#loginWrapper:not(.hide)').waitFor(); assert.equal(await page.locator('#dashboardWrapper').isVisible(), false); });
    await check('integration flows produce no runtime exceptions', async () => assert.deepEqual(errors, []));
    await context.close(); console.log(passed + ' integration checks passed. All cloud writes stayed in the local fixture.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
