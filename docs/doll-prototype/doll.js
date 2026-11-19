// RxTU10 doll — data + renderer (pure, no DOM). canvas 40x44, mirror axis x' = 39 - x
const W = 40, H = 44, PAD = 4;
const R = (x, y, w, h, c) => ['r', x, y, w, h, c];
const P = (x, y, s) => ['p', x, y, s];

const INK = '#3A2E2A';
const SKINS = [
  { id: 's1', label: 'ขาวอมชมพู', S: '#FFE3CF', s: '#F5C9AE' },
  { id: 's2', label: 'ผิวพีช', S: '#FFD9BF', s: '#F2BFA0' },
  { id: 's3', label: 'สองสี', S: '#EDBB92', s: '#D9A077' },
  { id: 's4', label: 'ผิวแทน', S: '#C98E64', s: '#AE754E' },
  { id: 's5', label: 'ผิวเข้ม', S: '#8E5B3D', s: '#74472E' },
];
const HAIRC = [
  { id: 'c1', label: 'ดำ', H: '#2F2A3A', h: '#1F1B28', L: '#4A4458' },
  { id: 'c2', label: 'น้ำตาล', H: '#7A4B2A', h: '#5E3820', L: '#A8703F' },
  { id: 'c3', label: 'บลอนด์', H: '#F2D27A', h: '#D9B25A', L: '#FFF0B8' },
  { id: 'c4', label: 'ชมพู', H: '#F29BB5', h: '#D97C99', L: '#FBC8D7' },
  { id: 'c5', label: 'ม่วง', H: '#8A6BC0', h: '#6B4E9B', L: '#B49BE0' },
  { id: 'c6', label: 'ฟ้า', H: '#6BB8E8', h: '#4A93C4', L: '#A8DAF7' },
  { id: 'c7', label: 'เงิน', H: '#C9C4D9', h: '#A39DB8', L: '#EDEAF5' },
  { id: 'c8', label: 'แดง', H: '#D9533F', h: '#B03D2C', L: '#F08A6E' },
];

const SLOTS = [
  { k: 'h', label: 'ทรงผม' }, { k: 'e', label: 'ตา' }, { k: 'm', label: 'ปาก' },
  { k: 't', label: 'เสื้อ/ชุด' }, { k: 'b', label: 'ท่อนล่าง' }, { k: 'k', label: 'รองเท้า' },
  { k: 'o', label: 'เสื้อคลุม' }, { k: 'x', label: 'หมวก' }, { k: 'a', label: 'หน้า' },
  { k: 'i', label: 'ในมือ' }, { k: 'w', label: 'ปีก/หลัง' },
];
const THEMES = { basic: 'พื้นฐาน', fashion: 'แฟชั่น', uniform: 'ยูนิฟอร์ม', fantasy: 'แฟนซี', cute: 'น่ารัก', sport: 'กีฬา' };

// ── shared shapes ──
const BASE = { m: [
  P(16, 4, 'SSSS'), P(15, 5, 'SSSSS'), R(14, 6, 6, 8, 'S'), P(15, 14, 'SSSSS'), P(16, 15, 'SSSS'),
  R(13, 9, 1, 2, 'S'), R(18, 16, 2, 1, 's'),
  P(15, 17, 'SSSSS'), R(14, 18, 6, 9, 'S'), R(12, 18, 2, 8, 'S'), R(12, 26, 2, 1, 's'),
  R(16, 27, 3, 12, 'S'), R(15, 39, 4, 2, 'S'), R(15, 12, 2, 1, 'C'),
] };
const FRINGE = [P(16, 3, 'HHHH'), P(15, 4, 'HHHHH'), R(14, 5, 6, 2, 'H'), P(14, 7, 'HHHHH'), P(14, 8, 'HH'), R(13, 6, 1, 5, 'H')];
const TEE = [P(15, 17, 'TTTTT'), R(14, 18, 6, 9, 'T'), R(12, 18, 2, 4, 'T'), R(14, 18, 1, 9, 't'), R(12, 21, 2, 1, 't')];
const TEE_O = [P(18, 17, 'SSSS')];
const LONG = [P(15, 17, 'TTTTT'), R(14, 18, 6, 9, 'T'), R(12, 18, 2, 8, 'T'), R(14, 18, 1, 9, 't'), R(12, 25, 2, 1, 't')];
const PANTS = [R(14, 27, 6, 2, 'P'), R(16, 29, 3, 10, 'P'), R(16, 29, 1, 10, 'p')];
const SKIRT = [R(14, 27, 6, 1, 'p'), R(13, 28, 7, 2, 'P'), R(12, 30, 8, 2, 'P'), R(12, 31, 8, 1, 'p')];
const BOOT = [R(15, 35, 4, 5, 'B'), R(15, 40, 4, 1, 'b'), R(15, 35, 4, 1, 'b')];

const I = (id, slot, theme, label, d) => ({ id, slot, theme, label, ...d });

