import { initArt } from './art.ts';
import { initRadio } from './radio.ts';

export function initSite() {
  const events = new AbortController();
  const options = { signal: events.signal };
  let stopArt = () => {};
  let radio: HTMLElement | null = null;
  let stopRadio = () => {};

  function beforeSwap() {
    // Artwork belongs to each page; release its observers and animation loop.
    stopArt();
    stopArt = () => {};
  }

  function pageLoad() {
    beforeSwap();
    const root = document.getElementById('forrof-site');
    if (root) stopArt = initArt(root);
    const nextRadio = root?.querySelector<HTMLElement>('[data-radio]') ?? null;
    // Astro carries over the entire radio node, including audio and live controls.
    // Do not initialize it again or reset playback, selection, volume, or position.
    if (nextRadio !== radio) {
      stopRadio();
      radio = nextRadio;
      stopRadio = radio ? initRadio(radio) : () => {};
    }
  }

  document.addEventListener('astro:before-swap', beforeSwap, options);
  document.addEventListener('astro:page-load', pageLoad, options);
  return () => { beforeSwap(); stopRadio(); events.abort(); };
}
