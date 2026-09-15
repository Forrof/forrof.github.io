import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import playlist from '../data/radio.json' with { type: 'json' };

const tracksSchema = z.array(z.object({
  title: z.string().trim().min(1).max(120),
  artist: z.string().trim().min(1).max(120),
  src: z.string().regex(/^\/audio\/[a-z0-9][a-z0-9._-]*\.(mp3|ogg|opus|wav|m4a)$/i, 'Use /audio/filename.mp3 (or ogg, opus, wav, m4a)'),
})).refine((tracks) => new Set(tracks.map(({ src }) => src)).size === tracks.length, 'Each audio file should appear once');

export function loadRadioTracks(input: unknown = playlist, publicDirectory = resolve('public')) {
  const tracks = tracksSchema.parse(input);
  for (const track of tracks) {
    const file = resolve(publicDirectory, track.src.slice(1));
    let available = false;
    try { const stat = statSync(file); available = stat.isFile() && stat.size > 0; } catch { /* Report the track, not a filesystem trace. */ }
    if (!available) throw new Error(`Radio track is missing or empty: ${track.src}`);
  }
  return tracks;
}
