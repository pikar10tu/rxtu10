// ════════════════════════════════════════════════════════════
//  Emoji helper — แสดง emoji เป็น "รูปเดียวกันทุกเครื่อง"
//  (iOS / Android / Windows render emoji ต่างกัน → ใช้ภาพชุดเดียว)
//  ใช้ Fluent Emoji (Microsoft, สไตล์ Color SVG) self-host ใน public/emoji/fluent/
//  ดาวน์โหลด subset เฉพาะที่ใช้ด้วย scripts/fetch-fluent.mjs (jsDelivr เสิร์ฟ repo
//  >50MB ไม่ได้) · ไฟล์ตั้งชื่อตาม codepoint ให้ตรงกับ emojiCodepoint()
//  License: Fluent Emoji = MIT (เครดิตใน README)
// ════════════════════════════════════════════════════════════

const ZWJ = '‍'   // zero-width joiner
const VS16 = /️/g // variation selector-16

// อัลกอริทึมเดียวกับ twemoji.toCodePoint (รองรับ surrogate pair)
function toCodePoint(str, sep = '-') {
  const r = []
  let c = 0, p = 0, i = 0
  while (i < str.length) {
    c = str.charCodeAt(i++)
    if (p) {
      r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16))
      p = 0
    } else if (c >= 0xd800 && c <= 0xdbff) {
      p = c
    } else {
      r.push(c.toString(16))
    }
  }
  return r.join(sep)
}

/** emoji string → codepoint สำหรับชื่อไฟล์ (ตัด VS16 ออกถ้าไม่ใช่ ZWJ sequence) */
export function emojiCodepoint(emoji) {
  if (!emoji) return ''
  const e = emoji.indexOf(ZWJ) < 0 ? emoji.replace(VS16, '') : emoji
  return toCodePoint(e)
}

/** emoji string → path ไฟล์ Fluent (สัมพัทธ์ต่อ BASE_URL) · '' ถ้า input ว่าง */
export function fluentFile(emoji) {
  const cp = emojiCodepoint(emoji)
  return cp ? `emoji/fluent/${cp}.svg` : ''
}
