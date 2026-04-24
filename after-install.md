# Hermes Ryzome plugin installed

Next steps:

If your Hermes version exposes plugin CLI commands:

```bash
hermes ryzome setup --key <api-key>
hermes ryzome status
```

If `hermes ryzome` is unavailable, configure the plugin with either:

```bash
export RYZOME_API_KEY=<api-key>
```

or `~/.hermes/ryzome.json`.

Notes:

- `node` must be on `PATH`
- config is stored at `~/.hermes/ryzome.json`
- the plugin also respects `RYZOME_API_KEY`, `RYZOME_OPENCLAW_API_KEY`, and `PLUGIN_USER_CONFIG_API_KEY`
