# hermes-ryzome-plugin

[Ryzome](https://ryzome.ai) canvas and document tools for the [Hermes Agent](https://hermes.ai). Lets an AI agent externalize its working context (plans, research, reasoning) as interactive canvases. Users can inspect, edit, and hand the corrected graph back to the agent.

This repository is the standalone Hermes install surface. The broader multi-surface Ryzome integrations live in the monorepo at [`0xPlaygrounds/ryzome-mcp-plugins`](https://github.com/0xPlaygrounds/ryzome-mcp-plugins).

## Requirements

- Python 3.10+
- Node.js (`node` must be on `PATH`)
- A Ryzome API key — [get one here](https://ryzome.ai/workspace#settings/api-keys)

## Install

Recommended Hermes install path:

```bash
hermes plugins install 0xPlaygrounds/hermes-ryzome-plugin --enable
```

During `hermes plugins install`, Hermes prompts for `RYZOME_API_KEY` from `plugin.yaml` and saves it to `~/.hermes/.env` automatically. This is the closest thing Hermes has to plugin-specific auth setup today — there is no separate plugin auth wizard inside `hermes setup` for general plugins.

Alternative PyPI install:

```bash
pip install hermes-ryzome-plugin
hermes plugins enable ryzome
export RYZOME_API_KEY=<api-key>
```

Hermes disables discovered plugins by default, including pip-installed ones, so `hermes plugins enable ryzome` is required after `pip install`.

Both the git install and the PyPI wheel ship a bundled Node runner at `ryzome_hermes_plugin/_runner.js`, so no separate npm install is required.

## Configure

Hermes-native auth path: declare `requires_env` in `plugin.yaml`, let `hermes plugins install` prompt for the API key, and read it from `~/.hermes/.env` via `RYZOME_API_KEY`.

You can also configure the plugin manually with either:

```bash
export RYZOME_API_KEY=<api-key>
```

or a config file at `~/.hermes/ryzome.json`:

```json
{
  "apiKey": "rz_...",
  "apiUrl": "https://api.ryzome.ai",
  "appUrl": "https://ryzome.ai"
}
```

### Config fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `apiKey` | Yes | — | Ryzome API key |
| `apiUrl` | No | `https://api.ryzome.ai` | API base URL |
| `appUrl` | No | `https://ryzome.ai` | App base URL (for viewer links) |

Environment variables `RYZOME_API_KEY`, `RYZOME_OPENCLAW_API_KEY`, or `PLUGIN_USER_CONFIG_API_KEY` also work and take precedence over the config file.

## Tools

| Tool | Description |
|------|-------------|
| `create_ryzome_document` | Create a standalone Ryzome document that appears in the library |
| `create_ryzome_canvas` | Create a canvas with explicitly defined nodes and edges |
| `get_ryzome_document` | Retrieve a standalone Ryzome document by its ID |
| `create_ryzome_plan` | Create a canvas from sequential steps (auto-chained, with optional branching via `dependsOn`) |
| `create_ryzome_research` | Create a canvas with research findings branching from a root topic |
| `get_ryzome_canvas` | Retrieve a canvas by ID with all nodes and edges |
| `list_ryzome_documents` | List standalone Ryzome documents, optionally filtered by library visibility, favorites, tags, or content type |
| `list_ryzome_canvases` | List all canvases accessible to the current user |
| `update_ryzome_document` | Update a standalone Ryzome document using document operations and metadata changes |
| `save_ryzome_node_to_library` | Promote an existing canvas node's backing document into the library |
| `upload_ryzome_image` | Upload an image from a URL to an existing canvas as an image node |

## Slash Commands

The plugin registers:

| Command | Description |
|---------|-------------|
| `/ryzome-status` | Show Ryzome plugin configuration status inside a Hermes session |

This matches how Hermes general plugins work in practice today: tools + optional slash commands, with auth handled through `requires_env` and `~/.hermes/.env`.

There is no separate plugin auth step inside `hermes setup` for general plugins.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `RYZOME_API_KEY` | API key (standard) |
| `RYZOME_OPENCLAW_API_KEY` | API key (alternative) |
| `PLUGIN_USER_CONFIG_API_KEY` | API key (set automatically by some hosts) |
| `RYZOME_HERMES_RUNNER` | Override the Node runner command (advanced) |
| `RYZOME_HERMES_CONFIG_PATH` | Override the config file path (default: `~/.hermes/ryzome.json`) |

## Troubleshooting

### `Ryzome API key not configured`

Tools register unconditionally but throw this error on call if no key is set. The standard fix is to reinstall or enable the plugin through Hermes so `requires_env` prompts for `RYZOME_API_KEY`, or set `RYZOME_API_KEY` manually.

### `Could not find a Ryzome Hermes runner`

The wheel ships with a bundled Node runner. If this error appears, verify:
- `node` is on `PATH`
- The wheel installed cleanly (the file `ryzome_hermes_plugin/_runner.js` exists inside the installed package)
- Or set `RYZOME_HERMES_RUNNER` to a command that runs the runner

### 401 or 403 errors

- Verify the API key is valid and has canvas route access
- If using a non-production API, confirm `apiUrl` matches that environment

## License

MIT
