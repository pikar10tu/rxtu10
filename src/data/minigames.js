// ════════════════════════════════════════════════════════════
//  Minigame registry — แหล่งข้อมูลเดียวของทุกมินิเกม
//  Play landing เรนเดอร์การ์ดจากที่นี่ · เกมอ่าน coinPerPoint/maxPlausibleScore
//  เพิ่มเกมใหม่ = เพิ่ม entry ที่นี่ (status:'live' ต้องมี route)
// ════════════════════════════════════════════════════════════

export const MINIGAMES = [
  {
    key: 'capsuleRush',
    name: 'Capsule Rush',
    emoji: '💊',
    route: '/play/games/capsule-rush',
    coinPerPoint: 5,          // เหรียญ/คะแนน
    maxPlausibleScore: 500,   // เกินนี้ = clamp เหรียญ + log cheat (กันเงินเฟ้อ ไม่ใช่ cap รายวัน)
    scoreLabel: 'คะแนน',
    tagline: 'พาเพ็ทบินลอดชั้นวางยา',
    status: 'live',
  },
  {
    key: 'pillCrush',
    name: 'Pill Crush',
    emoji: '🍬',
    scoreLabel: 'คะแนน',
    tagline: 'เรียงเม็ดยา 3 สี ตะลุยด่าน',
    status: 'soon',
  },
]

export function getMinigame(key) {
  return MINIGAMES.find(g => g.key === key)
}
