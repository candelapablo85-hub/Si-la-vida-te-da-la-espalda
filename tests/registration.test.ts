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

    const body = calls[0].init?.body as string;
    assert.match(body, /"name":"Test User"/);
    assert.match(body, /"email":"test@example.com"/);
    assert.match(body, /"date":"2026-07-05T00:00:00.000Z"/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('generates a timestamp when date is not provided', async () => {
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
    await submitRegistrationToGoogleSheets('https://example.com', {
      name: 'Another User',
      email: 'another@example.com',
    });

    const body = calls[0].init?.body as string;
    assert.match(body, /"date":/);
    assert.match(body, /"name":"Another User"/);
    assert.match(body, /"email":"another@example.com"/);
  } finally {
    global.fetch = originalFetch;
  }
});
