const LOCAL = new Set(['localhost', '127.0.0.1', '::1']);

export interface ApiRequestInput {
  url: string;
  method?: string;
  headers?: Record<string, unknown>;
  body?: unknown;
}
export interface ApiClientOptions {
  allowRemote?: boolean;
  maxBodyBytes?: number;
  maxResponseChars?: number;
}
export interface ValidatedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}
export interface ApiResponseSummary {
  status: number;
  ok: boolean;
  latencyMs: number;
  body: string;
}

export function validateRequest(input: ApiRequestInput, { allowRemote = false, maxBodyBytes = 1_000_000 }: ApiClientOptions = {}): ValidatedRequest {
  const url = new URL(input.url);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
  if (!allowRemote && !LOCAL.has(url.hostname)) throw new Error('remote host blocked');
  const body = input.body == null ? null : String(input.body);
  if (body && Buffer.byteLength(body) > maxBodyBytes) throw new Error('body too large');
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.headers ?? {})) {
    if (/authorization|cookie|x-api-key/i.test(key)) throw new Error('sensitive header blocked: authorization, cookie, and api-key headers are not allowed through this client');
    headers[key] = String(value);
  }
  return { method: String(input.method ?? 'GET').toUpperCase(), url: url.toString(), headers, body };
}

export async function performRequest(input: ApiRequestInput, options: ApiClientOptions = {}): Promise<ApiResponseSummary> {
  const request = validateRequest(input, options);
  const started = Date.now();
  const response = await fetch(request.url, { method: request.method, headers: request.headers, body: request.body });
  const text = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    latencyMs: Date.now() - started,
    body: text.slice(0, options.maxResponseChars ?? 20000),
  };
}
