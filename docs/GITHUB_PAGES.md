# GitHub Pages deployment

The source site lives on `main`. Each deployment refreshes public repository
metadata, creates a static Next.js export in `out`, and publishes exactly that
directory to the root of the real `gh-pages` branch. GitHub Pages then serves
the branch at `https://stevo.ai`.

## One-time repository setup

### 1. Create the deployment key

GitHub does not start a branch-based Pages deployment when a workflow pushes
with its built-in `GITHUB_TOKEN`. This workflow therefore uses a dedicated,
repository-scoped Ed25519 deploy key for the final `gh-pages` push. The key has
no access to other repositories or account resources. Public project metadata
is read with the workflow's read-only `GITHUB_TOKEN`.

1. Generate a dedicated SSH key pair with no passphrase.
2. In **Settings → Deploy keys**, add the public key with write access.
3. In **Settings → Secrets and variables → Actions**, create a repository
   secret named `ACTIONS_DEPLOY_KEY` containing the private key.
4. Delete the local key-pair files after the secret and deploy key are saved.

Never add the private key to a file in this repository, a commit, workflow
variable, or log. Replace both halves together if the key is ever rotated.

GitHub documents the `GITHUB_TOKEN` branch-build limitation under
[publishing from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch).

### 2. Run the first deployment

Open **Actions → Sync projects and deploy GitHub Pages → Run workflow**. The
workflow must finish successfully and place `index.html`, `CNAME`, and
`.nojekyll` at the root of `gh-pages`.

If branch protection is enabled on `gh-pages`, allow the deploy key to push, or
remove protection from this generated branch. Source changes belong on `main`;
do not edit generated `gh-pages` files by hand.

### 3. Configure Pages

In **Settings → Pages → Build and deployment**:

1. Select **Deploy from a branch** as the source.
2. Select `gh-pages` and `/(root)`.
3. Save, then set the custom domain to `stevo.ai`.

The workflow recreates `CNAME` and `.nojekyll` inside `out` before every push,
so the custom domain and Jekyll bypass survive replacement deployments.

## Domain and HTTPS setup

Verify `stevo.ai` in the `stevologic` account before changing DNS. Domain
verification protects against Pages domain takeovers.

For the apex domain, add these GitHub Pages `A` records at the DNS provider:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

GitHub also documents optional IPv6 `AAAA` records. Add a `www` `CNAME` record
pointing directly to `stevologic.github.io` so GitHub can redirect between the
apex and `www` forms. Do not use wildcard DNS records. Once GitHub has issued
the certificate, enable **Enforce HTTPS** in Pages settings. DNS and certificate
changes can take up to 24 hours.

See [GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
and [domain-verification instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

## Project metadata synchronization

`content/projects.json` is the editorial source of truth. It is normally a
top-level array; each project with a GitHub repository uses a `repo` value such
as `mouseclicker` or `stevologic/mouseclicker`. Full GitHub URLs are also
accepted. Projects without a repository can omit `repo`.

`scripts/sync-github.mjs` fetches public repository metadata and up to 100
public releases per listed repository, then replaces
`data/github.generated.json` only after every request succeeds.

In GitHub Actions, synchronization is strict: a missing project file, malformed
repository identifier, private or unavailable repository, API failure, or
unexpected response stops the deployment. The currently published site remains
unchanged when that happens.

For local development, run:

```sh
node scripts/sync-github.mjs
```

An API token is optional for public data. Set `GITHUB_TOKEN` or `GH_TOKEN` to
raise the API rate limit. If GitHub is unavailable locally, the script keeps the
committed snapshot when it covers every configured repository. To explicitly
work offline, set `GITHUB_SYNC_OFFLINE=1`. To reproduce CI failure behavior,
set `GITHUB_SYNC_STRICT=1`.

The workflow runs on every `main` push, by manual dispatch, and daily at 08:17
UTC (01:17 America/Phoenix). Scheduled builds fetch new repository activity and
releases without adding generated commits to `main`.

## Troubleshooting

- **`ACTIONS_DEPLOY_KEY is not configured`**: create or replace the repository
  secret with the exact name `ACTIONS_DEPLOY_KEY`.
- **Push rejected**: confirm the matching public key is installed as a writable
  deploy key and is allowed by branch protection.
- **Workflow succeeds but the site does not update**: confirm Pages is set to
  `gh-pages` and `/(root)`, not to the GitHub Actions publishing source.
- **Build has no `out/index.html`**: the application must use Next.js static
  export (`output: "export"`) and `npm run build` must produce `out`.
- **Pages returns 404**: confirm Pages is enabled and is serving `gh-pages` from
  `/(root)`.
- **Custom domain fails**: verify the account-level domain first, remove
  conflicting or wildcard DNS records, and confirm `out/CNAME` contains only
  `stevo.ai`.
