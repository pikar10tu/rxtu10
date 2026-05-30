import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Base path differs per deploy target:
//   - Firebase Hosting (root domain rxtu10dashboard.web.app) → '/'
//   - GitHub Pages project site (…github.io/RxTU10-Selection-Tracking/) → set VITE_BASE
// Build for Pages with:  VITE_BASE=/RxTU10-Selection-Tracking/ npm run build
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
})
