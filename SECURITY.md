# Security Policy

## Credentials

Do not commit passwords, access tokens, API keys, private keys, cookies, or local
machine credentials. Runtime secrets must be supplied through an ignored local
environment file, an operating-system credential store, or the deployment
platform's secret manager.

The repository previously tracked a local machine credential. Removing it from
the current tree does not remove it from Git history. Before sharing or pushing
the repository, the credential owner must rotate it. Any history rewrite must be
coordinated with every collaborator because it changes commit and tag IDs.

### Current remediation status (2026-07-13)

- The current working tree no longer contains the exposed credential.
- `npm run check:secrets` passes for the current tracked and untracked files.
- The old value is still reachable from repository history through `master` and
  the existing release tags. A full-history Gitleaks scan is therefore expected
  to fail until history is rewritten.
- Credential rotation is an operating-system action and has not been verified by
  this repository. Treat the old value as compromised until the owner confirms
  rotation.
- This local repository currently has no Git remote configured, so no remote
  cleanup or collaborator coordination has been performed.

### Local-only risk acceptance

The repository owner has chosen not to rotate the exposed local credential or
rewrite Git history while this remains a local-only project. This is an explicit
risk acceptance, not proof that the credential is safe.

Until rotation and history cleanup are completed:

- do not add a Git remote;
- do not push, publish, archive, or share the repository or its `.git` directory;
- do not use the exposed value for any remote account, service, deployment, or
  shared machine;
- reopen the remediation procedure below before onboarding collaborators.

### Required remediation order

1. Rotate the exposed credential outside Git and verify the old value no longer
   works. Never paste either value into an Issue, PR, chat, or command log.
2. Notify every collaborator and choose a history-rewrite window. Stop merging
   and tagging during that window.
3. Create a separate backup clone before rewriting history.
4. Use `git filter-repo` to replace the old value in every commit and tag. Keep
   any temporary replacement file outside the repository, restrict its file
   permissions, and delete it immediately after the rewrite.
5. Run a full-history Gitleaks scan and `npm run verify` against the rewritten
   clone.
6. Force-push rewritten branches and tags only after the scan passes, then have
   collaborators discard old clones and clone the repository again.

Do not merge a Gitleaks allowlist for this incident. An allowlist hides the
exposure but does not revoke the credential or remove it from distributed Git
objects.

## Required Checks

Run the following before opening or merging a pull request:

```bash
npm run verify
```

GitHub CI additionally runs Gitleaks. Do not suppress a real finding with an
allowlist; revoke the credential and remove it from the affected history.

## Reporting

Report suspected credential exposure privately to the repository owner. Do not
include the credential value in an Issue, PR, chat, screenshot, or log.
