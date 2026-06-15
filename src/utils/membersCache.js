// Cache รายชื่อสมาชิก (light subset) ข้ามเซสชันใน localStorage เพื่อตัด Firestore reads
// ตัวถ่วง read หลักคือ members (อ่านทั้ง collection ~150 docs/เซสชัน) — cache TTL 8 ชม./เครื่อง
// bump key v1→v2 ถ้า shape ของ light subset เปลี่ยน

export const MEMBERS_CACHE_KEY = 'rxtu10:members:v1'
export const MEMBERS_CACHE_TTL = 8 * 60 * 60 * 1000 // 8 ชม.

// ตัดฟิลด์หนัก (base64 customPhoto) ออกก่อนเขียน cache — กัน localStorage quota (~5MB) ระเบิด
// รูป custom จะ fallback เป็น googlePhoto/letter ตอน hydrate; กด ↻ ได้รูปกลับ
export function slimForCache(fbUsers, guestUsers) {
    const drop = ({ customPhoto, ...rest }) => rest
    const fb = {}
    for (const k in fbUsers) fb[k] = drop(fbUsers[k])
    return { fbUsers: fb, guestUsers: (guestUsers || []).map(drop) }
}

// raw = ค่าดิบจาก localStorage (string|null), now/ttl = ms
// → { fbUsers, guestUsers } ถ้า cache สด + shape ถูก, ไม่งั้น null (ให้ caller ไปยิง Firestore)
export function readCache(raw, now, ttl) {
    if (!raw) return null
    let parsed
    try { parsed = JSON.parse(raw) } catch { return null }
    if (!parsed || typeof parsed !== 'object') return null
    const { ts, fbUsers, guestUsers } = parsed
    if (typeof ts !== 'number') return null
    if (!fbUsers || typeof fbUsers !== 'object' || Array.isArray(fbUsers)) return null
    if (!Array.isArray(guestUsers)) return null
    if (now - ts >= ttl) return null // หมดอายุ
    return { fbUsers, guestUsers }
}
