# Protected preview E2E tests

Both preview workflows pass the repository Actions secret `VERCEL_AUTOMATION_BYPASS_SECRET` only to the `pnpm test:e2e` step. Create the value in the Vercel project's Deployment Protection settings under Protection Bypass for Automation, then store it in GitHub Actions secrets with that name.

To set or rotate the GitHub secret without putting it in shell history, run this command and paste the value at its hidden prompt:

```sh
gh secret set VERCEL_AUTOMATION_BYPASS_SECRET --repo ddaoxuan/e2e-preview
```

Rotate any value shared in chat. Update Vercel and GitHub together and redeploy as required by Vercel after changing the secret. This authenticates test requests; it does not unblock a failed deployment build.

Playwright reads the secret only when `BASE_URL` is set, requires HTTPS when using it, and sends `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie: true`. Local server tests remain unauthenticated. Remote CI runs fail clearly if the secret is missing. Fork PRs and Dependabot PRs do not normally receive repository Actions secrets and therefore cannot run these protected-preview tests successfully; do not use `pull_request_target` to expose the secret to their code.

Only run secret-bearing jobs against trusted code and trusted preview URLs. The test process can access this secret, and Playwright's context-wide headers also apply to third-party requests: these examples assume the app stays on trusted resources. Before adding external resources, switch to origin-scoped authentication. This bypass is project-wide, not limited to one deployment.

Traces are disabled whenever the bypass secret is used because they can capture authentication headers and cookies. HTML reports and failure screenshots remain enabled; treat all test artifacts as potentially sensitive and do not log credentials or headers in tests. Existing README statements about no deployment-protection authentication and always recording retry traces no longer apply to protected runs. README currently contains pre-existing merge-conflict markers that need separate resolution.

Reference: [Vercel Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).
