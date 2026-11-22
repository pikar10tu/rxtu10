// 🎲 เศรษฐีรอบโลก — พิกเซลอาร์ต (pxl) · build:
//   node ~/.claude/skills/pxl/bin/pxl.js build scripts/art/tycoon.px.js --out scripts/art/out
//   แล้วคัด sprites/*.png ไป src/assets/tycoon/ (ดู scripts/art/README-tycoon.md)
pal({
  k: "#2b2340",               // หมึก
  w: "#fffaf0", W: "#e8dcc8",
  p: "#ff7a9c", P: "#c94f72", // ชมพู (ที่นั่ง 1)
  r: "#e2585e", R: "#a63a4c",
  y: "#ffd25a", Y: "#e0a42c", o: "#ff9d4d",
  b: "#9fd3e8", B: "#5a95b8",
  g: "#a7d8a3", G: "#5f9e62",
  s: "#c9c3d6", S: "#8f88a3",
})
ramps("kPp", "kRr", "kYy", "kBb", "kGg", "kSs", "kWw")

// ── ตัวเดินทาง (หัวกลม + ลำตัวทรงหมาก) — ที่นั่ง 1 สีชมพู แล้ว swap เป็นอีก 3 สี ──
sprite("pawn_0", { mx: true, outline: "k" }, `
  ....pp
  ...ppp
  ..pwpp
  ..pppp
  ...ppp
  ....pp
  ...ppp
  ..pppp
  ..pPpp
  .ppPpp
  pppPpp
  PPPPPP`)
sprite("pawn_1", { base: "pawn_0", swap: { p: "b", P: "B" } })
sprite("pawn_2", { base: "pawn_0", swap: { p: "g", P: "G" } })
sprite("pawn_3", { base: "pawn_0", swap: { p: "y", P: "Y" } })

// ── บ้านหลังเล็ก (สิ่งปลูกสร้าง 1 หลัง) ──
sprite("house", { outline: "k" }, `
  ...rr...
  ..rrrr..
  .rrrrrr.
  RRRRRRRR
  .wwwwWW.
  .wbwwbW.
  .wwkkwW.
  .wwkkwW.`)

// ── แลนด์มาร์ค: หอคอยมีธงและประกาย ──
sprite("landmark", { outline: "k" },
  `
  ....r.....
  ....rr....
  ....k.....
  ...yyy....
  ..yyyyy...
  ..ywyyY...
  .yyyyyyY..
  .ywyywyY..
  .yyyyyyY..
  .ywyywyY..
  yyyyyyyyY.
  YYYYYYYYY.`)

// ── เหรียญ (ใช้ลอยตอนได้/เสียเงิน) ──
sprite("coin", { mx: true, outline: "k" }, `
  ..yy
  .yyw
  yyyY
  yyYy
  .yYy
  ..YY`)

// ── หน้าเต๋า 1–6 (ขาวขอบมน จุดสีหมึก · จุดหน้า 1 สีแดง) ──
const PIPS = {
  1: [[5, 5]], 2: [[2, 2], [8, 8]], 3: [[2, 2], [5, 5], [8, 8]],
  4: [[2, 2], [8, 2], [2, 8], [8, 8]], 5: [[2, 2], [8, 2], [5, 5], [2, 8], [8, 8]],
  6: [[2, 2], [8, 2], [2, 5], [8, 5], [2, 8], [8, 8]],
}
for (let n = 1; n <= 6; n++) {
  sprite("die_" + n, { w: 11, h: 11, outline: "k" },
    rect(1, 0, 9, 11, "w"), rect(0, 1, 11, 9, "w"),
    rect(1, 9, 9, 1, "W"), rect(10, 1, 1, 9, "W"),
    ...PIPS[n].map(([x, y]) => rect(x - 1 + (n === 1 ? 0 : 0), y - 1, 2, 2, n === 1 ? "r" : "k")))
}

// ── การ์ดดวง (หลังการ์ด) ──
sprite("card_back", { w: 14, h: 18, outline: "k" },
  rect(0, 0, 14, 18, "p"), rect(2, 2, 10, 14, "P"), rect(3, 3, 8, 12, "p"),
  text(5, 6, "?", "w"))
