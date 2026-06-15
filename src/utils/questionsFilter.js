// ค้นหา/กรองคลังข้อสอบฝั่ง admin — ทำในหน่วยความจำ (admin โหลดทั้งคลังอยู่แล้ว)
// แยกเป็น pure logic เพื่อเทสได้ ดู questionsFilter.test.js

// normalize สำหรับค้นหา: lowercase + ยุบช่องว่างซ้อน + trim
export function normForSearch(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// รายการหมวดที่ไม่ซ้ำ (ตัดค่าว่าง) เรียงตามตัวอักษร — ใช้ทำ dropdown กรอง
export function distinctCategories(list) {
    const set = new Set()
    for (const q of (list || [])) {
        const c = (q.category || '').trim()
        if (c) set.add(c)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
}

// กรองตาม { search, status, category }
//  status:   'all' | 'published' | 'draft'
//  category: '__all' | ชื่อหมวดตรงตัว
export function filterQuestions(list, { search = '', status = 'all', category = '__all' } = {}) {
    const q = normForSearch(search)
    return (list || []).filter(item => {
        if (status === 'published' && !item.isPublished) return false
        if (status === 'draft' && item.isPublished) return false
        if (category !== '__all' && (item.category || '') !== category) return false
        if (q) {
            const hay = normForSearch(`${item.question || ''} ${item.category || ''}`)
            if (!hay.includes(q)) return false
        }
        return true
    })
}
