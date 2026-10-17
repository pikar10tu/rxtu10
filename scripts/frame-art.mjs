// ════════════════════════════════════════════════════════════
//  กรอบรูปลายวาด (fa-*) 24 แบบ — วาด SVG ด้วยโค้ด → WebP ที่ public/cosmetics/frames/<id>.webp (384×384)
//  user เคาะจากเดโม 18 ต.ค. 2026: https://claude.ai/artifact/9Qi2qXWjMJV91RvRVsPEdE
//  เรขาคณิต: viewBox ดั้งเดิม 0–200 รูปโปรไฟล์ r=66 กลาง (100,100) · export เผื่อขอบ 20 ทุกด้าน (−20…220)
//    ⇒ ในไฟล์ รูปกินเส้นผ่านศูนย์กลาง 132/240 = 55% · CosFrame วางภาพใหญ่ 240/132 ≈ 1.818 เท่าของรูป
//  เลเยอร์: ชั้นหลังวง (หู ปีก กลีบ) ถูกเจาะรูตรงรูปเสมอ (paint) · ชั้นหน้าวงห้ามล้นเข้ารูป
//  id ในโค้ดวาดยังเป็น f-* (ตามเดโม) → ไฟล์/แคตตาล็อกใช้ fa-* เพราะ f-grad f-clover ฯลฯ มีอยู่แล้วในร้าน
//  WebP ไม่ใช่ SVG เหตุผลเดียวกับ tower-art.mjs (iPhone raster SVG ใหม่ทุกเฟรม)
//  รัน: node scripts/frame-art.mjs   (--svg เขียน .svg ไว้ดูด้วย)
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cosmetics', 'frames')

// ── กรอบรูป v2 · สีสด สไตล์สติกเกอร์ ──
// เลเยอร์ทุกชิ้น: back (โผล่จากหลังวง: หู ปีก กลีบ ใบไม้) → ring → front (วางทับวง: ของชิ้นหลัก มีเส้นขอบ)
// วง r=74 คลุม 66–82 พอดีขอบรูป (รูป r=66) · ของทุกชิ้นอยู่ใน viewBox 0–200
const C=100, R=74;
const f1=v=>(+v).toFixed(1);
const pt=(deg,r)=>[C+r*Math.sin(deg*Math.PI/180), C-r*Math.cos(deg*Math.PI/180)];
const T=(x,y,a=0,k=1)=>`transform="translate(${f1(x)} ${f1(y)}) rotate(${a}) scale(${k})"`;
const SW=2.6;
const ol=o=>o?`stroke="${o}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`:'';
// หยดน้ำ/ใบไม้/ขนนก ปลายแหลมชี้ไปทาง a
const drop=(x,y,L,w,a,fill,o='')=>`<path ${T(x,y,a)} d="M0,${-L} C${w},${-L*.45} ${w},${w*.6} 0,${w*.6} C${-w},${w*.6} ${-w},${-L*.45} 0,${-L}Z" fill="${fill}" ${ol(o)}/>`;
// วงหลัก: ขอบเข้ม + แถบสี + ไฮไลต์โค้งซ้ายบน + ประกายจุด
const ring=(c,o,hi,extra='')=>`<circle cx="100" cy="100" r="${R}" fill="none" stroke="${o}" stroke-width="17"/>`
 +`<circle cx="100" cy="100" r="${R}" fill="none" stroke="${c}" stroke-width="11.5"/>`
 +arc(R+1.5,-70,-20,hi,3.2)+`<circle cx="${f1(pt(-8,R+1.5)[0])}" cy="${f1(pt(-8,R+1.5)[1])}" r="1.8" fill="${hi}"/>`+extra;
const arc=(r,a1,a2,c,w,cap='round')=>{const[x1,y1]=pt(a1,r),[x2,y2]=pt(a2,r);return `<path d="M${f1(x1)},${f1(y1)} A${r},${r} 0 ${Math.abs(a2-a1)>180?1:0} 1 ${f1(x2)},${f1(y2)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="${cap}"/>`;};
const onRing=(a1,a2,step,fn)=>{let s='';for(let a=a1;a<=a2+.01;a+=step){const[x,y]=pt(a,R);s+=fn(x,y,a);}return s;};
const star=(x,y,r,fill,o='',a=0)=>{let p=[];for(let i=0;i<10;i++){const rr=i%2?r*.48:r;const t=(i*36+a)*Math.PI/180;p.push(f1(x+rr*Math.sin(t))+','+f1(y-rr*Math.cos(t)));}return `<polygon points="${p.join(' ')}" fill="${fill}" ${ol(o)}/>`;};
const spark=(x,y,k,fill)=>`<path ${T(x,y,0,k)} d="M0,-10 Q1.4,-1.4 10,0 Q1.4,1.4 0,10 Q-1.4,1.4 -10,0 Q-1.4,-1.4 0,-10Z" fill="${fill}"/>`;
const heart=(x,y,k,fill,o='',a=0)=>`<path ${T(x,y,a,k)} d="M0,8 C-13,-1 -7,-13 0,-6 C7,-13 13,-1 0,8Z" fill="${fill}" ${ol(o)}/>`;
const flower=(x,y,r,fill,mid,o='',a=0)=>{let s='';for(let i=0;i<5;i++)s+=`<path transform="rotate(${i*72})" d="M0,0 C${-r*.75},${-r*.35} ${-r*.55},${-r*1.05} ${-r*.12},${-r*.95} L0,${-r*.78} L${r*.12},${-r*.95} C${r*.55},${-r*1.05} ${r*.75},${-r*.35} 0,0Z" fill="${fill}" ${ol(o)}/>`;return `<g ${T(x,y,a)}>${s}<circle r="${r*.24}" fill="${mid}"/></g>`;};
const dot=(x,y,r,fill,o='')=>`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${fill}" ${ol(o)}/>`;
const cap=(x,y,L,w,a,c1,c2,o)=>`<g ${T(x,y,a)}><rect x="${-L/2}" y="${-w/2}" width="${L}" height="${w}" rx="${w/2}" fill="${c2}" ${ol(o)}/><path d="M0,${-w/2+1.3} H${L/2-w/2} a${w/2-1.3},${w/2-1.3} 0 0 1 0,${w-2.6} H0Z" fill="${c1}"/><rect x="${-L/2+w*.35}" y="${-w/2+2.2}" width="${L*.3}" height="2" rx="1" fill="#fff" opacity=".8"/></g>`;
const tablet=(x,y,r,fill,o,a=0)=>`<g ${T(x,y,a)}><circle r="${r}" fill="${fill}" ${ol(o)}/><circle cx="${-r*.3}" cy="${-r*.3}" r="${r*.25}" fill="#fff" opacity=".9"/></g>`;
const hex=(x,y,r,o,fill)=>{let p=[];for(let i=0;i<6;i++){const t=(i*60+30)*Math.PI/180;p.push(f1(x+r*Math.cos(t))+','+f1(y+r*Math.sin(t)));}return `<polygon points="${p.join(' ')}" fill="${fill}" ${ol(o)}/><circle cx="${x}" cy="${y}" r="${r*.48}" fill="none" stroke="${o}" stroke-width="2.2"/>`;};
const hexV=(x,y,r,i)=>{const t=(i*60+30)*Math.PI/180;return [x+r*Math.cos(t),y+r*Math.sin(t)];};
const cloud=(x,y,k,fill,o,face)=>`<g ${T(x,y,0,k)}><path d="M-28,12 C-40,12 -40,-6 -26,-6 C-26,-22 -4,-26 2,-12 C8,-24 30,-20 26,-4 C40,-4 40,12 28,12Z" fill="${fill}" ${ol(o)}/>${face?`<path d="M-10,0 q3,3 6,0 M6,0 q3,3 6,0" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/><ellipse cx="-14" cy="5" rx="3.5" ry="2" fill="#ff8fb8"/><ellipse cx="16" cy="5" rx="3.5" ry="2" fill="#ff8fb8"/>`:''}</g>`;


