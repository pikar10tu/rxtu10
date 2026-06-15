// ════════════════════════════════════════════════════════════
//  Twemoji helper — แสดง emoji เป็น "รูปเดียวกันทุกเครื่อง"
//  (iOS / Android / Windows render emoji ต่างกัน → ใช้ภาพชุดเดียว)
//  ใช้ SVG จาก jdecked/twemoji ผ่าน jsDelivr CDN (ฟรี, CC-BY 4.0)
//  *อย่าลืมใส่เครดิต Twemoji ใน README / หน้า credits*
// ════════════════════════════════════════════════════════════

// pin เวอร์ชันได้เพื่อความนิ่ง เช่น @15.1.0 — @latest = ตามล่าสุดเสมอ
const CDN = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/'

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

/** emoji string → codepoint สำหรับชื่อไฟล์ twemoji (ตัด VS16 ออกถ้าไม่ใช่ ZWJ sequence) */
export function emojiCodepoint(emoji) {
  if (!emoji) return ''
  const e = emoji.indexOf(ZWJ) < 0 ? emoji.replace(VS16, '') : emoji
  return toCodePoint(e)
}

/** emoji string → URL รูป SVG (คืน '' ถ้า input ว่าง) */
export function twemojiUrl(emoji) {
  const cp = emojiCodepoint(emoji)
  return cp ? `${CDN}${cp}.svg` : ''
}
