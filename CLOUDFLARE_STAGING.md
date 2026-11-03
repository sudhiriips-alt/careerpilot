# CareerPilot manual staging deployment

Branch: `feat/resume-document-import`. Existing PR #1 remains unmerged. Production Worker `careerpilot`, GitHub Pages and Firebase configuration/rules are unchanged.

## Existing workflow

`.github/workflows/deploy-staging.yml` is present and uses **repository Actions secrets**, without a GitHub Environment dependency. No Cloudflare dashboard configuration or terminal work is required from the user by this guide.

The workflow:

- Has only `workflow_dispatch`, with no user-controlled Worker name, routes or commands.
- Accepts only repository `sudhiriips-alt/careerpilot` and branch `feat/resume-document-import`, with independent guards before checkout and immediately before deployment. Main, tags, forks and automatic events cannot deploy through it.
- Uses read-only GitHub contents permission, SHA-pinned actions and exact-commit checkout without persisted credentials. Runs are serialized and time-limited.
- Builds using existing `scripts/build-staging.mjs` and `wrangler.staging.json`, runs five Node approval/auth/batch/package tests, installs Wrangler 4.156.0, performs a dry-run and tests local HTTP asset serving.
- Injects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` only into the final deployment step. Missing values fail before the deployment command. No secret values are logged or committed.
- Deploys only `careerpilot-staging`, with no production routes. Wrangler repeats the same reviewed allowlisted copy build during deployment.

The public package contains the application, local PDF.js/Mammoth files and their licenses, and staging cache/noindex headers. Repository rules, tests, docs and configuration are excluded. Missing assets return 404 rather than index.html.

## One simplest authorization action

**Authorize a trusted technical helper with GitHub/Cloudflare administration access to complete the one-time repository authorization.** The user does not need to navigate Cloudflare token settings or paste credentials into chat.

Handoff for that helper: securely add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` under this repository's **Settings → Secrets and variables → Actions → Repository secrets**. Use a token scoped as narrowly as possible to `careerpilot-staging` in the intended Cloudflare account. Do not use a global API key, commit a token or grant production access merely for convenience. No GitHub environment creation or environment-secret setup is needed. These settings were not changed or verified in this task.

There is also a GitHub activation prerequisite: `workflow_dispatch` requires the workflow file to be registered on the default branch (`main`). A separately authorized/reviewed **workflow-only** addition on main is necessary before manual execution is available. This is not a reason to merge the unvalidated app changes in PR #1. No main-branch change, default-branch change or dispatch was performed here; the helper must obtain authorization for registration separately.

Once both prerequisites are satisfied, an authorized repository writer can manually run **Actions → Deploy CareerPilot staging (manual)** with branch **feat/resume-document-import** selected. Selecting main will skip the deployment job. Repository secret names alone do not establish that credentials are valid; Cloudflare authorization must succeed during an explicitly authorized run.

## Evidence and limits

The existing workflow was reviewed and changed only to remove its GitHub Environment dependency and correct its missing-secret message. Current validation passed: five Node tests, YAML/manual-trigger/read-only-permission/secret-scope checks, Bash syntax, allowed-branch and denied main/tag/push/fork guard cases, and failure before deployment when credentials are empty. Previous local Wrangler dry-run and HTTP-serving evidence is recorded in PR #1; those deployment commands did not change in this update. No GitHub-hosted workflow was run.

No usable Cloudflare credentials are configured in this session. The available GitHub connector cannot inspect repository secrets, so their presence/validity is **unverified**, not asserted absent. No suitable Cloudflare authorization plugin was found in the available plugin search. No deployment was attempted and no live staging URL is claimed.

This is hosting isolation only: Firebase remains `careerpilot-ed4af` with its existing data. Use synthetic resumes and dedicated test accounts after deployment. Authorized-domain status, browser import/mapping/approval/cancellation, account switching, real persistence/reload, deployed rules, mobile/service-worker behavior and tracker CRUD remain pending staging checks. Static/mock/emulator checks do not establish production Firebase integration or a SAFE TO MERGE recommendation.

GitHub event/ref checks are workflow guards, not configured repository branch-protection rules. Repository secrets can be accessed by trusted workflow code; restrict branch write access and use a staging-scoped Cloudflare token. No production credentials are needed for this staging workflow.

References:

- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