const blush=(c='#ff7eb6')=>[-1,1].map(sd=>`<ellipse cx="${100+sd*R}" cy="118" rx="9" ry="5.5" fill="${c}" opacity=".85"/><ellipse cx="${100+sd*R-2}" cy="116.5" rx="2.4" ry="1.4" fill="#fff" opacity=".8"/>`).join('');
const whisk=(o)=>[-1,1].map(sd=>[-8,0,8].map(dy=>{const x1=100+sd*(R+7),x2=100+sd*(R+20);return `<path d="M${x1},${104+dy*.6} Q${(x1+x2)/2},${100+dy} ${x2},${102+dy*1.5}" fill="none" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/>`;}).join('')).join('');
// เชื่อมก้อนเข้ากับวงแบบไร้รอยต่อ: วาดก้อนมีขอบไว้หลังวง แล้วถมสีทับรอยต่อ + วาดขอบในวงคืน
let _mg=0;
const mergeShape=(shape,fill,o)=>({back:shape(`fill="${fill}" stroke="${o}" stroke-width="${SW*2.2}" stroke-linejoin="round"`),
  front:`<defs><mask id="mg${++_mg}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/><circle cx="100" cy="100" r="66" fill="#000"/></mask></defs><g mask="url(#mg${_mg})">${shape(`fill="${fill}"`)}</g><circle cx="100" cy="100" r="66.9" fill="none" stroke="${o}" stroke-width="2.8"/>`});
const merge=(bumps,fill,o)=>({back:bumps.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${o}" stroke-width="${SW*2.2}"/>`).join(''),
  front:`<defs><mask id="mg${++_mg}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/><circle cx="100" cy="100" r="66" fill="#000"/></mask></defs><g mask="url(#mg${_mg})">`+bumps.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join('')+'</g>'+`<circle cx="100" cy="100" r="66.9" fill="none" stroke="${o}" stroke-width="2.8"/>`});
