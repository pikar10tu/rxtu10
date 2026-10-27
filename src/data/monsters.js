// ════════════════════════════════════════════════════════════
//  มอนสเตอร์ดันเจี้ยน — ไม่ใช่เพ็ท: ไม่อยู่ใน PETS ⇒ ไม่หลุดเข้าตู้กาชา/คลัง/บอทหอคอย
//  getPetDef() (data/index.js) หาที่นี่ต่อเมื่อไม่เจอใน PETS — ให้รีเพลย์วาดหน้า/ชื่อได้
//  พาสสีฟอยู่ใน PET_PASSIVES (data/petPassives.js) ใต้ id เดียวกัน เพราะเอนจินหาจากที่นั่นที่เดียว
//  ดันฟักทอง (user เคาะ 25 ต.ค. 2026): มอนฟักทอง + ผีจิ๋ว · สกิลน้อยๆ ง่ายๆ
// ════════════════════════════════════════════════════════════

export const MONSTERS = [
  { id: 'mon-pumpkin', emoji: '🎃', name: 'ฟักทองหัวโต', rarity: 'common', element: 'paper', monster: true,
    flavor: 'ล้มไปแล้ว ยังเหลือเมล็ดไว้ให้เพื่อน' },
  { id: 'mon-ghost', emoji: '👻', name: 'ผีจิ๋ว', rarity: 'common', element: 'scissors', monster: true,
    flavor: 'จับไม่ได้หรอก แบร่~' },
]

const BY_ID = new Map(MONSTERS.map(m => [m.id, m]))
export const getMonster = (id) => BY_ID.get(id) || null
