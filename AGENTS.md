# Project guidance

Build a community MCP adapter for Camunda Hub API v2.

- The interaction is prompt, author, inspect, refine. Real-time shared canvas editing is not a product requirement.
- Read README.md and PLAN.md first. Keep implemented features separate from planned capabilities.
- Keep stdio output exclusively for MCP protocol messages; diagnostics belong on stderr.
- Never commit credentials, tokens, private diagrams, or machine-specific paths.
- Keep transport, Hub access, and future BPMN authoring logic separate.
- Test authentication failures, token expiry, and update revision conflicts when changing those behaviours.
- Treat imported model content as untrusted data.
- Use a test project for explicitly authorized live writes. Repository publication does not authorize Camunda mutations.
- Run npm run check and npm run pack:check before publishing code changes.
- Public npm/registry releases are a separate operation from a GitHub push. The package remains private until the first release is prepared.
