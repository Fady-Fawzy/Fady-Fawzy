/* Shared CV content and conservative adapters for the existing Firestore schema.
 * Browser: PortfolioContent. Node: require('./portfolio-content.js').
 * Version 2 denotes an explicit save in the updated admin portal.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortfolioContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const profile = {
    name: 'Fady Fawzy Youssef', location: 'Giza, Egypt',
    email: 'fady.fawzy2006@gmail.com', phone: '+201204788242',
    github: 'https://github.com/Fady-Fawzy',
    linkedin: 'https://www.linkedin.com/in/fady-fawzy-youssef/',
    university: 'Cairo University — Faculty of Engineering',
    degree: 'B.Sc. Computer Engineering', graduation: '2029',
    focus: 'Aspiring Machine Learning Engineer',
    academic: { department: { gpa: '3.88', rank: '1st' }, preparatory: { gpa: '3.94', rank: '3rd' } }
  };
  const projects = [
    { id: 'churn', title: 'Customer Churn Prediction System', category: 'ai', year: '2026', icon: 'activity',
      description: 'From commercial data to a usable prediction service. A production-oriented classification pipeline with one preprocessing path for training, single-customer prediction, and batch CSV inference.',
      tags: ['Python', 'Pandas', 'Scikit-learn', 'FastAPI'],
      repoLink: 'https://github.com/Fady-Fawzy/Customer-Churn-Prediction-System',
      details: ['ColumnTransformer keeps preprocessing inside the training pipeline to prevent data leakage.', 'Compared Logistic Regression, Decision Trees, and Random Forests with GridSearchCV.', 'Approximately 77% validation accuracy and 0.80 ROC-AUC; threshold tuning changes the classification trade-off.', 'FastAPI serves probabilistic churn-risk scores, batch CSV predictions, and interactive API documentation.'] },
    { id: 'nurse', title: 'Smart Nurse Robot', category: 'embedded', year: '2026', icon: 'cpu',
      description: 'A medical assistant built on STM32 in pure bare-metal ARM Thumb-2 Assembly. Every peripheral driver starts at the register level, without HAL or vendor libraries.',
      tags: ['STM32', 'ARM Thumb-2', 'Bare-metal'], repoLink: 'https://github.com/Fady-Fawzy/Nurse-Robot-',
      details: ['Custom I2C, SPI, UART, ADC, PWM, and external interrupt drivers.', 'Heart rate, SpO2, IV drop-rate, and pressure sensing with a TFT telemetry interface.', 'RFID authentication, Bluetooth status transmission, and ultrasonic navigation.'] },
    { id: 'flowchart', title: 'Flowchart Designer & Simulator', category: 'software', year: '2025', icon: 'git-branch',
      description: 'Draw an algorithm, validate its logic, run it, then generate C++. A modern C++ desktop application with modular connectors and an undo/redo history.',
      tags: ['C++', 'Simulation', 'Code generation'], repoLink: 'https://github.com/MrF0gg/PT-Project',
      details: ['Flowchart editing with copy/paste and undo/redo.', 'Modular block connectors, validation, simulation, and automatic C++ code generation.'] },
    { id: 'restaurant', title: 'Restaurant Management System', category: 'software', year: '2026', icon: 'coffee',
      description: 'An event-driven C++ simulation of a restaurant in motion. Custom data structures and scheduling algorithms assign dine-in, takeaway, and delivery orders to the right resources.',
      tags: ['C++', 'Data structures', 'Scheduling'], repoLink: 'https://github.com/FadyAshraf00/Restaurant-management-system',
      details: ['Models dine-in, takeaway, and delivery order cycles.', 'Dynamically assigns orders to chefs, tables, and delivery couriers.'] },
    { id: 'alu', title: 'FPGA 2-Phase ALU Logic Design', aliases: ['FPGA ALU Logic Design'], category: 'embedded', year: '2025', icon: 'zap',
      description: 'A Verilog HDL arithmetic and logic unit on the DE1-SoC FPGA. Arithmetic, logic, BCD-to-Excess-3 conversion, and registered outputs, verified in ModelSim.',
      tags: ['Verilog HDL', 'DE1-SoC', 'ModelSim'], repoLink: '', details: ['Two-phase logic design with registered outputs.', 'Designed, simulated, and synthesized for the FPGA board.'] },
    { id: 'lampshade', title: 'Sustainable Innovative Lampshade', aliases: ['Innovative Lampshade Project'], category: 'design', year: '2026', icon: 'sun',
      description: 'Recycled PVC, a useful object, and a lesson in leading a team. Our circular-economy design earned 3rd place and became a permanent department showcase model.',
      tags: ['Recycled PVC', 'Team leadership', 'Sustainable design'], repoLink: '',
      mediaLink: 'https://drive.google.com/drive/folders/101Fc_amTn_u18cCD_XIGu91pwlinP-0Y', details: ['Team-led sustainable design using recycled PVC materials.', '3rd place; selected by the department head as a permanent showcase model.'] },
    { id: 'sdg', title: 'SDG 9 Research & Keynote Presentation', aliases: ['SDG 9 — Industry & Innovation'], category: 'design', year: '2025', icon: 'globe',
      description: 'Research into industry, innovation, and sustainable infrastructure. Led the team, prepared the presentation, and delivered the keynote.',
      tags: ['Research', 'Public speaking', 'SDG 9'], repoLink: '', details: ['Team research on UN Sustainable Development Goal 9.', 'Keynote presentation on technical innovation in sustainable infrastructure.'] }
  ];
  const skills = {
    languages: ['C', 'C++', 'Python', 'JavaScript', 'HTML5', 'CSS3', 'SQL', 'Verilog HDL', 'ARM Thumb-2 Assembly'],
    data: ['Scikit-learn', 'Pandas', 'NumPy', 'EDA', 'Model Evaluation', 'Hyperparameter Tuning'],
    embedded: ['FastAPI', 'REST APIs', 'Bare-Metal STM32', 'UART', 'SPI', 'I2C', 'ADC', 'PWM'],
    tools: ['Git', 'GitHub', 'VS Code', 'Keil µVision', 'ModelSim', 'Power BI', 'AutoCAD'],
    soft: ['Technical Leadership', 'Adaptability', 'Cross-Functional Teamwork', 'Public Speaking', 'Problem Solving']
  };
  const experience = [
    { id: 'ml-internship', role: 'AI & Machine Learning Intern', company: 'ATR · Akhnaton Trading & Distribution — EVA Group', period: '1 Sep – 1 Oct 2026 · Completed', location: 'Cairo, Egypt', credentialId: 'atr',
      details: ['Worked with real commercial datasets in Python, Pandas, and Scikit-learn: EDA, missing-data handling, scaling, and categorical encoding.', 'Trained and evaluated Logistic Regression, Decision Trees, and Random Forests with GridSearchCV.', 'Structured modular, reproducible ML pipelines for API integration and batch inference.'] },
    { id: 'depi-experience', role: 'Microsoft Power BI Specialist', company: 'Digital Egypt Pioneers Initiative (DEPI)', period: 'Nov 2025 – Jul 2026 · Completed', location: 'Egypt',
      details: ['Built interactive dashboards, data models, DAX metrics, and analytical reporting workflows.', 'Recognized for outstanding leadership and contributions as a DEPI Round 4 Team Leader.'], credentialId: 'depi-leader' },
    { id: 'research-experience', role: 'Research Participant · 4th Place', company: 'TCCD Research Day — 15th Edition', period: '2026', location: 'Computer Department',
      details: ['Co-authored and presented Adaptive Low-Rank Memory Compression Framework for Operating Systems.', 'Investigated low-overhead compression for main-memory efficiency and lower paging overhead.'] },
    { id: 'ieee-experience', role: 'HR Team Member', company: 'IEEE CUSB — Cairo University Student Branch', period: '2025 – Present', location: 'Giza, Egypt',
      details: ['Member onboarding, event logistics, internal communication, and committee coordination.'] },
    { id: 'electrical-experience', role: 'Electrical & Technical Intern', company: 'EVA Pharma', period: 'Jun 2025 – Oct 2025', location: 'Giza, Egypt',
      details: ['Assisted with backup generator testing and power distribution panels.', 'Supported AutoCAD schematic reviews, technical documentation, and operational reports.'] },
    { id: 'production-experience', role: 'Production Line Operator / Summer Trainee', company: 'EVA Pharma', period: 'Jun 2025 – Aug 2025', location: 'Giza, Egypt',
      details: ['Operated pharmaceutical packaging machinery under GMP standards.', 'Worked with maintenance engineers and supervisors on minor mechanical stoppages.'] }
  ];
  const credentials = [
    { id: 'atr', title: 'ATR — Summer Internship Program', shortTitle: 'Digital Transformation Internship', issuer: 'ATR · Akhnaton Trading & Distribution', issuerNote: 'Certificate of appreciation · Digital Transformation Department', date: '1 September – 1 October 2026', subject: 'Industry experience · Digital transformation', original: 'assets/certificates/atr-original.png', image: 'assets/certificates/atr.webp', thumbnail: 'assets/certificates/atr-thumb.webp', width: 2500, height: 1406, verify: '' },
    { id: 'ml', title: 'NVIDIA: Fundamentals of Machine Learning', shortTitle: 'Fundamentals of ML', issuer: 'Whizlabs / Coursera', issuerNote: 'NVIDIA course · authorized by Whizlabs', date: 'June 18, 2026', subject: 'Machine learning · Model evaluation', original: 'ML.jpg', image: 'assets/certificates/ml.webp', thumbnail: 'assets/certificates/ml-thumb.webp', width: 1100, height: 852, verify: 'https://www.coursera.org/account/accomplishments/verify/RBSE776W6ASN' },
    { id: 'python', title: 'Programming for Everybody (Getting Started with Python)', shortTitle: 'Getting started with Python', issuer: 'University of Michigan / Coursera', issuerNote: 'University of Michigan', date: 'June 20, 2026', subject: 'Python · Programming foundations', original: 'Python.jpg', image: 'assets/certificates/python.webp', thumbnail: 'assets/certificates/python-thumb.webp', width: 1101, height: 851, verify: 'https://www.coursera.org/account/accomplishments/verify/JS4M16Q1NQ9B' },
    { id: 'fcc', title: 'Data Analysis with Python', shortTitle: 'Data Analysis with Python', issuer: 'freeCodeCamp', issuerNote: 'Developer Certification · approximately 300 hours', date: 'July 9, 2026', subject: 'Python · Data analysis', original: 'FreeCodeCamp.jpg', image: 'assets/certificates/fcc.webp', thumbnail: 'assets/certificates/fcc-thumb.webp', width: 1257, height: 843, verify: 'https://www.freecodecamp.org/certification/fcc-0f4aaa7e-288c-4693-9dd8-aa1d74daadcd/data-analysis-with-python-v7' },
    { id: 'depi', title: 'Digital Egypt Pioneers Program — Microsoft Power BI Specialist', shortTitle: 'Microsoft Power BI Specialist', issuer: 'Digital Egypt Pioneers Program', issuerNote: 'Sponsored by Egypt’s Ministry of Communications and Information Technology', date: 'November 2025 – July 2026', subject: 'Power BI · Business intelligence', original: 'DEBI.jpg', image: 'assets/certificates/depi.webp', thumbnail: 'assets/certificates/depi-thumb.webp', width: 3508, height: 2480, verify: '' },
    { id: 'depi-leader', title: 'DEPI Round 4 — Team Leader', shortTitle: 'Team Leader Recognition', issuer: 'Digital Egypt Pioneers Program', issuerNote: 'Outstanding leadership and exceptional contributions · MCIT-sponsored program', date: 'November 2025 – July 2026', subject: 'Team leadership · Program contribution', original: 'assets/certificates/depi-leader-original.jpg', image: 'assets/certificates/depi-leader.webp', thumbnail: 'assets/certificates/depi-leader-thumb.webp', width: 3300, height: 2550, verify: '' }
  ];
  const stages = [
    { label: 'Raw data', title: 'Inspect before fitting.', code: 'Pandas → EDA', description: 'Inspect customer records, numeric features, categories, and missing TotalCharges values before fitting a model.', input: 'Customer tabular data', decision: 'EDA + missing-value inspection', output: 'Numeric and categorical feature paths' },
    { label: 'Preprocess', title: 'One path for training and inference.', code: 'ColumnTransformer → Pipeline', description: 'Keep imputation, scaling, and categorical encoding inside the pipeline. Fit on training data to prevent validation data from leaking into preprocessing.', input: 'Raw numeric and categorical features', decision: 'Impute · scale · encode inside ColumnTransformer', output: 'A single fitted preprocessing path' },
    { label: 'Evaluate', title: 'Compare models, then tune the decision.', code: 'GridSearchCV → validation', description: 'Compare Logistic Regression, Decision Trees, and Random Forests. Approximately 77% validation accuracy and 0.80 ROC-AUC; threshold tuning changes which customers are flagged.', input: 'Preprocessed training / validation data', decision: 'GridSearchCV + model evaluation + threshold tuning', output: '~77% validation accuracy · ~0.80 ROC-AUC' },
    { label: 'Serve', title: 'Reuse the fitted pipeline.', code: 'FastAPI → single / batch', description: 'Serve single-profile and batch CSV inference, probabilistic churn-risk scores, and interactive API documentation.', input: 'One customer profile or a batch CSV', decision: 'Run the saved pipeline through FastAPI', output: 'Prediction + probability + risk score' }
  ];

  // Presentation relationships only: no new profile facts or database schema.
  const evidenceTrails = [
    { id: 'python', label: 'Python', summary: 'From first programs to a prediction API.', refs: [
      { kind: 'credential', id: 'python', note: 'Programming foundations' },
      { kind: 'credential', id: 'fcc', note: 'Data analysis practice' },
      { kind: 'experience', id: 'ml-internship', note: 'Commercial datasets and reproducible ML' },
      { kind: 'project', id: 'churn', note: 'Classification pipeline + FastAPI inference' }
    ] },
    { id: 'stm32', label: 'STM32', summary: 'Assembly, registers, and a robot that reads its sensors.', refs: [
      { kind: 'project', id: 'nurse', note: 'ARM Thumb-2 · custom drivers · no HAL' }
    ] },
    { id: 'cpp', label: 'C++', summary: 'Draw the algorithm. Simulate the system.', refs: [
      { kind: 'project', id: 'flowchart', note: 'Editing · validation · C++ code generation' },
      { kind: 'project', id: 'restaurant', note: 'Custom data structures + scheduling' }
    ] },
    { id: 'powerbi', label: 'Power BI', summary: 'Tabular data, models, and useful dashboards.', refs: [
      { kind: 'experience', id: 'depi-experience', note: 'Data models · DAX · analytical reports' },
      { kind: 'credential', id: 'depi', note: 'Completed Microsoft Power BI Specialist program' }
    ] },
    { id: 'verilog', label: 'Verilog', summary: 'Logic with registered outputs, tested in ModelSim.', refs: [
      { kind: 'project', id: 'alu', note: 'DE1-SoC · arithmetic / logic · BCD conversion' }
    ] }
  ];
  function getEvidenceTrail(id, inventory = projects) {
    const trail = evidenceTrails.find(item => item.id === id);
    if (!trail) return null;
    const items = trail.refs.flatMap(ref => {
      const record = (ref.kind === 'project' ? inventory : ref.kind === 'credential' ? credentials : experience).find(item => item.id === ref.id);
      if (!record) return [];
      return [{ kind: ref.kind, target: '#' + (ref.kind === 'project' ? 'project-' : ref.kind === 'credential' ? 'credential-' : '') + ref.id, title: ref.kind === 'experience' ? record.role : ref.kind === 'credential' ? record.shortTitle : record.title, detail: ref.note }];
    });
    return { id: trail.id, label: trail.label, summary: trail.summary, items };
  }

  function text(value, limit = 4000) { return typeof value === 'string' ? value.trim().slice(0, limit) : ''; }
  function list(value, limit = 100) { return Array.isArray(value) ? [...new Set(value.map(v => text(v, limit)).filter(Boolean))].slice(0, 32) : []; }
  function safeURL(value) {
    if (typeof value !== 'string' || !value.startsWith('https://')) return '';
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  }
  function repositoryURL(value) {
    const safe = safeURL(value);
    if (!safe) return '';
    const url = new URL(safe);
    return url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2 ? safe : '';
  }
  function key(value) { return text(value).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function canonicalId(record) {
    if (!record || typeof record !== 'object') return '';
    const explicit = text(record.canonicalId || record.id);
    if (projects.some(p => p.id === explicit)) return explicit;
    const title = key(record.title);
    return projects.find(p => [p.title, ...(p.aliases || [])].some(t => key(t) === title))?.id || '';
  }
  function normalizeProject(record, fallback = {}) {
    const categories = ['ai', 'embedded', 'software', 'design'];
    return {
      ...fallback,
      id: text(record.id, 200) || fallback.id || 'project',
      title: text(record.title, 180) || fallback.title || 'Untitled project',
      description: text(record.description) || fallback.description || '',
      category: categories.includes(record.category) ? record.category : fallback.category || 'software',
      year: /^\d{4}$/.test(String(record.year)) ? String(record.year) : fallback.year || '',
      tags: Array.isArray(record.tags) ? list(record.tags) : fallback.tags || [],
      details: Array.isArray(record.details) ? list(record.details, 1000) : fallback.details || [],
      icon: /^[a-z-]+$/.test(record.icon || '') ? record.icon : 'folder',
      repoLink: repositoryURL(record.repoLink) || (record.repoLink === '' ? '' : fallback.repoLink || ''),
      mediaLink: safeURL(record.mediaLink) || fallback.mediaLink || ''
    };
  }
  function mergeProjects(records = []) {
    const valid = Array.isArray(records) ? records.filter(r => r && typeof r === 'object') : [];
    const overrides = new Map();
    for (const record of valid) {
      const id = canonicalId(record);
      if (id && (record.schemaVersion === 2 || !overrides.has(id))) overrides.set(id, record);
    }
    const merged = projects.flatMap(base => {
      const record = overrides.get(base.id);
      if (record?.schemaVersion === 2 && record.archived === true) return [];
      if (record?.schemaVersion === 2) return [{ ...normalizeProject(record, base), id: base.id }];
      return [{ ...base, repoLink: repositoryURL(record?.repoLink) || base.repoLink, mediaLink: safeURL(record?.mediaLink) || base.mediaLink || '' }];
    });
    const seen = new Set(merged.map(p => key(p.title)));
    for (const record of valid) {
      if (canonicalId(record) || record.archived === true || !text(record.title)) continue;
      const normalized = normalizeProject(record);
      if (!seen.has(key(normalized.title))) { seen.add(key(normalized.title)); merged.push(normalized); }
    }
    return merged;
  }
  function mergeAcademic(record) {
    const result = JSON.parse(JSON.stringify(profile.academic));
    if (record?.schemaVersion !== 2) return result;
    for (const category of ['department', 'preparatory']) {
      const entry = record[category];
      if (!entry || typeof entry !== 'object') continue;
      if (/^\d(?:\.\d{1,2})?$/.test(String(entry.gpa)) && Number(entry.gpa) >= 0 && Number(entry.gpa) <= 4) result[category].gpa = Number(entry.gpa).toFixed(2);
      if (/^[1-9]\d{0,3}(st|nd|rd|th)$/.test(entry.rank)) result[category].rank = entry.rank;
    }
    return result;
  }
  function mergeSkills(records = []) {
    const result = JSON.parse(JSON.stringify(skills));
    if (!Array.isArray(records)) return result;
    for (const record of records) {
      if (!record || !Object.hasOwn(result, record.category) || !Array.isArray(record.list)) continue;
      if (record.schemaVersion === 2) { result[record.category] = list(record.list); continue; }
      const aliases = { html: 'HTML5', css: 'CSS3', verilog: 'Verilog HDL', 'arm assembly': 'ARM Thumb-2 Assembly', leadership: 'Technical Leadership', teamwork: 'Cross-Functional Teamwork' };
      const legacy = list(record.list).filter(item => record.category !== 'soft' || !/^(Arabic|English)\s*\(/i.test(item)).map(item => aliases[item.toLowerCase()] || item);
      result[record.category] = [...new Set([...result[record.category], ...legacy])];
    }
    return result;
  }
  function planSeed({ statsExists = false, skillIds = [], projects: existing = [] } = {}) {
    const ids = new Set(existing.map(p => canonicalId(p)).filter(Boolean));
    return {
      stats: statsExists ? null : { schemaVersion: 2, ...JSON.parse(JSON.stringify(profile.academic)) },
      skills: Object.entries(skills).filter(([category]) => !skillIds.includes(category)).map(([category, items]) => ({ category, schemaVersion: 2, list: [...items] })),
      projects: projects.filter(p => !ids.has(p.id)).map(p => ({ ...p, canonicalId: p.id, schemaVersion: 2 }))
    };
  }
  return { profile, projects, skills, experience, credentials, stages, evidenceTrails, getEvidenceTrail, text, list, safeURL, repositoryURL, canonicalId, normalizeProject, mergeProjects, mergeAcademic, mergeSkills, planSeed };
});
