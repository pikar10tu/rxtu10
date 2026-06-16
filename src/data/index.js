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
export const GRADE_LABELS = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
export const GRADE_COPIES = [0,1,1,1,1,2,2,2,2,3,3,3,3];
export const GRADE_MULTI  = [1.0,2.5,4.0,5.5,7.0,10.0,13.0,16.0,19.0,23.5,28.0,32.5,37.0];

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
export const STAT_MULTI = [1.0, 1.3, 1.7, 2.2, 2.8, 3.5, 4.3, 5.2, 6.2, 7.3, 8.5, 9.8, 11.2];

export function petStats(p){
    const base = BASE_STATS[p.rarity] || BASE_STATS.common;
    const g = p.grade || 0;
    const m = STAT_MULTI[g];
    return { atk: Math.round(base.atk * m), hp: Math.round(base.hp * m) };
}

// ── PETS POOL ──
export const PETS = [
    // COMMON
    { id:"cat",       emoji:"🐱", name:"แมวเหมียว",     rarity:"common",    element:"paper",    flavor:"นอนทับ lab sheet ที่พรุ่งนี้ต้องส่ง แต่ไม่มีใครกล้าปลุก",        rate:{normal:0.148,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"rabbit",    emoji:"🐰", name:"กระต่าย",    rarity:"common",    element:"scissors", flavor:"ออกฤทธิ์เร็วกว่า IV push ซะอีก",              rate:{normal:0.111,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"hamster",   emoji:"🐹", name:"แฮมสเตอร์",  rarity:"common",    element:"fist",     flavor:"ตุนแคปซูลเต็มแก้มเหมือนตุนชีตก่อนสอบ แต่ไม่เคยเปิดอ่าน",                        rate:{normal:0.089,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"frog",      emoji:"🐸", name:"กบน้อย",     rarity:"common",    element:"paper",    flavor:"นั่งหลังห้องแลป เปิดกล้องเรียนออนไลน์ไว้แต่หลับ",                  rate:{normal:0.074,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"penguin",   emoji:"🐧", name:"เพนกวิน",    rarity:"common",    element:"scissors", flavor:"เฝ้าตู้เย็นวัคซีน 2-8°C อุณหภูมิเดียวที่มันรู้สึกอบอุ่น",                        rate:{normal:0.052,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"hedgehog",  emoji:"🦔", name:"เม่นจิ๋ว",        rarity:"common",    element:"fist",     flavor:"หนามแหลมเหมือนเข็ม 18G แต่ใจอ่อนยิ่งกว่าวุ้น",              rate:{normal:0.03,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"mouse",     emoji:"🐭", name:"หนูน้อย",    rarity:"common",    element:"scissors", flavor:"อาสาเป็นหนูทดลอง ขอแค่ได้ใส่ชื่อเป็นผู้ร่วมวิจัย",                    rate:{normal:0.011,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"chick",     emoji:"🐣", name:"ลูกไก่",     rarity:"common",    element:"fist",     flavor:"ปี 1 ที่เพิ่งรู้ว่าเภสัชเรียน 6 ปี",                    rate:{normal:0.018,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"axolotl",   emoji:"🦎", name:"แอกโซลอเติล",rarity:"common",    element:"paper",    flavor:"regenerate อวัยวะได้ แต่ regenerate เกรดที่ตกไม่ได้",        rate:{normal:0.03,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"seal",      emoji:"🦭", name:"แมวน้ำ",      rarity:"common",    element:"fist",     flavor:"ตบมือให้ตัวเองทุกครั้งที่ตอบ ทั้งที่ตอบผิด",            rate:{normal:0.025,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"snail",     emoji:"🐌", name:"หอยทาก",      rarity:"common",    element:"paper",    flavor:"ออกฤทธิ์ช้าแบบ sustained release ส่งงานก็ช้าแบบ sustained release",    rate:{normal:0.02,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"ladybug",   emoji:"🐞", name:"เต่าทอง",     rarity:"common",    element:"scissors", flavor:"จุดแดงบนหลัง = ADR ที่อาจารย์ชอบออกสอบ",        rate:{normal:0.018,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"duck",      emoji:"🦆", name:"เป็ดน้อย",    rarity:"common",    element:"scissors", flavor:"ว่ายใน D5W ทุกเช้า กันตัวเอง dehydrate ตอนอ่านหนังสือ",           rate:{normal:0.015,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"koala",     emoji:"🐨", name:"โคอาล่า",     rarity:"common",    element:"fist",     flavor:"ดมยูคาลิปตัสแล้วหลับ 22 ชม./วัน สายเดียวกับเราตอนปิดเทอม",     rate:{normal:0.012,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"capybara",  emoji:"🦫", name:"คาปิบาร่า",   rarity:"common",    element:"paper",    flavor:"ใจเย็นที่สุดในรุ่น เพราะปลงแล้วว่าเกรดออกมายังไงก็รับได้",  rate:{normal:0.01,gold:0.0,rainbow:0.0}, hatchMins:1 },
    // RARE
    { id:"fox",       emoji:"🦊", name:"จิ้งจอก",    rarity:"rare",      element:"scissors", flavor:"ได้กลิ่น drug interaction ก่อน Micromedex โหลดเสร็จ",                      rate:{normal:0.059,gold:0.0746,rainbow:0.0}, hatchMins:1 },
    { id:"owl",       emoji:"🦉", name:"นกฮูก",      rarity:"rare",      element:"paper",    flavor:"อ่านหนังสือทั้งคืน ตื่นมาจำได้แค่หน้าปก",                    rate:{normal:0.044,gold:0.0689,rainbow:0.0}, hatchMins:1 },
    { id:"panda",     emoji:"🐼", name:"แพนด้า",     rarity:"rare",      element:"paper",    flavor:"ตาดำคล้ำเพราะอดนอนติว ไม่ใช่ลายประจำสายพันธุ์",                              rate:{normal:0.037,gold:0.0631,rainbow:0.0}, hatchMins:1 },
    { id:"butterfly", emoji:"🦋", name:"ผีเสื้อ",    rarity:"rare",      element:"scissors", flavor:"เก็บเกสรสมุนไพรเก่ง สอบ Pharmacognosy ได้ A คนเดียวในรุ่น",                     rate:{normal:0.03,gold:0.056,rainbow:0.0}, hatchMins:1 },
    { id:"wolf",      emoji:"🐺", name:"หมาป่า",     rarity:"rare",      element:"fist",     flavor:"หอนเรียกก๊วนมาติว สุดท้ายนั่งเล่นเกมกันหมด",               rate:{normal:0.022,gold:0.0502,rainbow:0.0}, hatchMins:1 },
    { id:"peacock",   emoji:"🦚", name:"นกยูง",      rarity:"rare",      element:"fist",     flavor:"รำแพนหางโชว์ Counselling คนไข้ ปึ้ง ปึ้ง ปึ้ง!",                 rate:{normal:0.015,gold:0.0316,rainbow:0.0}, hatchMins:1 },
    { id:"octopus",   emoji:"🐙", name:"ปลาหมึก",    rarity:"rare",      element:"paper",    flavor:"ใช้ 8 หนวดหยิบยา จัดยา พิมพ์ฉลาก รับโทรศัพท์ห้องยาพร้อมกัน",   rate:{normal:0.035,gold:0.043,rainbow:0.0}, hatchMins:1 },
    { id:"flamingo",  emoji:"🦩", name:"ฟลามิงโก้",  rarity:"rare",      element:"scissors", flavor:"ยืนขาเดียวรอคิวรับยานานจนกลายเป็นท่าโยคะ มิงโก้ มิงโก้",              rate:{normal:0.028,gold:0.0373,rainbow:0.0}, hatchMins:1 },
    { id:"deer",      emoji:"🦌", name:"กวาง",        rarity:"rare",      element:"scissors", flavor:"เขาซับซ้อนเหมือนโครงสร้าง steroid ที่ต้องท่องตอนสอบ",   rate:{normal:0.022,gold:0.0344,rainbow:0.0}, hatchMins:1 },
    { id:"shark",     emoji:"🦈", name:"ฉลาม",        rarity:"rare",      element:"fist",     flavor:"ว่ายไม่หยุดเหมือน deadline ที่ไม่เคยหยุดวิ่งเข้ามา",    rate:{normal:0.018,gold:0.0316,rainbow:0.0}, hatchMins:1 },
    { id:"parrot",    emoji:"🦜", name:"นกแก้ว",      rarity:"rare",      element:"paper",    flavor:"แบรนด์สบู่ในตำนาน ท่องสูตรยาได้เป๊ะ แต่ไม่เข้าใจสักคำ", rate:{normal:0.015,gold:0.0258,rainbow:0.0}, hatchMins:1 },
    { id:"turtle",    emoji:"🐢", name:"เต่าทะเล",   rarity:"rare",      element:"fist",     flavor:"อายุยืนเพราะ compliance 100% กินยาตรงเวลายิ่งกว่ากินข้าว",             rate:{normal:0.012,gold:0.0215,rainbow:0.0}, hatchMins:1 },
    // EPIC
    { id:"dragon",    emoji:"🐲", name:"มังกรน้อย",  rarity:"epic",      element:"fist",     flavor:"พ่นไฟ purify impurity ใน API แต่เผา reactor ไปด้วย สะดวกแต่แพง",                    rate:{normal:0.0,gold:0.0861,rainbow:0.1091}, hatchMins:1 },
    { id:"unicorn",   emoji:"🦄", name:"ยูนิคอร์น",  rarity:"epic",      element:"paper",    flavor:"เขาเป็น magic wand บดยาในโกร่งเนียนกริ๊บ ไม่ต้องเสี่ยงเอ็นข้อมืออักเสบ",                 rate:{normal:0.0,gold:0.0732,rainbow:0.0955}, hatchMins:1 },
    { id:"phoenix",   emoji:"🦅", name:"ฟีนิกซ์",   rarity:"epic",      element:"scissors", flavor:"น้ำตารักษาได้ทุกโรค ยกเว้นใจที่สลายตอนเห็นเกรด",              rate:{normal:0.0,gold:0.0603,rainbow:0.0894}, hatchMins:1 },
    { id:"spirit",    emoji:"🧿", name:"สปิริต",     rarity:"epic",      element:"paper",    flavor:"มองไม่เห็นเหมือน first-pass metabolism แต่ส่งผลกับทุกอย่าง",   rate:{normal:0.0,gold:0.0473,rainbow:0.0818}, hatchMins:1 },
    { id:"kitsune",   emoji:"🦊", name:"คิทสึเนะ",   rarity:"epic",      element:"scissors", flavor:"จิ้งจอก 9 หาง ซ่อนสูตรยาไว้หางละหมวด หางที่ 9 คือ 'จำไม่ได้แล้ว'",       rate:{normal:0.0,gold:0.043,rainbow:0.0682}, hatchMins:1 },
    { id:"thunderbird",emoji:"🌩️",name:"ธันเดอร์เบิร์ด",rarity:"epic",  element:"fist",     flavor:"นกจากแดนอีสาน เพราะ ธัน-เด้อ-เบิร์ด อะไร๊",   rate:{normal:0.0,gold:0.0359,rainbow:0.0621}, hatchMins:1 },
    { id:"leviathan", emoji:"🌊", name:"เลวีอาธาน",  rarity:"epic",      element:"paper",    flavor:"พายุระดับ cat-5 แต่ใจอ่อนเวลาน้องปี 1 มาถามทางห้องแลป",     rate:{normal:0.0,gold:0.0301,rainbow:0.0545}, hatchMins:1 },
    { id:"cerberus",  emoji:"🐕", name:"เซอร์เบอรัส", rarity:"epic",     element:"fist",     flavor:"หมา 3 หัวเฝ้า drug interaction ยา-อาหาร-สมุนไพร เห่าทุกครั้งที่เจอ grapefruit juice",    rate:{normal:0.0,gold:0.023,rainbow:0.0485}, hatchMins:1 },
    { id:"tanuki",    emoji:"🦝", name:"ทานูกิ",      rarity:"epic",      element:"paper",    flavor:"พกโกร่งใบจิ๋ว แอบผสมสูตรลับ ขายดีในตลาดนัดเภสัช",       rate:{normal:0.0,gold:0.0172,rainbow:0.0424}, hatchMins:1 },
    // LEGENDARY
    { id:"celestial", emoji:"🌟", name:"ดาวเหนือ", rarity:"legendary", element:"paper",    flavor:"ในคืนมืดมิดก่อนสอบ comp จะเป็นแสงนำทาง (ไปร้านกาแฟ 24 ชม.)",   rate:{normal:0.0,gold:0.0129,rainbow:0.0894}, hatchMins:60 },
    { id:"bahamut",   emoji:"🐉", name:"บาฮามุท",    rarity:"legendary", element:"scissors", flavor:"ราชันมังกรบรรพกาล กางปีกปัดเป่าโรคร้าย และปัดเป่าราคายาที่ requote ไม่จบ",    rate:{normal:0.0,gold:0.0129,rainbow:0.0758}, hatchMins:60 },
    { id:"kirin",     emoji:"🦁", name:"คิริน",       rarity:"legendary", element:"fist",     flavor:"สัตว์เทวะผู้นำสันติ รอยเท้าที่ก้าวผ่านชะล้างความเจ็บปวด (และคราบยาหก)", rate:{normal:0.0,gold:0.0072,rainbow:0.0606}, hatchMins:60 },
    { id:"ouroboros", emoji:"🐍", name:"อูโรโบรอส",  rarity:"legendary", element:"scissors", flavor:"งูกลืนหางตัวเอง = วัฏจักรการเรียนที่ไม่จบสิ้น เรียน–สอบ–ลืม–เรียนใหม่", rate:{normal:0.0,gold:0.0057,rainbow:0.05}, hatchMins:60 },
    { id:"simurgh",   emoji:"🦅", name:"ซีมูร์ก",    rarity:"legendary", element:"paper",    flavor:"ภูมิปัญญาโบราณ รากฐานของยาแผนปัจจุบัน และคำตอบข้อที่เราเดามั่ว", rate:{normal:0.0,gold:0.0043,rainbow:0.0409}, hatchMins:60 },
    { id:"qilin",     emoji:"🐘", name:"บากุ",     rarity:"legendary", element:"fist",     flavor:"ปีศาจกินฝันร้าย รวมถึงฝันว่าสอบตก (กินเก่งจนอ้วน)",  rate:{normal:0.0,gold:0.0029,rainbow:0.0318}, hatchMins:60 },
];

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
