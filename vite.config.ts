import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { social } from './scripts/build/social.ts'
import { https } from './scripts/dev/https.ts'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ panicThreshold: 'all_errors' })] }),
    tailwindcss(),
    social(),
    https(),
  ],
  resolve: {
    alias: { '@src': resolve(import.meta.dirname, 'src') },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['.local'],
  },
})
