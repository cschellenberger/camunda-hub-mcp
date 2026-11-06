import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";
import { HubClient } from "../src/hub-client.js";

const config = loadConfig({
  CAMUNDA_CONSOLE_CLIENT_ID: "synthetic-client",
  CAMUNDA_CONSOLE_CLIENT_SECRET: "synthetic-secret"
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const token = () => json({ access_token: "synthetic-token", expires_in: 100, token_type: "Bearer" });
const fileKey = "12345678-1234-4234-8234-123456789abc";

test("missing credentials and insecure or malformed endpoints fail before network access", () => {
  assert.throws(() => loadConfig({}), /Set CAMUNDA_CONSOLE_CLIENT_ID/);
  for (const url of ["http://example.com/api/v2", "https://user:pass@example.com/api/v2", "https://example.com/api/v1"]) {
    assert.throws(() => loadConfig({
      CAMUNDA_CONSOLE_CLIENT_ID: "test",
      CAMUNDA_CONSOLE_CLIENT_SECRET: "test",
      CAMUNDA_HUB_API_URL: url
    }), /must/);
  }
});

test("uses client credentials, caches the token, and renews before expiry", async () => {
  let now = 0;
  let authentications = 0;
  const request: typeof fetch = async (input, init) => {
    assert.equal(init?.redirect, "error");
    if (String(input) === config.tokenUrl) {
      authentications++;
      const body = new URLSearchParams(String(init?.body));
      assert.equal(body.get("grant_type"), "client_credentials");
      assert.equal(body.get("client_id"), "synthetic-client");
      assert.equal(body.get("client_secret"), "synthetic-secret");
      return token();
    }
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer synthetic-token");
    assert.equal(String(input), config.apiUrl + "/info");
    return json({ version: "v2" });
  };
  const hub = new HubClient(config, request, () => now);
  assert.deepEqual(await hub.getInfo(), { version: "v2" });
  await hub.getInfo();
  assert.equal(authentications, 1);
  now = 91_000;
  await hub.getInfo();
  assert.equal(authentications, 2);
});

test("re-authenticates once on 401 and does not loop on persistent rejection", async () => {
  let authentications = 0;
  let reads = 0;
  const request: typeof fetch = async input => {
    if (String(input) === config.tokenUrl) { authentications++; return token(); }
    reads++;
    return json({ detail: "synthetic-secret must never appear" }, 401);
  };
  await assert.rejects(new HubClient(config, request).getInfo(), error =>
    error instanceof Error && /HTTP 401/.test(error.message) && !error.message.includes("synthetic-secret"));
  assert.equal(authentications, 2);
  assert.equal(reads, 2);
});

test("returns file content and revision and rejects path injection", async () => {
  const model = { fileKey, revision: 5, content: "<definitions />" };
  let reads = 0;
  const request: typeof fetch = async input => {
    if (String(input) === config.tokenUrl) return token();
    reads++;
    assert.equal(String(input), config.apiUrl + "/files/" + fileKey);
    return json(model);
  };
  const hub = new HubClient(config, request);
  assert.deepEqual(await hub.getFile(fileKey), model);
  assert.throws(() => hub.getFile("../info"), /UUID/);
  assert.equal(reads, 1);
});

test("permission errors suppress upstream response bodies", async () => {
  const request: typeof fetch = async input =>
    String(input) === config.tokenUrl ? token() : json({ detail: "sensitive upstream content" }, 403);
  await assert.rejects(new HubClient(config, request).getInfo(), error =>
    error instanceof Error && /permissions/.test(error.message) && !error.message.includes("sensitive"));
});

test("invalid token responses are rejected without exposing their contents", async () => {
  const request: typeof fetch = async () => json({ access_token: "secret", expires_in: "not-a-number" });
  await assert.rejects(new HubClient(config, request).getInfo(), /invalid token response/);
});

test("network failures do not expose request details", async () => {
  const request: typeof fetch = async () => { throw new Error("synthetic-secret"); };
  await assert.rejects(new HubClient(config, request).getInfo(), error =>
    error instanceof Error && /Could not reach/.test(error.message) && !error.message.includes("synthetic-secret"));
});
