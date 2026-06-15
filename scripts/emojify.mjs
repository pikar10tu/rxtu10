// Codemod: แทน emoji hardcoded ใน <template> ของ .vue → <Emoji char="X" />
// แทนเฉพาะ "text node" — ข้าม attribute (ใน <...>), {{ mustache }}, <!-- comment -->
// เพิ่ม import Emoji อัตโนมัติถ้ายังไม่มี · รัน: node scripts/emojify.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { relative, dirname } from 'node:path'

const EMOJI = /\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/uy
const SHARED = 'src/components/shared/Emoji.vue'

function walk(dir) {
    const out = []
    for (const d of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${d.name}`
        if (d.isDirectory()) out.push(...walk(p))
        else if (d.name.endsWith('.vue')) out.push(p)
    }
    return out
}

// แทน emoji ใน template block (state machine) — คืน { out, n }
function transform(tpl) {
    let out = '', i = 0, n = 0
    const N = tpl.length
    while (i < N) {
        if (tpl.startsWith('<!--', i)) { const e = tpl.indexOf('-->', i); const j = e < 0 ? N : e + 3; out += tpl.slice(i, j); i = j; continue }
        if (tpl.startsWith('{{', i))   { const e = tpl.indexOf('}}', i);  const j = e < 0 ? N : e + 2; out += tpl.slice(i, j); i = j; continue }
        if (tpl[i] === '<')            { const e = tpl.indexOf('>', i);   const j = e < 0 ? N : e + 1; out += tpl.slice(i, j); i = j; continue }
        // text node → หา emoji ที่ตำแหน่งนี้
        EMOJI.lastIndex = i
        const m = EMOJI.exec(tpl)
        if (m && m.index === i) { out += `<Emoji char="${m[0]}" />`; i += m[0].length; n++; continue }
        out += tpl[i]; i++
    }
    return { out, n }
}

let totalFiles = 0, totalEmoji = 0
for (const file of walk('src')) {
    if (file.endsWith('shared/Emoji.vue')) continue
    const src = readFileSync(file, 'utf8')
    // greedy: จับถึง </template> ตัวสุดท้าย = root close (กัน <template v-else> ซ้อนหยุดเร็ว)
    // script/style ไม่มี </template> จึงปลอดภัย · nested template ถูกข้ามเองโดย tag-skipper
    const tm = src.match(/<template>[\s\S]*<\/template>/)
    if (!tm) continue
    const { out, n } = transform(tm[0])
    if (!n) continue
    let next = src.replace(tm[0], out)
    // เพิ่ม import ถ้ายังไม่มี
    if (!/shared\/Emoji\.vue/.test(next)) {
        let rel = relative(dirname(file), SHARED).replace(/\\/g, '/')
        if (!rel.startsWith('.')) rel = './' + rel
        const imp = `\nimport Emoji from '${rel}'`
        if (/<script setup>/.test(next)) next = next.replace('<script setup>', `<script setup>${imp}`)
        else { console.log(`⚠️ ${file}: ไม่มี <script setup> — ข้าม import (ใส่เอง)`); }
    }
    writeFileSync(file, next)
    totalFiles++; totalEmoji += n
    console.log(`✓ ${file.replace('src/', '')}  (+${n})`)
}
console.log(`\nเสร็จ: ${totalEmoji} emoji ใน ${totalFiles} ไฟล์`)
