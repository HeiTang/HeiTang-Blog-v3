import assert from 'node:assert/strict';
import test from 'node:test';
import { walletTarget } from './heroWallet.ts';

test('wallet swipe projects momentum, snaps small drags back and wraps in both directions', () => {
  assert.equal(walletTarget(0, 3, -100, 0, 270), 1);
  assert.equal(walletTarget(0, 3, 100, 0, 270), 2);
  assert.equal(walletTarget(2, 3, -100, 0, 270), 0);
  assert.equal(walletTarget(0, 3, -10, 0, 270), 0);
  assert.equal(walletTarget(0, 3, -10, -0.5, 270), 1);
  assert.equal(walletTarget(0, 1, -100, -0.5, 270), 0);
});
