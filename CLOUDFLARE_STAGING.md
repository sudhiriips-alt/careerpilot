# Isolated CareerPilot Cloudflare staging

Prepared 2 November 2026. Branch `feat/resume-document-import`, existing PR #1. No remote deployment, production change, merge, Firebase setting change or rule publication was performed.

## Hosting choice and isolation

Use Workers Static Assets, with no Worker entry-point script, rather than legacy Workers Sites or a Pages deployment. `wrangler.staging.json` targets **careerpilot-staging** only, with no routes/custom domains/account ID and no named environments. Both workers.dev and version URLs are enabled. A custom build copies an explicit public-file allowlist into `dist/staging`; never use the repository root as `assets.directory`.

The existing production Worker `careerpilot` and GitHub Pages are not deployment targets. There is no default Wrangler config or new deployment workflow. Do not run a bare `npx wrangler deploy`, change the staging name to `careerpilot`, attach production routes, or edit the existing production Worker's build settings.

The app changes views in JavaScript without client-side path routing. Consequently `not_found_handling: none` is intentional: a missing script must return 404, not index.html. Normal HTML canonical redirects are allowed. The staging-only `_headers` source disables search indexing, revalidates assets and sets no-store for sw.js/Firebase config. Local Firebase configuration is copied byte-for-byte; it is public Web SDK configuration, not an admin credential. Vendor parser files and their licenses are included.

## Safe staging action

From this branch in the repository root, in a Cloudflare-authenticated cloud terminal/account:

```sh
npx wrangler@4.156.0 deploy --config wrangler.staging.json --name careerpilot-staging
```

Wrangler runs `node scripts/build-staging.mjs` automatically. This command publishes only the separate staging Worker; it is not a production deployment. Confirm the selected Cloudflare account owns the existing CareerPilot project. If the CLI is unauthenticated, authenticate in that trusted terminal with `npx wrangler@4.156.0 login`, or configure an appropriately scoped Cloudflare API token and account ID in the cloud runner's secret settings. Never commit credentials or paste them into frontend configuration. No login was started here.

Alternatively create a **new** Cloudflare Workers Git-connected application named `careerpilot-staging`, connect `sudhiriips-alt/careerpilot`, select `feat/resume-document-import` as that application's build branch, and use:

- Root directory: repository root.
- Build command: `node scripts/build-staging.mjs`.
- Deploy command: `npx wrangler@4.156.0 deploy --config wrangler.staging.json --name careerpilot-staging`.

Do not configure those commands on the existing `careerpilot` Worker. Cloudflare may label the separate Worker's active branch as its “production branch”; that label applies to the staging Worker, not the existing production site. Creating this separate application does not require merging PR #1.

## Expected URLs

After the first staging publish:

- Stable staging URL: `https://careerpilot-staging.<account-subdomain>.workers.dev`.
- Version/preview URL: `https://<version-prefix>-careerpilot-staging.<account-subdomain>.workers.dev`.

The actual account subdomain and version prefix are reported by Cloudflare; neither is known here. These are URL templates, not live links. With version URLs enabled, a staging deploy creates a version URL. For subsequent preview-only uploads to the existing staging Worker:

```sh
npx wrangler@4.156.0 versions upload --config wrangler.staging.json --name careerpilot-staging --preview-alias resume-import
```

The alias URL is `https://resume-import-careerpilot-staging.<account-subdomain>.workers.dev`. Version uploads do not promote that version to the Worker's active deployment. This is a Worker version URL, not a Cloudflare Pages `pages.dev` preview. The dashboard's missing Preview entry for the existing main Worker is not fixed by deploying over production; create/upload staging separately. The existing dashboard settings were not accessible for inspection here.

## Validation evidence

Passed locally:

- Two staging package checks: all HTML/manifest/service-worker/parser references resolve; correct isolated Worker target; exact asset bytes; no source tests, rules, docs or credentials in the public package.
- Wrangler 4.156.0 `deploy --dry-run` with explicit staging config/name; no upload performed.
- Local Wrangler/workerd HTTP test: root/index plus all 11 other application assets served with exact bytes and correct MIME; staging security/cache headers applied; missing assets, .git/config, rules, configuration, tests, README and _headers all returned 404.
- Three existing Node approval/auth/batch regression tests passed. JavaScript syntax and diff whitespace checks passed.

Local runtime warned that Request.cf metadata could not be fetched and used its documented placeholder; asset serving passed. Compatibility date is pinned to 2026-10-01 because the runtime clock rejected 2026-11-02 as future. This does not alter application code.

Commands to reproduce without publishing:

```sh
node scripts/build-staging.mjs
node --test tests/staging_assets_test.cjs tests/auth_race_test.cjs tests/cloud_import_test.cjs
npx wrangler@4.156.0 deploy --dry-run --config wrangler.staging.json --name careerpilot-staging
npx wrangler@4.156.0 dev --local --config wrangler.staging.json --port 8787
```

While the local server runs, in another terminal:

```sh
STAGING_TEST_URL=http://127.0.0.1:8787/ node --test tests/staging_http_test.cjs
```

The HTTP check also accepts only the separate staging workers.dev/version hostnames for a later remote smoke test. It refuses production hosts. On Windows use the shell's environment-variable syntax, or run in the cloud terminal.

## Remaining blockers and Firebase boundaries

Wrangler `whoami` reported **not authenticated**. There is no confirmed Cloudflare account ID, workers.dev subdomain or deployment URL; no Cloudflare upload/deploy was attempted. The cloud runtime status tool/policy file were unavailable, so no managed Cloudflare identity readiness is inferred. GitHub authorization is separate from Cloudflare authorization.

This is **hosting isolation only**. Firebase remains project `careerpilot-ed4af`, including its existing data and rules. Staging sign-ins and approved saves will use that project. Use dedicated test accounts and synthetic resumes; do not treat staging as an isolated database. The staging hostname may need to be present in Firebase Authentication's authorized domains for relevant sign-in flows. Existing domain authorization was not verified or changed. If it is missing, report the blocker before any separately authorized Firebase settings change.

The previous pre-merge browser and real-account checks remain pending: import PDF/DOCX/scans, mapping/approval/cancellation, retry/account switching, deployed rules, persistence/reload, tracker CRUD, mobile upload and service-worker update. Static serving success does not establish Firebase integration or a SAFE TO MERGE result. PR #1 remains DO NOT MERGE pending that validation.

References: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/.
