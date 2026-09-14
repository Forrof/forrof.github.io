export const IRIS_ROWS = 25;
export const KNOT_ROWS = 24;
type Point = [number, number];

export function irisFrame(phase = 0): string[] {
  const cells = Array.from({ length: IRIS_ROWS }, () => Array<string>(57).fill(' '));
  const turn = phase * 0.065;
  const cosine = Math.cos(turn), sine = Math.sin(turn);
  function plot(x: number, y: number, character: string) {
    const col = Math.round(28 + (x * cosine - y * sine) * 24);
    const row = Math.round(12 + (x * sine + y * cosine) * 10.5);
    if (row >= 0 && row < IRIS_ROWS && col >= 0 && col < 57) cells[row][col] = character;
  }
  function line(start: Point, end: Point, character: string) {
    for (let step = 0; step <= 80; step++) {
      const progress = step / 80;
      plot(start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress, character);
    }
  }
  for (let step = 0; step < 480; step++) {
    const angle = step / 480 * Math.PI * 2;
    if (step % 16 < 9) plot(1.05 * Math.cos(angle), 1.05 * Math.sin(angle), '·');
    const radius = 0.64 + 0.28 * Math.cos(8 * angle);
    plot(radius * Math.cos(angle), radius * Math.sin(angle), '+');
    plot(0.29 * Math.cos(angle), 0.29 * Math.sin(angle), '▓');
  }
  for (let ray = 0; ray < 8; ray++) {
    const angle = ray * Math.PI / 4;
    const point = (radius: number, offset = 0): Point => [radius * Math.cos(angle + offset), radius * Math.sin(angle + offset)];
    line(point(0.33, -0.14), point(0.98), '░');
    line(point(0.98), point(0.33, 0.14), '▒');
    line(point(0.33, 0.14), point(0.62, 0.32), ':');
    line(point(0.62, 0.32), point(0.33, -0.14), ':');
  }
  for (let step = 0; step < 100; step++) {
    const angle = step / 100 * Math.PI * 2;
    plot(0.13 * Math.cos(angle), 0.13 * Math.sin(angle), '█');
  }
  plot(0, 0, '◆');
  return cells.map((row) => row.join(''));
}

const path: [number, number, number][] = [];
for (let t = 0; t < Math.PI * 2; t += 0.009) {
  const radius = 2 + 0.7 * Math.cos(3 * t);
  path.push([radius * Math.cos(2 * t), radius * Math.sin(2 * t), 0.7 * Math.sin(3 * t)]);
}
const tube = Array.from({ length: 8 }, (_, index) => [0.12 * Math.cos(index * Math.PI / 4), 0.12 * Math.sin(index * Math.PI / 4)]);
const shades = [' ', '·', ':', '+', '*', '#', '▓', '█'];

export function knotFrame(phase = 0, pointer = { x: 0, y: 0 }): string[] {
  const depth = new Float32Array(56 * KNOT_ROWS).fill(-Infinity);
  const ink = new Uint8Array(56 * KNOT_ROWS);
  const yaw = phase * 0.18 + pointer.x * 0.13;
  const pitch = 0.75 + Math.sin(phase * 0.13) * 0.15 + pointer.y * 0.1;
  const roll = -0.35 + Math.sin(phase * 0.11) * 0.08;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const cr = Math.cos(roll), sr = Math.sin(roll);
  for (const point of path) {
    const a = point[0] * cy + point[2] * sy;
    const b = -point[0] * sy + point[2] * cy;
    const y = point[1] * cp - b * sp;
    const z = point[1] * sp + b * cp;
    const x = a * cr - y * sr;
    const v = a * sr + y * cr;
    for (const offset of tube) {
      const col = Math.round(27.5 + (x + offset[0]) * 9);
      const row = Math.round(11.5 + (v + offset[1]) * 3.6);
      if (col < 0 || col >= 56 || row < 0 || row >= KNOT_ROWS) continue;
      const index = row * 56 + col;
      if (z > depth[index]) {
        depth[index] = z;
        ink[index] = Math.max(1, Math.min(7, Math.floor((z + 3) / 6 * 7) + 1));
      }
    }
  }
  return Array.from({ length: KNOT_ROWS }, (_, row) =>
    Array.from({ length: 56 }, (_, col) => shades[ink[row * 56 + col]]).join(''));
}

export function railFrame(phase = 0, offset = 0, woven = true): string {
  return Array.from({ length: 34 }, (_, row) => {
    const cells = Array<string>(15).fill(' ');
    const wave = row * 0.3 + phase * 0.7 + offset;
    const first = Math.round(7 + Math.sin(wave) * 5.5);
    const second = Math.round(7 + Math.sin(wave + Math.PI) * 5.5);
    if (row % 3 === 0) {
      for (let col = Math.min(first, second) + 1; col < Math.max(first, second); col++) cells[col] = woven ? '·' : '─';
    }
    if (row % 7 === 0) { cells[0] = '┊'; cells[14] = '┊'; }
    cells[first] = Math.cos(wave) > 0 ? '▓' : '░';
    cells[second] = Math.cos(wave) > 0 ? '░' : '▓';
    if (Math.abs(first - second) < 2) cells[7] = '╳';
    if (!woven && row % 5 === 0) cells[7] = '◇';
    return cells.join('');
  }).join('\n');
}
