// ════════════════════════════════════════
// STATIC DATA — Pets, Rarity, Elements,
//               Students, Drugs
// ════════════════════════════════════════

// ── RARITY SYSTEM ──
export const RARITY = {
    common:    { color:"#94a3b8", bg:"rgba(148,163,184,.12)", label:"COMMON",    glow:"#94a3b8", dailyBase:5  },
    rare:      { color:"#60a5fa", bg:"rgba(59,130,246,.15)",  label:"RARE",      glow:"#60a5fa", dailyBase:15 },
    epic:      { color:"#c084fc", bg:"rgba(168,85,247,.15)",  label:"EPIC",      glow:"#c084fc", dailyBase:35 },
    legendary: { color:"#fbbf24", bg:"rgba(251,191,36,.12)",  label:"LEGENDARY", glow:"#fbbf24", dailyBase:80 },
};

// ── GRADE SYSTEM ──
export const GRADE_LABELS = ['','I','II','III','IV','V'];
export const GRADE_COPIES = [0,1,2,3,4,5];        // copies ต่อการอัพไปเกรด index (อัพไป N = N copies)
export const GRADE_MULTI  = [1.0, 1.5, 2.1, 2.8, 3.6, 4.5];   // legacy stat mult (draft pin)

// ── ELEMENT SYSTEM ──
export const ELEMENTS = {
    fist:    { emoji:'✊', beats:'scissors' },
    scissors:{ emoji:'✌️', beats:'paper'   },
    paper:   { emoji:'✋', beats:'fist'     },
};
export const _EL_NAME = { fist:'✊ ค้อน', scissors:'✌️ กรรไกร', paper:'✋ กระดาษ' };
export function elementBeats(attEl, defEl){ return ELEMENTS[attEl]?.beats === defEl; }

// ── BASE STATS ──
export const BASE_STATS = {
    common:    { atk:10, hp:50  },
    rare:      { atk:15, hp:75  },
    epic:      { atk:20, hp:100 },
    legendary: { atk:25, hp:125 },
};
export const STAT_MULTI = [1.0, 1.5, 2.1, 2.8, 3.6, 4.5];   // (draft pin)

export function petStats(p){
    const base = BASE_STATS[p.rarity] || BASE_STATS.common;
    const g = Math.min(STAT_MULTI.length - 1, Math.max(0, p.grade || 0));
    const m = STAT_MULTI[g];
    return { atk: Math.round(base.atk * m), hp: Math.round(base.hp * m) };
}

