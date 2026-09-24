// ════════════════════════════════════════════════════════════
//  Achievement catalog (data-driven) — ความสำเร็จที่ได้อัตโนมัติ
//  type 'milestone' (trigger {stat,gte}) | 'awarded' (ระบบ/admin มอบ, dated?)
//  gte sentinel: 'ALL_SPECIES' = จำนวนสัตว์ทุกชนิด, 'MAX_RESIDENCE' = บ้านสูงสุด (ตอนนี้ไม่มีใครใช้แล้ว — บ้านผูกเลขตรงๆ)
// ════════════════════════════════════════════════════════════
export const ACHIEVEMENTS = {
  pet_5:   { title: 'ทาสแมวฝึกหัด',  icon: '🐣', type: 'milestone', trigger: { stat: 'petCount', gte: 5 },  desc: 'สะสมสัตว์ 5 ตัว', flavor: 'เลี้ยงตัวแรกๆ ยังจำชื่อได้ครบ' },
  pet_10:  { title: 'บ้านนี้เลี้ยงเยอะ',        icon: '🐾', type: 'milestone', trigger: { stat: 'petCount', gte: 10 }, desc: 'สะสมสัตว์ 10 ตัว', flavor: 'เสียงเจี๊ยวจ๊าวดังทั้งซอย' },
  pet_25:  { title: 'ผู้อำนวยการสวนสัตว์', icon: '🦁', type: 'milestone', trigger: { stat: 'petCount', gte: 25 }, desc: 'สะสมสัตว์ 25 ตัว', flavor: 'ต้องมีตารางให้อาหารแล้ว' },
  pet_all: { title: 'เจ้าแห่งสรรพสัตว์',  icon: '🏆', type: 'milestone', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' }, desc: 'สะสมสัตว์ครบทุกชนิด', flavor: 'ครบทุกชนิด ไม่มีใครหนีพ้น' },
  quiz_10:  { title: 'มือใหม่หัดจ่ายยา',     icon: '📝', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 10 },  desc: 'ทำข้อสอบครบ 10 ข้อ', flavor: 'ก้าวแรกหลังเคาน์เตอร์' },
  quiz_50:  { title: 'นักศึกษาฝึกงาน', icon: '✍️', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 50 },  desc: 'ทำข้อสอบครบ 50 ข้อ', flavor: 'เริ่มจับทางข้อสอบได้แล้ว' },
  quiz_100: { title: 'ผู้ช่วยเภสัชกร', icon: '🎓', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 100 }, desc: 'ทำข้อสอบครบ 100 ข้อ', flavor: 'ร้อยข้อผ่านมือ ไม่ใช่เล่นๆ' },
  flash_10:  { title: 'ท่องจนฝันเป็นยา',      icon: '📚', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 10 },  desc: 'ทบทวนแฟลชการ์ด 10 ใบ', flavor: 'หลับตาก็ยังเห็นชื่อยา' },
  flash_50:  { title: 'สมองสำรองยา', icon: '📖', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 50 },  desc: 'ทบทวนแฟลชการ์ด 50 ใบ', flavor: 'จำได้ก่อนเปิดตำรา' },
  flash_100: { title: 'คลังยาเดินได้',       icon: '🧠', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 100 }, desc: 'ทบทวนแฟลชการ์ด 100 ใบ', flavor: 'ถามยาอะไร ตอบได้หมด' },
  farm_100k: { title: 'พ่อค้าผัก',    icon: '🥬', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 100000 },  desc: 'ขายผลผลิตรวม 100,000', flavor: 'ผักสวนครัว รั้วกินได้' },
  farm_500k: { title: 'นักธุรกิจ',    icon: '💼', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 500000 },  desc: 'ขายผลผลิตรวม 500,000', flavor: 'จากแปลงผักสู่เครือธุรกิจ' },
  farm_2m:   { title: 'เจ้าสัวเกษตร', icon: '🏭', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 2000000 }, desc: 'ขายผลผลิตรวม 2,000,000', flavor: 'เกษตรกรเกือบพันล้าน' },
  spent_100k: { title: 'นักช้อป',      icon: '🛍️', type: 'milestone', trigger: { stat: 'totalSpent', gte: 100000 }, desc: 'ใช้จ่ายรวม 100,000', flavor: 'เงินมีไว้ใช้ ไม่ได้มีไว้กอด' },
  spent_500k: { title: 'ขาช้อปตัวยง', icon: '💳', type: 'milestone', trigger: { stat: 'totalSpent', gte: 500000 }, desc: 'ใช้จ่ายรวม 500,000', flavor: 'บัตรเครดิตเริ่มร้อน' },
  // ── ชุดใหม่ 25 ก.ย. 2026 (roadmap #8) — ⚠️ = ตัวนับเริ่มนับตั้งแต่ deploy (ของเก่าย้อนหลังไม่ได้) ──
  // สายเรียนขั้นสูง
  quiz_500: { title: 'เภสัชกรประจำเคาน์เตอร์', icon: '💊', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 500 }, desc: 'ทำข้อสอบครบ 500 ข้อ', flavor: 'ยืนหลังเคาน์เตอร์ได้เต็มตัว' },
  quiz_1000: { title: 'เภสัชกรผู้ชำนาญการ', icon: '🩺', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 1000 }, desc: 'ทำข้อสอบครบ 1,000 ข้อ', flavor: 'พันข้อผ่านตา ข้อไหนก็ไม่หวั่น' },
  quiz_2000: { title: 'ปรมาจารย์แห่งคลังยา', icon: '📜', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 2000 }, desc: 'ทำข้อสอบครบ 2,000 ข้อ', flavor: 'ตำราต้องมาถามต่อ' },
  quiz_perfect: { title: 'ไร้ที่ติ', icon: '💯', type: 'milestone', trigger: { stat: 'quizPerfectTotal', gte: 1 }, desc: 'ทำข้อสอบถูกหมดทั้งชุด (10 ข้อขึ้นไป)', flavor: 'ไม่พลาดแม้แต่ข้อเดียว' },
  ta_30: { title: 'มือไวใจเย็น', icon: '⏱️', type: 'milestone', trigger: { stat: 'ta15Best', gte: 30 }, desc: 'Time Attack 15 นาที ถูก 30 ข้อ', flavor: 'เร็วแต่ไม่ลน' },
  ta_60: { title: 'สายฟ้าแห่งห้องสอบ', icon: '⚡', type: 'milestone', trigger: { stat: 'ta15Best', gte: 60 }, desc: 'Time Attack 15 นาที ถูก 60 ข้อ', flavor: 'นาฬิกายังตามไม่ทัน' },
  // หอคอย + อารีน่า (หอคอยรีเซ็ตทุกซีซั่น แต่ achievement ได้ครั้งเดียวตลอดชีพ)
  tower_10: { title: 'นักปีนบันไดมือใหม่', icon: '🪜', type: 'milestone', trigger: { stat: 'towerBest', gte: 10 }, desc: 'ไต่หอคอยถึงชั้น 10', flavor: 'ขาเริ่มสั่นนิดหน่อย' },
  tower_30: { title: 'ผู้ไต่เมฆ', icon: '☁️', type: 'milestone', trigger: { stat: 'towerBest', gte: 30 }, desc: 'ไต่หอคอยถึงชั้น 30', flavor: 'ข้างล่างเริ่มเล็กลง' },
  tower_60: { title: 'ผู้ท้าทายฟ้า', icon: '🌩️', type: 'milestone', trigger: { stat: 'towerBest', gte: 60 }, desc: 'ไต่หอคอยถึงชั้น 60', flavor: 'ฟ้าผ่าก็ไม่ถอย' },
  tower_100: { title: 'ผู้พิชิตยอดหอคอย', icon: '🏔️', type: 'milestone', trigger: { stat: 'towerBest', gte: 100 }, desc: 'ไต่หอคอยถึงชั้น 100', flavor: 'บนนี้ลมแรง แต่วิวสุดยอด' },
  pvp_10: { title: 'นักสู้หน้าใหม่', icon: '🥊', type: 'milestone', trigger: { stat: 'pvpWinsTotal', gte: 10 }, desc: 'ชนะอารีน่ารวม 10 ครั้ง', flavor: 'เริ่มมีชื่อในสังเวียน' },
  pvp_50: { title: 'ขาประจำสังเวียน', icon: '⚔️', type: 'milestone', trigger: { stat: 'pvpWinsTotal', gte: 50 }, desc: 'ชนะอารีน่ารวม 50 ครั้ง', flavor: 'ทุกคนจำหน้าได้' },
  pvp_200: { title: 'ราชันแห่งอารีน่า', icon: '👑', type: 'milestone', trigger: { stat: 'pvpWinsTotal', gte: 200 }, desc: 'ชนะอารีน่ารวม 200 ครั้ง', flavor: 'ใครเข้ามาก็ต้องก้มหัว' },
  tower_legend: { title: 'ตำนานแห่งหอคอย', icon: '🏯', type: 'milestone', trigger: { stat: 'towerChampTotal', gte: 3 }, desc: 'ติดท็อปหอคอยครบ 3 ซีซั่น', flavor: 'ชื่อสลักไว้บนยอดหอคอย' },
  arena_legend: { title: 'ตำนานแห่งสังเวียน', icon: '🏟️', type: 'milestone', trigger: { stat: 'arenaChampTotal', gte: 3 }, desc: 'ติดท็อปอารีน่าครบ 3 ซีซั่น', flavor: 'สังเวียนนี้เป็นบ้านของเรา' },
  // สะสมเพ็ท
  legend_1: { title: 'ผู้ถูกเลือก', icon: '🌟', type: 'milestone', trigger: { stat: 'legendarySpecies', gte: 1 }, desc: 'มีเพ็ทเลเจนด์ตัวแรก', flavor: 'ตำนานเลือกเราแล้ว' },
  legend_6: { title: 'ผู้เรียกตำนาน', icon: '🔮', type: 'milestone', trigger: { stat: 'legendarySpecies', gte: 6 }, desc: 'มีเพ็ทเลเจนด์ 6 ชนิด', flavor: 'เรียกทีไรมาทุกที' },
  legend_12: { title: 'จักรพรรดิแห่งตำนาน', icon: '🐉', type: 'milestone', trigger: { stat: 'legendarySpecies', gte: 12 }, desc: 'มีเพ็ทเลเจนด์ครบ 12 ชนิด', flavor: 'ตำนานทั้งหมดอยู่ใต้บัญชา' },
  gacha_100: { title: 'มือเติมไม่ยั้ง', icon: '🎰', type: 'milestone', trigger: { stat: 'gachaPullsTotal', gte: 100 }, desc: 'อัญเชิญรวม 100 ครั้ง', flavor: 'อีกครั้งเดียว… อีกครั้งเดียว' },
  fuse_10: { title: 'นักเล่นแร่แปรธาตุ', icon: '⚗️', type: 'milestone', trigger: { stat: 'labFuseTotal', gte: 10 }, desc: 'หลอมในห้องทดลองสำเร็จ 10 ครั้ง', flavor: 'ของซ้ำก็กลายเป็นของดีได้' },
  // สายช่วยรุ่น + ตกแต่ง
  review_10: { title: 'ผู้ช่วยตรวจ', icon: '🔍', type: 'milestone', trigger: { stat: 'reviewedCount', gte: 10 }, desc: 'ตรวจข้อสอบ 10 ข้อ', flavor: 'ช่วยรุ่นทีละข้อ' },
  review_50: { title: 'กรรมการคุมสอบ', icon: '📋', type: 'milestone', trigger: { stat: 'reviewedCount', gte: 50 }, desc: 'ตรวจข้อสอบ 50 ข้อ', flavor: 'ข้อผิดหนีไม่พ้นสายตา' },
  review_200: { title: 'ผู้พิทักษ์คลังข้อสอบ', icon: '🛡️', type: 'milestone', trigger: { stat: 'reviewedCount', gte: 200 }, desc: 'ตรวจข้อสอบ 200 ข้อ', flavor: 'คลังข้อสอบปลอดภัยเพราะเรา' },
  report_1: { title: 'ตาไว', icon: '👀', type: 'milestone', trigger: { stat: 'reportsConfirmed', gte: 1 }, desc: 'แจ้งข้อสอบผิดแล้วทีมยืนยันว่าผิดจริง', flavor: 'เจอก่อนใคร' },
  report_10: { title: 'นักสืบแห่งคลังข้อสอบ', icon: '🕵️', type: 'milestone', trigger: { stat: 'reportsConfirmed', gte: 10 }, desc: 'แจ้งข้อผิดที่ทีมยืนยัน 10 ครั้ง', flavor: 'ไม่มีข้อผิดไหนรอด' },
  cos_5: { title: 'สายแฟ', icon: '🎀', type: 'milestone', trigger: { stat: 'cosmeticsOwned', gte: 5 }, desc: 'มีของตกแต่ง 5 ชิ้น', flavor: 'แต่งตัวก่อนออกจากบ้าน' },
  cos_20: { title: 'แฟชั่นนิสต้า', icon: '💅', type: 'milestone', trigger: { stat: 'cosmeticsOwned', gte: 20 }, desc: 'มีของตกแต่ง 20 ชิ้น', flavor: 'ตู้เสื้อผ้าไม่พอแล้ว' },
  cos_legend: { title: 'ไอคอนแห่งรุ่น', icon: '✨', type: 'milestone', trigger: { stat: 'cosmeticLegend', gte: 1 }, desc: 'มีของตกแต่งระดับตำนาน', flavor: 'เดินผ่านทีไรคนหันมอง' },
  // ── ลับ (กิมมิคตลก) — ปลดด้วย grantSecret() · ก่อนปลดไม่โชว์ที่ไหน (กริดโชว์แค่ของที่ได้) · user ขอ 25 ก.ย. 2026 ──
  gag_excited: { title: 'ตื่นเต้นล่ะสิ', icon: '😳', type: 'secret', desc: 'จิ้มนับถอยหลังวันสอบ 3 ครั้งรัวๆ', flavor: 'จิ้มแล้ววันสอบก็ไม่เลื่อนนะ' },
  gag_panic:   { title: 'PANIC ATTACK', icon: '😱', type: 'secret', desc: 'จิ้มนับถอยหลังวันสอบ 10 ครั้งรัวๆ', flavor: 'หายใจเข้า… หายใจออก…' },
  gag_stalker: { title: 'สายส่อง', icon: '👀', type: 'secret', desc: 'เปิดดูโปรไฟล์เพื่อน 5 คนติดโดยไม่ไปหน้าอื่น', flavor: 'แค่ดูเฉยๆ ไม่ได้คิดอะไร' },
  gag_fbi:     { title: 'FBI มาเอง', icon: '🕵️', type: 'secret', desc: 'เปิดดูโปรไฟล์เพื่อน 10 คนติดโดยไม่ไปหน้าอื่น', flavor: 'รู้หมดว่าใครเลี้ยงอะไร' },
  gag_mirror:  { title: 'กระจกวิเศษ', icon: '🪞', type: 'secret', desc: 'จิ้มรูปตัวเองในหน้าฉัน 7 ครั้งรัวๆ', flavor: 'ใครงามเลิศในปฐพี' },
  gag_dj:      { title: 'ดีเจมือใหม่', icon: '🎧', type: 'secret', desc: 'เปิดปิดเสียงรัวๆ 6 ครั้ง', flavor: 'เปิด… ปิด… เปิด…' },
  gag_owl:     { title: 'นกฮูกราตรี', icon: '🦉', type: 'secret', desc: 'ทำข้อสอบจบชุดช่วงตี 1–ตี 4', flavor: 'ร่างกายต้องการการนอนนะ' },
  // บ้านเลเวล 12 = เพดานเดิม · id คง home_max ไว้ (คนที่ได้ไปแล้วไม่หาย) แต่ผูกเลข 12 ตรงๆ แทน sentinel
  // เพราะเพดานขยายเป็น 15 แล้ว (25 ก.ย. 2026) — user สั่งให้ "เจ้าของคฤหาสน์" อยู่ที่ 12 เหมือนเดิม + ขั้นละอันถึง 15
  home_max: { title: 'เจ้าของคฤหาสน์', icon: '🏰', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 12 }, desc: 'อัปบ้านถึงเลเวล 12', flavor: 'จากข้างถนนสู่ยอดพีระมิด' },
  home_13:  { title: 'เจ้าสมุทร',         icon: '🌊', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 13 }, desc: 'อัปบ้านถึงเลเวล 13 คฤหาสน์ลอยตัวกลางมหาสมุทร', flavor: 'ตื่นมาเจอทะเลทุกทิศ ไม่มีเพื่อนบ้านมากวน' },
  home_14:  { title: 'ราชันใต้บาดาล',      icon: '🔱', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 14 }, desc: 'อัปบ้านถึงเลเวล 14 มหานครใต้บาดาล', flavor: 'ทั้งเมืองใต้น้ำเป็นของเรา' },
  home_15:  { title: 'ชาวสวรรค์',         icon: '☁️', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 15 }, desc: 'อัปบ้านถึงเลเวล 15 สวนสวรรค์เหนือน่านฟ้า บ้านสูงสุดของเกม', flavor: 'สูงกว่านี้ไม่มีแล้ว นอกจากท้องฟ้า' },
  // รางวัลสิ้นซีซั่น — แอดมินแจกผ่านจดหมาย (AdminView "แจกรางวัลซีซั่น") · date = 'YYYY-MM' ของซีซั่น
  // ⏳ จะกลายเป็นฉายาที่สวมได้ตอนทำระบบฉายา (roadmap #8)
  tower_champ: { title: 'ผู้ครอบครองหอคอย', icon: '🏯', type: 'awarded', dated: true, season: true, desc: 'ติดท็อป 10 หอคอยตอนจบซีซั่น', flavor: 'ยืนอยู่บนยอดหอคอยตอนหมดเวลา' },
  arena_champ: { title: 'ผู้ครอบครองอารีน่า', icon: '⚔️', type: 'awarded', dated: true, season: true, desc: 'ติดท็อป 3 อารีน่าตอนจบซีซั่น', flavor: 'สามคนสุดท้ายที่ยังยืนอยู่กลางสนาม' },
  daily_king: { title: 'ราชาควิซประจำวัน', icon: '👑', type: 'awarded', dated: true, desc: 'อันดับ 1 ข้อสอบประจำวัน', flavor: 'ทำคะแนนข้อสอบประจำวันได้อันดับ 1' },
}

export const getAchievement = (id) => ACHIEVEMENTS[id] || null
export const MILESTONES = Object.entries(ACHIEVEMENTS)
  .filter(([, a]) => a.type === 'milestone')
  .map(([id, a]) => ({ id, ...a }))
