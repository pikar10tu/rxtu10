import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base ('./') so the SAME build works on any path:
//   - Firebase Hosting root (rxtu10dashboard.web.app)
//   - GitHub Pages subpath (…github.io/rxtu10/)
// (App uses hash routing, so relative asset paths resolve correctly.)
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // Split the Firebase SDK into its own vendor chunk — it rarely changes,
        // so it stays cached across app-code deploys (only the small app chunk
        // gets re-downloaded).
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
        },
      },
    },
  },
})
