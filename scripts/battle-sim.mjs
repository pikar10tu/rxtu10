// RxTU10 — Battle Engine prototype + Balance Simulator (deterministic)
// node scripts/battle-sim.mjs
const CFG = {
  teamSize: 4, maxRounds: 30,
  elementAdv: 1.20, elementDis: 0.83,
  critRate: 0.12, critMult: 1.6,
  variance: 0.22,
  targeting: 'random', // 'front' | 'random'
}
const BASE = {
  common:    { atk: 10, hp: 50 },
  rare:      { atk: 11, hp: 56 },
  epic:      { atk: 13, hp: 63 },
  legendary: { atk: 14, hp: 70 },
}
const GRADE = [1.0, 1.06, 1.12, 1.19, 1.26, 1.34, 1.42, 1.50, 1.59]
const BIAS = { fist:{atk:1.2,hp:0.85}, scissors:{atk:1,hp:1}, paper:{atk:0.85,hp:1.2} }
const BEATS = { fist:'scissors', scissors:'paper', paper:'fist' }
const ROSTER = [
  ['bahamut','legendary','fist'],['oni','legendary','fist'],['trex','legendary','fist'],
  ['ouroboros','legendary','scissors'],['griffin','legendary','scissors'],['phoenix','legendary','scissors'],
  ['whale','legendary','paper'],['baku','legendary','paper'],['mammoth','legendary','paper'],
  ['dragon','epic','fist'],['cerberus','epic','fist'],['unicorn','epic','scissors'],['fairy','epic','scissors'],
  ['panda','epic','paper'],['genie','epic','paper'],
  ['wolf','rare','fist'],['shark','rare','fist'],['fox','rare','scissors'],['rabbit','rare','scissors'],
  ['owl','rare','paper'],['seal','rare','paper'],
  ['hedgehog','common','fist'],['hamster','common','fist'],['mouse','common','scissors'],['cat','common','scissors'],
  ['butterfly','common','paper'],['turtle','common','paper'],
].map(([id,rarity,element])=>({id,rarity,element}))
const PASSIVE = { common:null, rare:'shield', epic:'thorns', legendary:'firstStrike' }
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function mk(pet,grade){const b=BASE[pet.rarity],g=GRADE[grade]??GRADE[8],x=BIAS[pet.element];return{...pet,grade,atk:b.atk*g*x.atk,maxHp:b.hp*g*x.hp,hp:b.hp*g*x.hp,passive:PASSIVE[pet.rarity],shieldUsed:false}}
function eMult(a,d){if(BEATS[a]===d)return CFG.elementAdv;if(BEATS[d]===a)return CFG.elementDis;return 1}
const alive=t=>t.filter(f=>f.hp>0)
function resolve(tA,tB,seed){
  const rand=rng(seed)
  const A=tA.map(p=>mk(p.pet,p.grade)), B=tB.map(p=>mk(p.pet,p.grade))
  const pick=foes=>{const al=alive(foes);if(!al.length)return null;return CFG.targeting==='random'?al[Math.floor(rand()*al.length)]:al[0]}
  const hit=(att,foes)=>{const tg=pick(foes);if(!tg)return;let m=eMult(att.element,tg.element);if(rand()<CFG.critRate)m*=CFG.critMult;m*=1+(rand()*2-1)*CFG.variance;let dmg=att.atk*m;if(tg.passive==='shield'&&!tg.shieldUsed){tg.shieldUsed=true;dmg=0}tg.hp-=dmg;if(dmg>0&&tg.passive==='thorns'&&att.hp>0)att.hp-=dmg*0.2}
  for(const f of [...A,...B])if(f.passive==='firstStrike'&&f.hp>0)hit(f,A.includes(f)?B:A)
  let round=0
  while(round<CFG.maxRounds&&alive(A).length&&alive(B).length){
    round++
    const act=[];A.forEach(f=>{if(f.hp>0)act.push([f,B])});B.forEach(f=>{if(f.hp>0)act.push([f,A])})
    for(let i=act.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[act[i],act[j]]=[act[j],act[i]]}
    for(const [f,foes] of act)if(f.hp>0)hit(f,foes)
  }
  const pct=t=>t.reduce((s,f)=>s+Math.max(0,f.hp),0)/t.reduce((s,f)=>s+f.maxHp,0)
  const aa=alive(A).length>0, ba=alive(B).length>0
  let w; if(aa&&!ba)w='A'; else if(ba&&!aa)w='B'; else w=pct(A)>=pct(B)?'A':'B'
  return {winner:w,rounds:round}
}
const byEl=el=>ROSTER.filter(p=>p.element===el)
function mono(el,r,g){const pool=ROSTER.filter(p=>p.element===el&&p.rarity===r);const src=pool.length?pool:byEl(el);return Array.from({length:CFG.teamSize},(_,i)=>({pet:src[i%src.length],grade:g}))}
function rndTeam(rand,gm=5){return Array.from({length:CFG.teamSize},()=>({pet:ROSTER[Math.floor(rand()*ROSTER.length)],grade:Math.floor(rand()*(gm+1))}))}
const N=4000
function wr(mA,mB,n=N){let a=0,rd=0;for(let s=1;s<=n;s++){const r=resolve(mA(),mB(),s*2654435761);if(r.winner==='A')a++;rd+=r.rounds}return{wr:a/n,r:rd/n}}
function suite(tag){
  console.log(`\n========== targeting = ${tag} ==========`)
  const els=['fist','scissors','paper']
  console.log('① ธาตุ matchup (mono rare g3) — A win%  [กระจก~50%, ✊>✌️>✋>✊]')
  console.log('        '+els.map(e=>e.padStart(9)).join(''))
  for(const a of els){let row=a.padEnd(8);for(const b of els){const x=wr(()=>mono(a,'rare',3),()=>mono(b,'rare',3));row+=`${(x.wr*100).toFixed(0).padStart(7)}% `}console.log(row)}
  console.log('② ส่วนต่างเกรด (scissors rare) — A win%')
  for(const d of [0,1,2,3]){const x=wr(()=>mono('scissors','rare',3+d),()=>mono('scissors','rare',3));console.log(`  เกรด +${d}: ${(x.wr*100).toFixed(0)}%`)}
  console.log('③ rarity gap (scissors g3) — A win%')
  const rar=['common','rare','epic','legendary']
  for(let i=0;i<3;i++){const x=wr(()=>mono('scissors',rar[i+1],3),()=>mono('scissors',rar[i],3));console.log(`  ${rar[i+1]} vs ${rar[i]}: ${(x.wr*100).toFixed(0)}%`)}
  const rand=rng(99);let up=0,dec=0,rounds=0
  for(let s=1;s<=N;s++){const A=rndTeam(rand),B=rndTeam(rand);const pw=t=>t.reduce((u,x)=>u+BASE[x.pet.rarity].atk*GRADE[x.grade],0);const r=resolve(A,B,s*40503);rounds+=r.rounds;const pA=pw(A),pB=pw(B),fav=pA>=pB?'A':'B';if(Math.abs(pA-pB)/Math.max(pA,pB)>0.15){dec++;if(r.winner!==fav)up++}}
  console.log(`④ upset(พลังต่าง>15%): ${(up/dec*100).toFixed(1)}% [เป้า15-25%] · รอบเฉลี่ย ${(rounds/N).toFixed(1)}`)
}
console.log('═══ RxTU10 Battle Balance Sim ═══')
console.log(`elemAdv=${CFG.elementAdv} crit=${CFG.critRate} var=±${CFG.variance} grade+1≈×${GRADE[1]}`)
CFG.targeting='front'; suite('front (รุมตัวหน้า)')
CFG.targeting='random'; suite('random (กระจายตี)')
