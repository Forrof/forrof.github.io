import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { initRadio, formatTime } from '../src/scripts/radio.ts';
import { loadRadioTracks } from '../src/lib/radio.ts';

function harness() {
  const { window, document } = parseHTML(`<section data-radio data-state="idle" hidden>
    <button data-radio-toggle>[play]</button>
    <button data-radio-track aria-expanded="false"><span data-radio-title>First</span><span data-radio-artist>Artist</span></button>
    <input data-radio-seek value="0" disabled><input data-radio-volume value="25"><span data-radio-time></span>
    <ol data-radio-list hidden><li><button data-radio-choice data-src="/audio/first.mp3" data-title="First" data-artist="Artist" aria-current="true"></button></li><li><button data-radio-choice data-src="/audio/second.mp3" data-title="Second" data-artist="Another"></button></li></ol>
    <p data-radio-status hidden></p><audio data-radio-audio preload="none"></audio>
  </section>`);
  globalThis.window = window;
  const root = document.querySelector('[data-radio]');
  const audio = root.querySelector('audio');
  const get = (name) => root.querySelector(`[data-radio-${name}]`);
  let plays = 0;
  let loads = 0;
  let playResult = () => Promise.resolve();
  for (const [key, value] of Object.entries({ paused: true, ended: false, error: null, duration: NaN, currentTime: 0, volume: 1 })) Object.defineProperty(audio, key, { value, writable: true, configurable: true });
  const emit = (event) => audio.dispatchEvent(new window.Event(event));
  audio.play = () => { plays++; audio.paused = false; return playResult(); };
  audio.pause = () => { if (!audio.paused) { audio.paused = true; emit('pause'); } };
  audio.load = () => { loads++; audio.currentTime = 0; audio.duration = NaN; audio.error = null; audio.ended = false; audio.paused = true; emit('emptied'); };
  const cleanup = initRadio(root);
  return {
    root, audio, window, get, emit, cleanup,
    choices: [...root.querySelectorAll('[data-radio-choice]')],
    plays: () => plays, loads: () => loads,
    result(fn) { playResult = fn; },
    async clickPlay() { get('toggle').click(); await Promise.resolve(); },
    input(name, value) { get(name).value = String(value); get(name).dispatchEvent(new window.Event('input')); },
  };
}

test('radio stays silent and fetch-free until Play, including track selection', async () => {
  const page = harness();
  assert.equal(page.root.hidden, false);
  assert.equal(page.plays(), 0);
  assert.equal(page.loads(), 0);
  assert.equal(page.audio.getAttribute('src'), null);
  assert.equal(page.audio.autoplay, false);
  assert.equal(page.audio.preload, 'none');
  assert.equal(page.audio.volume, .25);
  assert.equal(page.get('seek').disabled, true);
  page.get('track').click();
  assert.equal(page.get('list').hidden, false);
  page.choices[1].click();
  assert.equal(page.get('title').textContent, 'Second');
  assert.equal(page.get('list').hidden, true);
  assert.equal(page.audio.getAttribute('src'), null);
  assert.equal(page.plays(), 0);
  await page.clickPlay();
  assert.equal(page.audio.getAttribute('src'), '/audio/second.mp3');
  assert.equal(page.root.dataset.state, 'playing');
  assert.equal(page.get('toggle').getAttribute('aria-label'), 'Pause radio');
  await page.clickPlay();
  assert.equal(page.audio.paused, true);
  assert.equal(page.root.dataset.state, 'paused');
  page.choices[0].click();
  assert.equal(page.plays(), 1);
  assert.equal(page.audio.getAttribute('src'), null);
  page.cleanup();
});

test('radio seek, time, volume, queue, and end-of-queue states work', async () => {
  const page = harness();
  await page.clickPlay();
  page.audio.duration = 120;
  page.audio.currentTime = 30;
  page.emit('loadedmetadata');
  assert.equal(page.get('time').textContent, '0:30 / 2:00');
  assert.equal(page.get('seek').value, '250');
  assert.equal(page.get('seek').disabled, false);
  page.input('seek', 500);
  assert.equal(page.audio.currentTime, 60);
  assert.equal(page.get('seek').getAttribute('aria-valuetext'), '1:00 of 2:00');
  page.input('volume', 0);
  assert.equal(page.audio.volume, 0);
  page.input('volume', 70);
  assert.equal(page.audio.volume, .7);
  page.audio.ended = true; page.audio.paused = true; page.emit('pause'); page.emit('ended');
  await Promise.resolve();
  assert.equal(page.plays(), 2);
  assert.equal(page.audio.getAttribute('src'), '/audio/second.mp3');
  assert.equal(page.choices[0].hasAttribute('aria-current'), false);
  assert.equal(page.choices[1].getAttribute('aria-current'), 'true');
  page.audio.ended = true; page.audio.paused = true; page.emit('pause'); page.emit('ended');
  assert.equal(page.plays(), 2);
  assert.equal(page.root.dataset.state, 'paused');
  page.cleanup();
});

