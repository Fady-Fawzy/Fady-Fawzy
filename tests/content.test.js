const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'portfolio-content.js');
const content = fs.existsSync(file) ? require(file) : {};

test('legacy cloud projects cannot remove the new churn project or replace current CV descriptions', () => {
  assert.equal(typeof content.mergeProjects, 'function');
  const projects = content.mergeProjects([{ id: 'old', title: 'Smart Nurse Robot', description: 'Stale copy', year: '2026', category: 'embedded', repoLink: 'https://github.com/fady111-f' }]);
  assert.equal(projects.length, 7);
  assert.ok(projects.find(p => p.id === 'churn'));
  assert.match(projects.find(p => p.id === 'nurse').description, /Thumb-2/);
  assert.equal(projects.find(p => p.id === 'nurse').repoLink, 'https://github.com/Fady-Fawzy/Nurse-Robot-');
});

test('versioned explicit edits update canonical projects without duplication', () => {
  assert.equal(typeof content.mergeProjects, 'function');
  const projects = content.mergeProjects([{ id: 'custom-cloud-id', canonicalId: 'churn', schemaVersion: 2, title: 'Customer Churn Prediction System', description: 'Updated by owner', category: 'ai', year: '2026', tags: ['Python'] }]);
  assert.equal(projects.length, 7);
  assert.equal(projects[0].description, 'Updated by owner');
  assert.equal(projects[0].id, 'churn');
});

test('explicit archive hides a canonical project while old duplicates cannot resurrect it', () => {
  assert.equal(typeof content.mergeProjects, 'function');
  const projects = content.mergeProjects([{ id: 'nurse', canonicalId: 'nurse', schemaVersion: 2, archived: true }, { id: 'old', title: 'Smart Nurse Robot', category: 'embedded' }]);
  assert.equal(projects.length, 6);
  assert.ok(!projects.some(p => p.id === 'nurse'));
});

test('external links reject executable schemes, credentials, and generic GitHub profile links', () => {
  assert.equal(typeof content.safeURL, 'function');
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@github.com/x/y', '//evil.test', {}, null]) assert.equal(content.safeURL(value), '');
  assert.equal(content.repositoryURL('https://github.com/Fady-Fawzy'), '');
  assert.equal(content.repositoryURL('https://github.com/Fady-Fawzy/Customer-Churn-Prediction-System'), 'https://github.com/Fady-Fawzy/Customer-Churn-Prediction-System');
});

test('malformed cloud arrays and categories fall back safely without losing custom records', () => {
  assert.equal(typeof content.mergeProjects, 'function');
  const projects = content.mergeProjects([{ id: 'other', title: 'Custom project', description: '<img src=x onerror=alert(1)>', category: '" onclick="evil', tags: {}, repoLink: 'javascript:evil()' }, null, { title: {} }]);
  assert.equal(projects.length, 8);
  const custom = projects.find(p => p.id === 'other');
  assert.equal(custom.category, 'software');
  assert.deepEqual(custom.tags, []);
  assert.equal(custom.repoLink, '');
  assert.equal(custom.description, '<img src=x onerror=alert(1)>'); // renderer must use textContent
});

test('unversioned academic data cannot conflate preparatory standing with department standing', () => {
  assert.equal(typeof content.mergeAcademic, 'function');
  const result = content.mergeAcademic({ gpa: '3.89', rank: '3rd', projectsCount: 600 });
  assert.equal(result.department.gpa, '3.88');
  assert.equal(result.department.rank, '1st');
  assert.equal(result.preparatory.gpa, '3.94');
  assert.equal(result.preparatory.rank, '3rd');
});

test('versioned academic updates validate each record independently', () => {
  assert.equal(typeof content.mergeAcademic, 'function');
  const result = content.mergeAcademic({ schemaVersion: 2, department: { gpa: '4.50', rank: 'wrong' }, preparatory: { gpa: '3.95', rank: '2nd' } });
  assert.equal(result.department.gpa, '3.88');
  assert.equal(result.department.rank, '1st');
  assert.equal(result.preparatory.gpa, '3.95');
  assert.equal(result.preparatory.rank, '2nd');
});

