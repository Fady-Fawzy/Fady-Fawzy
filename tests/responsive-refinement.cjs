// Actual public/admin browser states at every requested width, with isolated service writes.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require(require.resolve('playwright', { paths: [process.env.PLAYWRIGHT_MODULES || 'C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules', process.cwd()] }));
const fixture = require('./firebase-fixture.cjs');
const url = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5501';
const out = path.join(__dirname,'..','.qa','second-pass'); fs.mkdirSync(out,{recursive:true});
const widths = [1440,1280,1024,768,430,390,360];
const report = [];
async function settle(page) { await page.evaluate(async()=>{ document.body.offsetHeight; await Promise.allSettled(document.getAnimations().map(animation=>animation.finished)); }); }
async function setTheme(page,theme,button) { if (await page.locator('html').getAttribute('data-theme')!==theme) await page.locator(button).click(); await settle(page); }
async function audit(page, scope, caption) {
  const result = await page.evaluate(selector=>{
    const root = document.querySelector(selector);
    const bad = [];
    for (const el of root.querySelectorAll('h1,h2,h3,h4,label,button,a,img,summary')) {
      if (!el.getClientRects().length) continue;
      const rect=el.getBoundingClientRect();
      if (rect.left < -2 || rect.right > innerWidth+2) bad.push({element:el.tagName,text:el.textContent.trim().slice(0,80),left:rect.left,right:rect.right});
      if (/^H[1-4]$/.test(el.tagName) && el.scrollWidth>el.clientWidth+2) bad.push({element:el.tagName,text:el.textContent.trim().slice(0,80),clipped:true});
    }
    return { width:innerWidth,scroll:document.documentElement.scrollWidth,bad };
  },scope);
  assert.ok(result.scroll<=result.width,caption+' page overflow');
  assert.deepEqual(result.bad,[],caption+' clipped/off-screen content');
  return result;
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const publicContext=await browser.newContext({reducedMotion:'reduce'});
    await publicContext.route('**/*',route=>/firebase.*compat|firestore.googleapis|formspree|script.google/.test(route.request().url())?route.abort():route.continue());
    const page=await publicContext.newPage(); const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url); await page.locator('#credentials').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.querySelectorAll('#credentialShelf img')].every(img=>img.complete&&img.naturalWidth));
    for(const theme of ['light','dark']) for(const width of widths) {
      await page.setViewportSize({width,height:900}); await setTheme(page,theme,'#themeToggle');
      await page.evaluate(()=>scrollTo(0,0));
      await page.evaluate(()=>document.activeElement?.blur());
      const caption='public-'+theme+'-'+width;
      await audit(page,'body',caption);
      await page.screenshot({path:path.join(out,caption+'-full.png'),fullPage:true});
      await page.screenshot({path:path.join(out,caption+'-opening.png')});
      fs.writeFileSync(path.join(out,caption+'-bounds.json'),JSON.stringify(await page.evaluate(()=>Object.fromEntries(['hero','project-churn','project-nurse','about','education','experience','skills','credentials','contact'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return[id,{x:r.x,y:r.y+scrollY,width:r.width,height:r.height}]}))),null,2));
      for(const id of ['hero','project-churn','about','education','experience','skills','credentials','contact']) {
        await page.locator('#'+id).screenshot({path:path.join(out,caption+'-'+id+'.png')});
      }
      if(width<901) { await page.locator('#navToggle').click(); await audit(page,'#navbar',caption+' navigation'); await page.screenshot({path:path.join(out,caption+'-menu.png')}); await page.keyboard.press('Escape'); }
      await page.locator('[data-credential="depi"]').click(); await page.waitForFunction(()=>document.getElementById('certificateImage').complete&&document.getElementById('certificateImage').naturalWidth);
      await audit(page,'#credentialDialog',caption+' certificate viewer'); await page.screenshot({path:path.join(out,caption+'-viewer.png')}); await page.keyboard.press('Escape');
      await page.locator('body').click({position:{x:2,y:2}}); await page.keyboard.type('terminal'); await page.locator('#devTerminal[open]').waitFor();
      await page.locator('#termInput').fill('whoami'); await page.locator('#termInput').press('Enter');
      await audit(page,'#devTerminal',caption+' terminal'); await page.screenshot({path:path.join(out,caption+'-terminal.png')}); await page.keyboard.press('Escape');
      report.push({surface:'public',theme,width,result:'passed'}); console.log('PASS '+caption+' / sections, navigation, viewer, terminal');
    }
    const adminContext=await browser.newContext({reducedMotion:'reduce'});
    await adminContext.route('**/*',route=>/firebase.*compat|firestore.googleapis|sweetalert2/.test(route.request().url())?route.abort():route.continue());
    await adminContext.addInitScript(fixture);
    await adminContext.addInitScript(()=>{
      window.__cloud.projects.custom.title='QA custom project — a deliberately long record title to verify wrapping';
      window.__cloud.projects.archived={canonicalId:'alu',schemaVersion:2,title:'FPGA 2-Phase ALU Logic Design',archived:true};
    });
    const admin=await adminContext.newPage(); admin.on('pageerror',error=>errors.push(error.message));
    await admin.goto(url+'/portal_fady_9x2k.html');
    for(const width of widths) { await admin.setViewportSize({width,height:900}); await audit(admin,'#loginWrapper','login-'+width); await admin.screenshot({path:path.join(out,'admin-login-'+width+'.png')}); }
    await admin.locator('#adminEmail').fill('qa@example.com'); await admin.locator('#adminPassword').fill('fixture'); await admin.locator('#loginForm button').click();
    await admin.locator('#dashboardWrapper:not(.hide)').waitFor(); await admin.waitForFunction(()=>document.querySelector('#projectsTableBody').textContent.includes('Customer Churn'));
    await admin.locator('#showArchived').check();
    for(const theme of ['light','dark']) for(const width of widths) {
      await admin.setViewportSize({width,height:900}); await setTheme(admin,theme,'#adminTheme');
      await admin.locator('[data-tab="projects"]').click(); await admin.evaluate(()=>scrollTo(0,0));
      const caption='admin-'+theme+'-'+width;
      await audit(admin,'#dashboardWrapper',caption);
      const records=admin.locator(width<901?'#projectRecords [data-record]':'#projectsTableBody tr');
      assert.equal(await records.count(),8);
      assert.ok(await records.first().getByText('Customer Churn Prediction System',{exact:true}).isVisible());
      await admin.screenshot({path:path.join(out,caption+'-full.png'),fullPage:true}); await admin.screenshot({path:path.join(out,caption+'-opening.png')});
      await admin.locator('#addProjectBtn').click(); await audit(admin,'#projectFormContainer',caption+' project form'); await admin.locator('#projectFormContainer').screenshot({path:path.join(out,caption+'-project-form.png')}); await admin.locator('#cancelProjectBtn').click();
      for(const tab of ['stats','skills','subscribers']) { await admin.locator('[data-tab="'+tab+'"]').click(); await audit(admin,'#tab-'+tab,caption+' '+tab); await admin.locator('#tab-'+tab).screenshot({path:path.join(out,caption+'-'+tab+'.png')}); }
      report.push({surface:'admin',theme,width,result:'passed'}); console.log('PASS '+caption+' / inventory, forms, academic records, skills, subscribers');
    }
    assert.deepEqual(errors,[]); fs.writeFileSync(path.join(out,'matrix.json'),JSON.stringify(report,null,2));
    console.log(report.length+' public/admin viewport-theme combinations passed. No runtime exceptions.');
    await publicContext.close(); await adminContext.close();
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
