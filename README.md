# Fady's engineering workbench

A vanilla HTML/CSS/JavaScript portfolio with a clear aspiring Machine Learning Engineer direction: a traceable ML pipeline, prediction APIs, completed industry experience, and the engineering foundations behind the work. No framework, package installation, or build is required to run it.

## ML direction and credentials — 12 October 2026

- Hero, biography, project introduction, metadata, skills ordering, and terminal biography now foreground ML engineering while preserving the paper/green workbench identity.
- Six unique credentials: added ATR's Digital Transformation summer internship (1 September–1 October 2026) and DEPI Round 4 Team Leader recognition (November 2025–July 2026). The emailed Power BI artwork is byte-identical to `DEBI.jpg` and was not added again.
- The ATR experience is marked completed. ATR and DEPI experience entries link to their supporting credentials, including in the generated no-JavaScript fallback. ATR's document is described as an internship certificate, not an ML certification.
- Desktop gallery uses three columns; tablet uses two and mobile uses one to keep the real documents readable. Original downloads remain intact alongside optimized previews/viewer images.
- Fresh checks: 13 content tests, 10 refinement checks, 9 browser checks, 22 fixture integration checks, 5 accessibility/asset/fallback groups, and 28 public/admin viewport-theme combinations passed. Original asset hashes match the retrieved files; JavaScript syntax and whitespace checks passed. Service mutations stayed in isolated browser fixtures; production delivery/security remain unverified.

## Bespoke public design — 12 October 2026

The public page now opens with an oversized nameplate and a custom SVG signal study. Data, Model, and API views explain the idea visually and lead to the corresponding stage of the actual Churn pipeline. The sketch is explicitly illustrative; it does not run a model or present invented predictions. Its controls support keyboard navigation, reduced motion, filtered projects, archived-project fallback, and readable no-JavaScript content.

`workbench.css` scopes the art direction to the public `.portfolio` body: sage paper, forest ink, copper annotations, project-specific spreads, a physical portrait treatment, six real credential documents, and a larger contact/closing composition. `workbench.js` owns only the opening illustration. Existing content, project rendering, forms, Firebase paths, and admin styles retain their current ownership; no new dependencies were introduced.

Run `node tests/workbench-checks.cjs` with `PORTFOLIO_URL` pointing at the local server. The existing content, refinement, browser, accessibility, and responsive suites also cover the redesign. Local browser verification does not publish the page or verify live service delivery.

## Run locally

