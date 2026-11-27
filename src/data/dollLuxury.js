// 💎 เซ็ต Diorx (27 พ.ย. 2026 · เพื่อนโดเนทขอกระเป๋า+ต่างหูแบรนด์หรู) — ชื่อบิดเป็นมุก · ลายควิลต์ข้าวหลามตัดทั่วไป + จี้แคปซูล
// ไม่ใช้ลาย cannage / จี้ตัวอักษรของแบรนด์จริง · ขายในตู้ทุกคน (คนโดเนทได้ฟรี) · ทุกชิ้นมีประกายทอง ครบเซ็ต = เส้นแสง+ระยิบ
// ⚠️ ห้าม import จาก dollParts.js (วนกัน)
const P = (x, y, s) => ['p', x, y, s]
const I = (id, slot, label, d) => ({ id, slot, theme: 'fashion', label, ...d })

// กระเป๋าเลดี้แบ็กห้อยมือขวา · เย็บข้าวหลามตัด (l = เส้นเย็บ) · ตัวล็อกทอง · จี้แคปซูลทองข้างกระเป๋า
const BAG = [
  P(26, 24, '.KKKK.'), P(26, 25, 'K....K'), P(26, 26, 'K....K'),
  P(25, 27, 'BBBYYBBB'),
  P(25, 28, 'lBBBlBBB'), P(25, 29, 'BlBlBlBl'), P(25, 30, 'BBlBBBlB'), P(25, 31, 'BlBlBlBl'), P(25, 32, 'lBBBlBBB'),
  P(25, 33, 'dddddddd'),
  P(33, 27, 'Y'), P(33, 28, 'Y'), P(33, 29, 'R'), P(33, 30, 'W'),
]
const GOLD = { Y: '#E9C46A', R: '#E0524A', W: '#FFFFFF' }
const SILK = { T: '#34406A', t: '#252E4E', u: '#F4E6C8', Y: '#E9C46A' }   // กรมท่าขลิบครีม (ครีมล้วนกลืนเสื้อขาว)
export const LUX_PARTS = [
  I('i25', 'i', 'กระเป๋า Diorx ดำ', { o: BAG, pal: { ...GOLD, K: '#1E1A26', B: '#2A2533', l: '#4A4258', d: '#16131C' } }),
  I('i28', 'i', 'กระเป๋า Diorx ขาว', { o: BAG, pal: { ...GOLD, K: '#9AA3B8', B: '#FFFFFF', l: '#DCE1EC', d: '#C3CAD8' } }),
  I('i26', 'i', 'กระเป๋า Diorx ครีม', { o: BAG, pal: { ...GOLD, K: '#8A6E4B', B: '#F4E6C8', l: '#D8C29A', d: '#C9B088' } }),
  I('i27', 'i', 'กระเป๋า Diorx ชมพู', { o: BAG, pal: { ...GOLD, K: '#B5677F', B: '#F7C6D4', l: '#E39AB1', d: '#D98AA3' } }),
  // ต่างหูห้อย: ห่วงทอง + มุก (ช่องเครื่องประดับหน้า r · ย้ายด้วย FACE_ACC)
  I('a22', 'a', 'ต่างหูมุก Diorx', { m: [P(13, 12, 'Y'), P(13, 13, 'W'), P(13, 14, 'w')], pal: { Y: '#E9C46A', W: '#FFFFFF', w: '#E6E0F0' } }),
  // n18 รอบ 3 (27 พ.ย. user เลือกแบบ B) — ผ้าไหมกรมท่าขลิบครีม ผูกข้างขวา ชายพลิ้วลงไหล่ ปลายทอง
  I('n18', 'n', 'ผ้าไหมผูกคอ Diorx', { o: [P(15, 16, 'tTTTTTTTTt'), P(20, 17, 'TTt'), P(19, 18, 'TuTT'),
    P(20, 19, 'u'), P(22, 19, 'Tu'), P(20, 20, 'T'), P(23, 20, 'Tu'), P(23, 21, 'TT'), P(24, 22, 'Y')], pal: SILK }),
]
export const LUX_PRICE = { i25: 1500000, i26: 1500000, i27: 1500000, i28: 1500000, a22: 800000, n18: 600000 }
const CHAMPAGNE = { type: 'sparkle', color: '#FFE9A8' }   // สีเดียวกันทุกชิ้น → dollAura ตัดซ้ำเหลือชุดเดียว ไม่รก
// ต่างหู = วิ้งที่ตัวต่างหูเอง (glint · ไม่นับเพดานอนุภาค) · ชิ้นอื่น = ประกายรอบตัว
export const LUX_AURA = { ...Object.fromEntries(Object.keys(LUX_PRICE).map(id => [id, CHAMPAGNE])), a22: { type: 'glint', color: '#FFF3C4' } }
export const LUX_SETS = ['i25', 'i26', 'i27', 'i28'].map((bag, k) => ({
  id: 'diorx' + (k ? k + 1 : ''), label: 'Diorx ครบเซ็ต', parts: [bag, 'a22', 'n18'], min: 2,   // 27 พ.ย. user: ใส่ 2 ใน 3 ก็ได้เอฟเฟคเซ็ต
  anyLabel: 'กระเป๋า Diorx สีไหนก็ได้',   // แท็บเซ็ตยุบ 4 สีเป็นการ์ดเดียว
  glow: '#F3D9A4', aura: { type: 'shimmer', color: '#FFF6DC' },
}))
