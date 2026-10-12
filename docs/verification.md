# Verification — 26 September 2026

This concerns the local checkout. Implementation and review were performed alone by the same agent, as requested. No other model or reviewer was consulted.

| Check | Result | Scope |
| --- | --- | --- |
| `node --test tests/content.test.js` | 11 passed | Legacy/explicit data, academic validation, aliases, safe URLs, missing-only seed plans |
| `node tests/browser-checks.cjs` | 9 passed | Actual public page, four artwork dialogs, focus/Escape, pipeline, filters, terminal injection, persistent theme, offline subscription, both themes/six widths, runtime exceptions |
| `node tests/integration-checks.cjs` | 22 passed | Production scripts with service fixtures: refresh/filtering, XSS, partial failures, reduced motion, mobile menu/dialogs, contact success/failure, subscription persistence, login/logout, seed idempotence, real JSON export, academic/project/skill saves, archive/restore, mobile admin |
| `node tests/accessibility-checks.cjs` | 5 groups passed | Text contrast in both settled themes; image alternatives, labels/internal links; 16 local asset/link HTTP responses; readable no-JavaScript fallbacks |
| Syntax checks | Passed | Public/admin/shared/theme JavaScript and parsed PowerShell serve script |
| `git diff --check` | Passed | No whitespace errors; normal LF/CRLF normalization notices |

47 checks/groups. This is targeted verification, not complete WCAG certification or a Lighthouse score. All test mutations stayed in fixtures or intercepted responses.

Additional final checks passed in a 390 px touch-emulated Chromium context: certificate tap/swipe, DEPI's missing verification action, the helloworld Easter egg, and terminal display of both academic records. The mobile certificate viewer was captured and visually reviewed. The documented PowerShell serve command was launched on port 5502 and returned HTTP 200; that test server was stopped afterward. The main preview remains on port 5501.

Screenshots were generated at **1440, 1280, 1024, 768, 430, 390 px** in both themes. No document-level horizontal overflow was detected. Desktop/mobile openings, churn feature, robot diagram, credentials, contact, viewer, and mobile admin were visually reviewed. Artifacts are in ignored `.qa/`. Screenshot/contrast checks wait for transitions to settle.

## Live read-only evidence

Before: Firestore supplied GPA 3.89, rank 3rd, and six projects. Software filtering left all six visible because JavaScript retained references to nodes Firebase had replaced.

After: the browser read existing cloud data and showed seven projects, two under Software, **department 1st / GPA 3.88**, and **preparatory 3rd / GPA 3.94**. The live browser check reported zero console errors/warnings. Legacy skill aliases were also reviewed against the current shared source.

`firebase-config.js` matches HEAD after normalizing Git line endings. The CV SHA-256 matches the newer supplied PDF. Secret values were not printed or edited.

Read-only HTTP requests returned 200 for the GitHub profile, four project repositories, lampshade Drive folder, two Coursera links, and freeCodeCamp verification link. LinkedIn returned 999 to automation; the supplied URL remains and human-browser accessibility is unverified. HTTP 200 establishes reachability, not repository correctness, certificate identity, or folder permissions. Coursera titles/dates and the supplied artwork were inspected separately.

## Addressed bugs

- Dynamic project filters and active state survive cloud refreshes.
- Stale cloud academic/count values and duplicate skill aliases cannot replace corrected defaults.
- Public/admin/terminal use text nodes for external data. Executable URLs, profile-as-repository links, malformed lists, and invalid categories are rejected or normalized.
- Independent read failures no longer block other collections; initial content is not hidden by a network-dependent loader.
- Auto-Fill no longer deletes records; missing-only inserts are transactional and explicitly confirmed.
- Admin save feedback preserves the nested label needed for later project edits.
- Canonical archive/restore agrees with public fallback behavior and project counts.
- Modal focus wraps/returns; reduced motion is honored site-wide.
- Contact failure retains the message; newsletter distinguishes confirmed, unconfirmed, and local-only outcomes and handles corrupt storage.
- Mobile admin shows titles and actions together rather than a horizontally scrolled desktop registry.

## Limits

No live authenticated admin access, cloud writes, form delivery, real subscription, or production deployment was tested. Firestore security rules are absent locally and were not declared safe. The unchanged latest CV retains its source date errors/stray letter. Python's artwork/request date differs from Coursera. A current production URL and FPGA/SDG repositories remain unsupplied. No project media was fabricated. Original certificate JPGs and the user's `View.md` were preserved.

No commit, push, PR, deployment, package installation, or external service mutation was performed.
