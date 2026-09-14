import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { initArt } from '../src/scripts/art.ts';

function harness({ reduced = false, stored = null, storageBlocked = false } = {}) {
  const { window, document } = parseHTML(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'));
  const jobs = new Map();
  const observers = [];
  const changes = [];
  const media = { matches: reduced, addEventListener: (_event, callback) => changes.push(callback) };
  const storage = new Map(stored ? [['forrof:motion', stored]] : []);
  let serial = 0;
  globalThis.window = window;
  globalThis.document = document;
  window.matchMedia = () => media;
  Object.defineProperty(document, 'hidden', { value: false, writable: true });
  globalThis.localStorage = {
    getItem(key) { if (storageBlocked) throw new Error('Blocked'); return storage.get(key) ?? null; },
    setItem(key, value) { if (storageBlocked) throw new Error('Blocked'); storage.set(key, value); },
  };
  globalThis.requestAnimationFrame = (callback) => { jobs.set(++serial, callback); return serial; };
  globalThis.cancelAnimationFrame = (id) => jobs.delete(id);
  globalThis.IntersectionObserver = class {
    targets = [];
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.targets = []; }
    emit(isIntersecting) { this.callback(this.targets.map((target) => ({ target, isIntersecting }))); }
  };
  const root = document.getElementById('forrof-site');
  const cleanup = initArt(root);
  const button = root.querySelector('[data-motion-toggle]');
  return {
    root, button, jobs, storage, document, cleanup,
    visible(value) { observers[0].emit(value); },
    reduce(value) { media.matches = value; changes.forEach((callback) => callback()); },
    tick(time) { const pending = [...jobs.values()]; jobs.clear(); pending.forEach((callback) => callback(time)); },
    text() { return root.querySelector('[data-iris]').textContent; },
    hide(value) { document.hidden = value; document.dispatchEvent(new window.Event('visibilitychange')); },
  };
}

test('the real controller animates, pauses, persists, resumes, and suspends offscreen', () => {
  const page = harness();
  assert.equal(page.button.hidden, false);
  page.visible(true);
  const initial = page.text();
  page.tick(1000); page.tick(1200); page.tick(1400);
  assert.notEqual(page.text(), initial);
  page.button.click();
  assert.equal(page.root.dataset.motion, 'off');
  assert.equal(page.button.getAttribute('aria-pressed'), 'false');
  assert.equal(page.storage.get('forrof:motion'), 'off');
  assert.equal(page.jobs.size, 0);
  const paused = page.text();
  page.tick(3000);
  assert.equal(page.text(), paused);
  page.button.click(); page.tick(4000); page.tick(4200); page.tick(4400);
  assert.notEqual(page.text(), paused);
  page.hide(true);
  assert.equal(page.jobs.size, 0);
  page.hide(false);
  assert.equal(page.jobs.size, 1);
  page.visible(false);
  assert.equal(page.jobs.size, 0);
  page.visible(true);
  assert.equal(page.jobs.size, 1);
  page.cleanup();
  assert.equal(page.jobs.size, 0);
});

test('system reduced motion overrides animation and live preference changes', () => {
  const page = harness({ reduced: true });
  page.visible(true);
  assert.equal(page.jobs.size, 0);
  assert.equal(page.root.dataset.motion, 'off');
  assert.equal(page.button.disabled, true);
  page.reduce(false);
  assert.equal(page.jobs.size, 1);
  page.reduce(true);
  assert.equal(page.jobs.size, 0);
  page.cleanup();
});

test('a saved pause survives navigation and blocked storage remains usable', () => {
  const saved = harness({ stored: 'off' });
  saved.visible(true);
  assert.equal(saved.jobs.size, 0);
  assert.equal(saved.root.dataset.motion, 'off');
  saved.cleanup();
  const blocked = harness({ storageBlocked: true });
  blocked.visible(true);
  assert.equal(blocked.jobs.size, 1);
  assert.doesNotThrow(() => blocked.button.click());
  assert.equal(blocked.jobs.size, 0);
  blocked.cleanup();
});
