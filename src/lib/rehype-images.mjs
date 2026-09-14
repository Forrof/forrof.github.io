import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

// Keep the original evidence files and URLs; reserve space and link to full size.
export default function evidenceImages() {
  const publicDirectory = resolve('public');
  function walk(node) {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type !== 'element' || child.tagName !== 'img') { walk(child); return child; }
      const source = child.properties?.src;
      if (typeof source !== 'string' || !source.startsWith('/') || source.startsWith('//')) return child;
      const file = resolve(publicDirectory, `.${decodeURIComponent(source.split(/[?#]/)[0])}`);
      if (!file.startsWith(publicDirectory + sep)) throw new Error('Image path must stay inside public/.');
      const bytes = readFileSync(file);
      if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        child.properties.width = bytes.readUInt32BE(16);
        child.properties.height = bytes.readUInt32BE(20);
      }
      child.properties.loading = 'lazy';
      child.properties.decoding = 'async';
      if (node.tagName === 'a') return child;
      return {
        type: 'element', tagName: 'a',
        properties: { href: source, target: '_blank', rel: ['noopener', 'noreferrer'], className: ['ff-image-link'], ariaLabel: `Open full-size image: ${child.properties.alt || 'article figure'}` },
        children: [child],
      };
    });
  }
  return walk;
}
