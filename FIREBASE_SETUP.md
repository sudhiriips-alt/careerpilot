# CareerPilot v2: Firebase deployment and production checklist

## 1. Set up Firebase (required; GitHub Pages is hosting only)
1. In https://console.firebase.google.com create a project, then add a **Web app**.
2. The supplied CareerPilot project web config has already been inserted into `firebase-config.js`. This web config is public app identification, **not** a service account key. Never store admin SDK keys, tokens or passwords in GitHub.
3. Under **Authentication > Sign-in method**, enable **Email/Password** and **Google**; set the project support email.
4. Under **Authentication > Settings > Authorized domains**, add `sudhiriips-alt.github.io` (or your real GitHub Pages hostname). Do not include the `/careerpilot/` path.
5. Under **Firestore Database**, create a database in your chosen region. Paste and **publish** `firestore.rules` in Firestore > Rules. Do not leave Firestore in test mode.
6. Upload all updated project files to the GitHub repository root on the `main` branch; keep `firestore.rules` in GitHub for review, and publish its contents separately in Firebase console. GitHub Pages will redeploy.
7. Open https://sudhiriips-alt.github.io/careerpilot/ and run the test checklist below.

## 2. Validation checklist (required before public invitation)
- Register with email/password, sign out, sign in; request password reset.
- Test Google sign-in on desktop and Android browser; verify authorized domain.
- Create jobs, edit stages, refresh and sign in on another device; verify synchronization.
- Save profile and resume, refresh, print resume, and save PDF.
- Create a second account, verify it **cannot** read or modify first account's documents in Firestore emulator security-rule tests.
- Test invalid config, offline and network failures, mobile layout, accessibility and browser console errors.
- Configure password policy, MFA/abuse protection as appropriate, Firebase App Check where supported, backups, logging, support and privacy/data retention terms.

## 3. Important limits before commercial launch
This package is a **functional development build when Firebase is configured**, not a certified commercial launch. It has no admin console, paid subscriptions, user data export/deletion workflow, server-side job ingestion, AI model, email job alerts, integrated PDF engine, billing, legal policy pages, or automated security/integration test suite. Firebase service limits and costs apply. Add privacy policy and terms, deletion pathway, abuse controls, observability, data backup/restore, secure automation and test coverage before serving paying customers.

GitHub Pages does not execute server-side code. Firebase supplies authentication and per-user Firestore data persistence.
