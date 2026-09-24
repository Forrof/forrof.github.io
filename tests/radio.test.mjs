import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { initRadio, formatTime } from '../src/scripts/radio.ts';
import { loadRadioTracks } from '../src/lib/radio.ts';
import { initSite } from '../src/scripts/site.ts';

function harness({ site = false } = {}) {
  const { window, document } = parseHTML(`<html><head></head><body><div id="forrof-site"><section data-radio data-state="idle" hidden>
    <button data-radio-toggle>[play]</button>
    <button data-radio-track aria-expanded="false"><span data-radio-title>First</span><span data-radio-artist>Artist</span></button>
    <input data-radio-seek value="0" disabled><input data-radio-volume value="25"><span data-radio-time></span>
    <ol data-radio-list hidden><li><button data-radio-choice data-src="/audio/first.mp3" data-title="First" data-artist="Artist" data-credit="Remix by Artist" data-artist-url="https://example.com/artist" aria-current="true"></button></li><li><button data-radio-choice data-src="/audio/second.mp3" data-title="Second" data-artist="Another"></button></li></ol>
    <p><span data-radio-credit>Remix by Artist</span><a data-radio-artist-link href="https://example.com/artist">artist</a></p>
    <p data-radio-status hidden></p><audio data-radio-audio preload="none"></audio>
  </section></div></body></html>`);
  globalThis.window = window;
  globalThis.document = document;
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
  const cleanup = site ? initSite() : initRadio(root);
  if (site) document.dispatchEvent(new window.Event('astro:page-load'));
  return {
    root, audio, window, document, get, emit, cleanup,
    choices: [...root.querySelectorAll('[data-radio-choice]')],
    plays: () => plays, loads: () => loads,
    result(fn) { playResult = fn; },
    async clickPlay() { get('toggle').click(); await Promise.resolve(); },
    input(name, value) { get(name).value = String(value); get(name).dispatchEvent(new window.Event('input')); },
    navigate(keepRadio = true) {
      document.dispatchEvent(new window.Event('astro:before-swap'));
      const oldPage = document.getElementById('forrof-site');
      const nextPage = document.createElement('div');
      nextPage.id = 'forrof-site';
      document.body.append(nextPage);
      // Model the router carrying the existing element to the incoming page.
      if (keepRadio) nextPage.append(root);
      oldPage.remove();
      document.dispatchEvent(new window.Event('astro:after-swap'));
      document.dispatchEvent(new window.Event('astro:page-load'));
    },
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
  assert.equal(page.get('artist').textContent, 'Another');
  assert.equal(page.get('credit').textContent, 'Music by Another');
  assert.equal(page.get('artist-link').hidden, true);
  assert.equal(page.get('artist-link').hasAttribute('href'), false);
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
  assert.equal(page.get('credit').textContent, 'Remix by Artist');
  assert.equal(page.get('artist-link').hidden, false);
  assert.equal(page.get('artist-link').getAttribute('href'), 'https://example.com/artist');
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

test('page lifecycle keeps the playing or paused radio intact without duplicate handlers', async () => {
  const page = harness({ site: true });
  page.choices[1].click();
  await page.clickPlay();
  page.audio.duration = 240;
  page.audio.currentTime = 73;
  page.input('volume', 67);
  page.emit('timeupdate');
  const source = page.audio.getAttribute('src');
  const loads = page.loads();
  page.get('track').click();
  for (let visit = 0; visit < 3; visit++) {
    page.navigate();
    assert.equal(page.document.querySelector('[data-radio]'), page.root);
    assert.equal(page.document.querySelector('audio'), page.audio);
    assert.equal(page.audio.paused, false);
    assert.equal(page.audio.currentTime, 73);
    assert.equal(page.audio.volume, .67);
    assert.equal(page.audio.getAttribute('src'), source);
    assert.equal(page.get('title').textContent, 'Second');
    assert.equal(page.get('list').hidden, false);
    assert.equal(page.get('credit').textContent, 'Music by Another');
    assert.equal(page.plays(), 1);
    assert.equal(page.loads(), loads);
  }
  await page.clickPlay();
  assert.equal(page.audio.paused, true, 'One click pauses: no duplicate listeners');
  page.navigate();
  assert.equal(page.audio.paused, true);
  assert.equal(page.audio.currentTime, 73);
  assert.equal(page.plays(), 1);
  await page.clickPlay();
  assert.equal(page.plays(), 2);
  page.navigate(false);
  assert.equal(page.audio.paused, true, 'Removing the radio disposes its old controller');
  page.cleanup();
});

test('internal navigation never opts a silent visitor into audio', () => {
  const page = harness({ site: true });
  page.navigate();
  page.navigate();
  assert.equal(page.plays(), 0);
  assert.equal(page.loads(), 0);
  assert.equal(page.audio.hasAttribute('src'), false);
  assert.equal(page.audio.paused, true);
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

test('failed playback is recoverable and leaving the document never auto-resumes audio', async () => {
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
  for (const src of ['https://example.com/song.mp3', '//example.com/song.mp3', '/audio/../track.mp3', '/audio/%2e%2e/track.mp3', '/audio/song.html', '/audio/missing.mp3', '/audio/%2Ftrack.mp3', '/audio/%5Ctrack.mp3', '/audio/%00track.mp3', '/audio/track.mp3?download=1', '/audio/track.mp3#fragment', '/audio/%ZZ.mp3', '/audio/.hidden.mp3', '/audio/%74rack.mp3']) assert.throws(() => loadRadioTracks([{ ...track, src }], scratch));
  const originalName = "L'amour (remix).mp3";
  writeFileSync(join(scratch, 'audio', originalName), Buffer.from('test-only audio fixture'));
  assert.equal(loadRadioTracks([{ ...track, src: `/audio/${encodeURIComponent(originalName)}`, credit: 'Remix by Artist', artistUrl: 'https://example.com/artist' }], scratch)[0].credit, 'Remix by Artist');
  for (const artistUrl of ['javascript:alert(1)', 'http://example.com/artist', '/artist']) assert.throws(() => loadRadioTracks([{ ...track, artistUrl }], scratch));
  assert.throws(() => loadRadioTracks([{ ...track, credit: '' }], scratch));
  assert.throws(() => loadRadioTracks([{ ...track, artist: '' }], scratch));
  assert.throws(() => loadRadioTracks([track, track], scratch));
  writeFileSync(join(scratch, 'audio/empty.mp3'), '');
  assert.throws(() => loadRadioTracks([{ ...track, src: '/audio/empty.mp3' }], scratch));
});

test('configured radio renders credited tracks without autoplay and respects motion preferences', () => {
  const tracks = JSON.parse(readFileSync(new URL('../src/data/radio.json', import.meta.url), 'utf8'));
  for (const route of ['index.html', 'cves/index.html', 'projects/index.html', 'entries/is-freezing-ram-a-thing/index.html']) {
    const document = parseHTML(readFileSync(new URL(`../dist/${route}`, import.meta.url), 'utf8')).document;
    if (!tracks.length) assert.equal(document.querySelector('[data-radio]'), null);
    else {
      const radio = document.querySelector('[data-radio]');
      assert.ok(radio, route);
      assert.equal(radio.getAttribute('data-astro-transition-persist'), 'forrof-radio');
      assert.equal(document.querySelector('meta[name="astro-view-transitions-enabled"]').getAttribute('content'), 'true');
      assert.equal(document.querySelector('meta[name="astro-view-transitions-fallback"]').getAttribute('content'), 'swap');
      assert.equal(radio.querySelector('[data-radio-artist]').textContent, tracks[0].artist);
      assert.equal(radio.querySelector('[data-radio-credit]').textContent, tracks[0].credit ?? `Music by ${tracks[0].artist}`);
      assert.deepEqual([...radio.querySelectorAll('[data-radio-choice]')].map((button) => ({ title: button.dataset.title, artist: button.dataset.artist, src: button.dataset.src })), tracks.map(({ title, artist, src }) => ({ title, artist, src })));
    }
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

test('the supplied mixtape preserves every audio file and credits its remixer', () => {
  const tracks = loadRadioTracks();
  const uploaded = readdirSync(new URL('../public/audio/', import.meta.url)).filter((file) => file.endsWith('.mp3')).sort();
  assert.equal(tracks.length, 13);
  assert.deepEqual(tracks.map(({ src }) => decodeURIComponent(src.slice('/audio/'.length))).sort(), uploaded);
  assert.equal(tracks[0].title, 'Blancanieves x Stand Up');
  assert.equal(tracks.at(-1).title, 'Domingo x SSX');
  for (const track of tracks) {
    assert.equal(track.artist, 'Sevillano');
    assert.equal(track.credit, 'VHS Mixtape · Remix by Sevillano');
    assert.deepEqual(readFileSync(new URL(`../dist${track.src}`, import.meta.url)), readFileSync(new URL(`../public${track.src}`, import.meta.url)), track.title);
  }
});
