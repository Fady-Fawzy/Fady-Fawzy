/* Existing Firebase auth/CRUD flows, with shared defaults and safe DOM rendering. */
(function () {
  'use strict';
  const C = window.PortfolioContent;
  const $ = id => document.getElementById(id);
  const node = (tag, value, className) => { const el = document.createElement(tag); if (value !== undefined) el.textContent = value; if (className) el.className = className; return el; };
  let db = null;
  let projects = new Map();
  let subscribers = [];
  let seeding = false;
  const skillInputs = { languages: 'skillsLanguages', data: 'skillsData', embedded: 'skillsEmbedded', tools: 'skillsTools', soft: 'skillsSoft' };
  function notice(title, text = '', icon = 'info') {
    if (window.Swal) return window.Swal.fire({ title, text, icon });
    window.alert(title + (text ? '\n' + text : '')); return Promise.resolve({});
  }
  async function confirm(title, text, action) {
    if (window.Swal) return (await window.Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonText: action, cancelButtonText: 'Cancel' })).isConfirmed;
    return window.confirm(title + '\n' + text);
  }
  const loginStatus = node('p', '', 'admin-status'); loginStatus.setAttribute('role', 'status'); $('loginForm').append(loginStatus);
  function rowMessage(tbody, columns, message) { const tr = node('tr'); const td = node('td', message); td.colSpan = columns; tr.append(td); tbody.replaceChildren(tr); }
  function cloudReady() { if (db && window.firebase?.auth().currentUser) return true; notice('Sign in required', 'A Firebase connection and signed-in account are required.'); return false; }
  async function formAction(form, action) {
    const button = form.querySelector('button[type="submit"]'); if (button.disabled) return;
    const original = [...button.childNodes].map(child => child.cloneNode(true)); button.disabled = true; button.textContent = 'Saving…';
    try { await action(); }
    catch { await notice('Save failed', 'The data was not saved. Check your connection and Firestore permissions.', 'error'); }
    finally { button.disabled = false; button.replaceChildren(...original); }
  }
  function displayAcademic(record) {
    const academic = C.mergeAcademic(record);
    $('statGPA').value = academic.department.gpa; $('statRank').value = academic.department.rank;
    $('statPrepGPA').value = academic.preparatory.gpa; $('statPrepRank').value = academic.preparatory.rank;
    $('statsStatus').textContent = record && record.schemaVersion !== 2 ? 'Legacy summary found. The public site uses current CV records until you explicitly save these separate academic standings.' : 'Separate academic records. The project count is calculated from the displayed inventory.';
  }
  function projectActions(project, titleId) {
    const actions = node('div', undefined, 'project-actions');
    actions.setAttribute('role','group'); actions.setAttribute('aria-label','Actions for ' + project.title);
    const add = (label, className, attribute) => {
      const button = node('button', label, 'action-badge ' + className); button.type = 'button'; button.dataset[attribute] = project.id; button.setAttribute('aria-describedby',titleId); actions.append(button);
    };
    if (project.archived) add('Restore','badge-edit','restore');
    else { add('Edit','badge-edit','edit'); add(C.canonicalId(project) ? 'Archive' : 'Delete','badge-delete','remove'); }
    return actions;
  }
  function focusProjectControl(id) {
    const controls = [...$('projectInventory').querySelectorAll('[data-edit]')].filter(button => button.getClientRects().length);
    (controls.find(button => button.dataset.edit === id) || controls[0] || $('addProjectBtn')).focus();
  }
  async function loadStatsData() {
    try { const doc = await db.collection('stats').doc('summary').get(); displayAcademic(doc.exists ? doc.data() : null); }
    catch { $('statsStatus').textContent = 'Could not read the cloud summary. Current CV defaults shown; no data has been changed.'; }
  }
  async function loadProjectsData() {
    try {
      const snapshot = await db.collection('projects').get();
      const records = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const displayed = C.mergeProjects(records); projects = new Map();
      const inventory = [...displayed];
      if ($('showArchived').checked) {
        for (const record of records.filter(item => item.schemaVersion === 2 && item.archived)) {
          const id = C.canonicalId(record);
          const base = C.projects.find(project => project.id === id);
          if (base) inventory.push({ ...C.normalizeProject(record, base), id, archived: true });
        }
      }
      const fragment = document.createDocumentFragment();
      const cards = document.createDocumentFragment();
      for (const project of inventory) {
        const matches = records.filter(record => (C.canonicalId(record) || record.id) === project.id);
        const stored = matches.find(record => record.schemaVersion === 2) || matches[0];
        projects.set(project.id, { ...project, docId: stored?.id || project.id, canonicalId: C.canonicalId(project) });
        const kind = C.canonicalId(project) ? 'Default project' : 'Custom project';
        const status = project.archived ? 'Archived' : 'Visible';
        const safeId = project.id.replace(/[^a-z0-9_-]/gi,'-');
        const tableTitleId = 'table-title-' + safeId, cardTitleId = 'record-title-' + safeId;
        const tr = node('tr');
        const titleCell = node('td', project.title, 'inventory-title'); titleCell.id = tableTitleId;
        const recordCell = node('td'); recordCell.append(node('span',kind,'record-kind'), node('span',status,'record-status'));
        const actionCell = node('td'); actionCell.append(projectActions(project,tableTitleId));
        tr.append(titleCell, node('td', project.category), node('td', project.year), recordCell, actionCell); fragment.append(tr);
        const item = node('li'); const card = node('article',undefined,'project-record'); card.dataset.record = project.id;
        const heading = node('h3',project.title); heading.id = cardTitleId;
        const meta = node('p',project.category + ' · ' + project.year,'record-meta');
        const info = node('div',undefined,'record-state'); info.append(node('span',kind,'record-kind'), node('span',status,'record-status'));
        card.append(heading,meta,info,projectActions(project,cardTitleId)); item.append(card); cards.append(item);
      }
      $('projectsTableBody').replaceChildren(fragment);
      $('projectRecords').replaceChildren(cards);
      if (!inventory.length) { rowMessage($('projectsTableBody'),5,'No projects in this view. Add a project or show archived projects.'); $('projectRecords').append(node('li','No projects in this view. Add a project or show archived projects.','inventory-empty')); }
      $('statCount').value = displayed.length;
    } catch { rowMessage($('projectsTableBody'), 5, 'Could not load projects. Check connection and permissions.'); $('projectRecords').replaceChildren(node('li','Could not load projects. Check connection and permissions.','inventory-empty')); }
  }
  async function loadSkillsData() {
    try { const snapshot = await db.collection('skills').get(); const inventory = C.mergeSkills(snapshot.docs.map(doc => doc.data())); Object.entries(skillInputs).forEach(([category, id]) => { $(id).value = inventory[category].join(', '); }); }
    catch { await notice('Skills unavailable', 'Could not read skills. Current defaults remain in the form.', 'warning'); }
  }
  async function loadSubscribersData() {
    try {
      const snapshot = await db.collection('subscribers').orderBy('timestamp', 'desc').get(); subscribers = [];
      const fragment = document.createDocumentFragment();
      snapshot.docs.forEach(doc => {
        const data = doc.data(); const email = C.text(data.email, 254);
        let date = 'Date unavailable';
        try { const value = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp?.seconds ? data.timestamp.seconds * 1000 : data.timestamp); if (!Number.isNaN(value.getTime())) date = value.toLocaleString(); } catch { /* Malformed dates are displayed honestly. */ }
        subscribers.push({ email, subscribedAt: date }); const tr = node('tr'); tr.append(node('td', email), node('td', date)); fragment.append(tr);
      });
      $('subscribersTableBody').replaceChildren(fragment);
      if (!subscribers.length) rowMessage($('subscribersTableBody'), 2, 'No subscribers in the cloud collection.');
    } catch { rowMessage($('subscribersTableBody'), 2, 'Could not read subscribers. Check connection and permissions.'); }
  }
  async function loadDashboard() { await Promise.allSettled([loadStatsData(), loadProjectsData(), loadSkillsData(), loadSubscribersData()]); }
  $('loginForm').addEventListener('submit', async event => {
    event.preventDefault(); if (!db) { loginStatus.textContent = 'Firebase is unavailable. Check the network and firebase-config.js.'; return; }
    const button = event.currentTarget.querySelector('button'); if (button.disabled) return;
    button.disabled = true; loginStatus.textContent = 'Signing in…';
    try { await window.firebase.auth().signInWithEmailAndPassword($('adminEmail').value.trim(), $('adminPassword').value); $('loginForm').reset(); loginStatus.textContent = ''; }
    catch { loginStatus.textContent = 'Sign-in failed. Check your details, connection, and authorized domain.'; }
    finally { button.disabled = false; }
  });
  $('logoutBtn').addEventListener('click', async () => {
    if (!db) return;
    try { await window.firebase.auth().signOut(); } catch { await notice('Sign-out failed', 'Check your connection and try again.', 'error'); }
  });
  document.querySelectorAll('.admin-tab-btn').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab-btn').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    document.querySelectorAll('.admin-panel-section').forEach(panel => panel.classList.toggle('active', panel.id === 'tab-' + button.dataset.tab));
  }));
  $('statsForm').addEventListener('submit', event => {
    event.preventDefault(); if (!cloudReady()) return;
    formAction(event.currentTarget, async () => {
      await db.collection('stats').doc('summary').set({ schemaVersion: 2, department: { gpa: Number($('statGPA').value).toFixed(2), rank: $('statRank').value.trim() }, preparatory: { gpa: Number($('statPrepGPA').value).toFixed(2), rank: $('statPrepRank').value.trim() } }, { merge: true });
      await loadStatsData(); await notice('Academic records saved', 'Both standings are now stored separately.', 'success');
    });
  });
  function openProject(project) {
    $('projectForm').reset(); $('projectId').value = project?.id || '';
    $('projectFormTitle').textContent = project ? 'Edit project' : 'Add project';
    $('projSubmitBtnText').textContent = project ? 'Save changes' : 'Save project';
    if (project) { $('projTitle').value = project.title; $('projDesc').value = project.description; $('projCategory').value = project.category; $('projYear').value = project.year; $('projIcon').value = project.icon || 'folder'; $('projRepo').value = project.repoLink; $('projMedia').value = project.mediaLink || ''; $('projTags').value = project.tags.join(', '); }
    $('projectFormContainer').classList.remove('hide'); $('projTitle').focus();
  }
  $('addProjectBtn').addEventListener('click', () => openProject());
  $('cancelProjectBtn').addEventListener('click', () => { $('projectFormContainer').classList.add('hide'); $('projectForm').reset(); $('addProjectBtn').focus(); });
  $('projectInventory').addEventListener('click', async event => {
    const restore = event.target.closest('[data-restore]');
    if (restore) {
      if (!cloudReady()) return;
      const project = projects.get(restore.dataset.restore); if (!project) return;
      restore.disabled = true;
      try { await db.collection('projects').doc(project.docId).set({ archived: false }, { merge: true }); await loadProjectsData(); $('inventoryStatus').textContent = project.title + ' restored.'; focusProjectControl(project.id); }
      catch { restore.disabled = false; await notice('Restore failed', 'Check connection and permissions.', 'error'); }
      return;
    }
    const edit = event.target.closest('[data-edit]'); if (edit) { openProject(projects.get(edit.dataset.edit)); return; }
    const remove = event.target.closest('[data-remove]'); if (!remove || !cloudReady()) return;
    const project = projects.get(remove.dataset.remove); if (!project) return;
    const canonical = !!project.canonicalId;
    if (!await confirm(canonical ? 'Archive this project?' : 'Delete this project?', canonical ? 'This hides “' + project.title + '” from the public site. A versioned archive record will preserve the data and prevent the CV fallback from restoring it.' : 'This permanently deletes “' + project.title + '” from Firestore. Export or copy any details you need first.', canonical ? 'Archive project' : 'Delete project')) return;
    remove.disabled = true;
    try {
      if (canonical) {
        const { id, ...currentContent } = C.normalizeProject(project);
        await db.collection('projects').doc(project.docId).set({ ...currentContent, schemaVersion: 2, canonicalId: project.canonicalId, archived: true }, { merge: true });
      }
      else await db.collection('projects').doc(project.docId).delete();
      await loadProjectsData();
      $('inventoryStatus').textContent = project.title + (canonical ? ' archived.' : ' deleted.');
      focusProjectControl();
    } catch { remove.disabled = false; await notice('Project unchanged', 'The operation failed. Check connection and permissions.', 'error'); }
  });
  $('showArchived').addEventListener('change', () => { if (db) loadProjectsData(); });
  function updateAdminTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('adminTheme').textContent = dark ? 'Use light theme' : 'Use dark theme';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1c2825' : '#eeeee7';
  }
  $('adminTheme').addEventListener('click', () => {
    document.documentElement.classList.add('theme-switching');
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', document.documentElement.dataset.theme); } catch { /* Theme still works without storage. */ }
    updateAdminTheme(); requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('theme-switching')));
  });
  updateAdminTheme();
  $('projectForm').addEventListener('submit', event => {
    event.preventDefault(); if (!cloudReady()) return;
    const repo = $('projRepo').value.trim(), media = $('projMedia').value.trim();
    if (repo && !C.repositoryURL(repo)) { notice('Repository URL needed', 'Use an HTTPS GitHub repository URL, not a profile or executable URL.', 'warning'); return; }
    if (media && !C.safeURL(media)) { notice('Media URL invalid', 'Use an HTTPS URL without embedded credentials.', 'warning'); return; }
    formAction(event.currentTarget, async () => {
      const current = projects.get($('projectId').value);
      const payload = { title: $('projTitle').value.trim(), description: $('projDesc').value.trim(), category: $('projCategory').value, year: $('projYear').value.trim(), icon: /^[a-z-]+$/.test($('projIcon').value) ? $('projIcon').value : 'folder', repoLink: repo, mediaLink: media, tags: C.list($('projTags').value.split(',')), schemaVersion: 2, archived: false };
      if (current?.canonicalId) payload.canonicalId = current.canonicalId;
      let savedId = current?.id;
      if (current) await db.collection('projects').doc(current.docId).set(payload, { merge: true });
      else { const saved = await db.collection('projects').add(payload); savedId = C.canonicalId(payload) || saved.id; }
      $('projectFormContainer').classList.add('hide'); $('projectForm').reset(); await loadProjectsData(); await notice('Project saved', '', 'success');
      $('inventoryStatus').textContent = payload.title + ' saved.'; focusProjectControl(savedId);
    });
  });
  $('skillsForm').addEventListener('submit', event => {
    event.preventDefault(); if (!cloudReady()) return;
    formAction(event.currentTarget, async () => {
      const batch = db.batch();
      Object.entries(skillInputs).forEach(([category, id]) => batch.set(db.collection('skills').doc(category), { category, schemaVersion: 2, list: C.list($(id).value.split(',')) }, { merge: true }));
      await batch.commit(); await notice('Skills saved', 'Updated all five categories.', 'success');
    });
  });
  $('exportSubscribersBtn').addEventListener('click', () => {
    if (!subscribers.length) { notice('Nothing to export', 'No subscriber records were loaded.'); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(subscribers, null, 2)], { type: 'application/json' }));
    const anchor = node('a'); anchor.href = url; anchor.download = 'Subscribers_' + new Date().toISOString().slice(0, 10) + '.json'; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('autoFillBtn').addEventListener('click', async () => {
    if (seeding || !cloudReady()) return;
    seeding = true; $('autoFillBtn').disabled = true;
    try {
      const [stats, skills, inventory] = await Promise.all([db.collection('stats').doc('summary').get(), db.collection('skills').get(), db.collection('projects').get()]);
      const plan = C.planSeed({ statsExists: stats.exists, skillIds: skills.docs.map(doc => doc.id), projects: inventory.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
      const entries = [];
      if (plan.stats) entries.push({ ref: db.collection('stats').doc('summary'), data: plan.stats });
      plan.skills.forEach(item => entries.push({ ref: db.collection('skills').doc(item.category), data: item }));
      plan.projects.forEach(item => { const { id, ...data } = item; entries.push({ ref: db.collection('projects').doc(id), data }); });
      if (!entries.length) { await notice('Defaults already present', 'No records were added, replaced, or deleted.'); return; }
      if (!await confirm('Add missing defaults?', 'Add ' + plan.projects.length + ' projects, ' + plan.skills.length + ' skill categories, and ' + (plan.stats ? '1 academic summary' : 'no academic summary') + '. Existing documents and matching legacy projects are left untouched. No records will be deleted or replaced.', 'Add missing defaults')) return;
      const added = await db.runTransaction(async transaction => {
        // Read every target before any writes, so concurrent owner edits are preserved.
        const existing = await Promise.all(entries.map(item => transaction.get(item.ref)));
        let count = 0;
        entries.forEach((item, index) => { if (!existing[index].exists) { transaction.set(item.ref, item.data); count++; } });
        return count;
      });
      await loadDashboard(); await notice('Missing defaults added', added + ' new records. Existing records were preserved.', 'success');
    } catch { await notice('Defaults could not be added', 'The transaction failed. No partial transaction writes were committed. Check connection and permissions.', 'error'); }
    finally { seeding = false; $('autoFillBtn').disabled = false; }
  });
  if (!C) { loginStatus.textContent = 'Shared content is missing. Check portfolio-content.js.'; return; }
  displayAcademic(); Object.entries(skillInputs).forEach(([category, id]) => { $(id).value = C.skills[category].join(', '); });
  try {
    if (typeof firebaseConfig === 'undefined' || !window.firebase || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PLACEHOLDER')) throw new Error('Unavailable');
    if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.firestore();
    window.firebase.auth().onAuthStateChanged(user => {
      $('loginWrapper').classList.toggle('hide', !!user); $('dashboardWrapper').classList.toggle('hide', !user);
      if (user) loadDashboard();
      else { projects.clear(); subscribers = []; $('adminPassword').value = ''; }
    });
  } catch { loginStatus.textContent = 'Firebase is unavailable. The dashboard requires a connection to its existing project.'; }
})();
