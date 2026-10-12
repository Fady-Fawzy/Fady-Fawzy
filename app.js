/* Public workbench. External records are rendered with DOM text nodes only. */
(function () {
  'use strict';
  const C = window.PortfolioContent;
  if (!C) return; // The readable HTML remains available if a local script fails.
  const $ = id => document.getElementById(id);
  const el = (tag, value, className) => {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    if (className) node.className = className;
    return node;
  };
  const state = { projects: C.mergeProjects(), academic: C.mergeAcademic(), skills: C.mergeSkills(), filter: 'all', stage: 1 };
  const requestedTrail = new URL(location.href).searchParams.get('tool');
  state.trail = C.getEvidenceTrail(requestedTrail) ? requestedTrail : 'python';
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener('change', event => { if (event.matches) $('pipelineDetail')?.getAnimations().forEach(animation => animation.cancel()); });
  let db = null;
  let syncPromise = null;
  const categoryNames = { ai: 'AI & data', embedded: 'Embedded / hardware', software: 'Software / C++', design: 'Design / research' };
  function link(label, href, className = '') {
    const node = el('a', label, className);
    node.href = href;
    if (href.startsWith('https://')) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    return node;
  }
  function renderAcademic() {
    document.querySelectorAll('[data-academic]').forEach(node => {
      const [area, field] = node.dataset.academic.split('.');
      node.textContent = state.academic[area][field];
    });
  }
  function renderPipeline(article) {
    const group = article.querySelector('.pipeline-nodes');
    C.stages.forEach((stage, index) => {
      const button = el('button', undefined, 'pipeline-node');
      button.type = 'button'; button.dataset.stage = index;
      button.setAttribute('aria-pressed', String(index === state.stage));
      button.setAttribute('aria-controls', 'pipelineDetail');
      const port = el('span', String(index + 1).padStart(2, '0'), 'node-port');
      port.setAttribute('aria-hidden', 'true');
      button.append(port, el('span', stage.label, 'node-label'));
      group.append(button);
    });
    updatePipeline(article);
  }
  function updatePipeline(article = $('project-churn')) {
    if (!article) return;
    const stage = C.stages[state.stage];
    article.querySelectorAll('[data-stage]').forEach(button => {
      const index = Number(button.dataset.stage);
      button.setAttribute('aria-pressed', String(index === state.stage));
      button.dataset.traced = String(index <= state.stage);
    });
    article.querySelector('.pipeline-sheet').dataset.stageIndex = state.stage;
    article.querySelector('.pipeline-position').textContent = (state.stage + 1) + ' / ' + C.stages.length;
    const detail = article.querySelector('#pipelineDetail');
    if (detail) {
      const handoff = el('dl', undefined, 'pipeline-handoff');
      for (const [label, field] of [['Input','input'],['Decision','decision'],['Output','output']]) { const row = el('div'); row.append(el('dt', label), el('dd', stage[field])); handoff.append(row); }
      detail.replaceChildren(el('h4', stage.title), el('code', stage.code), handoff, el('p', stage.description, 'pipeline-context'));
      if (detail.isConnected && !motionPreference.matches && typeof detail.animate === 'function') {
        detail.getAnimations().forEach(animation => animation.cancel());
        detail.animate([{ opacity: .7 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
      }
    }
  }
  function renderSoftwareSketch(article, id) {
    const art = article.querySelector('.software-art');
    if (id === 'flowchart') {
      art.append(el('span', 'start', 'flow-node'), el('span', '→'), el('span', 'condition?', 'flow-node flow-decision'), el('span', '→'), el('span', 'C++', 'flow-node'));
    } else {
      const queue = el('div', undefined, 'queue-art');
      for (const name of ['dine-in', 'takeaway', 'delivery']) {
        const lane = el('div', undefined, 'queue-lane');
        lane.append(el('span', name, 'queue-label'));
        for (let i = 0; i < 4; i++) lane.append(el('span', undefined, 'queue-slot'));
        queue.append(lane);
      }
      art.append(queue);
    }
  }
  function renderProjects() {
    const openNotes = new Set([...document.querySelectorAll('[data-project] details[open]')].map(node => node.closest('[data-project]').dataset.project));
    const stageFocus = document.activeElement?.dataset.stage;
    const fragment = document.createDocumentFragment();
    for (const project of state.projects) {
      const featured = project.id === 'churn' || project.id === 'nurse';
      const software = project.id === 'flowchart' || project.id === 'restaurant';
      const template = $(featured ? project.id === 'churn' ? 'churnTemplate' : 'nurseTemplate' : software ? 'softwareTemplate' : 'entryTemplate');
      const article = el('article');
      article.dataset.project = project.id;
      article.dataset.category = project.category;
      article.id = 'project-' + project.id.replace(/[^a-zA-Z0-9_-]/g, '-');
      article.tabIndex = -1;
      article.className = featured ? 'project-feature ' + project.id + '-project' : software ? 'software-project' : 'project-entry';
      article.append(template.content.cloneNode(true));
      for (const field of ['title', 'description', 'year']) article.querySelector('[data-field="' + field + '"]').textContent = project[field];
      const category = article.querySelector('[data-field="category"]');
      if (category) category.textContent = categoryNames[project.category];
      article.querySelector('[data-field="tags"]').textContent = project.tags.join(' / ');
      const details = article.querySelector('[data-field="details"]');
      if (details) project.details.forEach(item => details.append(el('li', item)));
      const links = article.querySelector('[data-field="links"]');
      if (project.repoLink) links.append(link('View source ↗', project.repoLink));
      if (project.mediaLink) links.append(link('View project media ↗', project.mediaLink));
      if (!project.repoLink && !project.mediaLink) links.append(el('span', 'Source link not supplied', 'source-unavailable'));
      if (project.id === 'churn') renderPipeline(article);
      if (software) renderSoftwareSketch(article, project.id);
      const symbol = article.querySelector('.entry-symbol');
      if (symbol) symbol.textContent = { alu: '⊞', lampshade: '☼', sdg: '↗' }[project.id] || '{ }';
      if (openNotes.has(project.id)) article.querySelector('details')?.setAttribute('open', '');
      fragment.append(article);
    }
    $('projectList').replaceChildren(fragment);
    document.querySelectorAll('.sketch-outputs a').forEach(anchor => {
      if (!anchor.dataset.projectTarget) anchor.dataset.projectTarget = anchor.getAttribute('href');
      anchor.href = document.querySelector(anchor.dataset.projectTarget) ? anchor.dataset.projectTarget : '#projects';
    });
    applyFilter();
    if (stageFocus !== undefined) $('project-churn')?.querySelector('[data-stage="' + stageFocus + '"]')?.focus({ preventScroll: true });
  }
  function applyFilter() {
    let visible = 0;
    document.querySelectorAll('[data-project]').forEach(article => {
      article.hidden = state.filter !== 'all' && article.dataset.category !== state.filter;
      if (!article.hidden) visible++;
    });
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    $('projectCount').textContent = state.filter === 'all' ? state.projects.length + ' projects' : visible + ' of ' + state.projects.length + ' projects';
    $('projectEmpty').hidden = visible !== 0;
  }
  $('projects').addEventListener('click', event => {
    const filter = event.target.closest('[data-filter]');
    if (filter) { state.filter = filter.dataset.filter; applyFilter(); }
    const stage = event.target.closest('[data-stage]');
    if (stage) { state.stage = Number(stage.dataset.stage); updatePipeline(); }
  });
  $('projects').addEventListener('keydown', event => {
    const button = event.target.closest('[data-stage]');
    if (!button || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    state.stage = event.key === 'Home' ? 0 : event.key === 'End' ? C.stages.length - 1 : (Number(button.dataset.stage) + (event.key === 'ArrowRight' ? 1 : -1) + C.stages.length) % C.stages.length;
    updatePipeline(); $('project-churn').querySelector('[data-stage="' + state.stage + '"]').focus();
  });
  function renderExperience() {
    const fragment = document.createDocumentFragment();
    C.experience.forEach(item => {
      const article = el('article', undefined, 'experience-entry'); article.id = item.id; article.tabIndex = -1;
      const meta = el('div', undefined, 'experience-meta');
      meta.append(el('p', item.period, 'experience-period'), el('p', item.location, 'experience-location'));
      const body = el('div');
      body.append(el('h3', item.role), el('p', item.company, 'experience-company'));
      const details = el('ul'); item.details.forEach(detail => details.append(el('li', detail)));
      body.append(details); article.append(meta, body); fragment.append(article);
      if (item.credentialId && C.credentials.some(credential => credential.id === item.credentialId)) body.append(link('See the certificate ↗', '#credential-' + item.credentialId, 'experience-proof'));
    });
    $('experienceList').replaceChildren(fragment);
  }
  function renderSkills() {
    const rows = [
      { title: 'AI & data', category: 'data', evidence: [['Churn pipeline', '#project-churn'], ['ML internship', '#ml-internship'], ['Python data analysis', '#credential-fcc']] },
      { title: 'Programming', category: 'languages', evidence: [['C++ in practice', '#project-flowchart'], ['Python foundations', '#credential-python']] },
      { title: 'Backend & embedded', category: 'embedded', evidence: [['FastAPI inference', '#project-churn'], ['STM32 from scratch', '#project-nurse']] },
      { title: 'Tools & workflow', category: 'tools', evidence: [['FPGA / ModelSim', '#project-alu'], ['Power BI / DEPI', '#credential-depi'], ['AutoCAD / industry', '#electrical-experience']] }
    ];
    const fragment = document.createDocumentFragment();
    const trace = el('div', undefined, 'skills-tracer');
    const lead = el('div'); lead.append(el('p', 'FOLLOW A TOOL', 'eyebrow'), el('h3', 'What’s behind the skill?'));
    const controls = el('div', undefined, 'evidence-controls'); controls.id = 'skillsTrailControls'; controls.setAttribute('role','group'); controls.setAttribute('aria-label','Choose a skill to see its evidence');
    const trail = el('div', undefined, 'evidence-trail'); trail.id = 'skillsTrailDetail';
    trace.append(lead, controls, trail); fragment.append(trace);
    rows.forEach(row => {
      const article = el('article', undefined, 'skill-evidence-row');
      const evidence = el('div', undefined, 'skill-evidence-links'); evidence.append(el('span', 'SEEN IN THE WORK'));
      row.evidence.forEach(([label, href]) => {
        // Archived projects must not leave broken evidence links behind.
        if (href.startsWith('#project-') && !document.querySelector(href)) return;
        evidence.append(link(label, href));
      });
      article.append(el('h3', row.title), el('p', state.skills[row.category].join(' · '), 'skill-inventory'), evidence);
      fragment.append(article);
    });
    fragment.append(el('p', 'Working with people: ' + state.skills.soft.join(' · ') + '.', 'skill-footnote'));
    $('skillsEvidence').replaceChildren(fragment);
    renderTrailControls(); renderEvidence();
  }
  function renderTrailControls() {
    for (const id of ['evidenceControls','skillsTrailControls']) {
      const group = $(id); if (!group) continue;
      group.replaceChildren(...C.evidenceTrails.map(trail => {
        const button = el('button', trail.label, 'trail-button'); button.type = 'button'; button.dataset.trail = trail.id;
        button.setAttribute('aria-controls', id === 'evidenceControls' ? 'evidenceTrail' : 'skillsTrailDetail');
        return button;
      }));
    }
  }
  function renderEvidence(announce = false) {
    const trail = C.getEvidenceTrail(state.trail, state.projects);
    document.querySelectorAll('[data-trail]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.trail === state.trail)));
    document.querySelectorAll('[data-evidence-match]').forEach(artifact => artifact.removeAttribute('data-evidence-match'));
    for (const id of ['evidenceTrail','skillsTrailDetail']) {
      const panel = $(id); if (!panel) continue;
      const heading = el('p', trail.label + ': ' + trail.summary, 'trail-summary');
      const list = el('ol', undefined, 'trail-links');
      trail.items.forEach(item => {
        const row = el('li');
        const evidence = link(item.title, item.target); evidence.className = 'trail-evidence-link';
        evidence.prepend(el('span', { credential:'Learning', experience:'Fieldwork', project:'Build' }[item.kind], 'trail-kind'));
        row.append(evidence, el('p', item.detail, 'trail-detail')); list.append(row);
        document.getElementById(item.target.slice(1))?.setAttribute('data-evidence-match', trail.id);
      });
      panel.replaceChildren(heading, list);
      if (!trail.items.length) panel.append(el('p','No visible evidence for this tool. Choose another tool.','trail-empty'));
    }
    if (announce) $('evidenceStatus').textContent = trail.items.length + ' evidence ' + (trail.items.length === 1 ? 'item' : 'items') + ' connected to ' + trail.label + '.';
  }
  function selectTrail(id, focusGroup) {
    if (!C.getEvidenceTrail(id, state.projects)) return;
    state.trail = id; renderEvidence(true);
    const url = new URL(location.href); url.searchParams.set('tool', id); history.replaceState(null, '', url);
    if (focusGroup) focusGroup.querySelector('[data-trail="' + id + '"]')?.focus({ preventScroll:true });
  }
  document.addEventListener('click', event => { const button = event.target.closest('[data-trail]'); if (button) selectTrail(button.dataset.trail); });
  document.addEventListener('keydown', event => {
    const button = event.target.closest('[data-trail]'); if (!button || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); const index = C.evidenceTrails.findIndex(trail => trail.id === button.dataset.trail);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? C.evidenceTrails.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + C.evidenceTrails.length) % C.evidenceTrails.length;
    selectTrail(C.evidenceTrails[next].id, button.parentElement);
  });
  window.addEventListener('popstate', () => { const id = new URL(location.href).searchParams.get('tool'); state.trail = C.getEvidenceTrail(id) ? id : 'python'; renderEvidence(); });
  function renderCredentials() {
    const fragment = document.createDocumentFragment();
    C.credentials.forEach((credential, index) => {
      const article = el('article', undefined, 'credential'); article.id = 'credential-' + credential.id; article.tabIndex = -1;
      const button = el('button', undefined, 'certificate-trigger');
      button.type = 'button'; button.dataset.credential = credential.id;
      button.setAttribute('aria-label', 'Open certificate: ' + credential.title);
      button.setAttribute('aria-haspopup', 'dialog');
      button.style.setProperty('--ratio', credential.width + ' / ' + credential.height);
      const image = el('img'); image.src = credential.thumbnail; image.alt = credential.title + ' certificate awarded to Fady Fawzy';
      image.width = credential.width; image.height = credential.height; image.loading = 'lazy'; image.decoding = 'async';
      button.append(image); button.addEventListener('click', () => openCertificate(index));
      article.append(button, el('p', credential.issuer, 'eyebrow'), el('h3', credential.shortTitle), el('p', credential.date, 'credential-date'), el('p', credential.subject, 'credential-subject'));
      if (credential.verify) article.append(link('Verify with issuer ↗', credential.verify, 'credential-verify'));
      else article.append(el('p', 'Artwork available · no public verification link', 'credential-verify-note'));
      fragment.append(article);
    });
    $('credentialShelf').replaceChildren(fragment);
  }

  // Native dialogs handle tab trapping, Escape, and background inertness.
  const dialogTriggers = new WeakMap();
  function openDialog(dialog, focusTarget) {
    if (dialog.open || document.querySelector('dialog[open]')) return;
    dialogTriggers.set(dialog, document.activeElement);
    dialog.showModal(); focusTarget?.focus({ preventScroll: true });
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => dialogTriggers.get(dialog)?.focus({ preventScroll: true }));
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(control => control.getClientRects().length && !control.closest('[hidden]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  let certificateIndex = 0;
  function showCertificate(index) {
    certificateIndex = (index + C.credentials.length) % C.credentials.length;
    const credential = C.credentials[certificateIndex];
    $('certificateImage').src = credential.image;
    $('certificateImage').alt = credential.title + ' — original certificate artwork awarded to Fady Fawzy';
    $('certificateImage').width = credential.width; $('certificateImage').height = credential.height;
    $('certificateTitle').textContent = credential.title;
    $('certificateIssuer').textContent = credential.issuer;
    $('certificateIssuerNote').textContent = credential.issuerNote;
    $('certificateDate').textContent = credential.date;
    $('certificateSubject').textContent = credential.subject;
    $('certificatePosition').textContent = 'LEARNING EVIDENCE / ' + (certificateIndex + 1) + ' OF ' + C.credentials.length;
    $('certificateVerify').hidden = !credential.verify;
    $('certificateNoVerify').hidden = !!credential.verify;
    if (credential.verify) $('certificateVerify').href = credential.verify;
    else $('certificateVerify').removeAttribute('href');
    $('certificateOriginal').href = credential.original;
  }
  function openCertificate(index) { showCertificate(index); openDialog($('credentialDialog'), $('certificateClose')); }
  $('certificateClose').addEventListener('click', () => $('credentialDialog').close());
  $('certificatePrev').addEventListener('click', () => showCertificate(certificateIndex - 1));
  $('certificateNext').addEventListener('click', () => showCertificate(certificateIndex + 1));
  $('credentialDialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showCertificate(certificateIndex + (event.key === 'ArrowLeft' ? -1 : 1)); }
  });
  // A swipe is optional; visible Previous/Next buttons always remain available.
  let touchStart;
  $('certificateImage').addEventListener('touchstart', event => { touchStart = event.touches.length === 1 ? { x:event.touches[0].clientX, y:event.touches[0].clientY } : null; }, { passive: true });
  $('certificateImage').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const delta = event.changedTouches[0].clientX - touchStart.x, vertical = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(delta) > 65 && Math.abs(delta) > Math.abs(vertical)) showCertificate(certificateIndex + (delta < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  function updateTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('themeToggle').setAttribute('aria-pressed', String(dark));
    $('themeToggle').setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1c2825' : '#eeeee7';
  }
  $('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.add('theme-switching');
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', document.documentElement.dataset.theme); } catch { /* The theme still works without storage. */ }
    updateTheme();
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('theme-switching')));
  });
  updateTheme();
  function setMenu(open, returnFocus = false) {
    $('navLinks').classList.toggle('open', open);
    $('navToggle').setAttribute('aria-expanded', String(open));
    $('navToggle').lastElementChild.textContent = open ? '−' : '+';
    if (returnFocus) $('navToggle').focus();
  }
  $('navToggle').addEventListener('click', () => setMenu(!$('navLinks').classList.contains('open')));
  document.addEventListener('click', event => {
    if (!event.target.closest('#navbar')) setMenu(false);
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.getAttribute('href').slice(1));
    if (target?.matches('[data-project]') && target.hidden) { state.filter = 'all'; applyFilter(); }
    if (anchor.closest('#navLinks')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('navLinks').classList.contains('open')) setMenu(false, true);
  });
  const wideScreen = matchMedia('(min-width: 901px)');
  wideScreen.addEventListener('change', event => { if (event.matches) setMenu(false); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('#navLinks a').forEach(anchor => {
          if (anchor.getAttribute('href') === '#' + entry.target.id) anchor.setAttribute('aria-current', 'location');
          else anchor.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  }

  // Preserve the hidden terminal and helloworld, with safe text and modal focus.
  const terminal = $('devTerminal');
  function terminalLine(value, className) { $('termOutput').append(el('div', value, className)); $('termBody').scrollTop = $('termBody').scrollHeight; }
  function openTerminal() {
    if (document.querySelector('dialog[open]')) return;
    $('termOutput').replaceChildren();
    terminalLine('Fady’s workbench / developer notes\nType help for commands.');
    openDialog(terminal, $('termInput'));
  }
  $('termCloseBtn').addEventListener('click', () => terminal.close());
  $('terminalForm').addEventListener('submit', event => {
    event.preventDefault();
    const raw = $('termInput').value.trim(); const command = raw.toLowerCase();
    $('termInput').value = ''; if (!raw) return;
    terminalLine('fady:~$ ' + raw, 'command-history');
    switch (command) {
      case 'help': terminalLine('whoami   biography & separate academic records\nskills   current technical inventory\nprojects current project list\nclear    clear the output\nhire     contact details\nexit     close the terminal\nhelloworld a familiar first step'); break;
      case 'whoami': terminalLine(C.profile.name + '\n' + C.profile.focus + '\n' + C.profile.degree + ' @ Cairo University · Expected ' + C.profile.graduation + '\nComputer Engineering Department: ' + state.academic.department.rank + ' · GPA ' + state.academic.department.gpa + '\nPreparatory Engineering Year: ' + state.academic.preparatory.rank + ' · GPA ' + state.academic.preparatory.gpa); break;
      case 'skills': terminalLine(Object.entries(state.skills).map(([category, items]) => category + ': ' + items.join(', ')).join('\n')); break;
      case 'projects': terminalLine(state.projects.length + ' projects\n' + state.projects.map(p => p.title + ' (' + p.year + ')').join('\n')); break;
      case 'clear': $('termOutput').replaceChildren(); break;
      case 'hire': terminalLine('Email: ' + C.profile.email + '\nLinkedIn: ' + C.profile.linkedin); break;
      case 'exit': terminal.close(); break;
      case 'helloworld': terminal.close(); openDialog($('helloWorldDialog'), $('helloClose')); break;
      default: terminalLine('Command not found: ' + raw + '\nType help for available commands.');
    }
  });
  $('helloClose').addEventListener('click', () => $('helloWorldDialog').close());
  let sequence = '';
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (event.ctrlKey && event.key === '\\') { event.preventDefault(); openTerminal(); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
    sequence = (sequence + event.key.toLowerCase()).slice(-14);
    if (sequence.endsWith('fady') || sequence.endsWith('terminal')) { sequence = ''; openTerminal(); }
    if (sequence.endsWith('helloworld')) { sequence = ''; openDialog($('helloWorldDialog'), $('helloClose')); }
  });

  let toastTimer;
  $('copyEmail').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(C.profile.email); $('copyToast').textContent = 'Email copied'; }
    catch { $('copyToast').textContent = 'Select the email address to copy it.'; }
    $('copyToast').classList.add('visible'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('copyToast').classList.remove('visible'), 3000);
  });
  async function timed(promise, milliseconds = 8000) {
    let timeout;
    try { return await Promise.race([promise, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Request timed out')), milliseconds); })]); }
    finally { clearTimeout(timeout); }
  }
  function setFormStatus(id, message, error = false) { $(id).textContent = message; $(id).classList.toggle('error', error); }
  $('contactForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const original = button.textContent; button.disabled = true; button.textContent = 'Sending…';
    setFormStatus('contactStatus', 'Sending your message…');
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Message rejected');
      setFormStatus('contactStatus', 'Message sent. Thanks for the note.'); form.reset();
    } catch { setFormStatus('contactStatus', 'Message wasn’t sent. Your text is still here. Try again or use the email link.', true); }
    finally { clearTimeout(timeout); button.disabled = false; button.textContent = original; }
  });
  function saveSubscriberLocally(email) {
    try {
      const stored = JSON.parse(localStorage.getItem('subscribers') || '[]');
      const items = Array.isArray(stored) ? stored.filter(value => typeof value === 'string') : [];
      if (!items.includes(email)) items.push(email);
      localStorage.setItem('subscribers', JSON.stringify(items)); return true;
    } catch { return false; }
  }
  $('newsletterForm').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button');
    if (button.disabled) return;
    const email = $('newsletterEmail').value.trim(); button.disabled = true;
    setFormStatus('newsletterStatus', 'Sending subscription request…');
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12000);
    // Firestore confirmation is independent of the opaque Apps Script response.
    const firestoreRequest = db ? timed(db.collection('subscribers').add({ email, timestamp: window.firebase.firestore.FieldValue.serverTimestamp() })).then(() => true, () => false) : Promise.resolve(false);
    let transportSent = false;
    try {
      const response = await fetch(form.action, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ email }), signal: controller.signal });
      transportSent = response.ok || response.type === 'opaque';
    } catch { /* Feedback below distinguishes a send attempt from confirmation. */ }
    const cloudSaved = await firestoreRequest;
    clearTimeout(timeout); button.disabled = false;
    if (cloudSaved) { setFormStatus('newsletterStatus', 'Subscription saved.'); form.reset(); }
    else if (transportSent) { setFormStatus('newsletterStatus', 'Request sent; delivery could not be confirmed.'); }
    else {
      const saved = saveSubscriberLocally(email);
      setFormStatus('newsletterStatus', saved ? 'Saved on this device only. No subscription was confirmed; retry when connected.' : 'Subscription wasn’t saved. Please try again when connected.', true);
    }
  });

  function loadScript(src) {
    return timed(new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = src; script.async = true;
      script.onload = resolve; script.onerror = reject; document.head.append(script);
    }), 6000);
  }
  async function initializeFirebase() {
    if (typeof firebaseConfig === 'undefined' || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('PLACEHOLDER')) return false;
    try {
      if (!window.firebase) await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
      if (!window.firebase.firestore) await loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js');
      if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
      db = window.firebase.firestore(); return true;
    } catch { return false; }
  }
  async function syncPortfolioData() {
    if (syncPromise) return syncPromise;
    syncPromise = (async () => {
      if (!db && !await initializeFirebase()) return;
      const results = await Promise.allSettled([
        timed(db.collection('stats').doc('summary').get()),
        timed(db.collection('projects').get()),
        timed(db.collection('skills').get())
      ]);
      if (results[0].status === 'fulfilled' && results[0].value.exists) state.academic = C.mergeAcademic(results[0].value.data());
      if (results[1].status === 'fulfilled') state.projects = C.mergeProjects(results[1].value.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      if (results[2].status === 'fulfilled') state.skills = C.mergeSkills(results[2].value.docs.map(doc => doc.data()));
      renderAcademic(); renderProjects(); renderSkills();
    })().finally(() => { syncPromise = null; });
    return syncPromise;
  }
  renderAcademic(); renderProjects(); renderExperience(); renderCredentials(); renderSkills();
  // Useful for an owner reviewing content changes without a full reload.
  window.PortfolioApp = Object.freeze({ refresh: syncPortfolioData });
  syncPortfolioData();
})();
