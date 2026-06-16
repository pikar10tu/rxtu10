// v2 — nerf ค่า passive ให้เข้าเป้า ~55-62% + firstStrike จำกัด 1 ตัว/ทีม
const CFG={teamSize:4,maxRounds:30,elementAdv:1.20,elementDis:0.83,critRate:0.12,critMult:1.6,variance:0.22,targeting:'random'}
const BEATS={fist:'scissors',scissors:'paper',paper:'fist'}
function rng(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function eMult(a,d){if(BEATS[a]===d)return CFG.elementAdv;if(BEATS[d]===a)return CFG.elementDis;return 1}
const alive=t=>t.filter(f=>f.hp>0)
const PARAMS={ shield:0.5, dodge:0.10, heal:0.08, thorns:0.10, rage:0.20 } // ค่าที่ลดแล้ว
function resolve(tA,tB,seed){
  const rand=rng(seed)
  const cl=t=>t.map((f,i)=>({...f,hp:f.maxHp,shieldUsed:false,slot:i}))
  const A=cl(tA),B=cl(tB)
  const pick=foes=>{const al=alive(foes);return al.length?al[Math.floor(rand()*al.length)]:null}
  const hit=(att,foes)=>{
    const tg=pick(foes);if(!tg)return
    let m=eMult(att.element,tg.element)
    if(rand()<CFG.critRate)m*=CFG.critMult
    m*=1+(rand()*2-1)*CFG.variance
    let atk=att.atk
    if(att.pass==='rage'&&att.hp<att.maxHp*0.4)atk*=1+PARAMS.rage
    let dmg=atk*m
    if(tg.pass==='dodge'&&rand()<PARAMS.dodge)dmg=0
    if(tg.pass==='shield'&&!tg.shieldUsed){tg.shieldUsed=true;dmg*=(1-PARAMS.shield)} // ลดหมัดแรก ไม่บล็อกเต็ม
    tg.hp-=dmg
    if(dmg>0&&tg.pass==='thorns'&&att.hp>0)att.hp-=dmg*PARAMS.thorns
    if(dmg>0&&att.pass==='heal')att.hp=Math.min(att.maxHp,att.hp+dmg*PARAMS.heal)
  }
  // firstStrike: เฉพาะ "ตัวนำ" (slot 0) ของแต่ละทีม ไม่ใช่ทั้ง 4
  for(const team of [A,B]){const lead=team.find(f=>f.pass==='firstStrike'&&f.hp>0&&f.slot===0);if(lead)hit(lead,team===A?B:A)}
  let r=0
  while(r<CFG.maxRounds&&alive(A).length&&alive(B).length){
    r++
    const act=[];A.forEach(f=>{if(f.hp>0)act.push([f,B])});B.forEach(f=>{if(f.hp>0)act.push([f,A])})
    for(let i=act.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[act[i],act[j]]=[act[j],act[i]]}
    for(const[f,foes]of act)if(f.hp>0)hit(f,foes)
  }
  const pct=t=>t.reduce((s,f)=>s+Math.max(0,f.hp),0)/t.reduce((s,f)=>s+f.maxHp,0)
  const aa=alive(A).length>0,ba=alive(B).length>0
  return(aa&&!ba)?'A':(ba&&!aa)?'B':(pct(A)>=pct(B)?'A':'B')
}
function team(pass){return Array.from({length:4},(_,i)=>({atk:13.1,maxHp:66.6,hp:66.6,element:'scissors',pass:i===0?pass:null}))}
const N=6000
function wr(pa,pb){let a=0;for(let s=1;s<=N;s++)if(resolve(team(pa),team(pb),s*2654435761)==='A')a++;return a/N}
console.log('═══ passive v2 — 1 ใน 4 ตัวมี passive (signature) vs ทีมเปล่า ═══\n')
console.log('  ค่าที่ใช้:', JSON.stringify(PARAMS), '· firstStrike = ตัวนำ 1 ตัว\n')
for(const p of ['shield','dodge','heal','thorns','rage','firstStrike'])
  console.log(`  ${p.padEnd(12)} ${(wr(p,null)*100).toFixed(1)}%`)
