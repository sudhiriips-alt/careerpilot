# Resume import

Open **My profile** or **Resume builder**, choose **Upload PDF / DOCX**, and select a document up to 5 MB. Extraction uses locally bundled PDF.js and Mammoth in the browser. No file, filename or raw extracted text is uploaded. PDF support is limited to 30 pages and text-based documents; scanned images need OCR elsewhere. Password-protected, corrupt and empty documents display an error. Extracted text is capped at 100,000 characters. Complex columns and unusual section headings may require manual correction.

Mapping recognizes a first-line name, contact details, explicit `Location:` / `Headline:` / `Title:` labels, and Summary, Experience, Education, Skills, Projects and Certifications headings. It does not infer qualifications or job preferences. Review the extracted text and editable suggestions. Each checkbox identifies which profile/resume fields it updates and shows existing values. Unselected fields are preserved; selecting an empty value clears that field. Approval is required before saving. Profile-only preferences and existing jobs remain untouched.

Approved profile and resume values are committed together in an authenticated Firestore batch under `users/{uid}/workspace/{profile,resume}`, using existing security rules. Failed saves leave in-memory data unchanged and permit retry. Authentication changes discard the import draft; the write helper rejects an unexpected current UID. Drafts are not stored in localStorage. Controls and cancellation are locked while an approved batch is pending. Authentication changes discard the UI draft but cannot retract an already approved, submitted batch. No Firebase project settings or rules were changed.

## Local validation

Start from the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

In another terminal:

```sh
node --test tests/cloud_import_test.cjs tests/auth_race_test.cjs
python3 tests/resume_import_test.py
```

The browser test requires Python Playwright and `/usr/bin/chromium`, available in this cloud environment. It generates actual DOCX/PDF documents, exercises bundled parsers, and intercepts Firebase with an in-memory mock. Service workers are disabled in the test to avoid stale assets. It verifies mapping, no writes before approval, cancellation, invalid files, save failure/retry, selected-field edits, preservation of unselected fields/jobs, and authentication-change cleanup. The Node test exercises the actual cloud helper with a mocked SDK and verifies batch paths and UID rejection.

## Integration checks still required

On 2 November 2026 the SDK URL was reachable. Real Firebase integration is unverified: authorized test-account sessions are unavailable and Chromium startup is blocked by the environment. Firestore emulator tests passed. See PREMERGE_VALIDATION.md. The tests above do not establish production Firebase readiness. After permitted network access and authorized test accounts are available, verify:

- Existing email/password and Google authentication, job CRUD, profile editing and resume printing.
- Import approval followed by reload and a second-device read of profile/resume.
- Denied or offline batch writes leave both documents unchanged; retry succeeds.
- Sign-out/account switching during extraction and saving does not expose another user's draft.
- Firestore emulator/security-rule tests reject unauthenticated and cross-user writes while allowing the owning user to update the two existing documents.
- Service-worker upgrade from the previous cache and locally served parser assets work online; recheck offline behavior separately.

No accounts were created, production data written, security rules published, merges performed or deployments triggered during implementation.
