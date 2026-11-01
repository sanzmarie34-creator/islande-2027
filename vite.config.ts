import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Chemins relatifs : le site fonctionne quel que soit le dossier ou l'hébergeur (Netlify, GitHub Pages…)
  base: './',
})