test('missing-only seed plan preserves existing records and recognizes legacy project names', () => {
  assert.equal(typeof content.planSeed, 'function');
  const plan = content.planSeed({ statsExists: true, skillIds: ['languages', 'tools', 'soft'], projects: [{ id: 'legacy', title: 'Innovative Lampshade Project' }, { id: 'nurse', title: 'Owner custom title' }] });
  assert.equal(plan.stats, null);
  assert.ok(!plan.projects.some(p => p.id === 'lampshade' || p.id === 'nurse'));
  assert.deepEqual(plan.skills.map(p => p.category), ['data', 'embedded']);
  assert.equal(plan.projects.length, 5);
});

test('a second seed plan inserts nothing after all defaults exist', () => {
  assert.equal(typeof content.planSeed, 'function');
  const plan = content.planSeed({ statsExists: true, skillIds: ['languages', 'data', 'embedded', 'tools', 'soft'], projects: ['churn', 'nurse', 'flowchart', 'restaurant', 'alu', 'lampshade', 'sdg'].map(id => ({ id })) });
  assert.equal(plan.stats, null);
  assert.deepEqual(plan.projects, []);
  assert.deepEqual(plan.skills, []);
});

test('legacy skills preserve current AI and embedded evidence while explicit saves can replace a category', () => {
  assert.equal(typeof content.mergeSkills, 'function');
  const legacy = content.mergeSkills([{ category: 'languages', list: ['C++'] }, { category: 'data', list: 'bad' }]);
  assert.ok(legacy.languages.includes('Python'));
  assert.ok(legacy.data.includes('Scikit-learn'));
  const updated = content.mergeSkills([{ category: 'languages', schemaVersion: 2, list: ['C++'] }]);
  assert.deepEqual(updated.languages, ['C++']);
});

test('legacy skill aliases cannot duplicate current technologies or reintroduce an old language proficiency', () => {
  const inventory = content.mergeSkills([{ category: 'languages', list: ['HTML', 'CSS', 'Verilog', 'ARM Assembly'] }, { category: 'soft', list: ['Leadership', 'Teamwork', 'English (Very Good)', 'Arabic (Native)'] }]);
  assert.ok(inventory.languages.includes('HTML5'));
  assert.ok(!inventory.languages.includes('HTML'));
  assert.ok(!inventory.languages.includes('ARM Assembly'));
  assert.ok(!inventory.soft.includes('English (Very Good)'));
  assert.equal(inventory.soft.filter(item => /leadership/i.test(item)).length, 1);
});

test('Python trail connects only its real project, internship, and two certificates', () => {
  assert.equal(typeof content.getEvidenceTrail, 'function');
  const trail = content.getEvidenceTrail('python');
  assert.deepEqual(trail.items.map(item => item.target), ['#credential-python', '#credential-fcc', '#ml-internship', '#project-churn']);
  assert.equal(trail.label, 'Python');
});

test('evidence trails follow current project titles and omit archived project targets', () => {
  assert.equal(typeof content.getEvidenceTrail, 'function');
  const inventory = content.mergeProjects([{ id: 'nurse', canonicalId: 'nurse', schemaVersion: 2, archived: true }]);
  assert.deepEqual(content.getEvidenceTrail('stm32', inventory).items, []);
  const updated = content.mergeProjects([{ id: 'churn', schemaVersion: 2, title: 'Owner edited title', category: 'ai', year: '2026', description: 'Updated' }]);
  assert.equal(content.getEvidenceTrail('python', updated).items.at(-1).title, 'Owner edited title');
  assert.equal(content.getEvidenceTrail('unknown', inventory), null);
});
