// Regenerate readable HTML fallbacks from the same content used by public/admin JS.
// This is optional maintenance, not a build step needed to run the portfolio.
const fs = require('node:fs');
const path = require('node:path');
const C = require('../portfolio-content.js');
const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const external = (label, href) => `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const defaultTrail = C.getEvidenceTrail('python');
function trailMarkup(trail) {
  return `<p class="trail-summary">${escape(trail.label + ': ' + trail.summary)}</p><ol class="trail-links">${trail.items.map(item => `<li><a class="trail-evidence-link" href="${item.target}"><span class="trail-kind">${{credential:'Learning',experience:'Fieldwork',project:'Build'}[item.kind]}</span>${escape(item.title)}</a><p class="trail-detail">${escape(item.detail)}</p></li>`).join('')}</ol>`;
}
function replace(pattern, value) {
  if (!pattern.test(html)) throw new Error('Fallback marker was changed: ' + pattern);
  html = html.replace(pattern, (_, start, end) => start + value + end);
}
const projects = C.projects.map(project => `<article id="project-${escape(project.id)}" class="fallback-project" data-project="${escape(project.id)}" data-category="${escape(project.category)}"><p class="project-kicker">${escape(project.category)} / ${project.year}</p><h3>${escape(project.title)}</h3><p>${escape(project.description)}</p><p class="project-tools">${escape(project.tags.join(' / '))}</p>${project.repoLink ? external('View source ↗', project.repoLink) : ''}${project.mediaLink ? external('View project media ↗', project.mediaLink) : ''}</article>`).join('\n');
replace(/(<div id="projectList" class="project-list">)[\s\S]*?(<\/div><p id="projectEmpty")/, '\n' + projects + '\n');
const experience = C.experience.map(item => `<article id="${item.id}" class="experience-entry"><div class="experience-meta"><p class="experience-period">${escape(item.period)}</p><p class="experience-location">${escape(item.location)}</p></div><div><h3>${escape(item.role)}</h3><p class="experience-company">${escape(item.company)}</p><ul>${item.details.map(detail => '<li>' + escape(detail) + '</li>').join('')}</ul>${item.credentialId ? `<a class="experience-proof" href="#credential-${escape(item.credentialId)}">See the certificate ↗</a>` : ''}</div></article>`).join('\n');
replace(/(<div id="experienceList" class="experience-list">)[\s\S]*?(<\/div><\/section>)/, experience);
const names = { data: 'AI & data', languages: 'Programming', embedded: 'Backend & embedded', tools: 'Tools & workflow' };
const skills = Object.entries(names).map(([category, name]) => `<article class="skill-evidence-row"><h3>${name}</h3><p class="skill-inventory">${escape(C.skills[category].join(' · '))}</p></article>`).join('');
const skillTrail = `<div class="skills-tracer"><div><p class="eyebrow">FOLLOW A TOOL</p><h3>What’s behind the skill?</h3></div><div id="skillsTrailControls" class="evidence-controls"></div><div id="skillsTrailDetail" class="evidence-trail">${trailMarkup(defaultTrail)}</div></div>`;
replace(/(<div id="skillsEvidence" class="skills-evidence">)[\s\S]*?(<\/div><noscript>)/, skillTrail + skills);
replace(/(<div id="evidenceTrail" class="evidence-trail">)[\s\S]*?(<\/div><p id="evidenceStatus")/, trailMarkup(defaultTrail));
const credentials = C.credentials.map(item => `<article class="credential" id="credential-${item.id}"><a class="certificate-trigger" href="${item.original}" aria-label="Open original certificate: ${escape(item.title)}"><img src="${item.thumbnail}" width="${item.width}" height="${item.height}" loading="lazy" alt="${escape(item.title)} certificate awarded to Fady Fawzy"></a><p class="eyebrow">${escape(item.issuer)}</p><h3>${escape(item.shortTitle)}</h3><p class="credential-date">${escape(item.date)}</p><p class="credential-subject">${escape(item.subject)}</p>${item.verify ? external('Verify with issuer ↗', item.verify) : '<p class="credential-verify-note">Artwork available · no public verification link</p>'}</article>`).join('\n');
replace(/(<div id="credentialShelf" class="credential-shelf">)[\s\S]*?(<\/div><noscript>)/, credentials);
for (const [category, fields] of Object.entries(C.profile.academic)) {
  for (const [field, value] of Object.entries(fields)) {
    const pattern = new RegExp('(<strong data-academic="' + category + '\\.' + field + '">)[^<]*(<\\/strong>)');
    replace(pattern, escape(value));
  }
}
html = html.replace(/(<p id="projectCount"[^>]*>)[^<]*(<\/p>)/, '$1' + C.projects.length + ' projects$2');
fs.writeFileSync(file, html);
console.log('Static project, experience, skills, credential, and academic fallbacks updated.');