```powershell
cd 'C:\Users\PC\Desktop\Fady Fawzy\Fady-Fawzy'
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

Open <http://127.0.0.1:5501/>. Admin: <http://127.0.0.1:5501/portal_fady_9x2k.html>. Stop with Ctrl+C. If 5501 is occupied, add `-Port 5502` and use that port in the URLs. The script uses the bundled Python runtime when available, otherwise Python 3 on PATH. The existing VS Code Live Server port 5501 also works.

## Content and data migration

`portfolio-content.js` is the shared source for profile records, projects, skills, experience, credentials, and pipeline explanations. Public JavaScript, the terminal, and admin defaults consume it. After editing shared content, update the readable HTML fallbacks:

```powershell
node scripts/sync-static.cjs
```

This is optional maintenance, not a build requirement. The saved HTML includes content and certificate artwork even without JavaScript.

- Unversioned legacy statistics/descriptions cannot replace the corrected CV facts. Cloud documents have **not** been rewritten.
- `stats/summary` now supports `schemaVersion: 2` and separate `department: {gpa, rank}` / `preparatory: {gpa, rank}` objects. Save Statistics in the updated portal to adopt that format explicitly. Legacy `gpa`, `rank`, and `projectsCount` fields are ignored publicly.
- Project counts come from displayed projects. Canonical IDs: `churn`, `nurse`, `flowchart`, `restaurant`, `alu`, `lampshade`, `sdg`. Title aliases support older records. Version 2 owner edits can override defaults; matching legacy records can contribute safe evidence links. Unknown custom projects remain visible.
- Admin saves preserve unrelated fields. Archive hides a canonical project and its HTML fallback; **Show archived projects → Restore** reverses it. Custom projects retain a clearly confirmed permanent-delete action.
- **Add Missing Defaults** replaces destructive Auto-Fill. It explains insert counts, recognizes legacy titles, and uses a transaction to create absent target documents only. It never clears collections or replaces existing records; repeat runs are idempotent.
- Skills retain `languages`, `tools`, `soft` and add `data`, `embedded`. Legacy aliases are normalized, and old language proficiency text cannot return through soft skills.
- Firebase configuration and authentication integration were preserved. No local Firestore rules exist to audit. The hidden admin filename is not a security boundary; deployed rules control access.

## Preserved interactions

- Light/dark preference still uses localStorage `theme`; light is the new default.
- Filters work across cloud refreshes. Evidence links reveal a filtered-out target automatically.
- Certificate dialogs support Escape, keyboard focus wrapping/return, Previous/Next, arrow keys, and a horizontal swipe. Full artwork retains aspect ratio. DEPI has no invented verification action.
- Type `fady` or `terminal` outside forms, or press Ctrl+Backslash. Terminal commands: `help`, `whoami`, `skills`, `projects`, `clear`, `hire`, `exit`, `helloworld`. Type `helloworld` on the page for the other Easter egg. Output is plain text using the current shared state.
- Contact retains Formspree; success requires an HTTP success response and failure retains typed text.
- Newsletter retains Apps Script/Firestore. Opaque responses are unconfirmed send attempts; only successful persistence confirms a subscription. Local-only fallback says so and does not automatically resend.

The original certificate files are preserved. Twelve WebP derivatives provide smaller previews and full viewer artwork. Preview files total 155,730 bytes; the full DEPI image is 144,946 bytes versus its 1,252,555-byte original. The viewer links originals too.

## Verification commands

With the server running, use a second PowerShell window:

```powershell
cd 'C:\Users\PC\Desktop\Fady Fawzy\Fady-Fawzy'
node --check portfolio-content.js
node --check theme-init.js
node --check app.js
node --check admin.js
node --test tests/content.test.js
node tests/browser-checks.cjs
node tests/integration-checks.cjs
node tests/accessibility-checks.cjs
git diff --check
```

Browser scripts use this machine's existing bundled Playwright. Elsewhere, set `PLAYWRIGHT_MODULES` to an existing installation. Set `PORTFOLIO_URL` for a different server origin. QA output goes to ignored `.qa/`. Integration tests run the production public/admin scripts with isolated remote-service fixtures: no live login, cloud write, message, or subscription occurs. They do not prove live delivery or deployed security rules. See `docs/verification.md`.

## Remaining source/deployment input

The second pass adds the shared **Trace a tool** interaction, richer pipeline handoffs, a responsive admin record list, and gallery/viewer refinements. See `docs/second-pass-verification.md` for the exact changes and browser evidence. Two additional checks are available:

```powershell
node tests/refinement-checks.cjs
node tests/responsive-refinement.cjs
```

The responsive check covers both public/admin surfaces, both themes, and 1440/1280/1024/768/430/390/360 px. Admin opens on Projects; Setup & defaults contains the safe missing-only maintenance action. Theme selection is shared with the public site.

1. The CV download is a byte-identical copy of the newer supplied PDF. That PDF still says DEPI `2025 – Present`, freeCodeCamp `2025`, and has a stray `k` on page 1. Correct its original source and replace it. Website dates are already corrected.
2. Python artwork/request says June 20, 2026; the [Coursera page](https://www.coursera.org/account/accomplishments/verify/JS4M16Q1NQ9B) displays June 21. The site follows the supplied date/artwork; confirm the intended source date.
3. Confirm the published URL before adding canonical/Open Graph URL/image metadata. Old domain references were removed; no replacement deployment address was guessed.
4. FPGA/SDG 9 have no supplied repository URLs, which the UI discloses. The lampshade uses its real CV-linked Drive folder. No project screenshots were supplied; diagrams are labeled architecture sketches rather than fabricated screenshots.

## File changes

- Modified: `index.html`, `styles.css`, `app.css`, `app.js`; `portal_fady_9x2k.html`, `admin.js`, `admin.css`; `favicon.svg`, `Fady_Fawzy_CV_2026.pdf`.
- Added: `portfolio-content.js`, `theme-init.js`, `.gitignore`, twelve `assets/certificates/` derivatives and the ATR/Team Leader originals, two `scripts/`, seven `tests/`, this README, verification reports, and implementation plans under `docs/`.
- Preserved: `firebase-config.js`, original four certificate JPGs, portrait/logo, editor settings, and the pre-existing `View.md`.

No commit, push, PR, deployment, package installation, or live service mutation was performed.