// ── PETS POOL ──
export const PETS = [
  // ── LEGENDARY ──
  { id:"bahamut",   emoji:"🐉", name:"บาฮามุท",  rarity:"legendary", element:"fist",     flavor:"ราชันมังกรบรรพกาล กางปีกปัดเป่าโรคร้าย", hatchMins:60 },
  { id:"kirin",     emoji:"👹", name:"โอนิ",      rarity:"legendary", element:"fist",     flavor:"อสูรเขาเดียวจากตำนาน พลังทำลายล้างมหาศาล", hatchMins:60 },
  { id:"trex",      emoji:"🦖", name:"ทีเร็กซ์",  rarity:"legendary", element:"fist",     flavor:"ราชานักล่าแห่งยุคดึกดำบรรพ์ กัดทีเดียวจบ", hatchMins:60 },
  { id:"ouroboros", emoji:"🐍", name:"อูโรโบรอส", rarity:"legendary", element:"scissors", flavor:"งูกลืนหางตัวเอง วัฏจักรไม่มีวันสิ้นสุด", hatchMins:60 },
  { id:"simurgh",   emoji:"🦅", name:"กริฟฟิน",   rarity:"legendary", element:"scissors", flavor:"ราชาแห่งเวหา ปีกครึ่งอินทรีครึ่งสิงห์", hatchMins:60 },
  { id:"phoenix",   emoji:"🐦‍🔥", name:"ฟีนิกซ์", rarity:"legendary", element:"scissors", flavor:"เกิดใหม่จากเถ้าถ่าน ไม่มีวันดับสูญ", hatchMins:60 },
  { id:"whale",     emoji:"🐳", name:"คุณวาฬ",    rarity:"legendary", element:"paper",    flavor:"เจ้าสมุทรผู้ใจดี โอบอุ้มทั้งทีมไว้ในอ้อมอก", hatchMins:60 },
  { id:"qilin",     emoji:"🐘", name:"บากุ",      rarity:"legendary", element:"paper",    flavor:"ปีศาจกินฝันร้าย รวมถึงฝันว่าสอบตก", hatchMins:60 },
  { id:"mammoth",   emoji:"🦣", name:"แมมมอธ",    rarity:"legendary", element:"paper",    flavor:"ยักษ์ขนยาวแห่งยุคน้ำแข็ง เกราะหนาปราการ", hatchMins:60 },
  // ── EPIC ──
  { id:"dragon",    emoji:"🐲", name:"มังกร",     rarity:"epic", element:"fist",     flavor:"พ่นไฟ purify impurity แต่เผา reactor ไปด้วย", hatchMins:1 },
  { id:"cerberus",  emoji:"🐕", name:"เซอร์เบอรัส", rarity:"epic", element:"fist",   flavor:"หมา 3 หัวเฝ้า drug interaction เห่าทุกครั้งที่เจอ grapefruit", hatchMins:1 },
  { id:"unicorn",   emoji:"🦄", name:"ยูนิคอร์น", rarity:"epic", element:"scissors", flavor:"เขาเป็น magic wand บดยาในโกร่งเนียนกริ๊บ", hatchMins:1 },
  { id:"fairy",     emoji:"🧚", name:"ภูต",       rarity:"epic", element:"scissors", flavor:"ภูตน้อยเจ้าเวทมนตร์ โปรยละอองเสริมพลังทั้งทีม", hatchMins:1 },
  { id:"panda",     emoji:"🐼", name:"แพนด้า",    rarity:"epic", element:"paper",    flavor:"ตาดำคล้ำเพราะอดนอนติว ไม่ใช่ลายประจำสายพันธุ์", hatchMins:1 },
  { id:"genie",     emoji:"🧞", name:"จินนี่",    rarity:"epic", element:"paper",    flavor:"จินนี่จากตะเกียง ขอพรได้ แต่ใช้ไปกับการบ้านหมดแล้ว", hatchMins:1 },
  // ── RARE ──
  { id:"wolf",      emoji:"🐺", name:"หมาป่า",    rarity:"rare", element:"fist",     flavor:"หอนเรียกก๊วนมาติว สุดท้ายนั่งเล่นเกมกันหมด", hatchMins:1 },
  { id:"shark",     emoji:"🦈", name:"ฉลาม",      rarity:"rare", element:"fist",     flavor:"ว่ายไม่หยุดเหมือน deadline ที่ไม่เคยหยุดวิ่งเข้ามา", hatchMins:1 },
  { id:"fox",       emoji:"🦊", name:"จิ้งจอก",   rarity:"rare", element:"scissors", flavor:"ได้กลิ่น drug interaction ก่อน Micromedex โหลดเสร็จ", hatchMins:1 },
  { id:"rabbit",    emoji:"🐰", name:"กระต่าย",   rarity:"rare", element:"scissors", flavor:"ออกฤทธิ์เร็วกว่า IV push ซะอีก", hatchMins:1 },
  { id:"owl",       emoji:"🦉", name:"นกฮูก",     rarity:"rare", element:"paper",    flavor:"อ่านหนังสือทั้งคืน ตื่นมาจำได้แค่หน้าปก", hatchMins:1 },
  { id:"seal",      emoji:"🦭", name:"แมวน้ำ",    rarity:"rare", element:"paper",    flavor:"ตบมือให้ตัวเองทุกครั้งที่ตอบ ทั้งที่ตอบผิด", hatchMins:1 },
  // ── COMMON ──
  { id:"hedgehog",  emoji:"🦔", name:"เม่น",      rarity:"common", element:"fist",     flavor:"หนามแหลมเหมือนเข็ม 18G แต่ใจอ่อนยิ่งกว่าวุ้น", hatchMins:1 },
  { id:"hamster",   emoji:"🐹", name:"แฮมสเตอร์", rarity:"common", element:"fist",     flavor:"ตุนแคปซูลเต็มแก้มเหมือนตุนชีตก่อนสอบ", hatchMins:1 },
  { id:"mouse",     emoji:"🐭", name:"หนู",       rarity:"common", element:"scissors", flavor:"อาสาเป็นหนูทดลอง ขอแค่ได้ใส่ชื่อเป็นผู้ร่วมวิจัย", hatchMins:1 },
  { id:"cat",       emoji:"🐱", name:"แมว",       rarity:"common", element:"scissors", flavor:"นอนทับ lab sheet ที่พรุ่งนี้ต้องส่ง แต่ไม่มีใครกล้าปลุก", hatchMins:1 },
  { id:"butterfly", emoji:"🦋", name:"ผีเสื้อ",   rarity:"common", element:"paper",    flavor:"เก็บเกสรสมุนไพรเก่ง สอบ Pharmacognosy ได้ A", hatchMins:1 },
  { id:"turtle",    emoji:"🐢", name:"เต่า",      rarity:"common", element:"paper",    flavor:"อายุยืนเพราะ compliance 100% กินยาตรงเวลา", hatchMins:1 },
];

export const getPetDef = (id) => PETS.find(p => p.id === id) || null;