const PARTS = [
  // ── ตา ──
  I('e1', 'e', 'basic', 'ตาจุด', { m: [R(17, 9, 1, 2, 'K')] }),
  I('e2', 'e', 'basic', 'ตาโตวิบวับ', { m: [R(16, 9, 2, 3, 'K'), R(17, 11, 1, 1, 'I')], o: [R(16, 9, 1, 1, 'W'), R(22, 9, 1, 1, 'W')], pal: { I: '#4FA3D9' } }),
  I('e3', 'e', 'basic', 'ตายิ้ม', { m: [P(17, 9, 'K'), P(16, 10, 'K.K')] }),
  I('e4', 'e', 'basic', 'ตาง่วง', { m: [R(16, 10, 3, 1, 'K')] }),
  I('e5', 'e', 'fashion', 'ตาขนตายาว', { m: [R(17, 9, 1, 2, 'K'), P(16, 8, 'K')] }),
  I('e6', 'e', 'cute', 'ขยิบตา', { o: [R(17, 9, 1, 2, 'K'), P(22, 9, 'K'), P(21, 10, 'K.K')] }),
  I('e7', 'e', 'fantasy', 'ตาดาว', { m: [P(17, 9, 'Y'), P(16, 10, 'YYY'), P(17, 11, 'Y')], pal: { Y: '#F6C453' } }),
  I('e8', 'e', 'fantasy', 'ตาแดงปีศาจ', { m: [R(16, 9, 2, 3, 'K'), R(16, 10, 2, 1, 'R')], o: [R(16, 9, 1, 1, 'W'), R(22, 9, 1, 1, 'W')], pal: { R: '#E0524A' } }),
  // ── ปาก ──
  I('m1', 'm', 'basic', 'ยิ้ม', { o: [P(19, 13, 'MM')] }),
  I('m2', 'm', 'basic', 'อ้าปากหัวเราะ', { o: [P(18, 13, 'MMMM'), P(19, 14, 'MM')] }),
  I('m3', 'm', 'cute', 'ปากแมว', { o: [P(18, 12, 'K..K'), P(19, 13, 'KK')] }),
  I('m4', 'm', 'cute', 'แลบลิ้น', { o: [P(19, 13, 'KK'), P(20, 14, 'M')] }),
  I('m5', 'm', 'basic', 'เฉย', { o: [P(19, 13, 'KK')] }),
  I('m6', 'm', 'fantasy', 'เขี้ยว', { o: [P(18, 13, 'MMMM'), P(18, 14, 'W..W')] }),
  // ── ผม ──
  I('h1', 'h', 'basic', 'สั้น', { m: FRINGE, o: [P(16, 4, 'LL')] }),
  I('h2', 'h', 'basic', 'ยาวตรง', { m: [...FRINGE, R(12, 6, 2, 13, 'H'), R(12, 19, 2, 1, 'h')], back: [R(14, 8, 6, 12, 'h')], o: [P(16, 4, 'LL')] }),
  I('h3', 'h', 'fashion', 'บ๊อบ', { m: [...FRINGE, R(13, 6, 2, 8, 'H'), R(13, 14, 2, 1, 'h')], o: [P(16, 4, 'LL'), P(22, 5, 'L')] }),
  I('h4', 'h', 'cute', 'แกละสองข้าง', { m: FRINGE, back: [R(11, 6, 2, 2, 'R'), R(8, 8, 3, 9, 'H'), R(9, 17, 2, 2, 'h')], o: [P(16, 4, 'LL')], pal: { R: '#E0524A' } }),
  I('h5', 'h', 'fashion', 'ดังโงะ', { m: [...FRINGE, P(17, 0, 'HHH'), P(16, 1, 'HHHH'), P(17, 2, 'HHH')], o: [P(17, 1, 'L'), P(16, 4, 'LL')] }),
  I('h6', 'h', 'basic', 'ฟูชี้', { m: [P(15, 1, 'H..'), P(15, 2, 'HH.H'), P(14, 3, 'HHHHHH'), P(15, 4, 'HHHHH'), R(14, 5, 6, 2, 'H'), P(14, 7, 'H.HH.'), R(13, 6, 1, 3, 'H')], o: [P(16, 4, 'LL')] }),
  I('h7', 'h', 'fashion', 'หางม้า', { m: FRINGE, back: [], o: [P(16, 4, 'LL')], ob: [R(26, 6, 2, 3, 'H'), R(27, 9, 3, 9, 'H'), R(28, 18, 2, 2, 'h'), R(26, 7, 1, 1, 'R')], pal: { R: '#F29BB5' } }),
  I('h8', 'h', 'fashion', 'ลอนฟู', { m: [P(15, 1, 'HHHHH'), P(13, 2, 'HHHHHHH'), R(12, 3, 8, 4, 'H'), R(12, 7, 3, 6, 'H'), P(15, 7, 'H.H.H'), R(12, 13, 2, 2, 'h')], o: [P(15, 2, 'LL'), P(23, 3, 'L')] }),
  I('h9', 'h', 'basic', 'เกรียน', { m: [P(16, 4, 'hhhh'), P(15, 5, 'hhhhh'), R(14, 6, 1, 3, 'h')] }),
  I('h10', 'h', 'fashion', 'ปัดข้าง', { o: [P(16, 3, 'HHHHHHHH'), P(15, 4, 'HHHHHHHHHH'), R(14, 5, 12, 2, 'H'), P(14, 7, 'HHHHHHH....H'), P(14, 8, 'HHHHH......H'), P(14, 9, 'HHH'), R(13, 6, 1, 6, 'H'), R(26, 6, 1, 4, 'H'), P(17, 4, 'LL')] }),
  // ── เสื้อ ──
  I('t1', 't', 'basic', 'ยืดขาว', { m: TEE, o: TEE_O, pal: { T: '#F4F4F4', t: '#D9DEE8' } }),
  I('t2', 't', 'basic', 'ยืดมิ้นต์', { m: TEE, o: TEE_O, pal: { T: '#9ED9BF', t: '#7FC1A4' } }),
  I('t3', 't', 'basic', 'ยืดชมพู', { m: TEE, o: TEE_O, pal: { T: '#F7B6C8', t: '#E89AB0' } }),
  I('t4', 't', 'fashion', 'ลายขวาง', { m: TEE, o: [...TEE_O, R(14, 19, 12, 1, 'u'), R(14, 21, 12, 1, 'u'), R(14, 23, 12, 1, 'u'), R(14, 25, 12, 1, 'u')], pal: { T: '#F4F4F4', t: '#D9DEE8', u: '#4A6FA5' } }),
  I('t5', 't', 'uniform', 'เชิ้ตนักศึกษา', { m: [...TEE, P(17, 17, 'W')], o: [P(18, 17, 'SSSS'), R(19, 18, 2, 1, 'N'), R(19, 19, 2, 5, 'N'), P(19, 24, 'N.')], pal: { T: '#FFFFFF', t: '#D9DEE8', W: '#EEF1F6', N: '#2F3A5F' } }),
  I('t6', 't', 'fashion', 'ฮู้ดดี้', { m: [...LONG, P(15, 16, 'TT'), R(16, 23, 4, 3, 't')], o: [R(18, 18, 1, 3, 'W'), R(21, 18, 1, 3, 'W')], pal: { T: '#B49BE0', t: '#957AC6' } }),
  I('t7', 't', 'cute', 'สเวตเตอร์หัวใจ', { m: LONG, o: [P(18, 17, 'SSSS'), P(17, 20, 'RR..RR'), P(17, 21, 'RRRRRR'), P(18, 22, 'RRRR'), P(19, 23, 'RR')], pal: { T: '#FCE3D2', t: '#EBC7B0', R: '#E0524A' } }),
  I('t8', 't', 'fashion', 'กะลาสี', { m: [...TEE, P(14, 17, 'NNNNN'), P(14, 18, 'NNNN')], o: [R(19, 19, 2, 2, 'R')], pal: { T: '#FFFFFF', t: '#D9DEE8', N: '#2F3A5F', R: '#E0524A' } }),
  I('t9', 't', 'sport', 'เสื้อกีฬาเบอร์ 10', { m: TEE, o: [...TEE_O, R(16, 20, 1, 4, 'W'), R(19, 20, 3, 1, 'W'), R(19, 23, 3, 1, 'W'), R(19, 20, 1, 4, 'W'), R(21, 20, 1, 4, 'W')], pal: { T: '#4FA3D9', t: '#3A7FB0' } }),
  I('t10', 't', 'uniform', 'ชุดสครับ', { m: TEE, o: [P(18, 17, 'SSSS'), P(19, 18, 'SS'), R(15, 20, 3, 2, 't')], pal: { T: '#7FC8B5', t: '#5FAE9A' } }),
  I('t11', 't', 'fashion', 'ครอปท็อป', { m: [P(15, 17, 'TTTTT'), R(14, 18, 6, 5, 'T'), R(12, 18, 2, 3, 'T'), R(14, 22, 6, 1, 't')], o: TEE_O, pal: { T: '#F6C453', t: '#E0AC3A' } }),
  I('t12', 't', 'basic', 'เสื้อกล้าม', { m: [R(15, 17, 2, 1, 'T'), R(14, 18, 6, 9, 'T'), R(14, 18, 1, 9, 't')], pal: { T: '#E8EBF2', t: '#C3CAD8' } }),
  // ── ชุดเต็มตัว ──
  I('f1', 't', 'fashion', 'เดรสชมพู', { full: true, m: [P(15, 17, 'TTTTT'), R(14, 18, 6, 6, 'T'), R(12, 18, 2, 3, 'T'), R(14, 24, 6, 1, 'u'), R(14, 25, 6, 2, 'T'), R(13, 27, 7, 1, 'T'), R(12, 28, 8, 4, 'T'), R(12, 32, 8, 1, 't')], o: TEE_O, pal: { T: '#F7B6C8', t: '#E89AB0', u: '#FFFFFF' } }),
  I('f2', 't', 'uniform', 'ครุยรับปริญญา', { full: true, m: [R(14, 17, 6, 20, 'G'), R(12, 18, 2, 8, 'G'), R(13, 26, 7, 11, 'G'), R(12, 36, 8, 1, 'g'), P(17, 17, 'Y'), P(18, 18, 'Y')], pal: { G: '#2B2B33', g: '#1E1E25', Y: '#F6C453' } }),
  I('f3', 't', 'fantasy', 'ชุดนางฟ้า', { full: true, m: [P(15, 17, 'TTTTT'), R(14, 18, 6, 7, 'T'), R(12, 18, 2, 2, 'T'), R(14, 25, 6, 1, 'Y'), R(13, 26, 7, 4, 'T'), R(12, 30, 8, 4, 'u'), R(12, 34, 8, 1, 't')], o: [...TEE_O, P(16, 28, 'Y'), P(22, 31, 'Y'), P(14, 32, 'Y')], pal: { T: '#FFFFFF', t: '#D9DEE8', u: '#F7E3EC', Y: '#F6C453' } }),
  I('f4', 't', 'cute', 'ชุดเมด', { full: true, m: [P(15, 17, 'TTTTT'), R(14, 18, 6, 9, 'T'), R(12, 18, 2, 4, 'W'), R(13, 27, 7, 1, 'T'), R(12, 28, 8, 4, 'T'), R(12, 32, 8, 1, 'W'), R(16, 20, 4, 1, 'W'), R(16, 21, 4, 10, 'W'), R(16, 30, 4, 1, 'G')], o: [R(19, 17, 2, 2, 'R')], pal: { T: '#2F2A3A', t: '#1F1B28', W: '#FFFFFF', G: '#D9DEE8', R: '#E0524A' } }),
  I('f5', 't', 'cute', 'ชุดหมีกบ', { full: true, m: [...LONG, R(14, 27, 6, 2, 'T'), R(16, 29, 3, 10, 'T'), R(16, 29, 1, 10, 't'), R(16, 20, 4, 6, 'u')], o: TEE_O, pal: { T: '#7FC86B', t: '#5FAA4E', u: '#E9F5C9' } }),
  I('f6', 't', 'fantasy', 'ชุดฮีโร่', { full: true, m: [...LONG, R(14, 27, 6, 2, 'R'), R(16, 29, 3, 10, 'T'), R(16, 29, 1, 10, 't'), R(14, 26, 6, 1, 'Y')], o: [P(18, 17, 'TTTT'), P(18, 20, 'YYYY'), P(18, 21, 'Y..Y'), P(18, 22, 'YYYY'), P(19, 23, 'YY')], pal: { T: '#4A6FC9', t: '#3A55A0', R: '#E0524A', Y: '#F6C453' } }),
  I('f7', 't', 'fashion', 'ชุดยูกาตะ', { full: true, m: [R(14, 17, 6, 20, 'T'), R(11, 18, 3, 8, 'T'), R(11, 25, 3, 1, 't'), R(13, 27, 7, 10, 'T'), R(13, 36, 7, 1, 't'), R(14, 23, 6, 2, 'O')], o: [P(18, 17, 'S'), P(19, 18, 'S'), P(21, 17, 'S'), P(16, 29, 'F'), P(22, 33, 'F'), P(15, 19, 'F')], pal: { T: '#6BB8E8', t: '#4A93C4', O: '#F29BB5', F: '#FFFFFF' } }),
  I('f8', 't', 'fashion', 'เอี๊ยมยีนส์', { full: true, m: [...TEE, R(16, 18, 1, 4, 'P'), R(16, 22, 4, 5, 'P'), ...PANTS], o: [...TEE_O, R(18, 23, 4, 2, 'p'), P(16, 21, 'Y')], pal: { T: '#F6C453', t: '#E0AC3A', P: '#4A6FA5', p: '#3A5683', Y: '#F4F4F4' } }),
  // ── ท่อนล่าง ──
  I('b1', 'b', 'basic', 'ยีนส์', { m: PANTS, pal: { P: '#4A6FA5', p: '#3A5683' } }),
  I('b2', 'b', 'uniform', 'สแล็คดำ', { m: PANTS, pal: { P: '#2F3A5F', p: '#232C4A' } }),
  I('b3', 'b', 'basic', 'ขาสั้น', { m: [R(14, 27, 6, 2, 'P'), R(15, 29, 4, 3, 'P'), R(15, 31, 4, 1, 'p')], pal: { P: '#D9C49A', p: '#BFA87D' } }),
  I('b4', 'b', 'uniform', 'กระโปรงพลีท', { m: SKIRT, o: [R(15, 28, 1, 4, 'p'), R(18, 28, 1, 4, 'p'), R(21, 28, 1, 4, 'p'), R(24, 28, 1, 4, 'p')], pal: { P: '#2F3A5F', p: '#232C4A' } }),
  I('b5', 'b', 'fashion', 'กระโปรงลายสก็อต', { m: SKIRT, o: [R(12, 29, 16, 1, 'u'), R(15, 28, 1, 4, 'u'), R(20, 28, 1, 4, 'u'), R(24, 28, 1, 4, 'u')], pal: { P: '#E0524A', p: '#B53B35', u: '#3A2E2A' } }),
  I('b6', 'b', 'fashion', 'คาร์โก้', { m: [...PANTS, R(15, 31, 2, 3, 'p')], pal: { P: '#8A9A5B', p: '#6E7D45' } }),
  I('b7', 'b', 'sport', 'กางเกงวอร์ม', { m: [...PANTS, R(18, 29, 1, 10, 'W'), R(16, 37, 3, 2, 'p')], pal: { P: '#8A8FA3', p: '#6E7388', W: '#FFFFFF' } }),
  I('b8', 'b', 'fashion', 'กระโปรงยาว', { m: [R(14, 27, 6, 1, 'p'), R(13, 28, 7, 5, 'P'), R(12, 33, 8, 4, 'P'), R(12, 36, 8, 1, 'p')], pal: { P: '#B49BE0', p: '#957AC6' } }),
  // ── รองเท้า ──
  I('k1', 'k', 'basic', 'ผ้าใบขาว', { m: [R(15, 39, 4, 2, 'W'), R(15, 40, 4, 1, 'G'), P(16, 39, 'R')], pal: { G: '#C3CAD8', R: '#E0524A' } }),
  I('k2', 'k', 'fashion', 'บูทหนัง', { m: BOOT, pal: { B: '#7A5C3E', b: '#5A4430' } }),
  I('k3', 'k', 'uniform', 'คัทชูดำ', { m: [R(15, 39, 4, 2, 'B'), R(15, 40, 4, 1, 'b')], pal: { B: '#2B2B33', b: '#1E1E25' } }),
  I('k4', 'k', 'cute', 'สลิปเปอร์ขนฟู', { m: [R(14, 39, 5, 2, 'B'), R(14, 40, 5, 1, 'b'), P(15, 39, 'W')], pal: { B: '#F7B6C8', b: '#E89AB0' } }),
  I('k5', 'k', 'cute', 'บูทกันฝน', { m: BOOT, pal: { B: '#F6C453', b: '#E0AC3A' } }),
  I('k6', 'k', 'fashion', 'ส้นสูงแดง', { m: [R(15, 39, 4, 1, 'B'), R(15, 40, 1, 1, 'b'), R(18, 40, 1, 1, 'B')], pal: { B: '#E0524A', b: '#B53B35' } }),
  I('k7', 'k', 'sport', 'สตั๊ด', { m: [R(15, 39, 4, 2, 'B'), P(15, 40, 'W.W.')], pal: { B: '#2B2B33', W: '#F6C453' } }),
  // ── เสื้อคลุม ──
  I('o1', 'o', 'uniform', 'เสื้อกาวน์', { m: [P(14, 17, 'WWW'), R(14, 18, 4, 16, 'W'), R(12, 18, 2, 8, 'W'), R(17, 18, 1, 16, 'G'), R(14, 33, 4, 1, 'G')], o: [R(15, 25, 2, 2, 'G'), R(23, 21, 1, 2, 'B')], pal: { W: '#FFFFFF', G: '#D9DEE8', B: '#4FA3D9' } }),
  I('o2', 'o', 'fashion', 'คาร์ดิแกน', { m: [P(14, 17, 'TT'), R(14, 18, 3, 9, 'T'), R(12, 18, 2, 8, 'T'), R(16, 18, 1, 9, 't'), R(12, 25, 2, 1, 't')], pal: { T: '#F2D27A', t: '#D9B25A' } }),
  I('o3', 'o', 'fashion', 'แจ็กเก็ตหนัง', { m: [P(14, 17, 'TTTT'), R(14, 18, 4, 9, 'T'), R(12, 18, 2, 8, 'T'), R(17, 18, 1, 9, 't'), R(14, 26, 4, 1, 't'), P(16, 18, 'u')], pal: { T: '#4A3A34', t: '#2F2420', u: '#C3CAD8' } }),
  I('o4', 'o', 'sport', 'แจ็กเก็ตทีม', { m: [P(14, 17, 'TTTT'), R(14, 18, 4, 9, 'T'), R(12, 18, 2, 8, 'W'), R(12, 25, 2, 1, 'G'), R(14, 26, 4, 1, 'u')], o: [P(15, 20, 'YY'), P(15, 21, 'Y.')], pal: { T: '#E0524A', t: '#B53B35', W: '#FFFFFF', G: '#D9DEE8', u: '#FFFFFF', Y: '#F6C453' } }),
  I('o5', 'o', 'cute', 'ผ้าพันคอ', { m: [R(15, 16, 5, 2, 'R'), R(15, 17, 5, 1, 'r')], o: [R(21, 18, 2, 5, 'R'), R(21, 22, 2, 1, 'r')], pal: { R: '#E0524A', r: '#B53B35' } }),
  // ── หมวก ──
  I('x1', 'x', 'basic', 'แก๊ปแดง', { m: [P(15, 3, 'QQQQQ'), R(14, 4, 6, 3, 'Q')], o: [R(13, 7, 14, 1, 'q'), P(19, 4, 'WW')], pal: { Q: '#E0524A', q: '#B53B35' } }),
  I('x2', 'x', 'cute', 'บีนนี่ปอมปอม', { m: [P(16, 2, 'BBBB'), P(15, 3, 'BBBBB'), R(14, 4, 6, 3, 'B'), R(13, 6, 7, 2, 'b')], o: [P(19, 0, 'WW'), P(18, 1, 'WWWW')], pal: { B: '#7FC8A9', b: '#5FAE8D' } }),
  I('x3', 'x', 'fantasy', 'มงกุฎ', { m: [P(15, 0, 'Y..Y'), P(15, 1, 'YY.YY'), R(15, 2, 5, 2, 'Y'), R(15, 3, 5, 1, 'y')], o: [P(19, 2, 'RR'), P(16, 2, 'G'), P(23, 2, 'G')], pal: { Y: '#F6C453', y: '#D9A23A', R: '#E0524A', G: '#4FA3D9' } }),
  I('x4', 'x', 'fantasy', 'หมวกแม่มด', { o: [P(22, 0, 'VV'), P(20, 1, 'VVVV'), P(19, 2, 'VVVV'), P(18, 3, 'VVVVV'), P(16, 4, 'VVVVVVVV'), P(15, 5, 'vvvvvvvvvv'), R(11, 6, 18, 2, 'V'), R(11, 7, 18, 1, 'w')], pal: { V: '#5B4585', w: '#45346A', v: '#F6C453' } }),
  I('x5', 'x', 'cute', 'หูแมว', { m: [P(14, 1, 'H'), P(14, 2, 'HH'), P(14, 3, 'HPH')], pal: { P: '#F7B6C8' } }),
  I('x6', 'x', 'cute', 'หูกระต่าย', { m: [R(15, 0, 2, 4, 'W'), R(16, 1, 1, 2, 'P')], pal: { W: '#FFFFFF', P: '#F7B6C8' } }),
  I('x7', 'x', 'fantasy', 'วงแหวนนางฟ้า', { m: [P(16, 0, 'YYYY'), P(15, 1, 'Y')], pal: { Y: '#F6C453' } }),
  I('x8', 'x', 'fantasy', 'เขาปีศาจ', { m: [P(14, 1, 'R'), P(14, 2, 'RR'), P(15, 3, 'RR')], pal: { R: '#E0524A' } }),
  I('x9', 'x', 'uniform', 'หมวกบัณฑิต', { m: [R(11, 2, 9, 1, 'G'), P(13, 3, 'GGGGGGG'), R(14, 4, 6, 2, 'G')], o: [R(27, 2, 1, 4, 'Y'), R(26, 6, 2, 1, 'Y')], pal: { G: '#2B2B33', Y: '#F6C453' } }),
  I('x10', 'x', 'uniform', 'หมวกพยาบาล', { m: [P(16, 2, 'WWWW'), P(15, 3, 'WWWWW')], o: [R(19, 1, 2, 3, 'R'), R(18, 2, 4, 1, 'R')], pal: { W: '#FFFFFF', R: '#E0524A' } }),
  I('x11', 'x', 'fashion', 'มงกุฎดอกไม้', { o: [P(14, 4, 'FGYGFGYGFGYF'), P(15, 3, 'F..Y..F..Y')], pal: { F: '#F29BB5', G: '#7FC8A9', Y: '#F6C453' } }),
  I('x12', 'x', 'basic', 'หูฟัง', { o: [P(15, 2, 'KKKKKKKKKK'), P(14, 3, 'K'), P(25, 3, 'K'), R(13, 4, 1, 4, 'K'), R(26, 4, 1, 4, 'K')], m: [R(12, 8, 2, 4, 'A')], pal: { A: '#E0524A' } }),
  I('x13', 'x', 'cute', 'ฮู้ดกบ', { m: [P(15, 1, 'GG'), P(15, 2, 'GKG'), P(16, 3, 'GGGG'), R(14, 4, 6, 3, 'G'), R(13, 6, 2, 8, 'G'), R(13, 13, 2, 1, 'g')], pal: { G: '#7FC86B', g: '#5FAA4E' } }),
  // ── หน้า ──
  I('a1', 'a', 'basic', 'แว่นเหลี่ยม', { m: [P(15, 8, 'KKKK'), P(15, 9, 'K..K'), P(15, 10, 'K..K'), P(15, 11, 'KKKK')], o: [P(19, 9, 'KK')] }),
  I('a2', 'a', 'fashion', 'แว่นกันแดด', { m: [R(15, 9, 4, 2, 'K')], o: [P(16, 9, 'W'), P(21, 9, 'W'), P(19, 9, 'KK')] }),
  I('a3', 'a', 'uniform', 'แมสก์', { o: [R(15, 12, 10, 3, 'W'), R(15, 14, 10, 1, 'G'), P(14, 11, 'G'), P(25, 11, 'G')], pal: { W: '#FFFFFF', G: '#D9DEE8' } }),
  I('a4', 'a', 'fantasy', 'ผ้าปิดตา', { o: [R(21, 9, 3, 3, 'K'), P(13, 7, 'KK'), P(24, 8, 'KK')] }),
  I('a5', 'a', 'cute', 'สติกเกอร์ดาว', { o: [P(23, 11, 'Y'), P(22, 12, 'YYY'), P(23, 13, 'Y')], pal: { Y: '#F6C453' } }),
  I('a6', 'a', 'fashion', 'หนวด', { m: [P(17, 12, 'KKK'), P(16, 13, 'K')] }),
  // ── ในมือ ──
  I('i1', 'i', 'uniform', 'ขวดยา', { o: [R(28, 21, 3, 1, 'W'), R(28, 22, 3, 5, 'O'), R(28, 23, 3, 2, 'W'), R(30, 22, 1, 5, 'o')], pal: { W: '#FFFFFF', O: '#F6A04D', o: '#DB8636' } }),
  I('i2', 'i', 'cute', 'ชานมไข่มุก', { o: [P(30, 18, 'K'), P(30, 19, 'K'), R(28, 20, 3, 1, 'G'), R(28, 21, 3, 6, 'T'), R(30, 21, 1, 6, 't'), P(28, 25, 'K.K'), P(29, 26, 'K')], pal: { G: '#C3CAD8', T: '#E8C9A0', t: '#CFAE82' } }),
  I('i3', 'i', 'basic', 'หนังสือ', { o: [R(28, 20, 4, 7, 'B'), R(28, 20, 1, 7, 'b'), R(29, 22, 2, 1, 'W'), R(29, 24, 2, 1, 'W')], pal: { B: '#4FA3D9', b: '#3A7FB0' } }),
  I('i4', 'i', 'fantasy', 'ไม้กายสิทธิ์', { o: [P(30, 16, 'Y'), P(29, 17, 'YYY'), P(30, 18, 'Y'), R(30, 19, 1, 8, 'B')], pal: { Y: '#F6C453', B: '#7A5C3E' } }),
  I('i5', 'i', 'fantasy', 'ดาบ', { o: [R(29, 12, 2, 12, 'G'), R(29, 12, 1, 12, 'W'), R(27, 24, 6, 1, 'Y'), R(29, 25, 2, 2, 'B')], pal: { G: '#C3CAD8', W: '#EEF1F6', Y: '#F6C453', B: '#7A5C3E' } }),
  I('i6', 'i', 'basic', 'มือถือ', { o: [R(28, 21, 3, 6, 'K'), R(29, 22, 1, 4, 'G')], pal: { G: '#7FC8A9' } }),
  I('i7', 'i', 'cute', 'ลูกโป่ง', { o: [P(29, 8, 'RRR'), R(28, 9, 5, 4, 'R'), P(29, 13, 'RRR'), P(29, 9, 'W'), P(30, 14, 'r'), R(29, 15, 1, 11, 'G')], pal: { R: '#F29BB5', r: '#D97C99', G: '#C3CAD8' } }),
  I('i8', 'i', 'fashion', 'ดอกไม้', { o: [P(28, 19, 'P.P'), P(29, 20, 'Y'), P(28, 21, 'P.P'), R(29, 22, 1, 5, 'G'), P(30, 24, 'G')], pal: { P: '#F29BB5', Y: '#F6C453', G: '#7FC86B' } }),
  I('i9', 'i', 'basic', 'กาแฟ', { o: [P(29, 19, 'G'), P(30, 20, 'G'), R(28, 22, 3, 5, 'W'), R(28, 23, 3, 2, 'B'), R(31, 23, 1, 2, 'W')], pal: { G: '#C3CAD8', B: '#7A5C3E' } }),
  I('i10', 'i', 'uniform', 'ครกบดยา', { o: [R(31, 19, 1, 6, 'B'), R(28, 24, 5, 1, 'G'), R(28, 25, 5, 2, 'G'), R(29, 26, 3, 1, 'g')], pal: { B: '#7A5C3E', G: '#D9DEE8', g: '#A39DB8' } }),
  // ── ปีก/หลัง ── (วาดฝั่งซ้าย สะท้อนอัตโนมัติ)
  I('w1', 'w', 'fantasy', 'ปีกนางฟ้า', { back: [P(8, 12, 'WWW'), P(5, 13, 'WWWWWWWW'), P(4, 14, 'WWWWWWWWW'), P(3, 15, 'WWWWWWWWWW'), P(3, 16, 'WWWWWWWWWW'), P(4, 17, 'GWWWWWWWW'), P(5, 18, 'GWWWWWWW'), P(6, 19, 'GWWWWW'), P(7, 20, 'GWWW'), P(8, 21, 'GG')], pal: { W: '#FFFFFF', G: '#D9DEE8' } }),
  I('w2', 'w', 'fantasy', 'ปีกค้างคาว', { back: [P(9, 12, 'VVV'), P(6, 13, 'VVVVVVV'), P(3, 14, 'VVVVVVVVVV'), P(2, 15, 'VvVVVVVVVVV'), P(2, 16, 'V.VvVVVVVVV'), P(5, 17, 'V.VvVVVV'), P(8, 18, 'V.VVV'), P(10, 19, 'VV')], pal: { V: '#5B4585', v: '#45346A' } }),
  I('w3', 'w', 'fantasy', 'ปีกนางฟ้าน้อย', { back: [P(6, 10, 'FF'), P(4, 11, 'FFFFF'), P(3, 12, 'FFfFFFFFFF'), P(3, 13, 'FFFfFFFFFF'), P(5, 14, 'FFFfFFFF'), P(8, 15, 'FFFFF'), P(7, 17, 'FFFFFF'), P(5, 18, 'FFFfFFFF'), P(5, 19, 'FFFFfFF'), P(6, 20, 'FFFF')], pal: { F: '#BDE7F5', f: '#8FCDE3' } }),
  I('w4', 'w', 'cute', 'ปีกผีเสื้อ', { back: [P(5, 10, 'OOO'), P(3, 11, 'OOYOOOO'), P(2, 12, 'OYYYOOOOOO'), P(2, 13, 'OOYOOOOOOO'), P(4, 14, 'OOOOOOOO'), P(7, 15, 'OOOOO'), P(6, 17, 'OOOOOO'), P(4, 18, 'OOYOOOOO'), P(5, 19, 'OOOOOO'), P(7, 20, 'OOO')], pal: { O: '#F6A04D', Y: '#FFF0B8' } }),
  I('w5', 'w', 'fantasy', 'ปีกมังกร', { back: [P(7, 10, 'D'), P(6, 11, 'DD'), P(5, 12, 'DdDDDDDD'), P(3, 13, 'DDdDDDDDDD'), P(2, 14, 'DDDdDDDDDDD'), P(2, 15, 'D.DDdDDDDDD'), P(4, 16, 'D.DDdDDDD'), P(7, 17, 'D.DDDD'), P(10, 18, 'DD')], pal: { D: '#5FAA4E', d: '#3F7F36' } }),
  I('w6', 'w', 'fantasy', 'ผ้าคลุมฮีโร่', { back: [P(12, 17, 'RRRRRRRR'), R(11, 18, 9, 19, 'R'), R(11, 37, 9, 1, 'r'), R(11, 18, 1, 19, 'r')], pal: { R: '#E0524A', r: '#B53B35' } }),
];
const PART = Object.fromEntries(PARTS.map(p => [p.id, p]));

