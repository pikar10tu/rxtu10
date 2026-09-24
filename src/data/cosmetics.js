// ════════════════════════════════════════════════════════════
//  ร้านแต่งตัว (cosmetics) — ท่อระบายเหรียญ ของถูกเรียบ ของแพงเวอร์ (user เคาะจากเดโม 25 ก.ย. 2026)
//  เดโมอ้างอิง: https://claude.ai/artifact/NKHzKzf8BgwBuEHCFPsXjj
//  4 หมวด: n = สีชื่อ · f = กรอบรูป · b = ป้ายหน้าชื่อ · g = พื้นการ์ดโปรไฟล์
//  ซื้อครั้งเดียวเก็บถาวร ใส่ได้หมวดละ 1 ชิ้น
//  🔑 id ต้องสั้นและห้ามเปลี่ยน — n/f/b ขี่ไปกับแถว roster (ทั้งรุ่นโหลดทุกเซสชัน) · ลบชิ้นทิ้ง = ของที่คนซื้อไปหาย
//  หน้าตาทั้งหมดอยู่ใน styles/cosmetics.css (class = 'cz-' + id)
// ════════════════════════════════════════════════════════════

export const COS_KINDS = [
  { k: 'n', icon: '🎨', label: 'สีชื่อ' },
  { k: 'f', icon: '🖼️', label: 'กรอบรูป' },
  { k: 'b', icon: '✨', label: 'ป้ายหน้าชื่อ' },
  { k: 'g', icon: '🌈', label: 'พื้นการ์ด' },
]
export const COS_TIERS = [
  { t: 1, label: 'เรียบ' },
  { t: 2, label: 'น่ารัก' },
  { t: 3, label: 'เด่น' },
  { t: 4, label: 'ตำนาน' },
]

const I = (kind, t, id, label, price, extra = {}) => ({ kind, tier: t, id, label, price, ...extra })

