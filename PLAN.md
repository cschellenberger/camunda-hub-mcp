# Camunda Hub MCP development plan

Created: 2026-11-06. Owner: Cody Schellenberger. Target: a publicly distributed community MCP for Camunda Hub API v2.

## Product purpose

Enable a person to describe a business process, have their AI assistant author a BPMN diagram in their Camunda workspace, inspect the result, and request refinements. The interaction is sequential: prompt, author, evaluate, refine. Simultaneous canvas editing is not required.

Public users should be able to discover this project, install the MCP, connect their own Camunda account using supported API credentials, and complete the same workflow. The MCP is an adapter; the user's AI host supplies the model and conversation.

## Initial decisions

- Use TypeScript and the current stable MCP SDK v2.
- Start with a local stdio package. Each user keeps their own Camunda credentials locally.
- Target Hub API v2 directly rather than building on the deprecated Web Modeler v1 API.
- Keep Hub transport/authentication independent of MCP tool registration.
- Preserve stable BPMN element IDs and diagram geometry when refining models.
- Use ordinary revision checks on writes; do not build a concurrent editing product.
- Package and registry publication follow verified functionality and independent installation testing.
- MIT licence for the original project code. Preserve third-party licences if any implementation is later adapted.
- Keep the repository independent of institution-specific course files, private cases, and account data.

## Milestone 0: Public project foundation

Acceptance:
- Local folder and public personal GitHub repository exist.
- README distinguishes implemented features, planned features, and live verification.
- TypeScript build, local MCP handshake, unit tests, CI, lockfile, licence, and contribution guidance are present.
- Configuration contains no credentials or private models.

Initial implementation: status, Hub information, and reading a known file. No live Camunda access is claimed. GitHub publication does not imply npm or registry publication.

## Milestone 1: Verify access and read a real diagram

1. Confirm the project owner's Camunda environment, API base URL, version, and ability to obtain credentials.
2. Configure a client with read access through the supported Hub authentication flow.
3. Call the environment information endpoint and read one explicitly selected test diagram.
4. Compare returned content and revision with the diagram visible in Hub.
5. Record a short sanitized outcome here; retain no tokens or private model content.

Acceptance: a reproducible connection works and failures explain missing configuration, permissions, or unavailable files.

Open questions: API availability for the intended account/plan; exact SaaS endpoint; response schema compatibility; a second supported AI host.

## Milestone 2: Discover and create a draft

- Add workspace/project discovery and paginated file search based on the verified v2 schemas.
- Let the user designate the project that the session may access.
- Add draft BPMN creation in that project.
- Validate XML and basic BPMN references before upload; include diagram geometry.
- Return the created file's identifier and a verified supported UI link if available.
- Confirm the model opens and is readable in Hub.

Acceptance: a prompt produces a readable small process with lanes, gateways, and labelled paths in a designated test project.

## Milestone 3: Refine through follow-up prompts

- Read the current file before modifying it.
- Preserve existing IDs and layout where practical.
- Require the read revision on updates, and handle a conflict by reporting it and rereading.
- Capture a recoverable prior version using supported Hub version APIs where appropriate.
- Separate structural validation, visual readability, and business-logic review.
- Evaluate an MCP tool surface for whole-document writes versus bounded element-level operations. Start simple and choose from actual usage.

Acceptance: a follow-up prompt changes only the requested part of a model; the user can inspect and continue refining it. Failed validation leaves the prior model intact.

## Milestone 4: Public beta

- Test clean installation with a second person using their own account and credentials.
- Verify the supported operating systems and named AI hosts; document actual results.
- Cover authentication expiry, permission errors, pagination, revision conflicts, malformed BPMN, and layout preservation.
- Document setup troubleshooting and credential handling.
- Confirm npm package name availability and publication identity.
- Remove the package publication guard only when preparing the release.
- Publish a versioned npm package and GitHub release with clear limitations.
- Create and validate server.json against the then-current MCP Registry schema; publish metadata pointing to the released package.
- Add discoverable descriptions and worked examples for prompt-driven BPMN authoring.

Acceptance: an unfamiliar user completes installation and the prompt-author-review-refine workflow from the README without developer assistance.

## Milestone 5: Decide whether to host a service

Consider only after public package use reveals demand. A hosted service adds user onboarding, remote MCP authorization, per-user Camunda credential handling, tenant separation, operational costs, and support.

Do not promise a one-click Camunda sign-in flow until supported delegated authorization is verified. The currently documented Hub SaaS flow uses administrator-created client credentials.

## First release boundaries

The initial authoring release focuses on BPMN design files. Deployment, process execution, organization administration, member management, DMN/forms authoring, and a full diagram editor are outside its scope. Real-time collaboration is not a requirement.

## Evidence and validation

Local tests establish behaviour against mocks and the MCP transport, not compatibility with a live Camunda account. Live verification, public source publication, npm distribution, and registry discoverability are distinct milestones.

Sources:
- [Hub API authentication](https://docs.camunda.io/docs/apis-tools/hub-api-saas/authentication/)
- [Hub migration and file revision semantics](https://docs.camunda.io/docs/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api/)
- [MCP SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [Registry publishing](https://modelcontextprotocol.io/registry/quickstart)
