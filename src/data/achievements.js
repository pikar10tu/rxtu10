// ════════════════════════════════════════════════════════════
//  Achievement catalog (data-driven) — ความสำเร็จที่ได้อัตโนมัติ
//  type 'milestone' (trigger {stat,gte}) | 'awarded' (ระบบ/admin มอบ, dated?)
//  gte sentinel: 'ALL_SPECIES' = จำนวนสัตว์ทุกชนิด, 'MAX_RESIDENCE' = บ้านสูงสุด
// ════════════════════════════════════════════════════════════
export const ACHIEVEMENTS = {
  pet_5:   { title: 'นักเลี้ยงสัตว์',  icon: '🐣', type: 'milestone', trigger: { stat: 'petCount', gte: 5 },  desc: 'สะสมสัตว์ 5 ตัว' },
  pet_10:  { title: 'คอกใหญ่',        icon: '🐾', type: 'milestone', trigger: { stat: 'petCount', gte: 10 }, desc: 'สะสมสัตว์ 10 ตัว' },
  pet_25:  { title: 'สวนสัตว์ส่วนตัว', icon: '🦁', type: 'milestone', trigger: { stat: 'petCount', gte: 25 }, desc: 'สะสมสัตว์ 25 ตัว' },
  pet_all: { title: 'นักสะสมตัวจริง',  icon: '🏆', type: 'milestone', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' }, desc: 'สะสมสัตว์ครบทุกชนิด' },
  quiz_10:  { title: 'เริ่มติว',     icon: '📝', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 10 },  desc: 'ทำข้อสอบครบ 10 ข้อ' },
  quiz_50:  { title: 'ขยันทำโจทย์', icon: '✍️', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 50 },  desc: 'ทำข้อสอบครบ 50 ข้อ' },
  quiz_100: { title: 'เซียนข้อสอบ', icon: '🎓', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 100 }, desc: 'ทำข้อสอบครบ 100 ข้อ' },
  flash_10:  { title: 'หัดท่อง',      icon: '📚', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 10 },  desc: 'ทบทวนแฟลชการ์ด 10 ใบ' },
  flash_50:  { title: 'ท่องสม่ำเสมอ', icon: '📖', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 50 },  desc: 'ทบทวนแฟลชการ์ด 50 ใบ' },
  flash_100: { title: 'จำแม่น',       icon: '🧠', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 100 }, desc: 'ทบทวนแฟลชการ์ด 100 ใบ' },
  farm_100k: { title: 'พ่อค้าผัก',    icon: '🥬', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 100000 },  desc: 'ขายผลผลิตรวม 100,000' },
  farm_500k: { title: 'นักธุรกิจ',    icon: '💼', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 500000 },  desc: 'ขายผลผลิตรวม 500,000' },
  farm_2m:   { title: 'เจ้าสัวเกษตร', icon: '🏭', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 2000000 }, desc: 'ขายผลผลิตรวม 2,000,000' },
  spent_100k: { title: 'นักช้อป',      icon: '🛍️', type: 'milestone', trigger: { stat: 'totalSpent', gte: 100000 }, desc: 'ใช้จ่ายรวม 100,000' },
  spent_500k: { title: 'ขาช้อปตัวยง', icon: '💳', type: 'milestone', trigger: { stat: 'totalSpent', gte: 500000 }, desc: 'ใช้จ่ายรวม 500,000' },
  home_max: { title: 'เจ้าของคฤหาสน์', icon: '🏰', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' }, desc: 'อัปบ้านถึงระดับสูงสุด' },
  daily_king: { title: 'ราชาควิซประจำวัน', icon: '👑', type: 'awarded', dated: true, desc: 'อันดับ 1 ข้อสอบประจำวัน' },
}

export const getAchievement = (id) => ACHIEVEMENTS[id] || null
export const MILESTONES = Object.entries(ACHIEVEMENTS)
  .filter(([, a]) => a.type === 'milestone')
  .map(([id, a]) => ({ id, ...a }))
