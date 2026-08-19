import test from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../src/plugin.js'

type Handler = (invocation: { rawInput?: string }) => Promise<{ kind: string; text: string }>

function capture(config: unknown = {}) {
  const commands: Record<string, Handler> = {}
  apply({ commands: { register: (d: { name: string; handler: Handler }) => { commands[d.name] = d.handler } } } as never, config as never)
  return commands
}

test('api command rejects usage without method and url', async () => {
  const result = await capture()['api']!({ rawInput: '' })
  assert.equal(result.kind, 'error')
  assert.match(result.text, /usage/)
})

test('api command blocks remote hosts by default', async () => {
  const result = await capture()['api']!({ rawInput: 'GET https://example.com/' })
  assert.equal(result.kind, 'error')
  assert.match(result.text, /remote host blocked/)
})

test('api command blocks sensitive headers', async () => {
  const result = await capture({ allowRemote: false })['api']!({ rawInput: 'POST http://127.0.0.1:9/x' })
  assert.equal(result.kind, 'error')
})
