import { irisFrame, knotFrame, railFrame } from '../lib/art.ts';

export function initArt(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  if (!button) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preferenceKey = 'forrof:motion';
  let requested = true;
  try { requested = localStorage.getItem(preferenceKey) !== 'off'; } catch { /* Storage is optional. */ }
  const iris = root.querySelector<HTMLElement>('[data-iris]');
  const knot = root.querySelector<HTMLElement>('[data-knot]');
  const rails = [...root.querySelectorAll<HTMLElement>('[data-rail]')];
  const targets = [iris, knot, ...rails].filter((element): element is HTMLElement => Boolean(element));
  const visible = new Set<HTMLElement>();
  const irisLines = [...(iris?.querySelectorAll('span') ?? [])];
  const knotLines = [...(knot?.querySelectorAll('span') ?? [])];
  const pointer = { x: 0, y: 0 };
  let phase = 0;
  let frame = 0;
  let lastPaint = 0;
  const events = new AbortController();
  const enabled = () => requested && !reduced.matches;
  const canAnimate = () => enabled() && visible.size > 0 && !document.hidden && root.isConnected;

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = 0;
  }
  function paint() {
    if (iris && visible.has(iris)) irisFrame(phase).forEach((line, index) => { irisLines[index].textContent = line; });
    if (knot && visible.has(knot)) knotFrame(phase, pointer).forEach((line, index) => { knotLines[index].textContent = line; });
    rails.forEach((rail) => {
      if (visible.has(rail)) rail.textContent = railFrame(phase, rail.dataset.rail === 'right' ? Math.PI * 0.7 : 0, rail.dataset.rail === 'left');
    });
  }
  function animate(now: number) {
    frame = 0;
    if (!canAnimate()) { lastPaint = 0; return; }
    if (now - lastPaint >= 140) {
      phase += lastPaint ? Math.min((now - lastPaint) / 1000, 0.3) : 0;
      lastPaint = now;
      paint();
    }
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    root.dataset.motion = enabled() ? 'on' : 'off';
    button!.hidden = false;
    button!.textContent = enabled() ? 'motion: on' : 'motion: off';
    button!.setAttribute('aria-pressed', String(enabled()));
    button!.setAttribute('aria-label', reduced.matches ? 'Animation off: reduced motion preference' : enabled() ? 'Pause decorative animation' : 'Play decorative animation');
    button!.disabled = reduced.matches;
    if (canAnimate() && !frame) frame = requestAnimationFrame(animate);
    if (!canAnimate()) stop();
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
      else visible.delete(entry.target as HTMLElement);
    });
    sync();
  });
  targets.forEach((target) => observer.observe(target));
  button.addEventListener('click', () => {
    requested = !requested;
    try { localStorage.setItem(preferenceKey, requested ? 'on' : 'off'); } catch { /* Still works without persistence. */ }
    sync();
  }, { signal: events.signal });
  const masthead = root.querySelector<HTMLElement>('.ff-masthead');
  masthead?.addEventListener('pointermove', (event) => {
    if (!canAnimate() || event.pointerType === 'touch') return;
    const bounds = masthead.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    pointer.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    root.style.setProperty('--ff-pointer-x', String(pointer.x));
    root.style.setProperty('--ff-pointer-y', String(pointer.y));
  }, { signal: events.signal });
  masthead?.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = 0;
    root.style.setProperty('--ff-pointer-x', '0');
    root.style.setProperty('--ff-pointer-y', '0');
  }, { signal: events.signal });
  reduced.addEventListener('change', sync, { signal: events.signal });
  document.addEventListener('visibilitychange', sync, { signal: events.signal });
  window.addEventListener('pagehide', stop, { signal: events.signal });
  window.addEventListener('pageshow', sync, { signal: events.signal });
  sync();
  return () => { stop(); observer.disconnect(); events.abort(); };
}
