// buildMeta — pure: สรุปข้อมูลคลังให้หน้า quiz home ใช้โดยไม่ต้องโหลดทั้งคลัง
//  publishedTotal = จำนวนข้อที่เผยแพร่ · categories = หมวดไม่ซ้ำ (เรียง, ตัดว่าง)
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const cats = [...new Set(pub.map(q => (q.category || '').trim()).filter(Boolean))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  return { publishedTotal: pub.length, categories: cats }
}
