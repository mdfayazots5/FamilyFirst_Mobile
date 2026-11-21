import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {readFile} from 'node:fs/promises';
import {defineConfig} from 'vite';
import type {Manifest} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

async function emergencyPrecache(outDir: string) {
  const manifest: Manifest = JSON.parse(await readFile(path.join(outDir, '.vite/manifest.json'), 'utf8'));
  const assets = new Set(['emergency.html', 'manifest.json', 'favicon.ico', 'logo192.png', 'logo512.png']);
  const visit = (key: string) => {
    const entry = manifest[key];
    if (assets.has(entry.file)) return;
    assets.add(entry.file);
    entry.css?.forEach(file => assets.add(file));
    entry.assets?.forEach(file => assets.add(file));
    entry.imports?.forEach(visit);
  };
  visit('emergency.html');
  return assets;
}

export default defineConfig(() => {
  let outDir: string;
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'familyfirst-emergency-precache-directory',
        configResolved(config) {
          outDir = path.resolve(config.root, config.build.outDir);
        },
      },
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'emergency-sw.ts',
        manifest: false,
        injectRegister: false,
        injectManifest: {
          globPatterns: ['**/*.{html,js,css,json,png,ico,svg,woff,woff2}'],
          manifestTransforms: [async entries => {
            const allowed = await emergencyPrecache(outDir);
            const manifest = entries.filter(entry => allowed.has(entry.url));
            const missing = [...allowed].filter(file => !manifest.some(entry => entry.url === file));
            if (missing.length) throw new Error(`Emergency precache is missing: ${missing.join(', ')}`);
            return { manifest };
          }],
        },
      }),
    ],
    build: {
      manifest: true,
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'index.html'),
          emergency: path.resolve(__dirname, 'emergency.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
