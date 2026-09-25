// ════════════════════════════════════════════════════════════
//  สนามประลอง (arena skins) — ครึ่งบนของฉากต่อสู้เป็นสนามศัตรู ครึ่งล่างเป็นสนามเรา
//  สเปก: docs/superpowers/specs/2026-09-25-arena-skins-replay-news-design.md
//  เดโมที่ user เลือก: https://claude.ai/artifact/JZCVT1yHMhAo81qCMq7KDS
//
//  🔑 id ห้ามเปลี่ยน/ห้ามลบ — ขี่แถว roster (`ar`) และอยู่ใน users.arenas.owned
//  🔑 สนามต้องออกแบบเป็น "มุมมองจากด้านบน" — สนามเดียวกันไปอยู่ได้ทั้งครึ่งบนและครึ่งล่าง
//     พื้นใช้ var(--far) = ทิศขอบจอ (ครึ่งบน to top · ครึ่งล่าง to bottom) หน้าตาอยู่ใน styles/arenas.css
//  deco: [อีโมจิ, x%, d, ขนาด rem, ความทึบ, อนิเมชัน?]
//        d = ตำแหน่งในเขตขอบนอก 0 ชิดกล่องต่อสู้ · 1 ชิดขอบจอ (utils/arenaLayout.js แปลงเป็นพิกเซล)
//        อนิเมชัน: 'bob' | 'pulse' | 'twk' · ของขยับรวม petals ต้อง ≤ 2 ชิ้น (perf iOS)
//  สนามแชมป์: เดือนละ 1 อัน id = 'ch-' + season · ธีมตามตู้กาชาเลเจนด์ของเดือนนั้น (user เสนอ 25 ก.ย.)
//            ⚠️ ต้องเพิ่มก่อนกดแจกรางวัลซีซั่นของเดือนนั้น ไม่งั้นจดหมายไม่แนบสนาม
// ════════════════════════════════════════════════════════════

export const ARENA_TIERS = {
  free:      { label: 'FREE',      price: 0 },
  rare:      { label: 'RARE',      price: 10000 },
  epic:      { label: 'EPIC',      price: 50000 },
  legendary: { label: 'LEGENDARY', price: 100000 },
  champion:  { label: 'CHAMPION',  price: 0 },
}

export const DEFAULT_ARENA = 'ar-sand'

const A = (id, name, tier, src, floor, deco = [], extra = {}) => ({ id, name, tier, src, floor, deco, power: null, ...extra })

export const ARENAS = [
  A('ar-sand', 'ลานหินทราย', 'free', 'free', 'sand'),
  // ── RARE ──
  A('ar-grass', 'สนามหญ้า', 'rare', 'shop', 'grass', [['⚽', 82, .5, 1.3, .5]]),
  A('ar-lab', 'ห้องแล็บเภสัช', 'rare', 'shop', 'lab', [['🧪', 12, .5, 1.7, .7], ['⚗️', 88, .45, 1.7, .7], ['💊', 50, .6, 1.1, .5, 'bob']]),
  // ── EPIC ──
  A('ar-sakura', 'ซากุระ', 'epic', 'shop', 'sakura', [['⛩️', 14, .5, 2, .75], ['🌸', 86, .55, 1.5, .7]], { petals: '🌸' }),
  A('ar-beach', 'ชายหาด', 'epic', 'shop', 'beach', [['🐚', 20, .3, 1.1, .8], ['⛱️', 82, .3, 1.8, .9], ['🌊', 48, .85, 1.3, .7, 'bob']]),
  A('ar-apoth', 'โบราณสถาน', 'epic', 'shop', 'apoth', [['🏺', 10, .5, 1.7, .8], ['⚖️', 50, .55, 1.5, .7], ['🕯️', 90, .5, 1.5, .9, 'pulse'], ['📜', 30, .8, 1.1, .6]]),
  // ── LEGENDARY ──
  A('ar-volcano', 'ภูเขาไฟ', 'legendary', 'shop', 'volcano', [['🌋', 78, .55, 2.4, .85], ['🔥', 16, .6, 1.5, .9, 'pulse']]),
  A('ar-space', 'ห้วงอวกาศ', 'legendary', 'shop', 'space', [['🪐', 80, .5, 2.2, .9, 'bob'], ['✨', 18, .4, 1, .9, 'twk'], ['⭐', 40, .8, .8, .8], ['💫', 62, .3, .9, .7], ['☄️', 10, .8, 1.2, .7]]),
  A('ar-gold', 'วิหารทองคำ', 'legendary', 'shop', 'gold', [['🏛️', 16, .5, 2.2, .7], ['👑', 84, .5, 1.6, .85, 'bob'], ['✨', 50, .75, 1.1, .9, 'twk']]),
  // ── ลิมิเต็ด (วันที่ = เวลาไทย รวมวันสุดท้าย) ──
  A('ar-exam', 'คืนก่อนสอบ', 'rare', 'limited', 'exam', [['📚', 12, .5, 1.6, .75], ['☕', 88, .5, 1.4, .8], ['⏰', 50, .7, 1.2, .8, 'twk']],
    { sale: { from: '2026-10-01', to: '2026-12-10' } }),
  A('ar-loy', 'คืนลอยกระทง', 'epic', 'limited', 'loy', [['🪷', 22, .4, 1.5, .9, 'bob'], ['🪷', 70, .7, 1.2, .8], ['🏮', 88, .35, 1.4, .85, 'pulse']],
    { sale: { from: '2026-11-01', to: '2026-11-30' } }),
  // ── แชมป์ (ท็อป 10 อารีน่า · ป้ายสลักต่างกันตามอันดับ) ──
  // ก.ย. 2026 = ตู้ King of the Jungle (🦁 lion · 🦍 gorilla · 👾 virus = EVENT_FEATURED)
  A('ch-2026-09', 'King of the Jungle', 'champion', 'champ', 'jungle',
    [['🦁', 10, .5, 2, .95, 'bob'], ['🦍', 90, .5, 2, .95], ['👾', 50, .95, 1.1, .8], ['🌿', 28, .9, 1.3, .8], ['🌴', 74, .9, 1.5, .8]],
    { season: '2026-09' }),
]

const BY_ID = new Map(ARENAS.map(a => [a.id, a]))
export const getArena = (id) => (id && BY_ID.get(id)) || null
export const arenaPrice = (a) => ARENA_TIERS[a?.tier]?.price ?? 0
