// CC2 คลังเคส — ค้นหา (pure ใช้ทั้งสคริปต์ build และในแอป) · เทส: cc2Search.test.js
// หลายคำคั่นเว้นวรรค = ต้องตรงครบทุกคำ · คำที่เป็นตัวเลขล้วน/OS-xxxx = เทียบรหัสเคส · ข้อความเนื้อเคสมาจาก search.json

// HTML/ข้อความหลายชิ้น → ตัวพิมพ์เล็ก ไม่มีแท็ก คำไม่ซ้ำ (ไฟล์เล็กลง)
export function searchText(parts) {
  const words = parts.filter(Boolean).join(' ')
    .replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
    .toLowerCase().split(/[\s,;:()[\]{}"'“”/|]+/).filter(w => w.length > 1 && /[a-z]/.test(w))   // เก็บแค่คำอังกฤษ (ชื่อยา/โรค) — ไทยไม่เว้นวรรค ได้แต่ก้อนยาวไฟล์บวม ส่วนไทยค้นจากชื่อ/หัวข้ออยู่แล้ว
  return [...new Set(words)].join(' ')
}

export const searchTerms = q => String(q || '').toLowerCase().trim().split(/\s+/).filter(Boolean)

// รหัส: "os-0048" "0048" "48" → 48 · คำอื่น → null
function idNum(term) {
  const m = term.match(/^(?:os-?)?(\d{1,4})$/)
  return m ? +m[1] : null
}

// c = แถวจาก index.json · body = ข้อความเนื้อเคสจาก search.json ('' ถ้ายังโหลดไม่เสร็จ)
export function matchCase(c, terms, body = '') {
  const head = `${c.id} ${c.title || ''} ${c.topic || ''} ${c.group || ''}`.toLowerCase()
  const caseNum = +String(c.id).replace(/\D/g, '')
  return terms.every(t => {
    const n = idNum(t)
    if (n !== null && n === caseNum) return true
    return head.includes(t) || body.includes(t)
  })
}
