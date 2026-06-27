// src/data/expeditions.js
// Expedition (ส่งผจญภัย) — ค่าคงที่เกม + มิชชัน + reward table (ปรับเลขที่นี่ที่เดียว)
// ⚠️ ทั้งหมด draft pin — ต้อง number pass + sim ก่อนเปิดจริง (spec §8)

// ระยะเวลา 3 ระดับ (ผู้เล่นเลือก) · hours = ระยะเวลาจริง · ยาว = คุ้มกว่าต่อรอบ แต่รอนาน
export const DURATIONS = [
  { id: 'short',  label: 'สั้น',  hours: 1, baseCoins: 120,  coinCap: 400,  ticketChance: 0.04 },
  { id: 'medium', label: 'กลาง', hours: 4, baseCoins: 450,  coinCap: 1500, ticketChance: 0.12 },
  { id: 'long',   label: 'ยาว',  hours: 8, baseCoins: 1000, coinCap: 3500, ticketChance: 0.25 },
]

// มิชชันคงที่ — ครอบ 3 ธาตุ เพื่อให้เลือก element-match ได้เสมอ · ส่งตัวธาตุตรง = โบนัส
export const MISSIONS = [
  { id: 'forest', name: 'ป่าลึกลับ',      element: 'fist',     emoji: '🌲', flavor: 'บุกป่าหาสมุนไพรหายาก' },
  { id: 'ruins',  name: 'ซากปรักหักพัง', element: 'scissors', emoji: '🏚️', flavor: 'ค้นซากเมืองเก่าหาของมีค่า' },
  { id: 'peak',   name: 'ยอดเขาเมฆา',    element: 'paper',    emoji: '⛰️', flavor: 'ปีนเขาสูงเก็บผลึกพลัง' },
]

// คุณภาพเพ็ท → น้ำหนัก (rarity) · เกรด I-V (เก็บเป็น 0..5) เพิ่มทีละ GRADE_K
export const RARITY_WEIGHT = { common: 1, rare: 2, epic: 4, legendary: 7 }
export const GRADE_K = 0.15        // +15%/เกรด ต่อน้ำหนัก rarity
export const POWER_K = 0.04        // partyPower → ตัวคูณเหรียญ
export const ELEMENT_K = 0.15      // ต่อ 1 ตัวที่ธาตุตรง → +15%
export const TICKET_POWER_K = 0.008 // partyPower → +โอกาสตั๋ว
export const TICKET_EL_K = 0.05     // โบนัสธาตุ → +โอกาสตั๋ว
export const TICKET_CHANCE_MAX = 0.9

// reward table — extensible: เพิ่มชนิดใหม่ = เพิ่ม entry (field = field ใน user doc ที่จะ increment)
export const REWARD_TYPES = {
  coins:       { label: 'เหรียญ',   emoji: '🪙', field: 'coins' },
  gachaTicket: { label: 'ตั๋วกาชา', emoji: '🎟️', field: 'freeGachaTickets' },
}

export const EXPEDITION_PARTY_SIZE = 3
