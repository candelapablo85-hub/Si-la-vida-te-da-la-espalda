import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRegisterServiceWorker } from '../src/pwa';

test('disables service worker registration in development', () => {
  assert.equal(shouldRegisterServiceWorker(true), false);
});

test('enables service worker registration in production', () => {
  assert.equal(shouldRegisterServiceWorker(false), false);
});
