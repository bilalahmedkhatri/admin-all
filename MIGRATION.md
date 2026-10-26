# AI Gateway TailAdmin migration

The replacement frontend lives in this folder and uses the supplied TailAdmin Next.js template. The FastAPI backend and its database/API contracts are unchanged. The old Remix dashboard remains a reference and rollback option.

## Run locally

1. Install the locked dependencies with npm ci.
2. Copy .env.example to .env.local if defaults need changing. Set GATEWAY_URL to the existing gateway and ADMIN_ORIGIN to the exact dashboard origin. Both variables are server-only; do not prefix them with NEXT_PUBLIC_.
3. Run npm run dev and open http://localhost:3002. For a production build, use npm run build followed by npm start.

Keep the existing dashboard origin and Google callback path (/auth/google/callback). A new deployment origin would need separately verified backend OAuth/origin configuration; this migration does not change it. Production requires explicit GATEWAY_URL and ADMIN_ORIGIN. Serve the deployed frontend over HTTPS; cookie Secure follows the configured origin so local HTTP development remains usable.

## Implemented behavior

- TailAdmin sidebar/header, theme context, forms, tables, badges, modal, buttons, cards and charts are reused/adapted. Demo navigation is replaced by permission-filtered gateway pages; leftover demo destinations redirect to Overview.
- Existing Overview, endpoint catalog/detail/execution, API keys, authorized apps, provider models, activity, request history/details/graphs, team permissions, credential settings and profile are connected to existing APIs.
- Existing Google sign-in/browser binding, access request/email verification, pending approval and logout flows are adapted to Next.js. No new identity provider, local user database, CORS grant or backend route is introduced.
- Gateway HTTP calls are confined to server-only services and explicit Server Actions. The browser talks to Next.js; there is no generic caller-controlled gateway proxy. The authenticated browser-network sweep observed zero direct gateway requests.
- Page reads and each mutation independently validate the backend session and existing permissions. Only explicit action routes are accepted. Mutation Origin, identifiers and upload bounds are checked, with Next's own action-origin and body-size protections retained.
- Session cookies retain compatibility with existing opaque backend sessions and remain HttpOnly/SameSite=Lax with an eight-hour browser lifetime. Backend validation remains authoritative. Saved gateway credentials never enter browser bundles or storage. Newly issued one-time app keys and the existing administrator master-key workflow retain their authorized UI behavior.
- Sensitive fetches/pages are dynamic and use no-store. Responses include nonce-based script CSP, same-origin browser connect policy, frame denial, nosniff and a same-origin referrer policy. OAuth redirect responses retain no-referrer. Inline styles remain allowed for the template and chart library; development alone permits eval/WebSocket connections for Next tooling.
- Request filters, UTC boundaries, legacy query bookmarks, pagination and detail selection are retained. Summary/detail failures preserve the table except authorization failures. Null metrics stay unknown; charts show numeric data labels and scroll for dense ranges. Provider estimates and customer billing retain their existing distinctions.
- English remains the only enabled locale. Migrated visible JSX copy uses next-intl keys maintained across template dictionaries; inactive language copy still needs human translation before enabling those locales.

## Verification and limits

- npm test: 28 isolated tests passed, including direct Server Action authorization, session/approval handling, OAuth binding, key/app/model operations, safe errors, request filtering and summary/detail failure behavior.
- npm run typecheck, npm run lint and npm run build passed.
- Browser checks used tests/mock-gateway.cjs, synthetic accounts and a separate local frontend port. All ten main pages returned 200 for the fake administrator. A viewer received 403 on the team page; a signed-out user was redirected to login.
- Model creation and one-time key creation/close behavior passed against that fixture. Request details, visible chart labels, mobile dark-mode contrast and horizontal overflow were checked. Preview screenshots in docs/verification contain fabricated data.
- Full npm audit and production-only npm audit --omit=dev both report zero vulnerabilities after a clean npm ci. The scoped lint override below removes the vulnerable dependency chain without suppressing findings or downgrading Next.js. The earlier framework patch addressed https://github.com/advisories/GHSA-vcvr-r3jv-pc5j.
- Real Google sign-in/email delivery, configured gateway/database/provider acceptance and deployment remain unverified. No production records, backend files, grants, migrations or real provider calls were changed by these checks.

## Relevant code

- src/lib/gateway: server transport, auth, runtime checks, existing domain services and explicit Server Actions.
- src/components/gateway: migrated feature presentation wired to TailAdmin primitives and form state.
- src/app/[locale]: TailAdmin route groups, protected pages and auth handlers.
- tests: isolated regression suites and a local-only fake gateway fixture. Never point production configuration at that fixture.