const OUTFITS = [
  { name: 'นักศึกษา', eq: { s: 's2', c: 'c1', h: 'h3', e: 'e1', m: 'm1', t: 't5', b: 'b4', k: 'k3', a: 'a1', i: 'i3' } },
  { name: 'เภสัชกร', eq: { s: 's3', c: 'c2', h: 'h1', e: 'e2', m: 'm1', t: 't10', b: 'b2', k: 'k1', o: 'o1', i: 'i1' } },
  { name: 'รับปริญญา', eq: { s: 's2', c: 'c1', h: 'h2', e: 'e3', m: 'm2', t: 'f2', k: 'k3', x: 'x9', i: 'i8' } },
  { name: 'นางฟ้า', eq: { s: 's1', c: 'c3', h: 'h2', e: 'e2', m: 'm1', t: 'f3', k: 'k4', x: 'x7', w: 'w1', i: 'i4' } },
  { name: 'ปีศาจน้อย', eq: { s: 's4', c: 'c7', h: 'h6', e: 'e8', m: 'm6', t: 't6', b: 'b2', k: 'k2', x: 'x8', w: 'w2' } },
  { name: 'สตรีท', eq: { s: 's3', c: 'c1', h: 'h9', e: 'e4', m: 'm5', t: 't4', b: 'b6', k: 'k1', o: 'o3', x: 'x1', a: 'a2' } },
  { name: 'แม่มด', eq: { s: 's1', c: 'c5', h: 'h2', e: 'e7', m: 'm3', t: 'f4', k: 'k2', x: 'x4', i: 'i4' } },
  { name: 'เมด', eq: { s: 's2', c: 'c4', h: 'h4', e: 'e2', m: 'm1', t: 'f4', k: 'k3', x: 'x6', i: 'i2' } },
  { name: 'กบน้อย', eq: { s: 's2', c: 'c2', h: 'h1', e: 'e6', m: 'm4', t: 'f5', k: 'k5', x: 'x13', i: 'i7' } },
  { name: 'ฮีโร่', eq: { s: 's5', c: 'c8', h: 'h6', e: 'e1', m: 'm2', t: 'f6', k: 'k2', w: 'w6', a: 'a4' } },
  { name: 'ยูกาตะ', eq: { s: 's2', c: 'c1', h: 'h5', e: 'e3', m: 'm1', t: 'f7', k: 'k6', x: 'x11', i: 'i9' } },
  { name: 'นักบอล', eq: { s: 's4', c: 'c2', h: 'h1', e: 'e1', m: 'm2', t: 't9', b: 'b7', k: 'k7', o: 'o4', x: 'x12' } },
  { name: 'มังกร', eq: { s: 's3', c: 'c6', h: 'h8', e: 'e8', m: 'm6', t: 't12', b: 'b6', k: 'k2', w: 'w5', i: 'i5' } },
  { name: 'ผีเสื้อ', eq: { s: 's1', c: 'c8', h: 'h7', e: 'e5', m: 'm1', t: 'f1', k: 'k6', w: 'w4', x: 'x11' } },
  { name: 'หน้าหนาว', eq: { s: 's5', c: 'c3', h: 'h10', e: 'e4', m: 'm5', t: 't7', b: 'b1', k: 'k5', o: 'o5', x: 'x2', i: 'i9' } },
];

