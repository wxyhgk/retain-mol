# Codex Sites metadata

`hosting.json` is intentionally not committed with a fake project id.

For the first real Codex Sites deployment, create the site through the Sites
publishing tool, then write the returned project id to:

```json
{
  "project_id": "..."
}
```

After that, run:

```bash
npm run build --workspace retainmol
```

The build copies `.openai/hosting.json` into `dist/.openai/hosting.json`, which
is required by the Sites package step.
