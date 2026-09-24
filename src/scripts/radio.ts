export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export function initRadio(root: HTMLElement) {
  if (root.dataset.ready) return () => {};
  const audio = root.querySelector<HTMLAudioElement>('[data-radio-audio]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-radio-toggle]');
  const trackButton = root.querySelector<HTMLButtonElement>('[data-radio-track]');
  const title = root.querySelector<HTMLElement>('[data-radio-title]');
  const artist = root.querySelector<HTMLElement>('[data-radio-artist]');
  const credit = root.querySelector<HTMLElement>('[data-radio-credit]');
  const artistLink = root.querySelector<HTMLAnchorElement>('[data-radio-artist-link]');
  const seek = root.querySelector<HTMLInputElement>('[data-radio-seek]');
  const volume = root.querySelector<HTMLInputElement>('[data-radio-volume]');
  const time = root.querySelector<HTMLElement>('[data-radio-time]');
  const list = root.querySelector<HTMLOListElement>('[data-radio-list]');
  const status = root.querySelector<HTMLElement>('[data-radio-status]');
  const choices = [...root.querySelectorAll<HTMLButtonElement>('[data-radio-choice]')];
  if (!audio || !toggle || !trackButton || !title || !artist || !seek || !volume || !time || !list || !status || !choices.length) return () => {};

  const events = new AbortController();
  const options = { signal: events.signal };
  let index = 0;
  let requested = false;
  let sequence = 0;
  let disposed = false;

  function state(value: 'idle' | 'loading' | 'playing' | 'paused' | 'error') {
    root.dataset.state = value;
    toggle!.textContent = value === 'loading' ? '[cancel]' : value === 'playing' ? '[pause]' : '[play]';
    toggle!.setAttribute('aria-label', value === 'loading' ? 'Cancel loading radio' : value === 'playing' ? 'Pause radio' : 'Play radio');
  }
  function progress() {
    const duration = audio!.duration;
    const known = Number.isFinite(duration) && duration > 0;
    const current = Number.isFinite(audio!.currentTime) ? Math.max(0, audio!.currentTime) : 0;
    seek!.disabled = !known;
    seek!.value = String(known ? Math.min(1000, Math.round(current / duration * 1000)) : 0);
    seek!.setAttribute('aria-valuetext', known ? `${formatTime(current)} of ${formatTime(duration)}` : formatTime(current));
    time!.textContent = `${formatTime(current)} / ${known ? formatTime(duration) : '—'}`;
  }
  function message(text: string) { status!.textContent = text; status!.hidden = !text; }
  function pause() {
    requested = false;
    sequence++;
    audio!.pause();
    state('paused');
  }
  async function play() {
    if (disposed) return;
    const attempt = ++sequence;
    requested = true;
    message('');
    state('loading');
    // No src or audio request exists until this explicit play action.
    if (!audio!.getAttribute('src')) audio!.setAttribute('src', choices[index].dataset.src!);
    else if (audio!.error) audio!.load();
    try {
      await audio!.play();
      if (attempt === sequence && requested && !disposed) state('playing');
    } catch {
      if (attempt !== sequence || disposed) return;
      requested = false;
      state('error');
      message('Could not play this track. Press play to retry, or choose another.');
    }
  }
  function select(next: number, continuePlaying: boolean) {
    pause();
    index = next;
    audio!.removeAttribute('src');
    audio!.load();
    title!.textContent = choices[index].dataset.title!;
    artist!.textContent = choices[index].dataset.artist!;
    if (credit) credit.textContent = choices[index].dataset.credit || `Music by ${artist!.textContent}`;
    if (artistLink) {
      const url = choices[index].dataset.artistUrl;
      if (url) artistLink.setAttribute('href', url);
      else artistLink.removeAttribute('href');
      artistLink.hidden = !url;
    }
    trackButton!.setAttribute('aria-label', `Choose track; selected ${title!.textContent} by ${artist!.textContent}`);
    choices.forEach((choice, position) => {
      if (position === index) choice.setAttribute('aria-current', 'true');
      else choice.removeAttribute('aria-current');
    });
    message('');
    state('idle');
    progress();
    if (continuePlaying) void play();
  }
  function closeList() {
    list!.hidden = true;
    trackButton!.setAttribute('aria-expanded', 'false');
    trackButton!.focus();
  }

  audio.volume = .25;
  audio.autoplay = false;
  audio.preload = 'none';
  toggle.addEventListener('click', () => { if (requested) pause(); else void play(); }, options);
  trackButton.addEventListener('click', () => {
    list.hidden = !list.hidden;
    trackButton.setAttribute('aria-expanded', String(!list.hidden));
  }, options);
  choices.forEach((choice, next) => choice.addEventListener('click', () => {
    if (index !== next) select(next, requested);
    closeList();
  }, options));
  root.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !list.hidden) closeList(); }, options);
  seek.addEventListener('input', () => {
    if (!seek.disabled && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.max(0, Math.min(1000, Number(seek.value))) / 1000 * audio.duration;
      progress();
    }
  }, options);
  volume.addEventListener('input', () => {
    audio.volume = Math.max(0, Math.min(100, Number(volume.value))) / 100;
    volume.setAttribute('aria-valuetext', `${Math.round(audio.volume * 100)}%`);
  }, options);
  for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'emptied']) audio.addEventListener(event, progress, options);
  audio.addEventListener('playing', () => { if (requested) state('playing'); else audio.pause(); }, options);
  audio.addEventListener('waiting', () => { if (requested) state('loading'); }, options);
  audio.addEventListener('pause', () => {
    // An ended track may emit pause before ended; preserve queue intent in that case.
    if (!audio.ended && audio.paused) { requested = false; sequence++; state('paused'); }
  }, options);
  audio.addEventListener('ended', () => {
    if (requested && index + 1 < choices.length) select(index + 1, true);
    else { pause(); progress(); }
  }, options);
  audio.addEventListener('error', () => {
    requested = false;
    sequence++;
    state('error');
    message('Track unavailable. Press play to retry, or choose another.');
  }, options);
  // Internal ClientRouter navigation keeps this document alive. Only a full exit
  // or reload pauses playback; opening a fresh page never resumes it automatically.
  window.addEventListener('pagehide', pause, options);
  progress();
  root.dataset.ready = 'true';
  root.hidden = false;
  return () => { disposed = true; pause(); events.abort(); root.hidden = true; delete root.dataset.ready; };
}
