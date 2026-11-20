// 🌈→🪙 คืนเหรียญพื้นการ์ด (cosmetics kind 'g') ที่เลิกขาย 20 พ.ย. 2026 — ฉากบ้านเป็นปกการ์ดแทน
// node scripts/refund-card-bg.mjs          = dry run (อ่านอย่างเดียว พิมพ์ว่าใครได้คืนเท่าไร)
// node scripts/refund-card-bg.mjs --write  = เขียนจริง (production ทุกคน — ทำเมื่อ user สั่งเท่านั้น หลัง push)
// คืนตามราคาเหรียญเต็ม · ของอีเวนต์ (ราคา 0 ซื้อด้วยฟักทอง) ไม่คืนเหรียญ แค่ถอดออก (ตาม EVENT_REFUND ด้านล่าง)
// ใช้ token ของ firebase CLI ผ่าน REST (ข้าม rules) · เขียนแบบมีเงื่อนไข updateTime กันทับของที่เพิ่งเปลี่ยน
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { COSMETICS } from '../src/data/cosmetics.js'

const WRITE = process.argv.includes('--write')
const EVENT_REFUND = 0   // เหรียญต่อชิ้นสำหรับของอีเวนต์ฟักทอง (user ยังไม่เคาะ → 0)
const G = Object.fromEntries(COSMETICS.filter(c => c.kind === 'g').map(c => [c.id, c.price || EVENT_REFUND]))

const require = createRequire(import.meta.url)
const tools = path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/auth.js')
const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.config/configstore/firebase-tools.json'), 'utf8'))
const { access_token: tok } = await require(tools).getAccessToken(cfg.tokens.refresh_token, [])
const BASE = 'https://firestore.googleapis.com/v1/projects/rxtu10dashboard/databases/(default)/documents'
const H = { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }

const rows = []
let pageToken = ''
do {
  const r = await fetch(`${BASE}/users?pageSize=300&mask.fieldPaths=cosmetics&mask.fieldPaths=nickname${pageToken ? '&pageToken=' + pageToken : ''}`, { headers: H }).then(r => r.json())
  for (const d of r.documents || []) {
    const c = d.fields?.cosmetics?.mapValue?.fields
    const owned = (c?.owned?.arrayValue?.values || []).map(v => v.stringValue)
    const gs = owned.filter(id => id in G)
    if (!gs.length) continue
    rows.push({ name: d.name, nick: d.fields?.nickname?.stringValue || '?', updateTime: d.updateTime, owned, gs, coins: gs.reduce((s, id) => s + G[id], 0) })
  }
  pageToken = r.nextPageToken || ''
} while (pageToken)

let total = 0
for (const r of rows) { total += r.coins; console.log(`${r.nick.padEnd(14)} ${r.gs.join(' ')} → +${r.coins.toLocaleString()}`) }
console.log(`\n${rows.length} คน · คืนรวม ${total.toLocaleString()} เหรียญ${WRITE ? '' : '  (dry run — ยังไม่เขียน)'}`)
if (!WRITE) process.exit(0)

for (const r of rows) {
  const keep = r.owned.filter(id => !(id in G))
  const body = {
    writes: [{
      update: { name: r.name, fields: { cosmetics: { mapValue: { fields: { owned: { arrayValue: { values: keep.map(stringValue => ({ stringValue })) } } } } } } },
      updateMask: { fieldPaths: ['cosmetics.owned', 'cosmetics.g'] },   // g ไม่อยู่ใน fields = ลบทิ้ง
      currentDocument: { updateTime: r.updateTime },
    }, {
      transform: { document: r.name, fieldTransforms: [{ fieldPath: 'coins', increment: { integerValue: String(r.coins) } }] },
    }],
  }
  const res = await fetch(`${BASE.replace('/documents', '')}/documents:commit`, { method: 'POST', headers: H, body: JSON.stringify(body) })
  console.log(res.ok ? `✓ ${r.nick}` : `✗ ${r.nick} ${res.status} ${(await res.text()).slice(0, 120)} (รันใหม่ได้ — คนที่สำเร็จแล้วจะไม่มีของ g เหลือ)`)
}
