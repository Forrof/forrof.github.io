import assert from 'node:assert/strict';
import { test } from 'node:test';
import { irisFrame, knotFrame, railFrame } from '../src/lib/art.ts';

test('artwork keeps a stable character grid at every sampled orientation', () => {
  for (const phase of [0, 1, 5, 20, 60, 180, 900]) {
    for (const [lines, width, height] of [[irisFrame(phase), 57, 25], [knotFrame(phase), 56, 24], [railFrame(phase).split('\n'), 15, 34]]) {
      assert.equal(lines.length, height);
      assert.ok(lines.every((line) => line.length === width));
      assert.ok(lines.join('').trim().length > 100);
      assert.doesNotMatch(lines.join(''), /[01\u4e00-\u9fff]/);
    }
    assert.equal(irisFrame(phase)[12][28], '◆');
  }
});

test('frames are deterministic, move over time, and respond to pointer input', () => {
  assert.deepEqual(irisFrame(0), irisFrame(0));
  assert.notDeepEqual(irisFrame(0), irisFrame(5));
  assert.notDeepEqual(knotFrame(0), knotFrame(5));
  assert.notDeepEqual(knotFrame(0), knotFrame(0, { x: 1, y: -1 }));
  assert.notEqual(railFrame(0), railFrame(5));
  assert.notEqual(railFrame(0, 0, true), railFrame(0, Math.PI * 0.7, false));
});
