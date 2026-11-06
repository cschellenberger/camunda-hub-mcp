export interface HubConfig {
  apiUrl: string;
  tokenUrl: string;
  audience: string;
  clientId: string;
  clientSecret: string;
}

export class HubError extends Error {}

function httpsUrl(value: string, name: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new HubError(`${name} must be an HTTPS URL.`); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new HubError(`${name} must be an HTTPS URL without credentials, query, or fragment.`);
  }
  return url.toString().replace(/\/$/, "");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): HubConfig {
  const clientId = env.CAMUNDA_CONSOLE_CLIENT_ID?.trim();
  const clientSecret = env.CAMUNDA_CONSOLE_CLIENT_SECRET;
  if (!clientId || !clientSecret?.trim()) {
    throw new HubError("Set CAMUNDA_CONSOLE_CLIENT_ID and CAMUNDA_CONSOLE_CLIENT_SECRET locally before calling Hub tools.");
  }
  const apiUrl = httpsUrl(env.CAMUNDA_HUB_API_URL ?? "https://hub.camunda.io/api/v2", "CAMUNDA_HUB_API_URL");
  if (!new URL(apiUrl).pathname.endsWith("/api/v2")) {
    throw new HubError("CAMUNDA_HUB_API_URL must end with /api/v2.");
  }
  return {
    apiUrl,
    tokenUrl: httpsUrl(env.CAMUNDA_OAUTH_URL ?? "https://login.cloud.camunda.io/oauth/token", "CAMUNDA_OAUTH_URL"),
    audience: env.CAMUNDA_CONSOLE_OAUTH_AUDIENCE ?? "api.cloud.camunda.io",
    clientId,
    clientSecret
  };
}