test('cancelled and stale play promises cannot restart the radio', async () => {
  const page = harness();
  let resolvePlay;
  page.result(() => new Promise((resolve) => { resolvePlay = resolve; }));
  page.get('toggle').click();
  assert.equal(page.root.dataset.state, 'loading');
  assert.equal(page.get('toggle').textContent, '[cancel]');
  page.get('toggle').click();
  resolvePlay(); await Promise.resolve();
  assert.equal(page.root.dataset.state, 'paused');
  assert.equal(page.audio.paused, true);
  page.emit('playing');
  assert.notEqual(page.root.dataset.state, 'playing');
  page.cleanup();
});

test('failed playback is recoverable and navigation never resumes audio', async () => {
  const page = harness();
  page.result(() => Promise.reject(new Error('Unavailable')));
  await page.clickPlay();
  assert.equal(page.root.dataset.state, 'error');
  assert.equal(page.get('status').hidden, false);
  page.result(() => Promise.resolve());
  page.audio.error = { code: 3 };
  await page.clickPlay();
  assert.equal(page.loads(), 1);
  assert.equal(page.root.dataset.state, 'playing');
  assert.equal(page.get('status').hidden, true);
  page.emit('waiting');
  assert.equal(page.root.dataset.state, 'loading');
  page.emit('playing');
  page.window.dispatchEvent(new page.window.Event('pagehide'));
  page.window.dispatchEvent(new page.window.Event('pageshow'));
  assert.equal(page.audio.paused, true);
  assert.equal(page.root.dataset.state, 'paused');
  assert.equal(page.plays(), 2);
  page.cleanup();
});

test('track menu, media errors, and initialization are safe', async () => {
  const page = harness();
  initRadio(page.root);
  await page.clickPlay();
  assert.equal(page.plays(), 1, 'Only one click handler is registered');
  page.get('track').click();
  const escape = new page.window.Event('keydown'); escape.key = 'Escape';
  page.root.dispatchEvent(escape);
  assert.equal(page.get('list').hidden, true);
  assert.equal(page.get('track').getAttribute('aria-expanded'), 'false');
  page.emit('error');
  assert.equal(page.root.dataset.state, 'error');
  assert.match(page.get('status').textContent, /unavailable/);
  page.cleanup();
  assert.equal(page.root.hidden, true);
  assert.doesNotThrow(() => initRadio(parseHTML('<div></div>').document.querySelector('div')));
  assert.equal(formatTime(Infinity), '—');
  assert.equal(formatTime(-1), '—');
  assert.equal(formatTime(3661), '61:01');
});

test('playlist validation requires unique local audio files and complete metadata', (context) => {
  const scratch = mkdtempSync(join(tmpdir(), 'forrof-radio-test-'));
  context.after(() => rmSync(scratch, { recursive: true, force: true }));
  mkdirSync(join(scratch, 'audio'));
  writeFileSync(join(scratch, 'audio/track.mp3'), Buffer.from('test-only audio fixture'));
  const track = { title: ' Track ', artist: ' Artist ', src: '/audio/track.mp3' };
  assert.deepEqual(loadRadioTracks([], scratch), []);
  assert.equal(loadRadioTracks([track], scratch)[0].title, 'Track');
  for (const src of ['https://example.com/song.mp3', '//example.com/song.mp3', '/audio/../track.mp3', '/audio/%2e%2e/track.mp3', '/audio/song.html', '/audio/missing.mp3']) assert.throws(() => loadRadioTracks([{ ...track, src }], scratch));
  assert.throws(() => loadRadioTracks([{ ...track, artist: '' }], scratch));
  assert.throws(() => loadRadioTracks([track, track], scratch));
  writeFileSync(join(scratch, 'audio/empty.mp3'), '');
  assert.throws(() => loadRadioTracks([{ ...track, src: '/audio/empty.mp3' }], scratch));
});

test('empty radio is omitted and styling honors motion and small-screen preferences', () => {
  const tracks = JSON.parse(readFileSync(new URL('../src/data/radio.json', import.meta.url), 'utf8'));
  for (const route of ['index.html', 'cves/index.html', 'projects/index.html', 'entries/is-freezing-ram-a-thing/index.html']) {
    const document = parseHTML(readFileSync(new URL(`../dist/${route}`, import.meta.url), 'utf8')).document;
    if (!tracks.length) assert.equal(document.querySelector('[data-radio]'), null);
    for (const audio of document.querySelectorAll('audio')) {
      assert.equal(audio.hasAttribute('autoplay'), false);
      assert.equal(audio.hasAttribute('src'), false);
      assert.equal(audio.getAttribute('preload'), 'none');
    }
  }
  const css = readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8');
  assert.match(css, /\.ff-radio-meter span\s*\{[^}]*animation-play-state: paused/);
  assert.match(css, /\[data-state="playing"\] \.ff-radio-meter span\s*\{ animation-play-state: running/);
  assert.match(css, /\[data-motion="off"\] \.ff-radio-meter span\s*\{ animation-play-state: paused/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.site \.ff-radio-meter span \{ animation: none/);
  assert.ok(css.includes('@container (max-width: 24rem)'));
});