const FRAMES=[
 // ═══ เภสัช ═══
 {id:'f-alchemist',name:'เภสัชแปรธาตุ',tier:'ตำนาน',group:'rx',idea:'วงมรกตหมุดทอง เถาใบไม้เลื้อยครึ่งซ้าย แคปซูลชมพูบนขวา ขวดโพชันฟองปุดล่างขวา',
  svg:()=>{const o='#0a5c4c';let b='';
   for(let a=196;a<=336;a+=14){const[x,y]=pt(a,R+9);b+=drop(x,y,14,6.5,a+(a%28?38:-38),a%28?'#2fd38a':'#16b36e',o);}
   const f=onRing(30,150,30,(x,y)=>dot(x,y,2.4,'#ffd23f'))
    +cap(...pt(28,R+8),40,17,-30,'#ff3d8b','#ffffff',o)
    +`<g ${T(158,162,8)}><rect x="-6" y="-30" width="12" height="14" rx="2" fill="#e8f4ff" ${ol(o)}/><rect x="-9" y="-35" width="18" height="7" rx="3" fill="#c98a4b" ${ol(o)}/><circle r="17" fill="#e8f4ff" ${ol(o)}/><path d="M-15.5,2 A16,16 0 0 0 15.5,2 Q8,-3 0,2 Q-8,7 -15.5,2Z" fill="#b14dff"/><circle cx="-6" cy="-6" r="3.5" fill="#fff"/></g>`
    +dot(170,128,3.5,'#d9a3ff',o)+dot(178,116,2.4,'#d9a3ff')+spark(32,44,1,'#ffd23f')+spark(186,74,.6,'#ffd23f');
   return b+ring('#19c39a',o,'#c8fff0')+f;}},
 {id:'f-pills',name:'กองยาเม็ด',tier:'น่ารัก',group:'rx',idea:'วงฟ้าลายกากบาทขาว กองแคปซูลกับยาเม็ดมุมขวาล่าง แคปซูลจิ๋วบนซ้าย',
  svg:()=>{const o='#0f3f8f';
   const f=onRing(0,330,30,(x,y,a)=>`<path ${T(x,y,a)} d="M-3,0 H3 M0,-3 V3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`)
    +cap(150,176,34,14,-55,'#ff3d8b','#fff',o)+cap(172,154,32,13,-15,'#ffb81c','#fff',o)+tablet(184,180,9,'#ffffff',o)+tablet(132,190,7,'#7cf0c8',o,30)+cap(176,128,24,10,30,'#2fd38a','#fff',o)
    +cap(36,38,26,11,40,'#b14dff','#fff',o)+spark(60,20,.6,'#ffb81c')+spark(20,140,.55,'#2f8cff');
   return ring('#2f8cff',o,'#d6e8ff')+f;}},
 {id:'f-mortar',name:'ครกบดสมุนไพร',tier:'เด่น',group:'rx',idea:'วงไม้โอ๊ก ครกกับสากทับขอบล่าง ช่อใบสมุนไพรงอกจากหลังวงสองฝั่ง',
  svg:()=>{const o='#5a2e0c';let b='';
   for(const[a,l]of[[198,26],[214,21],[230,16],[184,15]]){const[x,y]=pt(a,R+6);b+=drop(x,y,l,9,a,'#2fbf4f',o);}
   for(const[a,l]of[[38,24],[54,18],[22,16]]){const[x,y]=pt(a,R+6);b+=drop(x,y,l,9,a,'#16a34a',o);}
   const f=`<g ${T(100,178)}><rect x="8" y="-46" width="11" height="44" rx="5.5" fill="#d9a066" ${ol(o)} transform="rotate(28)"/><path d="M-34,-8 H34 Q32,20 0,20 Q-32,20 -34,-8Z" fill="#f2e2cc" ${ol(o)}/><ellipse cy="-8" rx="34" ry="7" fill="#fff6ea" ${ol(o)}/><ellipse cy="-8" rx="24" ry="3.6" fill="#2fbf4f"/><path d="M-22,6 Q0,12 22,6" fill="none" stroke="#d9c2a2" stroke-width="2.4" stroke-linecap="round"/></g>`
    +spark(64,160,.5,'#2fbf4f')+spark(140,154,.45,'#2fbf4f')+dot(150,26,3,'#ffd23f');
   return b+ring('#d9822b',o,'#ffe2b8')+f;}},
 {id:'f-stetho',name:'หูฟังแพทย์',tier:'เด่น',group:'rx',idea:'หูฟังคล้องคอวงพาดหลังด้านบน หัวฟังทับขอบขวาล่าง หัวใจกับเส้นชีพจรฝั่งซ้าย',
  svg:()=>{const o='#06505e';const[ax,ay]=pt(-58,R+14),[bx,by]=pt(58,R+14);
   const b=arc(R+14,-58,58,o,8)+arc(R+14,-58,58,'#5ad7ff',4)+dot(ax,ay,6.5,'#2a3550',o)+dot(bx,by,6.5,'#2a3550',o);
   const[tx,ty]=pt(100,R);
   const f=`<path d="M${f1(tx)},${f1(ty)} C196,128 192,166 168,172" fill="none" stroke="${o}" stroke-width="8" stroke-linecap="round"/><path d="M${f1(tx)},${f1(ty)} C196,128 192,166 168,172" fill="none" stroke="#5ad7ff" stroke-width="4" stroke-linecap="round"/>`
    +`<g ${T(160,176)}><circle r="16" fill="#dfe7f2" ${ol(o)}/><circle r="10" fill="#9fb3cc" ${ol(o)}/><circle cx="-3" cy="-3" r="3" fill="#fff"/></g>`
    +heart(30,140,1.6,'#ff3355',o,-12)+`<path d="M12,172 H30 L36,160 L44,186 L50,172 H64" fill="none" stroke="#ff3355" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
   return b+ring('#12b5c9',o,'#c8f7ff')+f;}},
 {id:'f-molecule',name:'วงเบนซีน',tier:'เด่น',group:'rx',idea:'วงมิ้นต์สด วงแหวนเบนซีนสองวงเชื่อมกันบนขวา อะตอมสีลูกกวาดต่อพันธะ',
  svg:()=>{const o='#0b5c4a';
   const b=`<line x1="${f1(pt(40,R)[0])}" y1="${f1(pt(40,R)[1])}" x2="154" y2="42" stroke="${o}" stroke-width="3.5"/><line x1="${f1(pt(225,R)[0])}" y1="${f1(pt(225,R)[1])}" x2="34" y2="168" stroke="${o}" stroke-width="3.5"/>`;
   let f=hex(158,38,17,o,'#ffffff')+hex(158+29.4,38+17,17,o,'#ffffff');
   const v=[hexV(158,38,17,4),hexV(187.4,55,17,0),hexV(187.4,55,17,1)];const cs=['#ff3d8b','#ffb81c','#2f8cff'];
   v.forEach((p,i)=>f+=dot(p[0],p[1],5.5,cs[i],o));
   f+=hex(32,170,14,o,'#ffffff')+dot(...hexV(32,170,14,2),5,'#b14dff',o)+dot(...hexV(32,170,14,1),4.5,'#ffb81c',o)+spark(30,44,.7,'#1fcf9a')+spark(176,150,.6,'#ffb81c');
   return b+ring('#1fcf9a',o,'#c8fff0')+f;}},
 {id:'f-grad',name:'หมวกรับปริญญา',tier:'ตำนาน',group:'rx',idea:'วงน้ำเงินราชสีห์เส้นทอง ช่อลอเรลทองโอบครึ่งล่าง หมวกปริญญาเอียงบนหัว ม้วนใบปริญญาผูกโบว์',
  svg:()=>{const o='#101a5c';let b='';
   for(let a=112;a<=168;a+=11){const[x,y]=pt(a,R+9);b+=drop(x,y,13,5.5,a+60,'#ffc21f',o);}
   for(let a=192;a<=248;a+=11){const[x,y]=pt(a,R+9);b+=drop(x,y,13,5.5,a-60,'#ffc21f',o);}
   const f=`<g ${T(104,24,-10)}><path d="M-24,2 V18 Q0,30 24,18 V2Z" fill="#1d2a7a" ${ol(o)}/><polygon points="-46,0 0,-17 46,0 0,17" fill="#2d3fa8" ${ol(o)}/><circle r="3.5" fill="#ffd23f" ${ol(o)}/><path d="M0,0 Q32,2 36,22" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><path d="M31,21 h10 l-2,14 h-6Z" fill="#ffd23f" ${ol(o)}/></g>`
    +`<g ${T(100,184)}><circle cx="-6" cy="0" r="6" fill="#ff3355" ${ol(o)}/><circle cx="6" cy="0" r="6" fill="#ff3355" ${ol(o)}/><circle r="3.5" fill="#ff5c77" ${ol(o)}/></g>`
    +star(26,52,9,'#ffd23f',o)+star(176,58,6,'#ffd23f',o)+spark(182,120,.6,'#ffd23f');
   return b+ring('#2d4bd8',o,'#cfd8ff',`<circle cx="100" cy="100" r="${R}" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>`)+f;}},

 // ═══ สัตว์ ═══
 {id:'f-catsakura',name:'แมวซากุระ',tier:'น่ารัก',group:'animal',idea:'หูแมวชมพูโผล่หลังวง กระดิ่งทองที่คอ ช่อซากุระสามดอกซ้ายล่าง กลีบปลิวขวา',
  svg:()=>{const o='#9e1250';
   const C1='#ff4f9a';const earP=(sd,a)=>`<path ${T(100+sd*45,31,sd*24)} d="M-32,26 Q-20,-4 -6,-24 Q0,-31 6,-24 Q20,-4 32,26Z" ${a}/>`;
   const m=mergeShape(a=>earP(-1,a)+earP(1,a),C1,o);
   const inner=[-1,1].map(sd=>`<path ${T(100+sd*45,31,sd*24)} d="M-16,12 Q-8,-4 -2,-13 Q0,-16 2,-13 Q8,-4 16,12 Q0,8 -16,12Z" fill="#ffc2dc"/>`).join('');
   const b=m.back;
   const f=`<g ${T(100,R+100-2)}><circle r="10" fill="#ffd23f" ${ol(o)}/><path d="M-10,-1 H10" stroke="${o}" stroke-width="2"/><circle cy="4" r="2.4" fill="${o}"/><circle cx="-4" cy="-5" r="2" fill="#fff8c4"/></g>`
    +flower(36,150,17,'#ffd0e4','#ff4f9a',o,10)+flower(58,176,12,'#ffffff','#ff4f9a',o,-20)+flower(22,124,9,'#ff8fc0','#fff',o)
    +drop(176,150,7,4.5,130,'#ff8fc0',o)+heart(184,70,.8,'#ff4f9a',o,15);
   return b+ring(C1,o,'#ffd6ea')+m.front+inner+blush('#ffb3d6')+whisk(o)+f;}},
 {id:'f-bunny',name:'กระต่ายหูตั้ง',tier:'น่ารัก',group:'animal',idea:'หูกระต่ายกว้างตั้งเป็นตัววีเชื่อมกับวง ด้านในชมพู โบว์กลางหัว แก้มชมพู แครอทล่างขวา',
  svg:()=>{const o='#4a1f8f',C1='#a46bff';
   const m=mergeShape(a=>`<ellipse ${T(70,20,-16)} rx="18" ry="36" ${a}/><ellipse ${T(130,20,16)} rx="18" ry="36" ${a}/>`,C1,o);const inner=`<ellipse ${T(69,14,-16)} rx="8.5" ry="24" fill="#ffb3d9"/><ellipse ${T(131,14,16)} rx="8.5" ry="24" fill="#ffb3d9"/>`;const b=m.back;
   const f=`<g ${T(101,30,0,.75)}><path d="M0,0 L-18,-10 Q-22,0 -18,10Z M0,0 L18,-10 Q22,0 18,10Z" fill="#ff4fb8" ${ol(o)}/><circle r="5.5" fill="#ff7ccc" ${ol(o)}/></g>`
    +`<g ${T(166,164,35)}><path d="M-9,-16 Q0,-20 9,-16 L2,22 Q0,26 -2,22Z" fill="#ff8a1a" ${ol(o)}/><path d="M-6,-6 h5 M-4,4 h5" stroke="${o}" stroke-width="1.8" stroke-linecap="round"/>${drop(-4,-18,12,4.5,-25,'#2fbf4f',o)}${drop(4,-18,12,4.5,25,'#2fbf4f',o)}</g>`
    +flower(136,184,9,'#fff07a','#ff8a1a',o)+heart(28,150,.8,'#ff4fb8',o,-15);
   return b+ring(C1,o,'#e6d6ff')+m.front+inner+blush('#ff8fd0')+f;}},
   {id:'f-bear',name:'หมีน้ำผึ้ง',tier:'น่ารัก',group:'animal',idea:'หูหมีกลมหลังวง โหลน้ำผึ้งเยิ้มทับขอบขวาล่าง ผึ้งตัวจิ๋วบินซ้ายบน รอยเท้า',
  svg:()=>{const o='#5a2a0e';const m=merge([[48,40,25],[152,40,25]],'#c9733a',o);let b=m.back;const inner=[48,152].map(x=>`<circle cx="${x}" cy="38" r="13.5" fill="#ffcf9e"/>`).join('');
   const f=`<g ${T(162,164,6)}><path d="M-17,-12 H17 Q22,8 14,22 H-14 Q-22,8 -17,-12Z" fill="#ffb81c" ${ol(o)}/><rect x="-19" y="-20" width="38" height="9" rx="3" fill="#c9733a" ${ol(o)}/><path d="M-17,-12 Q-10,-2 -6,-12 Q0,2 6,-12 Q12,-4 17,-12" fill="#ffd96b"/><path d="M-6,-12 V2 A3,3 0 0 0 0,2 V-12" fill="#ffd96b" stroke="#5a2a0e" stroke-width="2"/><circle cx="-8" cy="10" r="3" fill="#fff4c4"/></g>`
    +`<g ${T(100,12,-10)}><ellipse rx="9" ry="7" fill="#ffd23f" ${ol(o)}/><path d="M-3,-6 v12 M3,-6 v12" stroke="${o}" stroke-width="2.4"/><ellipse cx="-3" cy="-10" rx="5" ry="4" fill="#e6f6ff" ${ol(o)}/><ellipse cx="4" cy="-10" rx="5" ry="4" fill="#e6f6ff" ${ol(o)}/></g>`
    
    +paw(34,160,.8,'#8a4a20');
   return b+ring('#c9733a',o,'#ffe0c2')+m.front+inner+blush('#ff8a8a')+f;}},
 {id:'f-frog',name:'กบน้อยบึงบัว',tier:'น่ารัก',group:'animal',idea:'ตากบโตสองข้างเป็นเนื้อเดียวกับวง แก้มชมพู ยิ้มกว้างใต้วง ใบบัวกับดอกบัวล่างขวา',
  svg:()=>{const o='#14602a',G='#3ccf4e';const m=merge([[62,28,21],[138,28,21]],G,o);
   let eyes='';for(const x of[62,138])eyes+=`<circle cx="${x}" cy="25" r="12.5" fill="#fff" ${ol(o)}/><circle cx="${x+(x<100?2:-2)}" cy="26" r="7.5" fill="#1d2433"/><circle cx="${x+(x<100?4.5:0.5)}" cy="22.5" r="2.8" fill="#fff"/><circle cx="${x+(x<100?-1:-4)}" cy="29" r="1.3" fill="#fff"/>`;
   const f=blush('#ff6fa8')+arc(R+10,160,200,o,3)
    +`<g ${T(162,176,-10)}><path d="M0,0 L28,-8 A28,28 0 1 1 22,-17Z" fill="#2fbf4f" ${ol(o)}/><path d="M0,0 L-18,-14 M0,0 L-20,10 M0,0 L8,22" stroke="#1f9a3a" stroke-width="2" stroke-linecap="round"/></g>`
    +flower(152,168,12,'#ff8fc0','#ffd23f',o)+drop(30,160,9,5,180,'#5ad7ff',o)+drop(44,176,7,4,180,'#5ad7ff',o);
   return m.back+ring(G,o,'#d4ffd8')+m.front+arc(R+1.5,-48,-30,'#d4ffd8',3)+arc(R+1.5,30,48,'#d4ffd8',3)+eyes+f;}},
 {id:'f-chick',name:'ลูกเจี๊ยบเกาะวง',tier:'น่ารัก',group:'animal',idea:'วงเหลืองทอง ลูกเจี๊ยบนั่งบนวงขวาบน เปลือกไข่แตกทับขอบซ้ายล่าง ขนนกจิ๋วปลิว',
  svg:()=>{const o='#9a5200';
   const f=`<g ${T(138,24,8)}><ellipse rx="21" ry="19" fill="#ffd23f" ${ol(o)}/><path d="M-2,-19 q4,-8 8,0 M3,-19 q5,-7 9,1" fill="none" stroke="${o}" stroke-width="2.2" stroke-linecap="round"/><circle cx="7" cy="-4" r="3" fill="#1d2433"/><circle cx="8" cy="-5" r="1" fill="#fff"/><path d="M17,-2 L27,2 L17,6Z" fill="#ff8a1a" ${ol(o)}/><ellipse cx="11" cy="7" rx="4" ry="2.4" fill="#ff8fb8"/><path d="M-14,2 Q-6,14 4,6" fill="#ffc21f" ${ol(o)}/></g>`
    +`<g ${T(36,162,-8)}><path d="M-20,-4 L-12,-14 L-4,-4 L4,-16 L12,-4 L20,-12 L20,4 Q20,22 0,22 Q-20,22 -20,4Z" fill="#fffaf0" ${ol(o)}/><path d="M-12,8 l4,4" stroke="#e8c88a" stroke-width="2"/></g>`
    +drop(64,26,9,4,-50,'#fff07a',o)+drop(184,80,8,3.5,70,'#fff07a',o)+heart(176,150,.8,'#ff6fa8',o,10);
   return ring('#ffc21f',o,'#fff6c4')+f;}},

 // ═══ ของกิน ═══
 {id:'f-boba',name:'ชานมไข่มุก',tier:'น่ารัก',group:'food',idea:'วงชานมคาราเมล ไข่มุกเรียงครึ่งล่างบนวง แก้วชานมหลอดชมพูทับขอบขวาล่าง',
  svg:()=>{const o='#5a2a0e';
   const f=onRing(118,242,15.5,(x,y)=>dot(x,y,5.6,'#3d2016')+dot(x-1.8,y-1.8,1.6,'#9a6a52'))
    +`<g ${T(166,150,10)}><rect x="3" y="-52" width="7" height="30" rx="3.5" fill="#ff3d8b" ${ol(o)}/><path d="M-18,-22 H18 L14,24 Q13,28 9,28 H-9 Q-13,28 -14,24Z" fill="#fff4e0" ${ol(o)}/><path d="M-16.5,-4 H16.5 L14,24 Q13,28 9,28 H-9 Q-13,28 -14,24Z" fill="#e8a65c"/><rect x="-22" y="-28" width="44" height="8" rx="4" fill="#ffffff" ${ol(o)}/>${[[-7,18],[2,21],[9,14],[-3,10]].map(([x,y])=>dot(x,y,3.6,'#3d2016')).join('')}<path d="M-10,-14 v10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>`
    +heart(34,40,1.1,'#ff3d8b',o,-15)+dot(54,22,4,'#3d2016')+dot(62,32,3,'#3d2016')+spark(180,90,.6,'#ffb81c');
   return ring('#e89a3c',o,'#ffe1b0')+f;}},
 {id:'f-strawberry',name:'สตรอว์เบอร์รี',tier:'น่ารัก',group:'food',idea:'วงแดงสตรอว์เบอร์รีเมล็ดทอง กลีบเลี้ยงเขียวแฉกเป็นมงกุฎหลังวงด้านบน ลูกเล็กกับดอกขาวล่างขวา',
  svg:()=>{const o='#8a0a24';let b='';
   for(let a=-60;a<=60;a+=20){const[x,y]=pt(a,R+6);b+=drop(x,y,a===0?22:17,8,a,a%40?'#22b04a':'#2fd35a',o);}
   const f=onRing(0,350,15,(x,y,a)=>`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="1.6" ry="2.8" fill="#ffe14d" transform="rotate(${a} ${f1(x)} ${f1(y)})"/>`)
    +`<g ${T(164,164,18)}><path d="M-16,-10 Q0,-16 16,-10 Q14,14 0,22 Q-14,14 -16,-10Z" fill="#ff3355" ${ol(o)}/>${drop(-6,-12,9,4,-40,'#2fd35a',o)}${drop(6,-12,9,4,40,'#2fd35a',o)}${drop(0,-13,9,4,0,'#22b04a',o)}${[[-6,0],[5,3],[-1,10],[8,-5]].map(([x,y])=>dot(x,y,1.4,'#ffe14d')).join('')}</g>`
    +flower(134,184,10,'#ffffff','#ffd23f',o)+flower(30,150,8,'#ffffff','#ffd23f',o)+spark(26,60,.6,'#ff3355');
   return b+ring('#ff3355',o,'#ffd0d8')+f;}},
 {id:'f-melon',name:'แตงโมหน้าร้อน',tier:'น่ารัก',group:'food',idea:'วงเนื้อแตงโมแดงเมล็ดดำ เปลือกเขียวลายเข้มด้านนอก ชิ้นแตงโมทับขอบขวาล่าง',
  svg:()=>{const o='#0f5a22';
   const rind=`<circle cx="100" cy="100" r="${R+8}" fill="none" stroke="${o}" stroke-width="8"/><circle cx="100" cy="100" r="${R+8}" fill="none" stroke="#2fbf4f" stroke-width="5"/>`+onRing(0,345,15,(x,y,a)=>{const[p,q]=pt(a,R+8);return `<path ${T(p,q,a)} d="M-1.5,-2.5 Q2,0 -1.5,2.5" fill="none" stroke="${o}" stroke-width="2"/>`;})
    +`<circle cx="100" cy="100" r="${R+3.5}" fill="none" stroke="#f2ffe6" stroke-width="3"/>`;
   const band=`<circle cx="100" cy="100" r="${R-2}" fill="none" stroke="#1d2433" stroke-width="12"/><circle cx="100" cy="100" r="${R-2}" fill="none" stroke="#ff3d5e" stroke-width="10"/>`+arc(R-1,-70,-20,'#ffc2cc',3)
    +onRing(10,350,30,(x,y,a)=>{const[p,q]=pt(a,R-2);return drop(p,q,4.5,2.4,a+180,'#1d2433');});
   const f=`<g ${T(164,166,-20)}><path d="M-24,-6 A24,24 0 0 0 24,-6Z" fill="#ff3d5e" ${ol(o)}/><path d="M-24,-6 A24,24 0 0 0 24,-6" fill="none" stroke="#2fbf4f" stroke-width="4"/>${[[-8,2],[0,6],[8,2]].map(([x,y])=>drop(x,y,3.5,2,180,'#1d2433')).join('')}</g>`+spark(30,46,.7,'#ffd23f')+spark(176,46,.5,'#2fbf4f');
   return rind+band+f;}},
 {id:'f-icecream',name:'ไอศกรีมเยิ้ม',tier:'น่ารัก',group:'food',idea:'วงมิ้นต์ ครีมชมพูเยิ้มไหลจากบนวง เม็ดสีโรยทั่ว ไอศกรีมสองลูกเชอร์รี่ทับขอบขวาล่าง',
  svg:()=>{const o='#0b5c58';
   let drip=arc(R,-78,78,o,17,'round')+arc(R,-78,78,'#ff6fb5',11.5,'round');
   for(const a of[-58,-30,22,50,70]){const[x,y]=pt(a,R+2);drip+=`<path ${T(x,y,0)} d="M-4.5,0 V${a%4?11:7} A4.5,4.5 0 0 0 4.5,${a%4?11:7} V0Z" fill="#ff6fb5" ${ol(o)}/><rect x="-4" y="-3" width="8" height="5" fill="#ff6fb5" transform="translate(${f1(x)} ${f1(y)})"/>`;}
   drip+=arc(R+1.5,-60,-25,'#ffd0ea',3);
   const sp=['#ffd23f','#2f8cff','#b14dff','#ffffff','#ff3355'];
   const f=onRing(95,265,17,(x,y,a)=>`<rect x="${f1(x-3.5)}" y="${f1(y-1.5)}" width="7" height="3" rx="1.5" fill="${sp[(a/17|0)%5]}" transform="rotate(${a*2.7} ${f1(x)} ${f1(y)})"/>`)
    +`<g ${T(166,158,16)}><path d="M-14,4 L0,38 L14,4Z" fill="#f2b45c" ${ol(o)}/><path d="M-8,10 L6,24 M-2,6 L9,16 M6,6 L-4,26" stroke="#c9803a" stroke-width="1.6"/><circle cy="-4" r="14" fill="#ff8fc8" ${ol(o)}/><circle cy="-22" r="12" fill="#7cf0e0" ${ol(o)}/><circle cx="2" cy="-36" r="4.5" fill="#ff3355" ${ol(o)}/><path d="M3,-40 q3,-6 8,-6" fill="none" stroke="${o}" stroke-width="1.8"/></g>`;
   return ring('#23d6c6',o,'#c8fff8')+drip+f;}},

 // ═══ ธรรมชาติ ═══
 {id:'f-clover',name:'โคลเวอร์นำโชค',tier:'เด่น',group:'nature',idea:'วงเขียวสดขอบประ ช่อโคลเวอร์สี่แฉกซ้ายบน เต่าทองเกาะวง เหรียญทองนำโชคล่างขวา',
  svg:()=>{const o='#0f5a22';
   const cl=(x,y,r,a)=>{let s='';for(let i=0;i<4;i++)s+=`<path transform="rotate(${i*90+45})" d="M0,0 C${-r*.9},${-r*.3} ${-r*.8},${-r*1.2} 0,${-r*.75} C${r*.8},${-r*1.2} ${r*.9},${-r*.3} 0,0Z" fill="#2fbf4f" ${ol(o)}/>`;return `<g ${T(x,y,a)}><path d="M0,0 Q4,10 2,18" stroke="${o}" stroke-width="2.6" fill="none"/>${s}<circle r="${r*.16}" fill="#c8ffc8"/></g>`;};
   const b=cl(30,38,22,-15)+cl(58,18,13,20);
   const f=`<g ${T(...pt(40,R),35)}><circle cy="-10" r="5.5" fill="#1d2433"/><ellipse rx="11" ry="12" fill="#ff3355" ${ol('#1d2433')}/><line y1="-12" y2="12" stroke="#1d2433" stroke-width="1.8"/><circle cx="-5" cy="-2" r="2.4" fill="#1d2433"/><circle cx="5" cy="3" r="2.4" fill="#1d2433"/><circle cx="-4" cy="7" r="1.8" fill="#1d2433"/></g>`
    +`<g ${T(166,166)}><circle r="16" fill="#ffd23f" ${ol('#9a5200')}/><circle r="11" fill="none" stroke="#ffb81c" stroke-width="2"/>${star(0,0,6.5,'#fff3b0')}</g>`+cl(140,186,10,30)+spark(186,132,.6,'#ffd23f');
   return b+ring('#2fbf4f',o,'#d4ffd8',`<circle cx="100" cy="100" r="${R}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="3 7" stroke-linecap="round"/>`)+f;}},
 {id:'f-sunflower',name:'ทานตะวัน',tier:'เด่น',group:'nature',idea:'กลีบทองสองชั้นแผ่รอบวง ใจกลางน้ำตาลลายเมล็ด ใบเขียวสองใบล่างซ้าย ผึ้งจิ๋ว',
  svg:()=>{const o='#7a3d00';let b='';
   for(let a=0;a<360;a+=20){const[x,y]=pt(a,R+5);b+=drop(x,y,19,8.5,a,'#ffb81c',o);}
   for(let a=10;a<360;a+=20){const[x,y]=pt(a,R+4);b+=drop(x,y,14,7,a,'#ffd23f',o);}
   b+=drop(30,178,20,9,-55,'#2fbf4f','#0f5a22')+drop(52,190,16,7,-20,'#22a046','#0f5a22');
   const band=ring('#8a4a1c',o,'#d9945c')+onRing(0,354,9,(x,y,a)=>{const[p,q]=pt(a,R+((a/9)%2?3:-3));return dot(p,q,1.7,'#3d1d08');});
   const f=`<g ${T(170,40,-15)}><ellipse rx="9" ry="7" fill="#ffd23f" ${ol('#3d1d08')}/><path d="M-3,-6 v12 M3,-6 v12" stroke="#3d1d08" stroke-width="2.4"/><ellipse cx="-2" cy="-10" rx="5" ry="4" fill="#e6f6ff" ${ol('#3d1d08')}/></g>`;
   return b+band+f;}},
 {id:'f-mushroom',name:'เห็ดป่าวิเศษ',tier:'เด่น',group:'nature',idea:'วงส้มอิฐ เห็ดหมวกแดงจุดขาวสองดอกทับขอบซ้ายล่าง หญ้ากับใบไม้หลังวง หิ่งห้อยเรืองแสง',
  svg:()=>{const o='#6b2a0a';let b='';
   for(const[x,a,L]of[[82,-20,14],[90,8,18],[120,-10,12],[126,14,15]])b+=drop(x,186,L,4.5,a,'#2fbf4f','#0f5a22');
   b+=drop(...pt(48,R+8),18,8,48,'#22a046','#0f5a22')+drop(...pt(62,R+8),13,6,80,'#2fd35a','#0f5a22');
   const mush=(x,y,k,cap,dots)=>`<g ${T(x,y,0,k)}><path d="M-9,-2 Q-10,20 -6,22 H6 Q10,20 9,-2Z" fill="#fff4e0" ${ol(o)}/><path d="M-28,2 Q-26,-30 0,-30 Q26,-30 28,2 Q0,8 -28,2Z" fill="${cap}" ${ol(o)}/>${dots}</g>`;
   const f=mush(38,160,1,'#ff3355',dot(-12,-14,4.5,'#fff')+dot(6,-20,3.5,'#fff')+dot(15,-6,3,'#fff')+dot(-2,-4,2.5,'#fff'))
    +mush(68,184,.55,'#b14dff',dot(-8,-14,5,'#fff')+dot(10,-10,4,'#fff'))
    +[[150,30],[180,60],[20,90],[176,130]].map(([x,y])=>dot(x,y,5,'#fff07a')+dot(x,y,2.4,'#ffffff')).join('');
   return b+ring('#ff8a3c',o,'#ffd9b8')+f;}},
 {id:'f-sea',name:'ทะเลปลาดาว',tier:'เด่น',group:'nature',idea:'วงฟ้าทะเลเส้นคลื่น ยอดคลื่นซ้ายบน ปลาดาวส้มทับขอบขวาล่าง เปลือกหอยชมพู ฟองอากาศ',
  svg:()=>{const o='#063f6b';
   const b=[[180,68,7],[190,92,4.5],[172,48,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#e6f8ff" ${ol(o)}/><circle cx="${x-r*.35}" cy="${y-r*.35}" r="${r*.3}" fill="#fff"/>`).join('');
   const wave=`<g ${T(36,42,-18)}><path d="M-16,0 Q0,-14 14,0 Q0,14 -16,0Z" fill="#ffb81c" ${ol(o)}/><path d="M-2,-8 Q2,0 -2,8 M6,-6 Q9,0 6,6" stroke="#ffffff" stroke-width="3" fill="none"/><path d="M14,0 L26,-9 L24,0 L26,9Z" fill="#ff7a1a" ${ol(o)}/><circle cx="-8" cy="-2" r="2" fill="#1d2433"/></g>`;
   const f=`<g ${T(164,164,15)}>${star(0,0,22,'#ff7a1a',o)}${star(0,0,12,'#ffa05c')}${[[0,-9],[7,3],[-7,3],[0,5]].map(([x,y])=>dot(x,y,1.8,'#ffe1c4')).join('')}</g>`
    +`<g ${T(30,160,-20)}><path d="M0,16 L-18,-4 Q0,-22 18,-4Z" fill="#ff8fc8" ${ol(o)}/><path d="M0,16 L-8,-12 M0,16 L0,-15 M0,16 L8,-12" stroke="${o}" stroke-width="1.8"/></g>`;
   return b+ring('#19a7e6',o,'#d0f2ff',`<circle cx="100" cy="100" r="${R}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-dasharray="10 7" stroke-linecap="round"/>`)+wave+f;}},
 {id:'f-rain',name:'ฝนพรำรุ้งพราย',tier:'เด่น',group:'nature',idea:'รุ้งสามสีโค้งจากหลังวงขวาล่าง เมฆหน้ายิ้มทับขอบซ้ายบน หยดฝนเรียง เมฆเล็กปลายรุ้ง',
  svg:()=>{const o='#123f8a';let b='';
   [['#ff3355',30],['#ffb81c',23],['#2fbf4f',16]].forEach(([c,r])=>{b+=`<path d="M${150-r},186 A${r},${r} 0 0 1 ${150+r},186" fill="none" stroke="${o}" stroke-width="9"/>`;});
   [['#ff3355',30],['#ffb81c',23],['#2fbf4f',16]].forEach(([c,r])=>{b+=`<path d="M${150-r},186 A${r},${r} 0 0 1 ${150+r},186" fill="none" stroke="${c}" stroke-width="5.5"/>`;});
   const f=cloud(44,40,1.05,'#ffffff',o,1)+[[22,74],[38,82],[54,72]].map(([x,y])=>drop(x,y,9,4.5,180,'#2f8cff',o)).join('')+cloud(178,182,.45,'#ffffff',o)+cloud(124,186,.4,'#ffffff',o)+spark(176,40,.7,'#ffd23f');
   return b+ring('#4aa8ff',o,'#d6ecff')+f;}},

 // ═══ แฟนตาซี ═══
 {id:'f-moon',name:'คืนดาวพราว',tier:'เด่น',group:'magic',idea:'วงม่วงราตรี จันทร์เสี้ยวทองโอบวงซ้ายบน (หลับตา) กลุ่มดาวทองล่างขวา ฝุ่นดาวรอบวง',
  svg:()=>{const o='#2a1080';
   const b=`<g ${T(36,40,-20)}><path d="M8,-26 A26,26 0 1 0 22,18 A20,20 0 1 1 8,-26Z" fill="#ffd23f" ${ol(o)}/><path d="M-12,-2 q3,3 6,0" fill="none" stroke="${o}" stroke-width="2" stroke-linecap="round"/><ellipse cx="-14" cy="6" rx="3" ry="1.8" fill="#ff8fb8"/></g>`;
   const f=star(166,158,13,'#ffd23f',o,10)+star(146,184,8,'#fff07a',o,-10)+star(186,130,6,'#fff07a',o)+star(170,30,7,'#fff07a',o,15)
    +[[100,8],[20,120],[60,188],[186,90]].map(([x,y])=>spark(x,y,.45,'#ffffff')).join('')+onRing(100,260,40,(x,y)=>dot(x,y,1.8,'#fff'));
   return ring('#7b4dff',o,'#ddd0ff')+b+f;}},
 {id:'f-angel',name:'ปีกนางฟ้า',tier:'ตำนาน',group:'magic',idea:'ปีกขนนกสามชั้นกางเต็มสองข้าง (ขนยาวขาว ขนกลางฟ้าอ่อน ขนโคนทอง) วงขาวมุกขอบทองประดับไข่มุก วงแหวนทองเรืองแสงเหนือหัว อัญมณีหัวใจด้านล่าง',
  svg:()=>{const o='#9a6a00';let b='';
   // ปีก = ซิลูเอตขนนกหยัก 3 ชั้นซ้อน (ขาว → ฟ้าอ่อน → ทอง) กางเฉียงขึ้นเข้ามุมบน
   const WP="M0,-4 C14,-44 58,-54 78,-38 C70,-31 64,-29 58,-27 C66,-20 64,-12 54,-10 C62,-3 58,6 48,6 C52,13 46,21 36,18 C32,27 16,28 4,18Z";
   const wing=sd=>`<g transform="translate(${100+sd*56} 74) rotate(${-sd*28}) scale(${sd*.95} .95)">`
     +`<path d="${WP}" fill="#ffffff" ${ol(o)}/>`
     +`<path transform="translate(2 4) scale(.72)" d="${WP}" fill="#d9f0ff" ${ol(o)}/>`
     +`<path transform="translate(3 7) scale(.44)" d="${WP}" fill="#ffe27a" ${ol(o)}/>`
     +`<path d="M44,-30 C58,-36 66,-38 72,-37 M48,-16 C54,-18 58,-19 60,-20" fill="none" stroke="#bfe3ff" stroke-width="2.2" stroke-linecap="round"/></g>`;
   b+=wing(-1)+wing(1);
   const halo=`<ellipse cx="100" cy="12" rx="34" ry="9" fill="none" stroke="#ffe27a" stroke-width="14" opacity=".35"/><ellipse cx="100" cy="12" rx="34" ry="9" fill="none" stroke="${o}" stroke-width="9"/><ellipse cx="100" cy="12" rx="34" ry="9" fill="none" stroke="#ffd23f" stroke-width="5.5"/><path d="M76,8 Q88,3.5 100,3.5" fill="none" stroke="#fffbe0" stroke-width="2.2" stroke-linecap="round"/>`;
   const f=onRing(0,315,45,(x,y,a)=>a===180?'':dot(x,y,3.6,'#ffffff',o))
    +`<g ${T(100,R+100+2)}><path d="M0,12 C-18,0 -12,-14 0,-6 C12,-14 18,0 0,12Z" fill="#ff4fa3" ${ol(o)}/><path d="M-6,-4 Q-3,-7 0,-4" fill="none" stroke="#ffd0ea" stroke-width="2" stroke-linecap="round"/></g>`
    +spark(44,26,.75,'#ffd23f')+spark(158,26,.6,'#ffd23f')+spark(22,150,.55,'#7cc9ff')+spark(180,150,.55,'#7cc9ff');
   return b+ring('#fff6dc',o,'#ffffff',`<circle cx="100" cy="100" r="${R}" fill="none" stroke="#ffd23f" stroke-width="2.2"/>`)+halo+f;}},
 {id:'f-phoenix',name:'ขนฟีนิกซ์',tier:'ตำนาน',group:'magic',idea:'ปีกเพลิงขนนกปลายม้วนกางสองข้าง หงอนเปลวไฟสามแฉกบนหัว หางขนยาวสองเส้นกวาดลงล่าง วงทองฝังทับทิม ประกายไฟลอย',
  svg:()=>{const o='#7a1004';
   // ขนเพลิงปลายม้วน 3 ชั้นสี (แดง → ส้ม → เหลือง) · sd=-1 กลับด้านให้ม้วนออกนอก
   const PL="M0,0 C-11,-14 -9,-36 6,-50 C2,-37 11,-26 15,-15 C17,-6 11,0 0,0Z";
   const plume=(x,y,a,k,sd=1)=>`<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a}) scale(${sd*k} ${k})"><path d="${PL}" fill="#ff2e3a" ${ol(o)}/><path transform="translate(1.5 -2) scale(.7)" d="${PL}" fill="#ff8a1a"/><path transform="translate(2.5 -3) scale(.42)" d="${PL}" fill="#ffe14d"/></g>`;
   let b='';
   for(const sd of[-1,1]){
     [[112,.8,62],[92,.95,50],[72,1.05,38],[52,1.05,26],[32,.9,14]].forEach(([a,k,r])=>{const[x,y]=pt(sd*a,R+1);b+=plume(x,y,sd*r,k,sd);});
     const[tx,ty]=pt(sd*160,R);b+=plume(tx,ty,sd*125,1.1,-sd)+plume(tx,ty,sd*150,.8,-sd);
   }
   b+=plume(...pt(0,R+2),0,1.15,1)+plume(...pt(-14,R+2),-16,.85,-1)+plume(...pt(14,R+2),16,.85,1);
   const f=onRing(-135,135,45,(x,y,a)=>a===0?'':`<g ${T(x,y,45)}><rect x="-3.2" y="-3.2" width="6.4" height="6.4" fill="#fff3b0" ${ol(o)}/></g>`)
    +`<g ${T(100,R+100)}><path d="M0,-11 L9,0 L0,13 L-9,0Z" fill="#e8102a" ${ol(o)}/><path d="M0,-11 L9,0 L0,0Z" fill="#ff5c6c"/><circle cx="-3" cy="-2" r="1.6" fill="#fff"/></g>`
    +dot(30,160,2.6,'#ffd23f')+dot(170,164,2.2,'#ff8a1a')+dot(18,128,1.8,'#ff8a1a')+dot(184,122,2.4,'#ffd23f')+spark(100,186,.0,'#fff');
   return b+ring('#ffb81c',o,'#fff3b0',`<circle cx="100" cy="100" r="${R-4.5}" fill="none" stroke="#ff7a1a" stroke-width="1.6"/>`)+f;}},
 {id:'f-cyber',name:'หูฟังไซเบอร์',tier:'เด่น',group:'magic',idea:'วงกรมท่าเส้นนีออนฟ้า คาดหัวหูฟังหลังวง หูแมวนีออนชมพู ครอบหูมีไฟเรืองสองข้าง ไมค์ล่างขวา',
  svg:()=>{const o='#0a0d2a';
   const b=arc(R+12,-64,64,o,12)+arc(R+12,-64,64,'#3b4a9e',7)+arc(R+12,-40,40,'#2ff3e0',1.8)
    +[-1,1].map(sd=>`<g ${T(100+sd*40,26,sd*16)}><path d="M-18,16 L-3,-22 Q0,-26 3,-22 L18,16Z" fill="#ff3dbb" ${ol(o)}/><path d="M-8,10 L0,-10 L8,10Z" fill="#ffd0f2"/></g>`).join('');
   const cup=sd=>{const x=100+sd*(R+9);return `<g ${T(x,104)}><rect x="-13" y="-24" width="26" height="48" rx="13" fill="#3b4a9e" ${ol(o)}/><rect x="-6" y="-14" width="12" height="28" rx="6" fill="#2ff3e0"/><rect x="-3" y="-11" width="4" height="10" rx="2" fill="#e0fffb"/></g>`;};
   const f=cup(-1)+cup(1)+`<path d="M${100+R+9},126 Q${100+R+8},160 156,170" fill="none" stroke="${o}" stroke-width="6" stroke-linecap="round"/><path d="M${100+R+9},126 Q${100+R+8},160 156,170" fill="none" stroke="#3b4a9e" stroke-width="3" stroke-linecap="round"/>${dot(152,171,6.5,'#ff3dbb',o)}`
    +[[30,166,4],[44,182,3],[22,184,2.4]].map(([x,y,s])=>`<rect x="${x}" y="${y}" width="${s*2}" height="${s*2}" fill="#2ff3e0" ${ol(o)}/>`).join('');
   return b+ring('#232a5c',o,'#2ff3e0',`<circle cx="100" cy="100" r="${R-4.5}" fill="none" stroke="#2ff3e0" stroke-width="1.6"/><circle cx="100" cy="100" r="${R+4.5}" fill="none" stroke="#ff3dbb" stroke-width="1.4" opacity=".9"/>`)+f;}},
];
function paw(x,y,k,c){return `<g ${T(x,y,-10,k)}><ellipse cy="4" rx="10" ry="8.5" fill="${c}"/>${[-11,-4,4,11].map((dx,i)=>`<ellipse cx="${dx}" cy="${i%3?-11:-6}" rx="4" ry="4.6" fill="${c}"/>`).join('')}</g>`;}
// เลเยอร์หลังวงถูกเจาะรูตรงรูปโปรไฟล์ (r<66) เสมอ — หู/ปีก/กลีบที่ล้นเข้ามาจะไม่ทับหน้าคน
let _m=0;
const paint=s=>{const k=s.indexOf('<circle cx="100" cy="100" r="'+R+'" fill="none"');if(k<=0)return s;const id='hole'+(_m++);
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="300"><rect x="-50" y="-50" width="300" height="300" fill="#fff"/><circle cx="100" cy="100" r="66" fill="#000"/></mask></defs><g mask="url(#${id})">${s.slice(0,k)}</g>${s.slice(k)}`;};


const AV=[
  {bg:'#7cc4e8',html:'<span style="font-size:30cqw">ป</span>'},
  {bg:'linear-gradient(160deg,#ffd9b8 0 45%,#8fb8d8 45%)',html:'<svg viewBox="0 0 100 100" style="position:static;width:100%;height:100%"><circle cx="50" cy="44" r="18" fill="#6b4a3c"/><circle cx="50" cy="48" r="14" fill="#f6d2b8"/><path d="M20,100 Q22,70 50,68 Q78,70 80,100Z" fill="#f2f6fb"/></svg>'},
];

mkdirSync(OUT, { recursive: true })
const wantSvg = process.argv.includes('--svg')
for (const fr of FRAMES) {
  const id = fr.id.replace(/^f-/, 'fa-')
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 240 240" width="384" height="384">' + paint(fr.svg()) + '</svg>'
  if (wantSvg) writeFileSync(join(OUT, id + '.svg'), svg)
  await sharp(Buffer.from(svg)).webp({ quality: 92, alphaQuality: 100 }).toFile(join(OUT, id + '.webp'))
  console.log(id, fr.tier, fr.name)
}
