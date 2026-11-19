import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

// 🎨 doll editor (dev เท่านั้น) — บันทึกชิ้นที่แก้ลง src/data/dollEdits.js + สถานะรีวิวลง docs/doll-prototype/review.json
function dollEditorSave() {
  const EDITS = path.resolve('src/data/dollEdits.js')
  const REVIEW = path.resolve('docs/doll-prototype/review.json')
  return {
    name: 'doll-editor-save',
    apply: 'serve',
    // ไม่ HMR ไฟล์ที่ editor เขียนเอง (กันหน้า editor รีโหลดทิ้งงานกลางคัน)
    // ล้าง cache ให้โหลดไฟล์ใหม่ครั้งหน้า แต่ไม่สั่งรีโหลดหน้า
    handleHotUpdate(ctx) {
      if (!ctx.file.replace(/\\/g, '/').endsWith('src/data/dollEdits.js')) return
      for (const m of ctx.modules) ctx.server.moduleGraph.invalidateModule(m)
      return []
    },
    configureServer(server) {
      server.middlewares.use('/__doll/review', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(fs.existsSync(REVIEW) ? fs.readFileSync(REVIEW, 'utf8') : '{}')
      })
      server.middlewares.use('/__doll/save', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end() }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => {
          try {
            const { edits, review } = JSON.parse(body)
            const lines = Object.keys(edits).sort().map(id => `  ${JSON.stringify(id)}: ${JSON.stringify(edits[id])},`)
            const NL = String.fromCharCode(10)
            const out = [
              '// 🎨 ชิ้นตุ๊กตาที่แก้ใน editor (#/doll-editor · dev เท่านั้น) — ไฟล์นี้ editor เขียนเอง ห้ามแก้มือ',
              '// { [partId]: { m, o, back, ob, pal } } ทับของเดิมใน dollParts.js',
              'export default {', ...lines, '}', '',
            ]
            fs.writeFileSync(EDITS, out.join(NL))
            if (review) fs.writeFileSync(REVIEW, JSON.stringify(review, null, 1) + NL)
            res.end('ok')
          } catch (e) { res.statusCode = 500; res.end(String(e)) }
        })
      })
    },
  }
}

// Relative base ('./') so the SAME build works on any path:
//   - Firebase Hosting root (rxtu10dashboard.web.app)
//   - GitHub Pages subpath (…github.io/rxtu10/)
// (App uses hash routing, so relative asset paths resolve correctly.)
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), dollEditorSave()],
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
