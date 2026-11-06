# Contributing

Start with README.md and PLAN.md. Small, reviewable changes are welcome through issues and pull requests.

Use Node.js 24 or later, install with `npm ci --ignore-scripts`, and run `npm run check` and `npm run pack:check` before submitting a change.

Include a behavioural test when changing authentication, network errors, tool contracts, or model updates. Use synthetic fixtures. Do not include private organization names, credentials, or real customer models in tests or issue reports.

Describe what changed, why, and how it was verified. Distinguish mock-based checks from live Camunda testing.

The GitHub repository is public, but the npm package is not released yet. Maintainers will prepare package and MCP Registry publication after the public beta criteria in PLAN.md are met.
