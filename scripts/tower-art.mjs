// ════════════════════════════════════════════════════════════
//  แบนเนอร์โซนหอคอย 6 ฉาก — วาด SVG ด้วยโค้ด → WebP ที่ public/tower/<key>.webp (640×220)
//  user เคาะจากเดโม 17 ต.ค. 2026 · key ตรงกับ ZONES[].key ใน data/towerFloors.js
//  WebP ไม่ใช่ SVG เหตุผลเดียวกับ herb-icons.mjs (iPhone raster SVG ใหม่ทุกเฟรม)
//  รัน: node scripts/tower-art.mjs   (--svg เขียน .svg ไว้ดูด้วย)
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'tower')
const ZONE_KEYS = ['arena', 'magic', 'demon', 'dragon', 'royal', 'endless']

let _uid=0; const uid=p=>p+(++_uid);
function rnd(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function stars(n,seed,h=70){const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*320,y=r()*h,k=r();s+=k>.9?`<path d="M${x} ${y-3}L${x+.7} ${y-.7}L${x+3} ${y}L${x+.7} ${y+.7}L${x} ${y+3}L${x-.7} ${y+.7}L${x-3} ${y}L${x-.7} ${y-.7}Z" fill="#fff" opacity=".9"/>`:`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.3+k*.8).toFixed(2)}" fill="#fff" opacity="${(.35+k*.6).toFixed(2)}"/>`}return s}
function cloud(x,y,s,c1,c2,op=1){return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="4" rx="26" ry="6" fill="${c2}"/><circle cx="-12" cy="0" r="8" fill="${c1}"/><circle cx="0" cy="-5" r="11" fill="${c1}"/><circle cx="13" cy="-1" r="8" fill="${c1}"/><circle cx="22" cy="3" r="5" fill="${c1}"/><ellipse cx="2" cy="5" rx="24" ry="3" fill="${c2}" opacity=".6"/><circle cx="-3" cy="-9" r="4" fill="#fff" opacity=".6"/></g>`}
function ridge(seed,base,amp,step,fill,extra=''){const r=rnd(seed);let d=`M0 110L0 ${base}`;for(let x=0;x<=320;x+=step){d+=`L${x} ${(base-r()*amp).toFixed(1)}`}return `<path d="${d}L320 110Z" fill="${fill}" ${extra}/>`}
function hills(seed,base,amp,fill){const r=rnd(seed);let d=`M0 110L0 ${base}`;let x=0;while(x<320){const w=40+r()*60;d+=`Q${(x+w/2).toFixed(1)} ${(base-amp*(.5+r()*.5)).toFixed(1)} ${(x+w).toFixed(1)} ${base}`;x+=w}return `<path d="${d}L${x.toFixed(1)} 110L0 110Z" fill="${fill}"/>`}
function grass(seed,y,n,c){const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=(r()*320).toFixed(1),h=2+r()*4;s+=`<path d="M${x} ${y}q-1 ${-h/2} -2 ${-h}M${x} ${y}q0 ${-h} .5 ${-h-1}M${x} ${y}q1 ${-h/2} 2 ${-h+.5}" stroke="${c}" stroke-width=".7" fill="none" stroke-linecap="round"/>`}return s}
function bricks(x,y,w,h,c,rows){let s='';const rh=h/rows;for(let i=1;i<rows;i++)s+=`<path d="M${x} ${y+i*rh}h${w}" stroke="${c}" stroke-width=".5" opacity=".5"/>`;for(let i=0;i<rows;i++){const off=i%2?w/6:0;for(let k=off+w/3;k<w;k+=w/3)s+=`<path d="M${x+k} ${y+i*rh}v${rh}" stroke="${c}" stroke-width=".5" opacity=".45"/>`}return s}
function castleTower(o){
 const {x,base,w,h,wall,wallD,roof,roofD,win,flag}=o,top=base-h,id=uid('t');
 let s=`<defs><linearGradient id="${id}w" x1="0" x2="1"><stop offset="0" stop-color="${wall}"/><stop offset=".62" stop-color="${wall}"/><stop offset="1" stop-color="${wallD}"/></linearGradient><linearGradient id="${id}r" x1="0" x2="1"><stop offset="0" stop-color="${roof}"/><stop offset=".55" stop-color="${roof}"/><stop offset="1" stop-color="${roofD}"/></linearGradient></defs>`;
 s+=`<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#${id}w)"/>`+bricks(x,top+4,w,h-4,wallD,Math.max(2,Math.round(h/7)));
 s+=`<rect x="${x-2}" y="${top}" width="${w+4}" height="4" fill="${wallD}"/>`;
 const rh=w*1.15;s+=`<path d="M${x-4} ${top}L${x+w/2} ${top-rh}L${x+w+4} ${top}Z" fill="url(#${id}r)"/><path d="M${x-4} ${top}Q${x+w/2} ${top+3} ${x+w+4} ${top}" fill="${roofD}" opacity=".6"/>`;
 for(let i=1;i<4;i++){const yy=top-rh+rh*i/4,hw=(w/2+4)*i/4;s+=`<path d="M${x+w/2-hw} ${yy}h${hw*2}" stroke="${roofD}" stroke-width=".5" opacity=".6"/>`}
 const n=Math.max(1,Math.floor(h/20));for(let i=0;i<n;i++){const wy=top+9+i*((h-14)/n);s+=`<circle cx="${x+w/2}" cy="${wy+4}" r="5" fill="${win}" opacity=".18"/><path d="M${x+w/2-2.6} ${wy+7}v-4.5a2.6 2.6 0 0 1 5.2 0v4.5Z" fill="${win}" stroke="${wallD}" stroke-width=".6"/>`}
 if(flag){const fx=x+w/2,fy=top-rh;s+=`<path d="M${fx} ${fy}v-10" stroke="#5b4636" stroke-width=".9"/><path d="M${fx} ${fy-10}q5 -1 10 1q-5 2 -10 4Z" fill="${flag}"/>`}
 return s}
