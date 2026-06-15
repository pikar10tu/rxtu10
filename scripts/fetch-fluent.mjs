// ดาวน์โหลด Fluent Emoji (สไตล์ Color SVG) เฉพาะ emoji ที่แอปใช้จริง → self-host
// เหตุผล: jsDelivr เสิร์ฟ fluentui-emoji ไม่ได้ (repo >50MB) ต้องโฮสต์เอง
// รัน: node scripts/fetch-fluent.mjs   (ต่อเน็ต) · ผล → public/emoji/fluent/<codepoint>.svg
//
// map: emoji → ชื่อ CLDR (จาก unicode-emoji-json) → โฟลเดอร์ Fluent (ขึ้นต้นใหญ่) + ไฟล์ <slug>_color.svg
// ชื่อไฟล์ผลลัพธ์ = codepoint (เดียวกับ emojiCodepoint) ให้ <Emoji> ชี้ได้ตรง
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { emojiCodepoint } from '../src/utils/emoji.js'

const OUT = 'public/emoji/fluent'
const RAW = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets'
const NAMES = 'https://cdn.jsdelivr.net/npm/unicode-emoji-json/data-by-emoji.json'

// emoji ดิบ (base pictographic + VS16/ZWJ/skin-tone) — ใช้สแกน .vue + data
const EMOJI_RE = /\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu

function walk(dir) {
    const out = []
    for (const d of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${d.name}`
        if (d.isDirectory()) out.push(...walk(p))
        else if (/\.(vue|js)$/.test(d.name) && !d.name.endsWith('.test.js')) out.push(p)
    }
    return out
}

// 1) สแกนทุกไฟล์ใน src/ (.vue + .js ยกเว้น test) หา emoji ดิบทั้งหมด (dedup)
//    ครอบคลุมทั้ง emoji ข้อมูล (key emoji:) และ hardcode ใน template/JS
const set = new Set()
for (const f of walk('src')) {
    for (const m of readFileSync(f, 'utf8').matchAll(EMOJI_RE)) set.add(m[0])
}
const emojis = [...set]
console.log(`พบ emoji ${emojis.length} ตัวจาก src/`)

// 2) ตาราง emoji → { name, slug }
const byEmoji = await (await fetch(NAMES)).json()
const lookup = (e) => byEmoji[e] || byEmoji[e.replace(/️/g, '')] || byEmoji[e + '️']

// ชื่อโฟลเดอร์ Fluent ที่ไม่ตรงกับชื่อ CLDR ของ unicode-emoji-json (แก้มือ)
const OVERRIDES = { '🤗': 'Hugging face', '👒': 'Womans hat' }

// 3) ดาวน์โหลดทีละตัว
mkdirSync(OUT, { recursive: true })
const missing = []
let ok = 0
for (const e of emojis) {
    const cp = emojiCodepoint(e)
    const meta = lookup(e)
    const cldr = OVERRIDES[e] || meta?.name
    if (!cldr) { missing.push([e, cp, 'ไม่พบชื่อ']); continue }
    // Fluent ใช้ sentence case: ตัวแรกใหญ่ ที่เหลือ lowercase (เช่น "Globe showing asia-australia")
    const folder = cldr.charAt(0).toUpperCase() + cldr.slice(1).toLowerCase()
    const base = folder.toLowerCase().replaceAll(' ', '_') // ชื่อไฟล์ Fluent (hyphen คงไว้)
    const enc = encodeURIComponent(folder)
    // (1) emoji ปกติ: <folder>/Color/<base>_color.svg
    // (2) emoji มี skin-tone: <folder>/Default/Color/<base>_color_default.svg
    const tries = [
        `${RAW}/${enc}/Color/${base}_color.svg`,
        `${RAW}/${enc}/Default/Color/${base}_color_default.svg`,
    ]
    let saved = false
    for (const url of tries) {
        const res = await fetch(url)
        if (!res.ok) continue
        writeFileSync(`${OUT}/${cp}.svg`, await res.text())
        ok++; saved = true
        console.log(`✓ ${e}  ${cp}  ← ${folder}`)
        break
    }
    if (!saved) missing.push([e, cp, `404 ${folder}`])
}

console.log(`\nเสร็จ: บันทึก ${ok}/${emojis.length} ตัว → ${OUT}`)
if (missing.length) {
    console.log(`\n⚠️ ไม่ได้ ${missing.length} ตัว (จะ fallback เป็น emoji เครื่องตอนรัน):`)
    for (const [e, cp, why] of missing) console.log(`   ${e}  ${cp}  — ${why}`)
}
