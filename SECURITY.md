# Security

This is an early development project. The current tools read Hub data; authoring tools are planned.

Keep credentials in a local ignored environment file or your host's supported credential mechanism. Do not paste credentials into prompts, public issues, or logs. Hub API clients may have organization-wide access according to their granted permissions.

The adapter sends requests directly to the configured Camunda and identity-provider endpoints. It does not implement a hosted service or telemetry. File content returned by the MCP is visible to the user's AI host and is subject to that host's data handling.

For a suspected vulnerability, use the repository's GitHub private vulnerability reporting feature if available. Otherwise open an issue requesting a private reporting channel without including exploit details, credentials, or private diagrams.

Rotate any accidentally exposed credentials. Repository history must not be used as credential storage.
