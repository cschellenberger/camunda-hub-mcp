import { z } from "zod";
import { HubError, type HubConfig } from "./config.js";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  token_type: z.string().refine(value => value.toLowerCase() === "bearer")
});

export class HubClient {
  private token: { value: string; expiresAt: number } | undefined;

  constructor(
    private readonly config: HubConfig,
    private readonly request: typeof fetch = fetch,
    private readonly now: () => number = Date.now
  ) {}

  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.request(url, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(15_000)
      });
    } catch {
      throw new HubError("Could not reach the configured Camunda endpoint. Check connectivity and endpoint configuration.");
    }
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.now() < this.token.expiresAt) return this.token.value;
    const response = await this.send(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        audience: this.config.audience
      })
    });
    if (!response.ok) throw new HubError(`Camunda authentication failed (HTTP ${response.status}). Check the API client credentials and audience.`);
    let body: unknown;
    try { body = await response.json(); } catch { throw new HubError("Camunda returned an invalid token response."); }
    const parsed = tokenSchema.safeParse(body);
    if (!parsed.success) throw new HubError("Camunda returned an invalid token response.");
    this.token = {
      value: parsed.data.access_token,
      expiresAt: this.now() + parsed.data.expires_in * 900
    };
    return this.token.value;
  }

  private async get(path: string, retryAuthentication = true): Promise<unknown> {
    const token = await this.accessToken();
    const response = await this.send(`${this.config.apiUrl}${path}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    if (response.status === 401 && retryAuthentication) {
      this.token = undefined;
      return this.get(path, false);
    }
    if (!response.ok) {
      const advice = response.status === 403 ? "Check the Hub API permissions." :
        response.status === 404 ? "Check the file key and API URL." :
        response.status === 429 || response.status === 503 ? "Try again later." :
        "Check the endpoint and credentials.";
      // Do not return upstream error bodies: they can contain credentials or private data.
      throw new HubError(`Camunda Hub request failed (HTTP ${response.status}). ${advice}`);
    }
    try { return await response.json(); } catch { throw new HubError("Camunda Hub returned invalid JSON."); }
  }

  getInfo(): Promise<unknown> { return this.get("/info"); }

  getFile(fileKey: string): Promise<unknown> {
    if (!z.uuid().safeParse(fileKey).success) throw new HubError("fileKey must be a UUID.");
    return this.get(`/files/${encodeURIComponent(fileKey)}`);
  }
}
