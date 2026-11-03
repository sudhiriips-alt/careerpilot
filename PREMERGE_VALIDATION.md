# CareerPilot PR #1 pre-merge validation

2 November 2026 (India). Branch `feat/resume-document-import`.
**DO NOT MERGE** until the browser and staging checks below pass. No merge or deployment performed.

## Passed

- Three Node tests: atomic batch paths and authenticated UID guard; stale account success/failure protection including same-UID reauthentication; actual approval handler with zero writes before checked approval, unchanged in-memory values after failure, retry, duplicate-submit rejection, pending-save control lock, and preservation of unselected fields/jobs. These use DOM/SDK doubles.
- Firestore emulator v1.22.0 using demo project `demo-careerpilot`: owner read/write for jobs/profile/resume; anonymous and cross-user read/write denial for all three; unknown-document denial; approved two-document batch; atomic rollback when one target is forbidden. One emulator test passed. Expected permission-denied logs represent successful denial assertions.
- JavaScript syntax, Python test compilation and diff whitespace checks.
- Existing Firebase Web configuration and Firestore rules unchanged from main. Configuration SHA-256: `943679745e0bf2bbdf528908d9701fafd797c367df1faa27ae8396bf89925d45`; project `careerpilot-ed4af`.

## Blocked / not established

- Browser suite attempted but failed before assertions: Chromium process-singleton socket creation returned `Operation not permitted`. Fallback Playwright headless-shell download returned an invalid/truncated ZIP. No browser pass is claimed in this review.
- Expanded browser cases remain unexecuted: actual PDF/DOCX parsing, mapping, cancellation, invalid/empty/oversized/corrupt files, textless PDF, approval, save failure/retry, unselected fields/jobs preservation and account switching. The textless PDF tests no-text rejection; a real image-only scanned resume still needs validation.
- Production Firebase integration **not passed**. SDK URL returned HTTP 200, superseding the previous SDK network-block finding. No authorized real-account session was available; authentication, deployed rules, persistence/reload and second-device checks were not performed. No production records were written.

## Security findings and fixes

- Fixed stale account load results/errors applying after an authentication transition. Account state now clears immediately; responses require the current authentication generation.
- Fixed duplicate import submissions and misleading cancellation during approved pending saves. Controls lock until settlement; failure permits retry. Account changes discard drafts and suppress stale completion UI, but cannot retract already approved/submitted writes.
- Static review found the import persistence call behind explicit checked approval. Extraction/mapping make no storage calls. This is additionally covered by the actual-handler mock test; browser/real-account confirmation remains required.
- Current source scan found no private keys, service-account JSON markers, private-key IDs or client emails. Firebase Web configuration is public client configuration, not an admin credential. This is not a complete history/secret audit.
- Rules enforce ownership; approval is a UI workflow, not server-enforced consent. Authenticated owners can write their allowed documents through the normal API.

## Required staging checks with two real test accounts

1. Run browser suite on a Chromium-capable host. Test image-only scans, encrypted/corrupt PDFs, complex columns, limits, cancellation during extraction and another-file retry after parse failure.
2. Verify email/password/Google sign-in and account switching during extraction/pending saves. Inspect network/storage for zero profile/resume writes before approval and no original file/raw text uploads.
3. Approve with account A; reload and read on another device. Verify both documents and unchanged jobs. Confirm account B and signed-out requests cannot access A under deployed rules. Emulator results do not prove the deployed rules match.
4. Test denied/offline saves and retry, tracker add/edit/delete, ordinary profile/resume saves, print/export, mobile upload and service-worker upgrades. Separately validate cross-tab concurrent edits and pending ordinary form saves.

## Files changed

`app.js`, `tests/auth_race_test.cjs`, `tests/resume_import_test.py`, `tests/firestore_rules_test.cjs`, `firebase.json`, `RESUME_IMPORT.md`, `PREMERGE_VALIDATION.md`.

## Reproduce

```sh
npm install --prefix /tmp/careerpilot-validation --no-audit --no-fund firebase-tools@15.34.2 @firebase/rules-unit-testing firebase
NODE_PATH=/tmp/careerpilot-validation/node_modules node /tmp/careerpilot-validation/node_modules/firebase-tools/lib/bin/firebase.js emulators:exec --project demo-careerpilot --only firestore 'node --test tests/firestore_rules_test.cjs'
node --test tests/cloud_import_test.cjs tests/auth_race_test.cjs
```

Browser instructions are in RESUME_IMPORT.md; optional CHROMIUM_PATH selects an installed executable. Tooling was installed outside the app repository. Use only the demo project for the emulator command. Do not deploy.
