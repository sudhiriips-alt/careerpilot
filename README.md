# CareerPilot — Local-first Web + Mobile PWA MVP

A **functional first version** of a job search/application tracker. Inspired by job-tracking workflows, not affiliated with Teal.

## Features
- Responsive dashboard with pipeline metrics and follow-ups
- Add, edit, delete and search job applications
- Kanban-style tracker with stage updates
- Status, priority, work type, deadlines, notes, job URL
- Dedicated follow-up list and overdue indicators
- Curated outbound links to job boards (not live job ingestion)
- Rule-based career coach, clearly labeled as a demonstration (not a connected AI model)
- Local browser storage, JSON backup export and CSV export
- Installable Progressive Web App, offline cache after first load

## Run locally (no Node or Gradle required)

In the extracted folder:

```bash
python -m http.server 8080
```

Open http://localhost:8080. Python is only needed for this convenient local server. You can also open `index.html` directly to preview, though service-worker install requires HTTPS or localhost.

## Deploy for free

Upload the files to a static hosting service, e.g. GitHub Pages, Netlify, or Cloudflare Pages. Once served over HTTPS, supported Android browsers can offer **Install app** / **Add to home screen**. Desktop browsers can also install it. No APK is included.

## Data and security

All application records are stored **only in this browser's localStorage**. No server, authentication, email integrations or cross-device sync is present. Clearing browser storage may permanently erase data, so use **Export JSON backup** regularly. There is no fake sample job database or fake live job feed. Job board buttons open third-party websites.

## Roadmap for a production platform

1. Firebase/Supabase authentication, Postgres/Firestore with per-user access controls, encrypted transport, data deletion/export.
2. Licensed/authorized job feeds/APIs, canonical links, source provenance, deduplication and closing dates.
3. Server-side LLM-assisted job matching and resume tailoring with grounded job descriptions, guardrails and cost controls.
4. User-authorized Gmail/calendar integrations, reminders via push/email and audit-friendly tracking.
5. Android build through Capacitor or Trusted Web Activity with cloud CI, app signing and store policy checks.
6. Automated accessibility/security tests, telemetry, privacy policy and consent.

Do not treat the demo career coach as actual generative AI or the job discovery links as an integrated jobs API.
