# Fady's engineering workbench — implementation plan

**Goal:** Redesign the existing vanilla portfolio as a personal engineering sketchbook, with accurate CV content and real evidence.
**Architecture:** Keep HTML/CSS/classic JavaScript, Firebase compat, the admin page, contact endpoints, theme storage, filters, and Easter eggs. Add one shared, versioned content module consumed by the public renderer, terminal, and admin. Do not change Firebase credentials or rules.
**Spec:** The user's attached brief and supplied CV; explicit user corrections and certificate artwork override stale dates in the CV.
**Execution:** Work alone in this checkout as explicitly requested. No delegation, commits, pushes, deployments, or cloud mutations.

## Design

- Paper #eeeeE7, ink #202c2a, forest #2d5c4f, highlight #dcc36b, surface #fafaf5, secondary ink #596b62. Dark mode uses graphite and warm paper lettering with sage accents.
- Bricolage Grotesque headings, DM Sans text, IBM Plex Mono annotations; use handwriting sparingly for marginal notes.
- Opening: large personal name, concise engineering thesis, portrait pinned to a technical worksheet. Projects precede biography.
- Signature: trace a customer through the churn pipeline. Four selectable stages show the engineering decisions, clearly presented as an architecture explanation rather than a running prediction API.
- Churn: substantial feature sheet. Robot: peripheral schematic. C++ projects: illustrated technical spreads. Remaining projects: concise notebook entries.
- Credentials: an asymmetric evidence shelf with actual artwork, clear metadata, and a native modal viewer with full images, previous/next, Escape, focus return, touch controls, and real verification links.
- Discoverability: Projects, About, Education, Experience, Skills, Credentials, Contact all linked in navigation.

## Tasks

- [x] Shared content and data safety (`portfolio-content.js`, `tests/content.test.js`): define canonical CV data, normalize links/records, protect against legacy overwrites, compute project counts from displayed records, and plan missing-default inserts without deletion. Run `node --test tests/content.test.js` before/after implementation.
- [x] Public redesign (`index.html`, `styles.css`, `app.css`, `app.js`, `favicon.svg`, optimized certificate derivatives, CV): preserve useful flows with semantic markup, safe DOM rendering, robust storage/CDN fallbacks, accessible dialogs, deliberate motion, and responsive compositions. Test the real page with Playwright at 1440/1280/1024/768/430/390 in both themes.
- [x] Admin integration (`portal_fady_9x2k.html`, `admin.js`, `admin.css`): retain authentication/CRUD/export; show separate academic records; add AI/data and embedded skill categories; schema version on explicit saves; make missing-only seeding idempotent and transactional; sanitize externally controlled text. Verify with isolated browser Firebase fixtures, never live writes.
- [x] Verification and handoff (`tests/browser-checks.cjs`, `README.md`, `docs/verification.md`): cover navigation, dynamic filters, stale/failed data, injected strings/URLs, reduced motion, certificate keyboard/touch behavior, theme persistence, contact outcomes, admin seeding and CRUD, local links and image loading. Review screenshots and git diff, then document exact commands and remaining external limitations.

## Evidence and decisions

- Initial user work: four certificate JPGs and `View.md` are untracked; preserve them.
- Baseline live read: GPA 3.89, six projects; Software filtering leaves all six visible. No cloud writes performed.
- Exact repository/media URLs recovered from PDF annotations. Nurse repository redirects from old username to Fady-Fawzy; use the resolved URL. No project screenshots are present locally or in inspected repository pages; use honest architecture drawings and real source/media links.
- No confirmed current deployment URL: remove stale canonical/Open Graph URL instead of guessing a new domain.
- Supplied CV retains incorrect DEPI ongoing status and freeCodeCamp year; website follows corrected dates. Copy latest PDF intact and document the remaining PDF discrepancies for its source author.
- Python artwork says June 20, 2026, while Coursera displays June 21: follow the user's date/artwork and flag the discrepancy in handoff.
- Legacy Firestore documents cannot replace corrected CV facts. Version 2 explicit admin saves can override shared defaults; matching legacy projects can contribute safe evidence links. Preserve unknown custom projects. No destructive database migration.

Final evidence: 11 content tests, 9 public browser checks, 22 integration checks, and 5 accessibility/asset/fallback groups passed. Review performed alone per user instruction. Live public reads verified; no live service writes or Git operations performed.