export const COSMETICS = [
  // ── สีชื่อ ──
  ...[['n-sky', 'ฟ้า'], ['n-mint', 'มิ้นต์'], ['n-rose', 'ชมพู'], ['n-grape', 'องุ่น'], ['n-amber', 'อำพัน'], ['n-peach', 'พีช'], ['n-navy', 'กรมท่า'], ['n-lime', 'มะนาว']]
    .map(([id, l]) => I('n', 1, id, l, 5000)),
  I('n', 2, 'n-g-sunset', 'พระอาทิตย์ตก', 60000), I('n', 2, 'n-g-ocean', 'ทะเล', 60000), I('n', 2, 'n-g-candy', 'ลูกกวาด', 60000),
  I('n', 2, 'n-g-dream', 'ลาเวนเดอร์ฝัน', 60000), I('n', 2, 'n-g-forest', 'ป่าสน', 60000), I('n', 2, 'n-g-boba', 'ชานมไข่มุก', 60000),
  I('n', 2, 'n-sticker', 'สติกเกอร์', 80000),
  I('n', 3, 'n-g-mermaid', 'นางเงือก', 300000), I('n', 3, 'n-g-aurora', 'แสงเหนือ', 300000), I('n', 3, 'n-g-fire', 'เปลวไฟ', 350000),
  I('n', 3, 'n-g-ice', 'น้ำแข็ง', 350000), I('n', 3, 'n-neon', 'นีออน', 400000), I('n', 3, 'n-g-galaxy', 'กาแล็กซี', 450000),
  I('n', 4, 'n-g-gold', 'ทองคำประกาย', 1200000), I('n', 4, 'n-g-lava', 'ลาวา', 1300000), I('n', 4, 'n-g-rainbow', 'รุ้งไหล', 1500000),
  I('n', 4, 'n-g-diamond', 'เพชร', 2000000), I('n', 4, 'n-g-heaven', 'แสงสวรรค์', 3000000),

  // ── กรอบรูป ── (deco = ของประดับวางตำแหน่งตายตัว · orbit = ของลอยวนรอบรูป)
  I('f', 1, 'f-sky', 'วงฟ้า', 8000), I('f', 1, 'f-mint', 'วงมิ้นต์', 8000), I('f', 1, 'f-rose', 'วงชมพู', 8000),
  I('f', 1, 'f-grape', 'วงม่วง', 8000), I('f', 1, 'f-cream', 'ขอบขาวนุ่ม', 8000), I('f', 1, 'f-plaingold', 'วงทอง', 15000),
  I('f', 2, 'f-double', 'วงคู่', 70000), I('f', 2, 'f-dots', 'ลายจุด', 70000), I('f', 2, 'f-dash', 'เส้นประ', 70000),
  I('f', 2, 'f-grad', 'พาสเทลรุ้ง', 90000),
  I('f', 2, 'f-cat', 'หูแมว', 120000, { deco: [['🔺', 'top:-9px;left:6%;font-size:.55em;transform:rotate(-20deg)'], ['🔺', 'top:-9px;right:6%;font-size:.55em;transform:rotate(20deg)']] }),
  I('f', 2, 'f-star', 'ดาวมุม', 120000, { deco: [['⭐', 'top:-6px;right:-4px;font-size:.6em'], ['⭐', 'bottom:-4px;left:-4px;font-size:.45em']] }),
  I('f', 3, 'f-glow', 'ออร่าเรืองแสง', 350000),
  I('f', 3, 'f-flower', 'ซากุระ', 400000, { deco: [['🌸', 'top:-6px;left:-4px;font-size:.6em', 1], ['🌸', 'bottom:-4px;right:-4px;font-size:.6em', 1], ['🌸', 'top:-8px;right:4px;font-size:.4em']] }),
  I('f', 3, 'f-clover', 'ใบโคลเวอร์', 400000, { deco: [['🍀', 'top:-6px;right:-4px;font-size:.6em', 1], ['🍀', 'bottom:-4px;left:-4px;font-size:.5em', 1]] }),
  I('f', 3, 'f-bubble', 'ฟองสบู่', 450000, { orbit: [['🫧', 'top:0;left:50%'], ['🫧', 'bottom:10%;left:0'], ['🫧', 'top:40%;right:-4px;font-size:.7em']], orbitSec: 9 }),
  I('f', 4, 'f-gold', 'กรอบทองหมุน', 1500000, { orbit: [['⭐', 'top:0;left:50%'], ['✨', 'bottom:0;left:40%']] }),
  I('f', 4, 'f-crown', 'มงกุฎราชา', 1800000, { deco: [['👑', 'top:-18px;left:50%;margin-left:-.35em;font-size:.7em', 1]] }),
  I('f', 4, 'f-rainbow', 'รุ้งหมุน', 1800000),
  I('f', 4, 'f-dragon', 'มังกรวน', 2500000, { orbit: [['🐉', 'top:-4px;left:44%;font-size:1.2em']], orbitSec: 4 }),
  I('f', 4, 'f-heaven', 'ออร่าสวรรค์', 3500000, { orbit: [['✨', 'top:0;left:50%'], ['☁️', 'bottom:0;left:40%'], ['🕊️', 'top:45%;left:-6px']] }),

  // ── ป้ายหน้าชื่อ ── (fx = อนิเมชัน · ในรายชื่อสมาชิกเป็นภาพนิ่ง)
  ...[['b-sakura', '🌸', 'ซากุระ'], ['b-star', '⭐', 'ดาว'], ['b-pill', '💊', 'ยาเม็ด'], ['b-clover', '🍀', 'โคลเวอร์'], ['b-paw', '🐾', 'รอยเท้า'], ['b-drop', '💧', 'หยดน้ำ'], ['b-moon', '🌙', 'จันทร์']]
    .map(([id, e, l]) => I('b', 1, id, l, 3000, { emoji: e })),
  I('b', 2, 'b-tube', 'หลอดทดลอง', 40000, { emoji: '🧪' }), I('b', 2, 'b-bow', 'โบว์', 40000, { emoji: '🎀' }),
  I('b', 2, 'b-rainbow', 'รุ้ง', 40000, { emoji: '🌈' }), I('b', 2, 'b-dango', 'ดังโงะ', 40000, { emoji: '🍡' }),
  I('b', 2, 'b-unicorn', 'ยูนิคอร์น', 50000, { emoji: '🦄' }),
  I('b', 3, 'b-chick', 'ลูกเจี๊ยบเด้ง', 250000, { emoji: '🐣', fx: 'bounce' }), I('b', 3, 'b-spark', 'ประกายวิบวับ', 250000, { emoji: '✨', fx: 'spark' }),
  I('b', 3, 'b-fire', 'ไฟลุก', 300000, { emoji: '🔥', fx: 'flame' }), I('b', 3, 'b-gem', 'เพชรวิบวับ', 350000, { emoji: '💎', fx: 'spark' }),
  I('b', 4, 'b-crown', 'มงกุฎเรืองแสง', 1000000, { emoji: '👑', fx: 'glow' }), I('b', 4, 'b-dragon', 'มังกรเรืองแสง', 1200000, { emoji: '🐉', fx: 'glow' }),
  I('b', 4, 'b-starx', 'ดาวสวรรค์', 1500000, { emoji: '🌟', fx: 'glow' }),

  // ── พื้นการ์ดโปรไฟล์ ── (fall/rise = อีโมจิร่วง/ลอย · dark = ตัวอักษรบนพื้นต้องเป็นสีขาว)
  I('g', 1, 'g-pink', 'ชมพู', 10000), I('g', 1, 'g-sky', 'ฟ้า', 10000), I('g', 1, 'g-mint', 'มิ้นต์', 10000), I('g', 1, 'g-lav', 'ลาเวนเดอร์', 10000),
  I('g', 2, 'g-dots', 'ลายจุด', 80000), I('g', 2, 'g-stripe', 'ลายทาง', 80000), I('g', 2, 'g-check', 'ตารางหมากรุก', 80000), I('g', 2, 'g-wave', 'คลื่น', 80000),
  I('g', 3, 'g-stars', 'ท้องฟ้าดาว', 400000, { dark: true }), I('g', 3, 'g-sakura', 'ซากุระร่วง', 450000, { fall: '🌸' }),
  I('g', 3, 'g-sea', 'ใต้ทะเล', 450000, { rise: '🫧' }),
  I('g', 4, 'g-aurora', 'ออโรร่า', 2000000, { dark: true }), I('g', 4, 'g-heaven', 'สวรรค์', 3000000),
]

const BY_ID = new Map(COSMETICS.map(c => [c.id, c]))
/** คืนชิ้น หรือ null (id ไม่รู้จัก/ถูกลบ = ไม่โชว์อะไร ไม่พัง) */
export const getCosmetic = (id) => (id && BY_ID.get(id)) || null
