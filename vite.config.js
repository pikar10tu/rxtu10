import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base ('./') so the SAME build works on any path:
//   - Firebase Hosting root (rxtu10dashboard.web.app)
//   - GitHub Pages subpath (…github.io/RxTU10-Selection-Tracking/)
// (App uses hash routing, so relative asset paths resolve correctly.)
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
})