function glow(cx,cy,r,c,op=.6){const id=uid('g');return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`}
function sky(a,b,c){const id=uid('s');return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".65" stop-color="${b}"/><stop offset="1" stop-color="${c||b}"/></linearGradient></defs><rect width="320" height="110" fill="url(#${id})"/>`}
function vignette(){const id=uid('v');return `<defs><radialGradient id="${id}" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient></defs><rect width="320" height="110" fill="url(#${id})"/>`}
function motes(seed,n,c,y0=20,y1=100){const r=rnd(seed);let s='';for(let i=0;i<n;i++)s+=`<circle cx="${(r()*320).toFixed(1)}" cy="${(y0+r()*(y1-y0)).toFixed(1)}" r="${(.6+r()*1.3).toFixed(2)}" fill="${c}" opacity="${(.4+r()*.5).toFixed(2)}"/>`;return s}

function zoneSVG(z){
 let m='';
 if(z.k==='arena'){
  m=sky('#7cc7f2','#c6ecff','#eaf8e0')+glow(262,28,46,'#fff4b0',.9)+`<circle cx="262" cy="28" r="11" fill="#fff8d1"/>`
   +cloud(70,26,1,'#fff','#d6ecf8',.95)+cloud(180,16,.7,'#fff','#d6ecf8',.85)+cloud(300,46,.55,'#fff','#d6ecf8',.8)
   +ridge(3,74,10,16,'#a9cfe0',' opacity=".7"')+hills(5,84,14,'#9bd36a')+hills(9,92,10,'#7cbf4b')
   +`<ellipse cx="216" cy="94" rx="58" ry="7" fill="#5a7d2f" opacity=".5"/><path d="M164 92V66Q216 56 268 66V92Z" fill="#efe6d2"/><path d="M164 66Q216 56 268 66V70Q216 60 164 70Z" fill="#d8ccb1"/>`
   +Array.from({length:9},(_,i)=>`<path d="M${170+i*11} 90v-9a3.6 3.6 0 0 1 7.2 0v9Z" fill="#b9a988"/><path d="M${170+i*11} 78v-5a3.6 3 0 0 1 7.2 0v5Z" fill="#cbbd9e"/>`).join('')
   +castleTower({x:248,base:92,w:20,h:44,wall:'#f3ead7',wallD:'#c8b893',roof:'#f26b5b',roofD:'#b4382c',win:'#ffe9a8',flag:'#ef4444'})
   +castleTower({x:150,base:92,w:16,h:34,wall:'#f3ead7',wallD:'#c8b893',roof:'#3a8fd6',roofD:'#245f95',win:'#ffe9a8',flag:'#3b82f6'})
   +`<path d="M0 110V98Q80 92 160 98T320 96V110Z" fill="#5ea33a"/>`+grass(4,104,70,'#3f7d25')+grass(8,99,40,'#6cbf45')
   +`<g transform="translate(40 92)"><path d="M0 10V0" stroke="#7a5a3a" stroke-width="1.4"/><path d="M0 0q6 -1 12 1v7q-6 -2 -12 -1Z" fill="#f59e0b"/><path d="M3 2l3 3 3-3" stroke="#fff" stroke-width=".8" fill="none"/></g>`;
 }
 if(z.k==='magic'){
  m=sky('#101a4d','#2f4fa8','#6f8fe0')+stars(50,7,60)+glow(60,26,30,'#c7d2fe',.5)+`<circle cx="60" cy="26" r="10" fill="#eef2ff"/><circle cx="64" cy="23" r="9" fill="#1a2a6e"/>`
   +ridge(12,70,16,12,'#273f8c',' opacity=".9"')+ridge(14,84,10,10,'#1b2c6a')
   +glow(214,30,40,'#7dd3fc',.45)
   +castleTower({x:198,base:96,w:30,h:50,wall:'#46609f',wallD:'#25386b',roof:'#7c3aed',roofD:'#4c1d95',win:'#a5f3fc'})
   +``
   +castleTower({x:236,base:96,w:16,h:34,wall:'#3b5294',wallD:'#22336a',roof:'#6d28d9',roofD:'#3b0f7a',win:'#a5f3fc'})
   +`<g><circle cx="213" cy="8" r="4.5" fill="#cffafe"/><circle cx="213" cy="8" r="2.2" fill="#fff"/><ellipse cx="213" cy="8" rx="13" ry="3.5" fill="none" stroke="#a5f3fc" stroke-width=".8" opacity=".7" transform="rotate(-15 213 8)"/></g>`
   +Array.from({length:8},(_,i)=>{const r=rnd(40+i);const x=(150+r()*140).toFixed(1),y=(20+r()*60).toFixed(1);return `<path d="M${x} ${y-2.5}l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8Z" fill="#e0f2fe" opacity=".85"/>`}).join('')
   +`<path d="M0 110V98Q100 90 200 100T320 96V110Z" fill="#0f1a45"/>`
   +`<g fill="#0b1336"><path d="M30 98l6-22 6 22Z"/><path d="M46 98l5-16 5 16Z"/><path d="M110 99l7-26 7 26Z"/><path d="M128 99l5-18 5 18Z"/></g>`;
 }
 if(z.k==='demon'){
  m=sky('#1a0730','#5b1d8f','#c084fc')+glow(230,50,80,'#f472b6',.35)
   +ridge(21,60,26,10,'#3b1063',' opacity=".85"')+ridge(23,78,14,8,'#2a0a49')
   +`<path d="" fill="#24083f"/>`
   +castleTower({x:200,base:96,w:36,h:46,wall:'#3d1366',wallD:'#1e0638',roof:'#1a0430',roofD:'#0b0118',win:'#fb7185'})
   +`<path d="M198 50l-10-18 14 10Z M238 50l10-18-14 10Z" fill="#12031f"/>`
   +`<path d="M212 96V82q6-7 12 0v14Z" fill="#0b0118"/><path d="M212 82q6-7 12 0" stroke="#fb7185" stroke-width=".8" fill="none"/>`
   +`<path d="M0 110V96Q80 88 160 98T320 94V110Z" fill="#1a0530"/>`+motes(60,16,'#f0abfc')
   +`<g fill="#12031f" opacity=".9"><path d="M40 40q6-6 10 0q4-6 10 0q-5-1-10 4q-5-5-10-4Z"/><path d="M110 28q4-4 7 0q3-4 7 0q-4-1-7 3q-3-4-7-3Z"/></g>`;
 }
 if(z.k==='dragon'){
  m=sky('#7c2d12','#f97316','#fde68a')+glow(80,78,70,'#fff1c2',.9)+`<circle cx="80" cy="78" r="22" fill="#fff4d0"/>`
   +ridge(31,70,22,12,'#b45309',' opacity=".55"')+ridge(33,86,12,9,'#92400e',' opacity=".8"')
   +castleTower({x:216,base:98,w:32,h:54,wall:'#8a4a1f',wallD:'#4a2309',roof:'#b91c1c',roofD:'#6b0f0f',win:'#fde68a',flag:'#facc15'})
   +`<g fill="#3b0b0b"><path d="M120 40c10-12 24-14 34-8c-6 0-10 2-12 6c8-8 22-6 28 2c-8-2-14 0-18 6c-6-2-12-2-18 2c-4-6-8-8-14-8Z"/><path d="M160 32l9-5-2 8Z"/><path d="M170 30c6 2 12 8 14 16c-4-4-8-6-12-6Z"/></g>`
   +`<path d="M0 110V100Q90 90 180 100T320 98V110Z" fill="#5a1f05"/>`+motes(70,14,'#fde68a',30,100);
 }
 if(z.k==='royal'){
  m=sky('#0f0a2e','#2e1065','#4c1d95')+stars(36,3,50)+glow(175,52,70,'#fcd34d',.35)
   +[30,70,250,290].map(x=>`<rect x="${x}" y="30" width="12" height="70" fill="#2a1a6b"/><rect x="${x+8}" y="30" width="4" height="70" fill="#1a0f4a"/><rect x="${x-3}" y="26" width="18" height="5" fill="#3b2a8a"/><rect x="${x-3}" y="96" width="18" height="5" fill="#3b2a8a"/><path d="M${x+3} 34v62" stroke="#fcd34d" stroke-width=".5" opacity=".35"/>`).join('')
   +`<path d="M95 0Q110 50 100 104H90Q100 50 82 0Z" fill="#7f1d1d"/><path d="M225 0Q210 50 220 104H230Q220 50 238 0Z" fill="#7f1d1d"/><path d="M92 0Q104 50 96 104" stroke="#b91c1c" stroke-width="1" fill="none"/><path d="M228 0Q216 50 224 104" stroke="#b91c1c" stroke-width="1" fill="none"/>`
   +`<path d="M140 110L156 80H194L210 110Z" fill="#991b1b"/><path d="M156 80h38M150 92h50" stroke="#fcd34d" stroke-width=".8" opacity=".7"/>`
   +`<path d="M156 80V40q19-16 38 0V80Z" fill="#6d28d9"/><path d="M160 78V44q15-12 30 0V78Z" fill="#8b5cf6"/><path d="M160 60h30" stroke="#c4b5fd" stroke-width=".6"/>`
   +`<rect x="152" y="62" width="8" height="20" rx="2" fill="#fbbf24"/><rect x="190" y="62" width="8" height="20" rx="2" fill="#fbbf24"/><rect x="156" y="74" width="38" height="6" fill="#f59e0b"/>`
   +`<path d="M163 34l5 6 7-10 7 10 5-6v8h-24Z" fill="#fcd34d"/><circle cx="175" cy="28" r="2.2" fill="#f43f5e"/><circle cx="168" cy="36" r="1.2" fill="#38bdf8"/><circle cx="182" cy="36" r="1.2" fill="#38bdf8"/>`
   +`<path d="M0 110V104H320V110Z" fill="#1e1b4b"/>`+motes(5,10,'#fde68a',20,90);
 }
 if(z.k==='endless'){
  m=sky('#010d0b','#062e2a','#0f766e')+stars(80,11,110)+glow(200,56,80,'#2dd4bf',.35)
   +`<g transform="rotate(-12 200 56)"><ellipse cx="200" cy="56" rx="86" ry="22" fill="none" stroke="#5eead4" stroke-width="1" opacity=".35"/><ellipse cx="200" cy="56" rx="64" ry="15" fill="none" stroke="#99f6e4" stroke-width="1.6" opacity=".55" stroke-dasharray="6 4"/><ellipse cx="200" cy="56" rx="42" ry="9" fill="none" stroke="#ccfbf1" stroke-width="1.2" opacity=".8"/></g>`
   +glow(200,56,22,'#ccfbf1',.9)+`<circle cx="200" cy="56" r="7" fill="#f0fdfa"/>`
   +[0,1,2,3,4,5].map(i=>{const x=40+i*24,y=96-i*11,w=22-i*1.5;return `<g opacity="${1-i*.12}"><path d="M${x} ${y}h${w}l-2 4h${-w+4}Z" fill="#115e59"/><path d="M${x} ${y}h${w}" stroke="#5eead4" stroke-width=".7"/><path d="M${x+3} ${y+4}l${(w-6)/2} 8l${(w-6)/2} -8" fill="#0b3d3a" opacity=".8"/></g>`}).join('');
 }
 return `<svg viewBox="0 0 320 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${z.name}">${m}${vignette()}</svg>`;
}


if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(OUT, { recursive: true })
  const keepSvg = process.argv.includes('--svg')
  for (const k of ZONE_KEYS) {
    const svg = zoneSVG({ k, name: k }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="220" ')
    if (keepSvg) writeFileSync(join(OUT, `${k}.svg`), svg)
    await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(join(OUT, `${k}.webp`))
    console.log('✓', k)
  }
}