Final production-mode browser checks also passed: private/no-store headers, script nonce policy without unsafe-eval, foreign-Origin authentication POST denied with 403, model creation through a server action, zero direct browser gateway calls, request input/output details, theme switching and mobile sidebar navigation. No browser console errors were observed in the final production checks.

## Native Google login Origin regression

The page-level Referrer-Policy is same-origin. The previous no-referrer page policy caused native login form POSTs to send Origin: null, which the strict mutation guard correctly rejected. Missing/null/foreign Origins remain rejected; the authorization guard and backend are unchanged. OAuth response redirects continue to use no-referrer.

With the local dashboard running, open /login in an isolated Playwright CLI session, then run playwright-cli run-code --filename tests/login-origin.browser.js in the same session. The scenario intercepts the native form before any gateway/Google call and verifies the actual browser Origin plus three rejection cases. It does not claim real Google account/provider acceptance. Browser behavior reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin.


## Temporary Next ESLint dependency override

The package.json override applies only to @next/eslint-plugin-next: its fast-glob dependency resolves to npm:tinyglobby@0.2.17. This removes the development-only fast-glob -> micromatch -> braces chain affected by https://github.com/advisories/GHSA-vfj7-8cjw-p6xm. Next.js remains 16.3.8; eslint-config-next and @next/eslint-plugin-next remain 16.4.2, with the existing lint rules preserved.

This dashboard uses the default project root (process.cwd()). The installed Next lint plugin does not invoke glob matching in that mode. tinyglobby and fast-glob have different directory-glob defaults, so this is a deliberately limited compatibility override. tooling/lint-root-guard.mjs validates the exported ESLint configuration and throws a clear error when settings.next.rootDir is configured, including custom string and array roots. Verify glob compatibility before enabling custom roots.

Regression tests verify the actual alias resolution, unchanged default root, custom-root rejection, detection of a representative Next lint violation, and absence of the vulnerable chain from the lockfile. Clean npm ci, 28 tests, typecheck, full lint with zero warnings, and the production build passed. Both full and production-only audits reported zero findings on 2026-10-21. These tooling checks do not establish real OAuth/provider or deployment acceptance.

When an official compatible upstream dependency fix is available, remove only the @next/eslint-plugin-next override, regenerate the lockfile, and repeat clean npm ci, both audits, dependency-tree inspection and all regression/lint/type/build checks. Remove or revise the temporary guard and alias-specific test only after confirming the upstream custom-root behavior.
## Overview child pages and icon scaling (2026-10-21)

Overview is now an expandable sidebar group with Summary (/), API collections (/overview/collections), Usage analytics (/overview/analytics), and Recent activity (/overview/recent-activity). The existing content is split across these pages. Child URLs require the existing overview permission; collections and recent activity also retain their endpoint/activity permissions. Existing server-only gateway loaders and session checks remain in use.

Both SVG loader configurations preserve viewBox while allowing CSS sizing, fixing clipped header, account, refresh and summary icons. Menu and Refresh use dedicated SVG assets. Per the requested presentation, Overview token/cost charts show their exact values only in hover tooltips; other chart labels retain their existing behavior.

Verification: production build, typecheck, full lint, and 30 isolated tests passed. A production-mode browser check against a local fake gateway verified all four child pages, dropdown collapse/expand, 25 visible SVG coordinate systems, exact token/cost tooltips without point labels, mobile navigation without page overflow, signed-out login redirection and unknown-section 404. The browser made zero direct gateway requests. docs/verification/overview-child-analytics.png contains synthetic data. Real provider and deployment acceptance were not part of this UI change.
## Shared page loading (2026-10-21)

The existing src/components/gateway/loading.tsx spinner is reused through common/PageLoading.tsx and shared loading.tsx boundaries under [locale] and the admin route group. Pending routes show a centered animated circle with a localized status message; the dashboard header/sidebar remain available while page content loads. The Overview Refresh button also shows the existing spinner while its refresh transition is pending. Existing button/section loading consumers are preserved. Instant or already-loaded navigation may complete without displaying a fallback; no artificial production delay was added.

Verification: production build (including TypeScript), full lint and 30 isolated tests passed. A production-mode browser check against an isolated fake gateway with delayed responses verified visible animated loaders on API endpoints, AI requests and Settings, automatic removal after data loads, disabled Refresh with a pending spinner, and zero direct browser gateway requests. Screenshot docs/verification/page-loading-spinner.png uses synthetic data. No packages or backend files were changed.
