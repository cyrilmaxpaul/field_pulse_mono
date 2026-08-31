import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'FieldPulse',
        short_name: 'FieldPulse',
        description: 'Offline-first field inspection & evidence platform',
        theme_color: '#1565c0',
        background_color: '#f5f5f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // API responses carry RBAC-sensitive, frequently-changing data — our own
        // Dexie-backed offline layer decides what to cache and for how long.
        // The generic HTTP cache must never intercept /api/ traffic.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