export const HATCH_LABELS = { common:"1 นาที", rare:"1 นาที", epic:"1 นาที", legendary:"1 นาที", glow:"1 นาที" };
export const EGG_TYPES = {
    pet: { label:"🥚 ไข่สัตว์เลี้ยง", cost:150, desc:"Common 72% · Rare 25% · Epic 3%", color:"#10b981" },
};

// ── STUDENT DATA ──
export const R_SCI=["กิ้ฟท์ 🎁 (6418610082)","โบ 🎀 (6418610140)","อิกคิว 👦 (6418610264)","เหนือ ⛰️ (6418610280)","ขิม 🎼 (6518540015)","มายด์ 💖 (6518610016)","ติน 💎 (6518610024)","อ้น 🐿️ (6518610073)","เอ็มมี่ 🌸 (6518610099)","โฟกัส 🔍 (6518610123)","ลิ้ง 🔗 (6518610164)","ติณณ์ ✨ (6518610172)","เพ่ยเพ่ย 🏮 (6518610180)","ป่าน 🌿 (6518610198)","เอเชีย 🌏 (6518610214)","แพร 👗 (6518610222)","กาฟิว 🐱 (6518610297)","แตงโม 🍉 (6518610347)","ส้มโอ 🍊 (6518610420)","อุ้ม 🤗 (6518610446)","ทิว 🌲 (6518610479)","แพน 🐼 (6518610503)","ปั้น 🏺 (6518610545)","แก๊ป 🧢 (6518610560)","แยม 🍓 (6518610578)","แพรไหม 🧵 (6518610586)","ไอจัง 🍦 (6518610610)","เพ้นท์ 🎨 (6518670010)","สุ่น 🧶 (6518670069)","ทะเล 🌊 (6518670077)","ตั้ว 🎟️ (6518670093)","แพรวา 💎 (6518670101)","ซาเนียร์ 🎐 (6518670119)","เปปเปอร์ 🌶️ (6518670150)","ว่านว่าน 🍃 (6518670176)","ฟ้าใส ☀️ (6518670192)","เขต 🏁 (6518670200)","เบเบ้ 🧸 (6518670226)","เชอร์รี่ 🍒 (6518670267)"];
export const R_CARE=["เมย์ 🌙 (6418610157)","เดียร 🦌 (6418670110)","บัว 🪷 (6518610032)","ปาล์มมี่ 🌴 (6518610040)","อุ๋งอิ๋ง 🦭 (6518610057)","เพียว 🫧 (6518610065)","ใบบัว 🍃 (6518610081)","บลู 💙 (6518610107)","ต้นน้ำ 🌱 (6518610115)","แซนนี่ ☀️ (6518610131)","กัส ⛽ (6518610149)","นินจี้ 🥷 (6518610206)","นนท์ 🕶️ (6518610230)","มินท์ 🌿 (6518610248)","แป้ง 🍞 (6518610255)","ตีตี้ 🎸 (6518610263)","แพม 👒 (6518610271)","อะตอม ⚛️ (6518610305)","นาย 👔 (6518610313)","การ์ตูน 📖 (6518610321)","นัซ 🌠 (6518610354)","แพนด้า 🐼 (6518610362)","ปิ๊ก 🎸 (6518610388)","จอย 😊 (6518610396)","มายด์ ✨ (6518610404)","โดนัท 🍩 (6518610453)","บุ๊ค 📚 (6518610461)","ปอนด์ 💷 (6518610495)","เบค 🥓 (6518610511)","ต้นกล้า 🪴 (6518610537)","มิ้นท์ 🌱 (6518610552)","ต้นน้ำ 💧 (6518610602)","แพรทอง ✨ (6518660011)","แก้ม 😊 (6518660029)","แสนดี 😇 (6518670028)","อุ๊กอิ๊ก 🐣 (6518670044)","ต้้นน้ำ 🌊 (6518670085)","เจ 🃏 (6518670135)","เปมี่ 🍭 (6518670143)","ท้องฟ้า ☁️ (6518670184)","พีช 🍑 (6518670218)","สมายด์ 😁 (6518670242)","แพร 🌸 (6518670259)","ตะวัน 🌻 (6518670283)"];
export const RN="นางสาวชญานิศ ชายเมฆนางสาวณัชชา ศรีทองสุขนางสาวณัฏฐณิชา ตราหยกนายปวริศ ชูชมชื่นนายพศวัต พุทธิชนม์นางสาวณัฎฐริณีย์ เทือกท้าวนางสาวหรรษธร เปลี่ยนภักดีนางสาวกชกร ทรงเตชะเลิศนายกฎปิยราช ชนะสิทธิ์นางสาวกมลพร ว่องไวนางสาวกฤติยาพร คำศรีนางสาวกอแก้ว พัฒนาศูรนางสาวกัญญาณัฏฐ์ ลาภทรงสุขนายเกตุโพธิ์ ใจสงฆ์นางสาวแก้วบุษราภรณ์ เลาหกัยกุลนางสาวงามวรินทร์ กิตติจิตต์นายจิรวัฒน์ รักษ์วิเชียรนางสาวชนัญธิดา วีระวุฒิพงศ์นายชนาธิป บุญมาศิรินางสาวชวัลพัชร วิชัยศิริรัตน์นายชาคริษ บวรกิจนางสาวชาลิสา พรสุขจันทรานายญาณพัฒน์ สุขเกษมนางสาวฐณิชา จรัสวิชากรนางสาวฐิตารีย์ ปานสง่านายณพงศ์ เจริญเนติศาสตร์นางสาวณัฏฐณิชา สุดคงนางสาวณัฐกฤตา ศรีวิเชียรนายณัฐชนนท์ เครือตานางสาวณัฐณิชา ขวาลำธารนางสาวณัฐธิดา อรุณแสงนางสาวต่วนนีซาวาตี อัลอาตัสนางสาวธัญรดา โทธรัตน์นายธิติวุฒิ เพชรเงินทองนายธีรเมธ แสงอรุณนายนพเก้า วิวัฒชยางกูลนางสาวนภัสวรรณ แผลงศรนางสาวนัชชา ลักษณ์เชื้อวงศ์นางสาวนัซรียา บุญชูนางสาวนันตรา อินทร์น้อยนายประวิชญ์ อำนวยพันธ์วิไลนางสาวปรางค์ทิพย์ บุญมีวิเศษนางสาวปราณปริยา จ่าพลนางสาวปาณิสรา ศรีอาจนางสาวพรปวีณ์ บุราณเคนนายพิธินันท์ สัตติยารักษ์นายพุฒิพงศ์ ผดุงวัฒนะโชคนายภูมิรพี บูรณะสมทบนายภูวเดช นิลคตนางสาวมนณิชชา บุญนำนายรัชชานนท์ ขมิ้นทองนายวชิรวิทย์ ชำนาญวงศ์นายวศิน เอี่ยมต่อมนางสาวศุภิสรา สุวรรณศักดิ์สินนายสุรพงษ์ จันทบูรณ์นางสาวหทัยนันท์ เทพกำปนาทนางสาวอชิรญาณ์ ลำพรหมแก้วนายอัครวิทย์ นิธิบุญญาพันธ์นางสาวไอลดา ทาหะพรหมนางสาวแพรทอง เพอรัตน์นางสาวอภิสรา นุตภูติพงศ์นางสาวกวินธร เมฆะจำรูญนางสาวกานติมา มัทกิจนางสาวจาริญดา อินอัญชัญนายโชคชัย อริยะบุญสกุลนางสาวณภัทร ดำแก้วนายณัฐดนย์ อภิรติชัยศิริกุลนางสาวทัศน์สุดา ประสิทธิ์วิเศษนางสาวธีริศรา อินตรานางสาวนรมล พรหมโชตินายปิติพัตน์ รัตนสัมพันธ์นางสาวเปมิกา บุรณศิรินางสาวพรภรณ์ บุญยู่ฮงนางสาวภานิลนาถ มานะธัญญานายภาสกร นาคานางสาวมศารัศม์ พุทธะไชยทัศน์นายรัฐธีร์ พนิตจินดาศักดิ์นางสาววิรัลพัชร คุณาสถิตย์ชัยนางสาวศศินิภา แก้วสุวรรณ์นางสาวสุชัญญา หนูยิ้มนางสาวสุภัสสรา ฤกษ์รัตนีนางสาวสุมาลี นิมิตรมงคลนางสาวแสงตะวัน บุษปวนิช";

// ── DRUG DATA (Study flashcards) ──
// moved to ./drugs.js (now includes ข้อบ่งใช้ + ขนาดรับประทาน per drug)
export { DRUGS } from './drugs.js';

// ── REPORT REWARD (Phase 5) ──
// เหรียญรางวัลเมื่อทีมวิชาการตัดสินว่า report ข้อสอบผิด "ผิดจริง" (verdict=valid).
// ส่งจริงผ่าน Mailbox (track ถัดไป) — Phase 5 แค่ stamp ค่านี้ค้างไว้บน report doc.
export const REPORT_REWARD = 50; // TBD รอเคาะตอนรีวิว economy

// ── QUESTION STATS (SP2b) — เกณฑ์ flag "ข้อมีปัญหา" บนแถวย่อจัดการข้อสอบ ──
// tunable pin: ปรับตัวเลขที่นี่ที่เดียว
export const QUESTION_STAT_MIN_ATTEMPTS = 5; // ต้องถูกตอบ ≥ เท่านี้ก่อนจึง flag (กัน sample น้อยหลอก)
export const QUESTION_STAT_PROBLEM_PCT  = 50; // %ถูก < เท่านี้ = ข้อมีปัญหา (โชว์ 🔴)
