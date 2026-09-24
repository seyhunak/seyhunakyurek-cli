# seyhunakyurek — CLI

CLI for [Seyhun Akyurek](https://seyhunakyurek.com) portfolio — AI Architect & Delivery Lead (Dubai, UAE). It is a zero-install, agent-friendly client for the site's public WebMCP portfolio API.

## Quick start

```bash
npx seyhunakyurek --help
npx seyhunakyurek projects --json
npx seyhunakyurek project pact --json
npx seyhunakyurek mcp --json
npx seyhunakyurek profile --json
npx seyhunakyurek openapi --json
```

Commands emit machine-readable JSON when `--json` is used. Read-only requests require no API key. For a local checkout, point the same client at a development server with `--base-url http://localhost:3000` or `SEYHUNAKYUREK_API=http://localhost:3000`.

## Install

Install from npm (after the package is published):


```bash
npm i -g seyhunakyurek
# or
npx seyhunakyurek --help
```

## API

- REST: `GET https://seyhunakyurek.com/api/v1/webmcp/projects` (also `GET /api/webmcp/projects`)
- Headers: `API-Version: v1`, `RateLimit-*`, `Retry-After` on 429, `Sunset`/`Deprecation` on version changes
- OpenAPI: `https://seyhunakyurek.com/openapi.json` (alias `/api/openapi.json`)
- MCP: `POST https://seyhunakyurek.com/api/mcp` (Streamable HTTP, protocol 2024-11-05)
- Docs: `https://seyhunakyurek.com/developers`

## Source

https://github.com/seyhunak/seyhunakyurek-cli

## Repository

This CLI is maintained as a standalone public repository so it can be installed and audited independently of the portfolio site.

```bash
git clone https://github.com/seyhunak/seyhunakyurek-cli.git
cd seyhunakyurek-cli
node bin/cli.js --help
```

To publish a new npm release, maintainers with npm publish access can run `npm publish` from the repository root.
