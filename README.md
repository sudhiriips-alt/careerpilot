# CareerPilot v2 — Firebase-connected job tracker and resume builder

Responsive browser / installable PWA with:
- Email/password registration, login, password reset and Google login (Firebase Authentication).
- Isolated user records in Cloud Firestore using user-scoped security rules.
- User profile editor and resume builder with printable PDF output.
- Jobs tracker, pipeline stages, due follow-ups, CSV and JSON exports, job board links and a rule-based assistant.

**Firebase configuration and Firestore rule publication are REQUIRED.** Read `FIREBASE_SETUP.md` before deploying. Unconfigured installations deliberately block the app rather than pretending to authenticate users.

This is a development-stage foundation. It is **not yet a commercially certified product**, and does not claim real AI matching or a live jobs feed. Do not collect real user data until production security validation and policy requirements are complete.

To deploy: update `firebase-config.js`, publish `firestore.rules` in Firebase console, and upload the project files into the root of the GitHub Pages repository (with `index.html` at root). No Android Studio or local build required.

Resume upload supports local PDF/DOCX text extraction with editable, explicitly approved profile/resume updates. See [resume import workflow and validation](RESUME_IMPORT.md).