// ── render ──
function apply(g, ops, pal, mirror, onlyEmpty) {
  const put = (x, y, ch) => {
    if (ch === '.' || x < 0 || x >= W || y < 0 || y >= H) return;
    if (onlyEmpty && g[y][x]) return;
    g[y][x] = pal[ch] || pal.__fallback?.(ch) || ch;
  };
  const one = (op, mir) => {
    if (op[0] === 'r') {
      const [, x, y, w, h, c] = op;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(mir ? W - 1 - (x + i) : x + i, y + j, c);
    } else {
      const [, x, y, s] = op;
      for (let i = 0; i < s.length; i++) put(mir ? W - 1 - (x + i) : x + i, y, s[i]);
    }
  };
  for (const op of ops || []) { one(op, false); if (mirror) one(op, true); }
}

const ORDER = ['w', 'hb', 'base', 'b', 'k', 't', 'o', 'e', 'm', 'h', 'x', 'a', 'i'];

function compose(eq) {
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const skin = SKINS.find(s => s.id === eq.s) || SKINS[1];
  const hair = HAIRC.find(c => c.id === eq.c) || HAIRC[0];
  const glob = { S: skin.S, s: skin.s, H: hair.H, h: hair.h, L: hair.L, K: INK, W: '#FFFFFF', C: '#FFB3A7', M: '#D9665F' };
  const top = PART[eq.t];
  const hidden = new Set(top?.full ? ['b'] : []);
  for (const k of ORDER) {
    if (k === 'base') { apply(g, BASE.m, glob, true); continue; }
    if (k === 'hb') { const p = PART[eq.h]; if (p) { const pal = { ...glob, ...p.pal }; apply(g, p.back, pal, true); apply(g, p.ob, pal, false); } continue; }
    if (hidden.has(k)) continue;
    const p = PART[eq[k]];
    if (!p) continue;
    const pal = { ...glob, ...p.pal };
    if (k === 'w') { apply(g, p.back, pal, true); continue; }
    apply(g, p.m, pal, true);
    apply(g, p.o, pal, false);
  }
  return g;
}

function outline(g) {
  const w = W + PAD * 2, h = H + PAD * 2;
  const src = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => g[y - PAD]?.[x - PAD] || null));
  const out = src.map(r => r.slice());
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (src[y][x]) continue;
    let m = 99;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy < 0 || xx < 0 || yy >= h || xx >= w || !src[yy][xx]) continue;
      const d = Math.hypot(dx, dy); if (d < m) m = d;
    }
    if (m <= 1.5) out[y][x] = INK; else if (m <= 3.2) out[y][x] = '#FFFFFF';
  }
  return { w, h, px: out };
}

const render = eq => outline(compose(eq));

if (typeof module !== 'undefined') module.exports = { PARTS, PART, SLOTS, THEMES, SKINS, HAIRC, OUTFITS, compose, outline, render, W, H };
