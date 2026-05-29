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
    { id:"cat",       emoji:"🐱", name:"แมวเหมียว",     rarity:"common",    element:"paper",    flavor:"เพื่อนซี้ประจำห้องยา ชอบนั่งบนตำราและทำตัวเป็นที่ปรึกษา",        rate:{normal:0.148,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"rabbit",    emoji:"🐰", name:"กระต่าย",    rarity:"common",    element:"scissors", flavor:"กระโดดไปมาระหว่างตะกร้ายา ได้อย่างคล่องแคล่ว",              rate:{normal:0.111,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"hamster",   emoji:"🐹", name:"แฮมสเตอร์",  rarity:"common",    element:"fist",     flavor:"เก็บสะสมแคปซูลยาไว้เต็มแก้มทั้งสองข้าง",                        rate:{normal:0.089,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"frog",      emoji:"🐸", name:"กบน้อย",     rarity:"common",    element:"paper",    flavor:"อาศัยอยู่ในห้องแลป ยามว่างชอบลงมาฟังเลคเชอร์",                  rate:{normal:0.074,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"penguin",   emoji:"🐧", name:"เพนกวิน",    rarity:"common",    element:"scissors", flavor:"ใส่เสื้อกาวน์เดินเตาะแตะ รับหน้าที่เฝ้าตู้เย็นเก็บวัคซีน 2-8 องศา",                        rate:{normal:0.052,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"hedgehog",  emoji:"🦔", name:"เม่นจิ๋ว",        rarity:"common",    element:"fist",     flavor:"ถึงหนามจะแหลมเหมือนเข็มไซรินจ์ แต่จริงๆ เป็นเด็กขี้อายที่ใจดีมากนะ",              rate:{normal:0.03,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"mouse",     emoji:"🐭", name:"หนูน้อย",    rarity:"common",    element:"scissors", flavor:"อาสาเป็น lab model ทดสอบยาทุกชนิดด้วยใจกล้า",                    rate:{normal:0.011,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"chick",     emoji:"🐣", name:"ลูกไก่",     rarity:"common",    element:"fist",     flavor:"เพิ่งฟักออกมา ยังต้องเรียนรู้เรื่องยาอีกเยอะ",                    rate:{normal:0.018,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"axolotl",   emoji:"🦎", name:"แอกโซลอเติล",rarity:"common",    element:"paper",    flavor:"ฟื้นฟูอวัยวะได้เหมือน regenerative medicine ที่ทุกคนฝัน",        rate:{normal:0.03,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"seal",      emoji:"🦭", name:"แมวน้ำ",      rarity:"common",    element:"fist",     flavor:"ปรบมือให้ตัวเองทุกครั้งที่ตอบคำถามถูก ดีใจจนลืมเลข",            rate:{normal:0.025,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"snail",     emoji:"🐌", name:"หอยทาก",      rarity:"common",    element:"paper",    flavor:"เดินช้าแต่แน่นอน เหมือนยา sustained release ค่อยๆ ออกฤทธิ์",    rate:{normal:0.02,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"ladybug",   emoji:"🐞", name:"เต่าทอง",     rarity:"common",    element:"scissors", flavor:"จุดแดงบนหลังคือ warning signs ของ adverse drug reaction",        rate:{normal:0.018,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"duck",      emoji:"🦆", name:"เป็ดน้อย",    rarity:"common",    element:"scissors", flavor:"ว่ายน้ำในสระ D5W ทุกเช้า เพื่อ maintain fluid balance",           rate:{normal:0.015,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"koala",     emoji:"🐨", name:"โคอาล่า",     rarity:"common",    element:"fist",     flavor:"กลิ่นยูคาลิปตัสหอมชื่นใจจนหลับปุ๋ย นอนได้ตลอด 24 ชม.",     rate:{normal:0.012,gold:0.0,rainbow:0.0}, hatchMins:1 },
    { id:"capybara",  emoji:"🦫", name:"คาปิบาร่า",   rarity:"common",    element:"paper",    flavor:"สงบเย็นที่สุดในห้องยา แม้ตอน on-call กลางดึกก็ไม่ตื่นตระหนก",  rate:{normal:0.01,gold:0.0,rainbow:0.0}, hatchMins:1 },
    // RARE
    { id:"fox",       emoji:"🦊", name:"จิ้งจอก",    rarity:"rare",      element:"scissors", flavor:"จมูกไว ได้กลิ่น drug interaction ก่อนใคร",                      rate:{normal:0.059,gold:0.0746,rainbow:0.0}, hatchMins:1 },
    { id:"owl",       emoji:"🦉", name:"นกฮูก",      rarity:"rare",      element:"paper",    flavor:"ตื่นทั้งคืนอ่านตำราเหมือนนักศึกษาก่อน final",                    rate:{normal:0.044,gold:0.0689,rainbow:0.0}, hatchMins:1 },
    { id:"panda",     emoji:"🐼", name:"แพนด้า",     rarity:"rare",      element:"paper",    flavor:"ช่วงสอบก็จะมีคน cover เป็นน้องบ่อยหน่อย",                              rate:{normal:0.037,gold:0.0631,rainbow:0.0}, hatchMins:1 },
    { id:"butterfly", emoji:"🦋", name:"ผีเสื้อ",    rarity:"rare",      element:"scissors", flavor:"โบยบินเก็บละอองเกสรสมุนไพร เป็นกูรูด้าน Pharmacognosy ตัวจริง",                     rate:{normal:0.03,gold:0.056,rainbow:0.0}, hatchMins:1 },
    { id:"wolf",      emoji:"🐺", name:"หมาป่า",     rarity:"rare",      element:"fist",     flavor:"เป็นผู้นำ pack หอนเรียกเพื่อนมาช่วยกันติวสอบ",               rate:{normal:0.022,gold:0.0502,rainbow:0.0}, hatchMins:1 },
    { id:"peacock",   emoji:"🦚", name:"นกยูง",      rarity:"rare",      element:"fist",     flavor:"รำแพนหางโชว์ความรู้ Counselling คนไข้ ปึ้ง ปึ้ง ปึ้ง!",                 rate:{normal:0.015,gold:0.0316,rainbow:0.0}, hatchMins:1 },
    { id:"octopus",   emoji:"🐙", name:"ปลาหมึก",    rarity:"rare",      element:"paper",    flavor:"ใช้ 8 หนวดหยิบยา จัดยา พิมพ์ฉลาก และรับโทรศัพท์ห้องยาได้พร้อมกัน",   rate:{normal:0.035,gold:0.043,rainbow:0.0}, hatchMins:1 },
    { id:"flamingo",  emoji:"🦩", name:"ฟลามิงโก้",  rarity:"rare",      element:"scissors", flavor:"ยืนขาเดียวได้นานสุดๆ มิงโก้ มิงโก้",              rate:{normal:0.028,gold:0.0373,rainbow:0.0}, hatchMins:1 },
    { id:"deer",      emoji:"🦌", name:"กวาง",        rarity:"rare",      element:"scissors", flavor:"เขาสวยงามเหมือนโครงสร้างทางเคมีของยาอะไรซักอย่าง",   rate:{normal:0.022,gold:0.0344,rainbow:0.0}, hatchMins:1 },
    { id:"shark",     emoji:"🦈", name:"ฉลาม",        rarity:"rare",      element:"fist",     flavor:"ดุดัน ไม่เกรงใจใคร",    rate:{normal:0.018,gold:0.0316,rainbow:0.0}, hatchMins:1 },
    { id:"parrot",    emoji:"🦜", name:"นกแก้ว",      rarity:"rare",      element:"paper",    flavor:"เจ้าของแบรนด์สบู่สุดดัง", rate:{normal:0.015,gold:0.0258,rainbow:0.0}, hatchMins:1 },
    { id:"turtle",    emoji:"🐢", name:"เต่าทะเล",   rarity:"rare",      element:"fist",     flavor:"อายุยืนเพราะ compliance ดี กินยาครบทุกวันไม่เคยขาด",             rate:{normal:0.012,gold:0.0215,rainbow:0.0}, hatchMins:1 },
    // EPIC
    { id:"dragon",    emoji:"🐲", name:"มังกรน้อย",  rarity:"epic",      element:"fist",     flavor:"หายใจพ่นไฟกำจัดimpurityในAPIได้ทันที สะดวกเกิ้น !",                    rate:{normal:0.0,gold:0.0861,rainbow:0.1091}, hatchMins:1 },
    { id:"unicorn",   emoji:"🦄", name:"ยูนิคอร์น",  rarity:"epic",      element:"paper",    flavor:"เขาเป็น magic wand บดยาในลูกโกร่งได้เนียนกริ๊บ",                 rate:{normal:0.0,gold:0.0732,rainbow:0.0955}, hatchMins:1 },
    { id:"phoenix",   emoji:"🦅", name:"ฟีนิกซ์",   rarity:"epic",      element:"scissors", flavor:"ว่ากันว่าน้ำตาของฟีนิกซ์สามารถรักษาได้ทุกอย่างบนโลก",              rate:{normal:0.0,gold:0.0603,rainbow:0.0894}, hatchMins:1 },
    { id:"spirit",    emoji:"🧿", name:"สปิริต",     rarity:"epic",      element:"paper",    flavor:"เหมือนความรัก มองไม่เห็น แต่มีอยู่จริง",   rate:{normal:0.0,gold:0.0473,rainbow:0.0818}, hatchMins:1 },
    { id:"kitsune",   emoji:"🦊", name:"คิทสึเนะ",   rarity:"epic",      element:"scissors", flavor:"จิ้งจอก 9 หางที่ซ่อนความรู้ทางเภสัชวิทยาไว้หางละหมวด",       rate:{normal:0.0,gold:0.043,rainbow:0.0682}, hatchMins:1 },
    { id:"thunderbird",emoji:"🌩️",name:"ธันเดอร์เบิร์ด",rarity:"epic",  element:"fist",     flavor:"นกจากแดนอีสาน เพราะธัน เด้อ เบิร์ด อะไร๊",   rate:{normal:0.0,gold:0.0359,rainbow:0.0621}, hatchMins:1 },
    { id:"leviathan", emoji:"🌊", name:"เลวีอาธาน",  rarity:"epic",      element:"paper",    flavor:"แข็งแกร่งพอที่จะต้านทานพายุ แต่ก็อ่อนโยนพอที่จะโอบล้อมชายฝั่ง",     rate:{normal:0.0,gold:0.0301,rainbow:0.0545}, hatchMins:1 },
    { id:"cerberus",  emoji:"🐕", name:"เซอร์เบอรัส", rarity:"epic",     element:"fist",     flavor:"น้องหมา 3 หัว เฝ้าระวัง Drug Interaction ครบทั้งยา อาหาร และสารเคมี",    rate:{normal:0.0,gold:0.023,rainbow:0.0485}, hatchMins:1 },
    { id:"tanuki",    emoji:"🦝", name:"ทานูกิ",      rarity:"epic",      element:"paper",    flavor:"พกโกร่งบดยาใบจิ๋วติดตัว ชอบแอบผสมยาสูตรลับในใบไม้",       rate:{normal:0.0,gold:0.0172,rainbow:0.0424}, hatchMins:1 },
    // LEGENDARY
    { id:"celestial", emoji:"🌟", name:"ดาวเหนือ", rarity:"legendary", element:"paper",    flavor:"ท่ามกลางความมืดมิด จะเป็นแสงสว่างที่คอยนำทางให้คุณเอง",   rate:{normal:0.0,gold:0.0129,rainbow:0.0894}, hatchMins:60 },
    { id:"bahamut",   emoji:"🐉", name:"พาฮามุท",    rarity:"legendary", element:"scissors", flavor:"ราชันย์มังกรบรรพกาล ผู้กางปีกปกป้องสรรพชีวิตและปัดเป่าภัยพิบัติจากเงามืดแห่งโรคร้าย",    rate:{normal:0.0,gold:0.0129,rainbow:0.0758}, hatchMins:60 },
    { id:"kirin",     emoji:"🦁", name:"คิริน",       rarity:"legendary", element:"fist",     flavor:"สัตว์เทวะผู้นำพาสันติสุข รอยเท้าที่มันย่างก้าวผ่านจะชะล้างความเจ็บปวด", rate:{normal:0.0,gold:0.0072,rainbow:0.0606}, hatchMins:60 },
    { id:"ouroboros", emoji:"🐍", name:"อูโรโบรอส",  rarity:"legendary", element:"scissors", flavor:"อสรพิษแห่งวัฏจักรนิรันดร์ ผู้กุมความลับของการฟื้นคืนและการก่อกำเนิดใหม่ที่ไม่มีวันสิ้นสุด", rate:{normal:0.0,gold:0.0057,rainbow:0.05}, hatchMins:60 },
    { id:"simurgh",   emoji:"🦅", name:"ซีมูร์ก",    rarity:"legendary", element:"paper",    flavor:"ภูมิปัญญาแห่งอดีตกาล คือรากฐานของปาฏิหาริย์แห่งการรักษาในยุคปัจจุบัน", rate:{normal:0.0,gold:0.0043,rainbow:0.0409}, hatchMins:60 },
    { id:"qilin",     emoji:"🐘", name:"บากุ",     rarity:"legendary", element:"fist",     flavor:"โอสถที่ประเสริฐที่สุด หาใช่ยารสขมใด หากแต่เป็นความเมตตาจากหัวใจ",  rate:{normal:0.0,gold:0.0029,rainbow:0.0318}, hatchMins:60 },
];

export const HATCH_LABELS = { common:"1 นาที", rare:"1 นาที", epic:"1 นาที", legendary:"1 นาที", glow:"1 นาที" };
export const EGG_TYPES = {
    pet: { label:"🥚 ไข่สัตว์เลี้ยง", cost:150, desc:"Common 72% · Rare 25% · Epic 3%", color:"#10b981" },
};

// ── STUDENT DATA ──
export const R_SCI=["กิ้ฟท์ 🎁 (6418610082)","โบ 🎀 (6418610140)","อิกคิว 👦 (6418610264)","เหนือ ⛰️ (6418610280)","ขิม 🎼 (6518540015)","มายด์ 💖 (6518610016)","ติน 💎 (6518610024)","อ้น 🐿️ (6518610073)","เอ็มมี่ 🌸 (6518610099)","โฟกัส 🔍 (6518610123)","ลิ้ง 🔗 (6518610164)","ติณณ์ ✨ (6518610172)","เพ่ยเพ่ย 🏮 (6518610180)","ป่าน 🌿 (6518610198)","เอเชีย 🌏 (6518610214)","แพร 👗 (6518610222)","กาฟิว 🐱 (6518610297)","แตงโม 🍉 (6518610347)","ส้มโอ 🍊 (6518610420)","อุ้ม 🤗 (6518610446)","ทิว 🌲 (6518610479)","แพน 🐼 (6518610503)","ปั้น 🏺 (6518610545)","แก๊ป 🧢 (6518610560)","แยม 🍓 (6518610578)","แพรไหม 🧵 (6518610586)","ไอจัง 🍦 (6518610610)","เพ้นท์ 🎨 (6518670010)","สุ่น 🧶 (6518670069)","ทะเล 🌊 (6518670077)","ตั้ว 🎟️ (6518670093)","แพรวา 💎 (6518670101)","ซาเนียร์ 🎐 (6518670119)","เปปเปอร์ 🌶️ (6518670150)","ว่านว่าน 🍃 (6518670176)","ฟ้าใส ☀️ (6518670192)","เขต 🏁 (6518670200)","เบเบ้ 🧸 (6518670226)","เชอร์รี่ 🍒 (6518670267)"];
export const R_CARE=["เมย์ 🌙 (6418610157)","เดียร 🦌 (6418670110)","บัว 🪷 (6518610032)","ปาล์มมี่ 🌴 (6518610040)","อุ๋งอิ๋ง 🦭 (6518610057)","เพียว 🫧 (6518610065)","ใบบัว 🍃 (6518610081)","บลู 💙 (6518610107)","ต้นน้ำ 🌱 (6518610115)","แซนนี่ ☀️ (6518610131)","กัส ⛽ (6518610149)","นินจี้ 🥷 (6518610206)","นนท์ 🕶️ (6518610230)","มินท์ 🌿 (6518610248)","แป้ง 🍞 (6518610255)","ตีตี้ 🎸 (6518610263)","แพม 👒 (6518610271)","อะตอม ⚛️ (6518610305)","นาย 👔 (6518610313)","การ์ตูน 📖 (6518610321)","นัซ 🌠 (6518610354)","แพนด้า 🐼 (6518610362)","ปิ๊ก 🎸 (6518610388)","จอย 😊 (6518610396)","มายด์ ✨ (6518610404)","โดนัท 🍩 (6518610453)","บุ๊ค 📚 (6518610461)","ปอนด์ 💷 (6518610495)","เบค 🥓 (6518610511)","ต้นกล้า 🪴 (6518610537)","มิ้นท์ 🌱 (6518610552)","ต้นน้ำ 💧 (6518610602)","แพรทอง ✨ (6518660011)","แก้ม 😊 (6518660029)","แสนดี 😇 (6518670028)","อุ๊กอิ๊ก 🐣 (6518670044)","ต้้นน้ำ 🌊 (6518670085)","เจ 🃏 (6518670135)","เปมี่ 🍭 (6518670143)","ท้องฟ้า ☁️ (6518670184)","พีช 🍑 (6518670218)","สมายด์ 😁 (6518670242)","แพร 🌸 (6518670259)","ตะวัน 🌻 (6518670283)"];
export const RN="นางสาวชญานิศ ชายเมฆนางสาวณัชชา ศรีทองสุขนางสาวณัฏฐณิชา ตราหยกนายปวริศ ชูชมชื่นนายพศวัต พุทธิชนม์นางสาวณัฎฐริณีย์ เทือกท้าวนางสาวหรรษธร เปลี่ยนภักดีนางสาวกชกร ทรงเตชะเลิศนายกฎปิยราช ชนะสิทธิ์นางสาวกมลพร ว่องไวนางสาวกฤติยาพร คำศรีนางสาวกอแก้ว พัฒนาศูรนางสาวกัญญาณัฏฐ์ ลาภทรงสุขนายเกตุโพธิ์ ใจสงฆ์นางสาวแก้วบุษราภรณ์ เลาหกัยกุลนางสาวงามวรินทร์ กิตติจิตต์นายจิรวัฒน์ รักษ์วิเชียรนางสาวชนัญธิดา วีระวุฒิพงศ์นายชนาธิป บุญมาศิรินางสาวชวัลพัชร วิชัยศิริรัตน์นายชาคริษ บวรกิจนางสาวชาลิสา พรสุขจันทรานายญาณพัฒน์ สุขเกษมนางสาวฐณิชา จรัสวิชากรนางสาวฐิตารีย์ ปานสง่านายณพงศ์ เจริญเนติศาสตร์นางสาวณัฏฐณิชา สุดคงนางสาวณัฐกฤตา ศรีวิเชียรนายณัฐชนนท์ เครือตานางสาวณัฐณิชา ขวาลำธารนางสาวณัฐธิดา อรุณแสงนางสาวต่วนนีซาวาตี อัลอาตัสนางสาวธัญรดา โทธรัตน์นายธิติวุฒิ เพชรเงินทองนายธีรเมธ แสงอรุณนายนพเก้า วิวัฒชยางกูลนางสาวนภัสวรรณ แผลงศรนางสาวนัชชา ลักษณ์เชื้อวงศ์นางสาวนัซรียา บุญชูนางสาวนันตรา อินทร์น้อยนายประวิชญ์ อำนวยพันธ์วิไลนางสาวปรางค์ทิพย์ บุญมีวิเศษนางสาวปราณปริยา จ่าพลนางสาวปาณิสรา ศรีอาจนางสาวพรปวีณ์ บุราณเคนนายพิธินันท์ สัตติยารักษ์นายพุฒิพงศ์ ผดุงวัฒนะโชคนายภูมิรพี บูรณะสมทบนายภูวเดช นิลคตนางสาวมนณิชชา บุญนำนายรัชชานนท์ ขมิ้นทองนายวชิรวิทย์ ชำนาญวงศ์นายวศิน เอี่ยมต่อมนางสาวศุภิสรา สุวรรณศักดิ์สินนายสุรพงษ์ จันทบูรณ์นางสาวหทัยนันท์ เทพกำปนาทนางสาวอชิรญาณ์ ลำพรหมแก้วนายอัครวิทย์ นิธิบุญญาพันธ์นางสาวไอลดา ทาหะพรหมนางสาวแพรทอง เพอรัตน์นางสาวอภิสรา นุตภูติพงศ์นางสาวกวินธร เมฆะจำรูญนางสาวกานติมา มัทกิจนางสาวจาริญดา อินอัญชัญนายโชคชัย อริยะบุญสกุลนางสาวณภัทร ดำแก้วนายณัฐดนย์ อภิรติชัยศิริกุลนางสาวทัศน์สุดา ประสิทธิ์วิเศษนางสาวธีริศรา อินตรานางสาวนรมล พรหมโชตินายปิติพัตน์ รัตนสัมพันธ์นางสาวเปมิกา บุรณศิรินางสาวพรภรณ์ บุญยู่ฮงนางสาวภานิลนาถ มานะธัญญานายภาสกร นาคานางสาวมศารัศม์ พุทธะไชยทัศน์นายรัฐธีร์ พนิตจินดาศักดิ์นางสาววิรัลพัชร คุณาสถิตย์ชัยนางสาวศศินิภา แก้วสุวรรณ์นางสาวสุชัญญา หนูยิ้มนางสาวสุภัสสรา ฤกษ์รัตนีนางสาวสุมาลี นิมิตรมงคลนางสาวแสงตะวัน บุษปวนิช";

// ── DRUG QUIZ DATA ──
export const DRUGS = [
    {n:"Paracetamol",a:"Analgesic / Antipyretic"},{n:"Amoxicillin",a:"Antibiotic (Penicillin)"},{n:"Cetirizine",a:"Antihistamine Gen 2"},{n:"Omeprazole",a:"Proton Pump Inhibitor (PPI)"},{n:"Simvastatin",a:"HMG-CoA Reductase Inhibitor (Statin)"},{n:"Metformin",a:"Biguanide (เบาหวาน)"},{n:"Amlodipine",a:"Calcium Channel Blocker (CCB)"},{n:"Ibuprofen",a:"NSAIDs (COX-1/2 inhibitor)"},{n:"Prednisolone",a:"Systemic Corticosteroid"},{n:"Salbutamol",a:"Short-acting β2-agonist (SABA)"},{n:"Losartan",a:"Angiotensin II Receptor Blocker (ARB)"},{n:"Atorvastatin",a:"HMG-CoA Reductase Inhibitor (Statin)"},{n:"Clopidogrel",a:"P2Y12 Antiplatelet"},{n:"Gabapentin",a:"Anticonvulsant / Neuropathic pain"},{n:"Domperidone",a:"Dopamine Antagonist Antiemetic"},{n:"Lorazepam",a:"Benzodiazepine (anxiolytic)"},{n:"Tramadol",a:"Weak Opioid Analgesic"},{n:"Acetylcysteine",a:"Mucolytic / Antidote (paracetamol OD)"},{n:"Mefenamic Acid",a:"NSAIDs (NSAID fenamate)"},{n:"Enalapril",a:"ACE Inhibitor"},{n:"Propranolol",a:"Non-selective Beta-blocker"},{n:"Furosemide",a:"Loop Diuretic"},{n:"Warfarin",a:"Vitamin K Antagonist (Anticoagulant)"},{n:"Digoxin",a:"Cardiac Glycoside (inotrope)"},{n:"Azithromycin",a:"Macrolide Antibiotic"},{n:"Ciprofloxacin",a:"Fluoroquinolone Antibiotic"},{n:"Doxycycline",a:"Tetracycline Antibiotic"},{n:"Ceftriaxone",a:"3rd-gen Cephalosporin"},{n:"Diazepam",a:"Benzodiazepine (anticonvulsant/anxiolytic)"},{n:"Fluoxetine",a:"Selective Serotonin Reuptake Inhibitor (SSRI)"},{n:"Amitriptyline",a:"Tricyclic Antidepressant (TCA)"},{n:"Phenytoin",a:"Hydantoin Anticonvulsant (Na+ channel blocker)"},{n:"Chlorpheniramine (CPM)",a:"1st-gen Antihistamine (sedating)"},{n:"Loratadine",a:"2nd-gen Antihistamine (non-sedating)"},{n:"Fexofenadine",a:"3rd-gen Antihistamine (peripherally selective)"},{n:"Dextromethorphan",a:"NMDA Antagonist Antitussive"},{n:"Bromhexine",a:"Mucolytic (depolymerizes mucopolysaccharides)"},{n:"Famotidine",a:"H2-Receptor Antagonist"},{n:"Hyoscine (Scopolamine)",a:"Anticholinergic / Antispasmodic"},{n:"Loperamide",a:"Peripheral Opioid Receptor Agonist (Antidiarrheal)"},{n:"Glibenclamide",a:"Sulfonylurea (closes K-ATP channel)"},{n:"Allopurinol",a:"Xanthine Oxidase Inhibitor (antigout)"},{n:"Colchicine",a:"Microtubule Inhibitor (acute gout)"},{n:"Diclofenac",a:"NSAIDs (acetic acid derivative)"},{n:"Naproxen",a:"NSAIDs (propionic acid derivative)"},{n:"Celecoxib",a:"Selective COX-2 Inhibitor"},{n:"Aspirin (Low dose)",a:"Irreversible COX-1 Inhibitor / Antiplatelet"},{n:"Ergotamine",a:"Serotonin Agonist Antimigraine"},{n:"Norfloxacin",a:"Fluoroquinolone (urinary/GI tract)"},{n:"ORS",a:"Oral Rehydration Solution (WHO formula)"}
];
