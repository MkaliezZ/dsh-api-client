import { performRequest, type ApiClientOptions } from './core.js';

interface CommandContext {
  command?: (name: string, handler: (...args: string[]) => unknown | Promise<unknown>) => unknown;
}

export function registerApiClient(ctx: CommandContext, options: ApiClientOptions = {}): void {
  ctx.command?.('api', async (method, url) => JSON.stringify(await performRequest({ method, url }, options), null, 2));
}
