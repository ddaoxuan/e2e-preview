# Preview lab
t2est3

test with pr

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

<<<<<<< Updated upstream
The existing `.github/workflows/e2e.yaml` runs on Vercel's `vercel.deployment.ready` repository dispatch for previews associated with an open PR. It installs pnpm dependencies and Chromium, passes the deployment URL as `BASE_URL`, and uploads the HTML report. CI retries failures twice and records a trace on the first retry; failure screenshots and traces are available in the report. The Vercel repository-dispatch integration must be configured separately.

The workflow publishes an `E2E / Preview` commit status on the deployed commit so it appears on the matching PR. It starts as pending and links to the Actions run; a separate reporting job publishes success, failure, or error (for a cancelled/skipped E2E job). Setup and artifact-upload failures also fail the status. GitHub's native workflow checks remain attached to the default-branch commit because this uses `repository_dispatch`.

Workflow changes must land on the default branch (`main`) before a new deployment-ready event will use them. Updating only the PR branch or rerunning an old run does not activate the new workflow.
=======
## GitHub Actions: two independent strategies

Both workflows are enabled as examples. Keeping both enabled can run E2E twice for the same commit. Choose one in production by disabling the other in GitHub Actions (or removing its workflow file). They replace the previous repository-dispatch workflow and use Vercel's GitHub deployment records directly.

### Every successful preview: `.github/workflows/e2e-preview.yaml`

Triggered by `deployment_status`, filtered to state `success` and environment `Preview`. It checks out `deployment.sha` and tests `deployment_status.environment_url`. There is no PR lookup or polling: previews are tested whether or not a PR exists yet. GitHub associates the run with the deployed commit; a later PR using that commit can show its checks. Production and unsuccessful deployment events do not run E2E.

### PRs only: `.github/workflows/e2e-pr.yaml`

Triggered when a PR is opened, updated with new commits, reopened, or marked ready for review. It also runs for draft PRs. A separate read-only job polls GitHub deployments immediately, then every minute for up to 20 minutes, matching the exact `pull_request.head.sha` and `Preview` environment. It selects the newest matching deployment and checks its latest status, never falling back to another commit or an older successful deployment.

A successful deployment supplies its URL to E2E, which checks out that same PR head SHA (not GitHub's synthetic merge commit). A failed, errored, or inactive deployment fails the wait immediately; no deployment, no status, or a pending deployment waits until the deadline. API errors and missing/invalid success URLs fail visibly. New PR events cancel older runs for that PR.

This handles either ordering: a preview can be ready before the PR opens, or become ready afterward. If a deployment fails and you redeploy the same SHA later, rerun **all jobs** in this PR workflow; a redeployment by itself does not trigger it. PR workflows also follow GitHub's normal fork-approval and merge-conflict restrictions. Fork previews must be approved/created by Vercel before the wait expires; no elevated `pull_request_target` token or deployment-protection secrets are supplied.

For PR branch protection, require `E2E / PR result`. This final job fails if either the deployment wait or E2E fails, so a skipped test job cannot hide a deployment timeout. The polling deadline covers deployment readiness only; the test job has its own 20-minute timeout.

### Shared behavior

Both strategies install pnpm dependencies and Chromium, use `BASE_URL` to avoid starting a local server, and upload distinctly named Playwright reports. CI retries test failures twice and records a trace on the first retry; failure screenshots and traces are available in the report. Previews must be accessible to the runner. Neither strategy prevents Vercel from deploying; PR checks can gate merging, not deployment.

Commit the chosen workflow before triggering a new deployment/PR event. Rerunning an old Actions run uses its original workflow revision. Environment matching is deliberately case-sensitive (`Preview`), matching this repo's Vercel integration. If multiple Vercel projects share this repo and environment name, add project-specific filtering before using these examples.
>>>>>>> Stashed changes
