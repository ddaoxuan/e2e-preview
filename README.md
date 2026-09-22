# Preview lab

A Next.js app with a small interactive launch checklist and Playwright end-to-end tests. Tasks live in memory and reset on reload; no backend or external data is needed.

## Development

This project uses pnpm (the version is pinned in `package.json`).

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

## End-to-end tests

Install Chromium once, then run the suite:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

On Linux/CI, use `pnpm exec playwright install --with-deps chromium` to install system dependencies too.

By default, Playwright builds the app, starts a production server at http://127.0.0.1:3100, runs the tests, and stops the server. Port 3100 must be free. Tests run in desktop Chromium and a mobile Chrome viewport (Pixel 7 emulation, not a real device).

The examples in `e2e/checklist.spec.ts` cover:

- Initial page content and progress
- Adding a task with keyboard submission
- Blank-input validation and recovery
- Completing and reopening tasks
- Filtering and the all-complete empty state

Each test starts with a fresh page and uses accessible roles and labels rather than CSS selectors or fixed sleeps.

### Useful commands

```sh
pnpm test:e2e:ui                       # Interactive runner
pnpm exec playwright test --project=chromium # Desktop only
pnpm test:e2e:report                   # Open the last HTML report
```

### Test an already running app or preview

Set `BASE_URL` to skip the local build and server entirely:

```sh
BASE_URL=http://localhost:3000 pnpm test:e2e
BASE_URL=https://your-preview.vercel.app pnpm test:e2e
```

`BASE_URL` must be a full URL, including the scheme. Remote deployments must be accessible to the test runner; deployment-protection authentication is not configured by this example. Keep the preview and test checkout on the same revision.

The existing `.github/workflows/e2e.yaml` runs on Vercel's `vercel.deployment.ready` repository dispatch for previews associated with an open PR. It installs pnpm dependencies and Chromium, passes the deployment URL as `BASE_URL`, and uploads the HTML report. CI retries failures twice and records a trace on the first retry; failure screenshots and traces are available in the report. The Vercel repository-dispatch integration must be configured separately.

The workflow publishes an `E2E / Preview` commit status on the deployed commit so it appears on the matching PR. It starts as pending and links to the Actions run; a separate reporting job publishes success, failure, or error (for a cancelled/skipped E2E job). Setup and artifact-upload failures also fail the status. GitHub's native workflow checks remain attached to the default-branch commit because this uses `repository_dispatch`.

Workflow changes must land on the default branch (`main`) before a new deployment-ready event will use them. Updating only the PR branch or rerunning an old run does not activate the new workflow.
