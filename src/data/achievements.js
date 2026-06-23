// ════════════════════════════════════════════════════════════
//  Achievement catalog (data-driven) — ความสำเร็จที่ได้อัตโนมัติ
//  type 'milestone' (trigger {stat,gte}) | 'awarded' (ระบบ/admin มอบ, dated?)
//  gte sentinel: 'ALL_SPECIES' = จำนวนสัตว์ทุกชนิด, 'MAX_RESIDENCE' = บ้านสูงสุด
// ════════════════════════════════════════════════════════════
export const ACHIEVEMENTS = {
  pet_5:   { title: 'นักเลี้ยงสัตว์',  icon: '🐣', type: 'milestone', trigger: { stat: 'petCount', gte: 5 },  desc: 'สะสมสัตว์ 5 ตัว', flavor: 'เริ่มจากตัวเล็กๆ สู่คอกในฝัน' },
  pet_10:  { title: 'คอกใหญ่',        icon: '🐾', type: 'milestone', trigger: { stat: 'petCount', gte: 10 }, desc: 'สะสมสัตว์ 10 ตัว', flavor: 'คอกเริ่มแน่น เสียงเริ่มดัง' },
  pet_25:  { title: 'สวนสัตว์ส่วนตัว', icon: '🦁', type: 'milestone', trigger: { stat: 'petCount', gte: 25 }, desc: 'สะสมสัตว์ 25 ตัว', flavor: 'นี่มันสวนสัตว์ชัดๆ' },
  pet_all: { title: 'นักสะสมตัวจริง',  icon: '🏆', type: 'milestone', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' }, desc: 'สะสมสัตว์ครบทุกชนิด', flavor: 'ครบทุกชนิด ไม่มีตัวไหนรอด!' },
  quiz_10:  { title: 'เริ่มติว',     icon: '📝', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 10 },  desc: 'ทำข้อสอบครบ 10 ข้อ', flavor: 'ก้าวแรกของเส้นทางเซียน' },
  quiz_50:  { title: 'ขยันทำโจทย์', icon: '✍️', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 50 },  desc: 'ทำข้อสอบครบ 50 ข้อ', flavor: 'ปากกาเริ่มหมึกหมด' },
  quiz_100: { title: 'เซียนข้อสอบ', icon: '🎓', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 100 }, desc: 'ทำข้อสอบครบ 100 ข้อ', flavor: 'ข้อสอบเห็นแล้วต้องหลบ' },
  flash_10:  { title: 'หัดท่อง',      icon: '📚', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 10 },  desc: 'ทบทวนแฟลชการ์ด 10 ใบ', flavor: 'ยาตัวแรกที่จำได้ ภูมิใจ' },
  flash_50:  { title: 'ท่องสม่ำเสมอ', icon: '📖', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 50 },  desc: 'ทบทวนแฟลชการ์ด 50 ใบ', flavor: 'สม่ำเสมอคือกุญแจ' },
  flash_100: { title: 'จำแม่น',       icon: '🧠', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 100 }, desc: 'ทบทวนแฟลชการ์ด 100 ใบ', flavor: 'สมองนี้คือคลังยาเคลื่อนที่' },
  farm_100k: { title: 'พ่อค้าผัก',    icon: '🥬', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 100000 },  desc: 'ขายผลผลิตรวม 100,000', flavor: 'ผักสวนครัว รั้วกินได้' },
  farm_500k: { title: 'นักธุรกิจ',    icon: '💼', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 500000 },  desc: 'ขายผลผลิตรวม 500,000', flavor: 'จากแปลงผักสู่เครือธุรกิจ' },
  farm_2m:   { title: 'เจ้าสัวเกษตร', icon: '🏭', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 2000000 }, desc: 'ขายผลผลิตรวม 2,000,000', flavor: 'เกษตรกรเกือบพันล้าน' },
  spent_100k: { title: 'นักช้อป',      icon: '🛍️', type: 'milestone', trigger: { stat: 'totalSpent', gte: 100000 }, desc: 'ใช้จ่ายรวม 100,000', flavor: 'เงินมีไว้ใช้ ไม่ได้มีไว้กอด' },
  spent_500k: { title: 'ขาช้อปตัวยง', icon: '💳', type: 'milestone', trigger: { stat: 'totalSpent', gte: 500000 }, desc: 'ใช้จ่ายรวม 500,000', flavor: 'บัตรเครดิตเริ่มร้อน' },
  home_max: { title: 'เจ้าของคฤหาสน์', icon: '🏰', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' }, desc: 'อัปบ้านถึงระดับสูงสุด', flavor: 'จากข้างถนนสู่ยอดพีระมิด' },
  daily_king: { title: 'ราชาควิซประจำวัน', icon: '👑', type: 'awarded', dated: true, desc: 'อันดับ 1 ข้อสอบประจำวัน', flavor: 'วันนี้ทั้งรุ่นต้องยอม' },
}

export const getAchievement = (id) => ACHIEVEMENTS[id] || null
export const MILESTONES = Object.entries(ACHIEVEMENTS)
  .filter(([, a]) => a.type === 'milestone')
  .map(([id, a]) => ({ id, ...a }))
