# Camunda Hub MCP

A community MCP server for authoring and refining BPMN diagrams through the Camunda Hub API.

The intended workflow is simple: describe a process to your AI assistant, inspect the diagram in Camunda Hub, and refine it through follow-up prompts. The assistant brings the language model; this project supplies tools for working with Hub files.

**Status: development scaffold.** The local MCP server exposes status, connection information, and reading a known file. Diagram search, creation, editing, validation, and previews are planned. Live Camunda authentication and diagram access have not been verified. There is no npm release, MCP Registry listing, or hosted service yet.

This is an independent community project, not an official Camunda product.

## Current tools

| Tool | Behaviour |
| --- | --- |
| `get_server_status` | Reports development capabilities without contacting Camunda. |
| `get_hub_info` | Obtains an access token and reads Hub API v2 environment information. |
| `read_file` | Reads one file's metadata, revision, and content using its UUID. |

The starter provides local stdio transport, environment-based configuration, token caching and renewal, one authentication retry after HTTP 401, bounded request timeouts, and errors that omit upstream response bodies. The mocked tests do not establish live API compatibility.

## Run from source

Requires Node.js 24 or later and npm. Clone the repository, then:

```sh
npm ci --ignore-scripts
npm run check
```

An MCP host launches `node /absolute/path/to/camunda-hub-mcp/dist/index.js`. It communicates over standard input and output. Running the server directly waits for protocol messages; it is not an interactive terminal application.

Tool discovery and `get_server_status` work without Camunda credentials.

### Configure Camunda access

Copy `.env.example` to a local `.env` and configure:

| Variable | Purpose |
| --- | --- |
| `CAMUNDA_HUB_API_URL` | Hub API root ending in `/api/v2`; defaults to `https://hub.camunda.io/api/v2`. |
| `CAMUNDA_OAUTH_URL` | Token endpoint; defaults to Camunda SaaS login. |
| `CAMUNDA_CONSOLE_OAUTH_AUDIENCE` | Token audience; SaaS default is `api.cloud.camunda.io`. |
| `CAMUNDA_CONSOLE_CLIENT_ID` | API client ID. |
| `CAMUNDA_CONSOLE_CLIENT_SECRET` | API client secret; retain locally. |

Use your organization's documented endpoint if it differs. This initial implementation accepts HTTPS endpoints only. Self-managed environments require their own endpoint, audience, and identity-provider configuration and are not yet tested.

Camunda documents an Admin role for creating API credentials. Use a client with Hub API read access for the current tools. Tokens can have organization-wide access according to their permissions; there is no project restriction implemented in this starter.

The process reads environment variables. Node loads the local `.env` only when launched with the appropriate option. For example, this generic MCP server entry uses absolute paths:

```json
{
  "command": "node",
  "args": [
    "--env-file=/absolute/path/to/camunda-hub-mcp/.env",
    "/absolute/path/to/camunda-hub-mcp/dist/index.js"
  ]
}
```

Place that entry in your host's MCP configuration using the host's documented format. For Windows JSON paths, use forward slashes or escaped backslashes. This is a generic launch example, not a claim that a particular AI host has been tested.

An alternative is to have the host supply the variables through its supported credential/environment mechanism. Do not paste secrets into prompts or commit them to Git.

## Development

```sh
npm run typecheck
npm run build
npm test
npm run pack:check
```

`npm run check` runs type checking, compilation, and tests. Tests use fake credentials and mocked HTTP responses, plus an actual local MCP client/server handshake without Camunda access. CI runs the checks on Windows and Linux.

| Location | Purpose |
| --- | --- |
| `src/config.ts` | Environment configuration and endpoint checks |
| `src/hub-client.ts` | OAuth token lifecycle and Hub reads |
| `src/server.ts` | MCP tool definitions |
| `src/index.ts` | stdio entry point |
| `test/` | Offline behaviour and MCP transport tests |
| [PLAN.md](PLAN.md) | Milestones, acceptance criteria, and distribution decisions |

## Roadmap and distribution

The next milestone is a verified read against a designated Camunda test project. Then add project-scoped discovery, draft creation, revision-aware updates, BPMN checks, and a repeatable visual review workflow.

The first distribution target is an installable npm package listed in the official MCP Registry. Each user runs their own instance with their own Camunda credentials. Hosted multi-user service work is a later decision.

`package.json` deliberately has `"private": true` while the package is unreleased. Source code is public under the MIT licence. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## References

Documentation checked 2026-11-06:

- [Camunda Hub SaaS authentication](https://docs.camunda.io/docs/apis-tools/hub-api-saas/authentication/)
- [Hub API migration and revision requirements](https://docs.camunda.io/docs/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api/)
- [Get a Hub file](https://docs.camunda.io/docs/apis-tools/hub-api-saas/specifications/get-file/)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [Publish to the MCP Registry](https://modelcontextprotocol.io/registry/quickstart)
