# CareerPilot growth suite — implementation plan

Created on 2 November 2026. This branch is **not production-ready**. Its first functional increment is local, transparent resume-to-job vocabulary analysis. Features below are **planned**, not falsely represented as implemented.

## Delivery gates
0. **Release baseline**: complete two-account staging and mobile security/integration validation of PR #1 before merge; test scanned PDFs, offline failures, consent, Firebase rules, and tracker regression.
1. **Resume-to-job alignment**: local, evidence-only keyword coverage; manually compare genuine job descriptions to current resume; no ATS-score or hiring prediction claims. Next: skills taxonomy, requirement classification, editable suggestions, test corpora and language handling.
2. **Real job discovery**: permissioned licensed API/feeds, per-source provenance, attribution, deduplication, expiry checks, search filters for remote/on-site and freelance/consulting, and user-controlled save. Do not scrape sites against terms or invent listings.
3. **Enhanced tracker**: timeline of interactions, interview events, contacts, attachment references, privacy-safe backups, accessibility, optimistic write/error recovery and conflict handling.
4. **AI career assistant**: authenticated backend proxy, server-side key handling, cost caps, opt-in sending, consent and retention controls; no client-side AI secrets or invented credentials.
5. **Job alerts**: saved-search subscriptions, opt-in email/push, unsubscribe, rate limiting, quotas, transparent freshness and retention.
6. **Cover letters**: evidence-grounded drafts with user review and explicit send/export, never autofill invented skills or submit applications automatically.
7. **Interview practice**: role-specific question sets, structured STAR preparation, optional private AI feedback, no automated hiring evaluation.
8. **Multiple resumes**: immutable versions with labels, resume-to-application linking, private storage, migration and per-user security rules.
9. **Job authenticity**: source/URL signals and warnings only, transparent limitations, no ungrounded “verified” guarantee.
10. **Career analytics**: conversion funnel and deadline trend from user's private data; no cross-user exposure.
11. **Project/consultancy opportunities**: contract duration, scope, tender deadlines, eligibility, deliverables and geographic filters, alongside jobs.
12. **Languages**: Hindi and selected Indian languages with localization, translated interface and human-reviewed high-impact wording.
13. **Commercial readiness**: policy/legal review, deletion/export, accessibility, support, monitoring, India-first pricing research, billing only after compliance and reliability gates.

## Engineering safeguards
- Keep existing production GitHub Pages and Cloudflare Worker unchanged; staging deployments require explicit authorization.
- PR #1 is currently in Draft. Do not merge it as a side effect of this work.
- Existing Firebase Auth and Firestore project remain unchanged. Do not enable additional public storage or relax rules.
- This module does not send descriptions or resumes to a server, save them, or modify profile/resume data.
- Staging packaging must include each new script; update cache/version and tests whenever public assets change.
- For each phase require tests, a reviewable PR, stage deployment, real-account/mobile checks, security and cost review.
- Avoid claims of real AI, live feeds or ATS certification until implemented and independently validated.
