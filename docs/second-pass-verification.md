# Second-pass refinement — evidence and review

The existing implementation was refined directly by one agent. No delegation, live service mutation, commit, push, or deployment was performed.

## Intentionally preserved

Paper, forest green, workshop yellow, taped portrait, selective handwritten notes, varied project layouts, real certificate artwork, the churn case study, themes, filters, terminal/helloworld, forms, Firebase/admin compatibility, archive/restore/delete, missing-only default inserts, unknown cloud fields, and the shared content/static fallback architecture.

Professional `profile`, `projects`, `skills`, `experience`, and `credentials` objects were compared against the saved first-pass snapshot and matched exactly. Existing `mergeProjects`, `mergeAcademic`, `mergeSkills`, `planSeed`, `safeURL`, and `repositoryURL` function bodies also matched. Additions to the shared module are presentation relationships and verified pipeline explanations, not a schema migration.

## What changed

- **Signature: Trace a tool.** Hero and skills selectors share Python, STM32, C++, Power BI, and Verilog trails. Real learning/fieldwork/build references appear as links, and matching artifacts receive restrained yellow marks. Selection supports mouse, touch, Tab, arrow keys, Home/End, and a shareable `?tool=` URL. Filtered project links reveal their target; archived targets are removed; edited titles are resolved from current content. A readable default trail exists without JavaScript.
- **Hero:** the abstract three-icon diagram was replaced with an actual evidence worksheet. The taped portrait remains. Mobile uses one name line and a portrait beside the tool controls, rather than a tall desktop stack. Redundant generic copy was removed.
- **Churn:** ordered, named steps replace cryptic symbols. Each stage shows input, decision, and output; a completed-path highlight communicates position. Keyboard selection changes the notes. The 140 ms opacity transition is interruptible and disabled/cancelled under reduced motion. The new TotalCharges mention was checked against the [project README](https://github.com/Fady-Fawzy/Customer-Churn-Prediction-System#1-eda-findings); metrics were not changed.
- **Page rhythm:** education is a concise facts band, experience uses dated log entries, and skills foreground evidence before compact inventories. Smaller secondary headings and tighter link rows reduce repeated editorial spreads and empty column height.
- **Certificates:** DEPI receives a wider desktop position and full mobile width. Artwork stays uncropped, with original aspect ratios. Metadata is larger, shadows quieter, and focus remains clear. The viewer uses natural image height instead of a fixed-height letterbox. A labelled 44 px Close control replaces the heavy double-ring X.
- **Admin:** below 901 px, a genuine record list replaces the desktop table. Each record has a dominant title, category/year, Default/Custom project, Visible/Archived status, and context-labelled actions. Both views share the existing handlers. Projects is the initial/first tab. Setup/defaults is a lower-prominence disclosure with explicit missing-only/idempotent wording. An admin theme control shares the existing preference.
- **Accessibility:** admin record actions announce outcomes and restore focus to a surviving control after DOM replacement. Vertical scrolling on a certificate cannot accidentally trigger a horizontal swipe. Theme palettes switch together instead of interpolating old backgrounds under new text. Important labels/body copy were enlarged; all action targets remain usable.

## Baseline finding

The checked-out 360/390/430 px CSS already exposed project titles, so it would be inaccurate to claim all titles were missing at this baseline. It still depended on table-cell reshaping, omitted record type/status, and had a very tall navigation region. The dedicated record list resolves that structural weakness and the requested narrow-screen identification problem.

## Executed validation

| Command/check | Result |
| --- | --- |
| `node --check portfolio-content.js` | Passed |
| `node --check theme-init.js` | Passed |
| `node --check app.js` | Passed |
| `node --check admin.js` | Passed |
| `node --test tests/content.test.js` | 13 passed |
| `node tests/browser-checks.cjs` | 9 passed |
| `node tests/integration-checks.cjs` | 22 passed |
| `node tests/accessibility-checks.cjs` | 5 groups passed |
| `git diff --check` | Passed; ordinary LF/CRLF notices |
| `node tests/refinement-checks.cjs` | 9 passed |
| `node tests/responsive-refinement.cjs` | 28 public/admin width-theme combinations passed |

The original tests retain their assertions. Integration selectors now operate on the visible inventory view and open the new setup disclosure before testing missing-only inserts.

The matrix covers **1440, 1280, 1024, 768, 430, 390, 360 px**, both themes, public sections/navigation/viewer/terminal, and admin inventory/forms/statistics/skills/subscribers. It checks document overflow, off-screen controls/images, clipped headings, project titles, and runtime exceptions. Login was checked at each width. Full-page and section screenshots, contact sheets, geometry reports, and `matrix.json` are in `.qa/second-pass/`.

Final live public read: seven projects, four Python trail links, department 1st / GPA 3.88, preparatory 3rd / GPA 3.94, and zero console errors/warnings. The complete page composition, the 28 opening states, enlarged credential artwork, compact skills evidence, native viewer, project forms, and mobile record views were visually reviewed. No application code changes remain after the final validation run.

Additional browser checks used the actual SweetAlert UI with a fixture Firebase boundary: keyboard cancellation, confirmation, plain-text handling of malicious-looking titles, and focus restoration passed. Touch-emulated checks passed for the vertical-swipe guard and reduced motion. Immediate theme foreground/background values matched the new palette. These are browser/emulation checks, not physical-device or complete WCAG certification.

## Files in this pass

Modified: `index.html`, `styles.css`, `app.css`, `app.js`, `portfolio-content.js`, `portal_fady_9x2k.html`, `admin.css`, `admin.js`, `scripts/sync-static.cjs`, `tests/content.test.js`, `tests/browser-checks.cjs`, `tests/integration-checks.cjs`, and `README.md`.

Added: `tests/refinement-checks.cjs`, `tests/responsive-refinement.cjs`, this report, and `docs/superpowers/plans/2026-09-26-second-pass.md`. QA-only helpers/snapshots remain ignored under `.qa/`.

Untouched in this pass: CV PDF, certificate originals/optimized assets, portrait/logo/favicon, Firebase configuration, existing data adapter semantics, and prior user files.

## Remaining real inputs and limits

No real prototype photos/application screenshots were supplied; architecture drawings remain honestly labelled. Exact FPGA/SDG repositories are still unavailable. Earlier CV source-date issues and the unconfirmed deployment URL remain documented in the README. Live authenticated writes, real form delivery/subscription, and deployed Firestore rules were not tested or declared safe.
