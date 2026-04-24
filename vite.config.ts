import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'MomoPet - 宠物健康助手',
          short_name: 'MomoPet',
          description: '可爱简约的手绘风宠物健康记录应用，支持每日健康确认、周期护理提醒以及多维度的趋势分析。',
          theme_color: '#f0f8e8',
          background_color: '#fafaf8',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/img/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/img/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/img/icon-192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/img/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/img/screenshot-1.png',
              sizes: '540x720',
              type: 'image/png',
              form_factor: 'narrow',
            },
            {
              src: '/img/screenshot-2.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
            },
          ],
          categories: ['productivity', 'health'],
          shortcuts: [
            {
              name: '记录宠物',
              short_name: '记录',
              description: '快速记录宠物健康数据',
              url: '/?mode=log',
              icons: [
                {
                  src: '/img/icon-192.png',
                  sizes: '192x192',
                },
              ],
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
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
