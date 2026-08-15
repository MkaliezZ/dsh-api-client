import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest } from '../src/core.js';

test('allows localhost', () => assert.match(validateRequest({ url: 'http://localhost:3000/x' }).url, /localhost/));
test('blocks remote by default', () => assert.throws(() => validateRequest({ url: 'https://example.com' })));
test('blocks sensitive headers by default', () => assert.throws(() => validateRequest({ url: 'http://127.0.0.1', headers: { Authorization: 'x' } })));
