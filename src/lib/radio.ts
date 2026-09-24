import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import playlist from '../data/radio.json' with { type: 'json' };

function isLocalAudioPath(value: string) {
  if (!value.startsWith('/audio/')) return false;
  try {
    const filename = decodeURIComponent(value.slice('/audio/'.length));
    // Preserve uploaded filenames while rejecting traversal, URL suffixes, and ambiguous encodings.
    return /^[^./\\\u0000-\u001f\u007f?#][^/\\\u0000-\u001f\u007f?#]*\.(mp3|ogg|opus|wav|m4a)$/i.test(filename)
      && value === `/audio/${encodeURIComponent(filename)}`;
  } catch { return false; }
}

const tracksSchema = z.array(z.object({
  title: z.string().trim().min(1).max(120),
  artist: z.string().trim().min(1).max(120),
  credit: z.string().trim().min(1).max(200).optional(),
  artistUrl: z.url({ protocol: /^https$/ }).optional(),
  src: z.string().refine(isLocalAudioPath, 'Use a URL-encoded filename under /audio/ (mp3, ogg, opus, wav, m4a)'),
})).refine((tracks) => new Set(tracks.map(({ src }) => src)).size === tracks.length, 'Each audio file should appear once');

export function loadRadioTracks(input: unknown = playlist, publicDirectory = resolve('public')) {
  const tracks = tracksSchema.parse(input);
  for (const track of tracks) {
    const file = resolve(publicDirectory, decodeURIComponent(track.src.slice(1)));
    let available = false;
    try { const stat = statSync(file); available = stat.isFile() && stat.size > 0; } catch { /* Report the track, not a filesystem trace. */ }
    if (!available) throw new Error(`Radio track is missing or empty: ${track.src}`);
  }
  return tracks;
}
