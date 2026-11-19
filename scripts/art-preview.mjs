// 🎨 ภาพเทียบเก่า/ใหม่ของงานแผนกอาร์ต (20 พ.ย. 2026)
// node scripts/art-preview.mjs <out.png> <ไฟล์ใน inbox/parts>... [--ids=t1,b20]   แถวบน = ของเดิม · แถวล่าง = ของใหม่
// ไม่ใส่ --ids = ทุกชิ้นในไฟล์ (ใส่บนตัวเริ่มต้น)
import fs from 'node:fs'; import zlib from 'node:zlib'
const R = await import('../src/utils/dollRender.js')
const D = await import('../src/data/dollParts.js')
const argv = process.argv.slice(2), idArg = argv.find(a => a.startsWith('--ids='))
const [out, ...files] = argv.filter(a => !a.startsWith('--'))
const I = (id, slot, theme, label, d) => ({ id, slot, theme, label, ...d })
const r = (x, y, w, h, c) => ['r', x, y, w, h, c], p = (x, y, s) => ['p', x, y, s]
let newBase = null; const newParts = []
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8')
  if (/export const BASE/.test(src)) { src = src.replace('export const BASE =', 'return'); newBase = new Function('I','R','P', src)(I, r, p); continue }
  src = src.replace('export default', 'return')
  newParts.push(...new Function('I','R','P', src)(I, r, p))
}
const ids = idArg ? idArg.slice(6).split(',') : newParts.map(p => p.id)
const looks = (ids.length ? ids : ['h1']).map(id => [id, { ...D.DEFAULT_EQ, [D.PART[id].slot]: id }])
const before = looks.map(([, eq]) => R.render(eq))
const oldBase = D.BASE.m.slice()
if (newBase) D.BASE.m.splice(0, D.BASE.m.length, ...newBase.m)
for (const np of newParts) { const o = D.PART[np.id]; for (const k of Object.keys(o)) if (!['id','slot','theme','label','price'].includes(k)) delete o[k]; Object.assign(o, np, { price: o.price }) }
const after = looks.map(([, eq]) => R.render(eq))
const hex = c => [1,3,5].map(i => parseInt(c.slice(i,i+2),16))
const S = 4, cw = before[0].w*S, ch = before[0].h*S, G = 6
const W = looks.length*(cw+G)+G, H = 2*(ch+G)+G, buf = Buffer.alloc(W*H*3)
for (let y=0;y<H;y++) for (let x=0;x<W;x++){ const v=((x>>4)+(y>>4))%2?0xF1:0xF8; buf.set([v,v-4,255],(y*W+x)*3) }
;[before, after].forEach((row, ri) => row.forEach((c, n) => { const ox=G+n*(cw+G), oy=G+ri*(ch+G)
  for (let y=0;y<c.h;y++) for (let x=0;x<c.w;x++){ const v=c.px[y][x]; if(!v||v[0]!=='#') continue; const rgb=hex(v); for(let j=0;j<S;j++) for(let i=0;i<S;i++) buf.set(rgb,((oy+y*S+j)*W+ox+x*S+i)*3) } }))
const raw = Buffer.alloc((W*3+1)*H); for (let y=0;y<H;y++){ raw[y*(W*3+1)]=0; buf.copy(raw,y*(W*3+1)+1,y*W*3,(y+1)*W*3) }
const crc=(b)=>{let c=~0;for(const x of b){c^=x;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xEDB88320:c>>>1}return ~c>>>0}
const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])}
const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2
fs.writeFileSync(out, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]))
console.log('parts', newParts.map(p => p.id).join(' '), 'base', !!newBase)
