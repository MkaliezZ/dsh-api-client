import { performRequest, type ApiClientOptions } from './core.js'

export const name = 'api-client'
export const inject = ['commands']

export interface Config extends ApiClientOptions {}

export function apply(ctx: any, config: Config = {}): void {
  ctx.commands.register({
    name: 'api',
    description: 'Localhost-first HTTP request with bounded responses and sensitive-header blocking.',
    recordInput: false,
    async handler(invocation: any) {
      const parts = String(invocation.rawInput ?? '').trim().split(/\s+/)
      const method = (parts[0] ?? '').toUpperCase()
      const url = parts.slice(1).join(' ').trim()
      if (!method || !url) return { kind: 'error', text: 'usage: /api GET|POST|PUT|DELETE <url>' }
      try {
        return { kind: 'success', text: JSON.stringify(await performRequest({ method, url }, config), null, 2) }
      } catch (error) {
        return { kind: 'error', text: `api request failed: ${error instanceof Error ? error.message : String(error)}` }
      }
    },
  })
}