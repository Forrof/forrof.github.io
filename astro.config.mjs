import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import autolinkHeadings from 'rehype-autolink-headings';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';
import evidenceImages from './src/lib/rehype-images.mjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://forrof.github.io',
  output: 'static',
  // Keep content caches local, including in isolated publication tests.
  cacheDir: './.astro/cache',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    processor: unified({
      smartypants: false,
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { trust: false }], evidenceImages, rehypeHeadingIds, [autolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }]],
    }),
  },
});
