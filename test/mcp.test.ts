import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

test("built server supports discovery and returns a useful missing-credentials error", { timeout: 15_000 }, async () => {
  const client = new Client({ name: "offline-smoke-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../dist/index.js", import.meta.url))],
    env: { CAMUNDA_CONSOLE_CLIENT_ID: "", CAMUNDA_CONSOLE_CLIENT_SECRET: "" },
    stderr: "pipe"
  });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ["get_hub_info", "get_server_status", "read_file"]);
    const status = await client.callTool({ name: "get_server_status", arguments: {} });
    assert.equal(status.isError, undefined);
    assert.match(JSON.stringify(status.content), /authoringAvailable/);
    const missing = await client.callTool({ name: "get_hub_info", arguments: {} });
    assert.equal(missing.isError, true);
    assert.match(JSON.stringify(missing.content), /Set CAMUNDA_CONSOLE_CLIENT_ID/);
  } finally {
    await client.close();
  }
});
