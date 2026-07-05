import test from 'node:test';
import assert from 'node:assert/strict';
import { submitRegistrationToGoogleSheets } from '../src/registration.ts';

test('submits registration payload to Google Sheets URL', async () => {
  const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
  const originalFetch = global.fetch;

  global.fetch = (async (input, init) => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const response = await submitRegistrationToGoogleSheets('https://example.com', {
      name: 'Test User',
      email: 'test@example.com',
      date: '2026-07-05T00:00:00.000Z',
    });

    assert.equal(response.ok, true);
    assert.equal(calls.length, 1);

    const body = JSON.parse(calls[0].init?.body as string);
    assert.deepEqual(body, {
      name: 'Test User',
      email: 'test@example.com',
      date: '2026-07-05T00:00:00.000Z',
    });
  } finally {
    global.fetch = originalFetch;
  }
});
