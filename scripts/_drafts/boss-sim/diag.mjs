import fs from 'fs'
import { simulateBoss } from './bossEngine.mjs'
import { getPetDef } from 'file:///D:/RXTU/rxtu10-v2/src/data/index.js'
const users = JSON.parse(fs.readFileSync('teams.json','utf8')).filter(u=>u.towerBest>=60)
const [kind, T, cfgS] = [process.argv[2], +process.argv[3], process.argv[4]]
const cfg = { kind, tier: T, smashMult: 3, ...JSON.parse(cfgS) }
const el = { hammer:'fist', doom:'paper', shield:'scissors' }[kind]
const RANK={common:0,rare:1,epic:2,legendary:3}
let acc={w:0,hp:0,rd:0,n:0,st:{}}
for (const u of users) {
  const m=new Map(); for(const p of u.pets){const id=p.id||p.species,d=getPetDef(id);if(!d)continue;const x={id,rarity:p.rarity||d.rarity,element:d.element,grade:p.grade||0};if(!m.get(id)||m.get(id).grade<x.grade)m.set(id,x)}
  const L=[...m.values()].sort((a,b)=>RANK[b.rarity]-RANK[a.rarity]||b.grade-a.grade).slice(0,12)
  if(process.env.COMET) L.unshift({id:"comet",rarity:"legendary",element:"scissors",grade:3})
  let best=null,bs=1e9
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)for(let k=j+1;k<L.length;k++){const t=[L[i],L[j],L[k]];let h=0;for(let s=0;s<4;s++){const B=[{id:'boss',rarity:'legendary',element:el,grade:3}];if(kind==='shield'&&T===3)B.push({id:'minion',rarity:'common',element:'scissors',grade:0},{id:'minion',rarity:'common',element:'scissors',grade:0});const r=simulateBoss(t,B,s*31+5,{boss:cfg});h+=r.win?-1:r.bossHpPct}if(h<bs){bs=h;best=t}}
  for(let s=0;s<20;s++){const B=[{id:'boss',rarity:'legendary',element:el,grade:3}];if(kind==='shield'&&T===3)B.push({id:'minion',rarity:'common',element:'scissors',grade:0},{id:'minion',rarity:'common',element:'scissors',grade:0});const r=simulateBoss(best,B,s*977+3,{boss:cfg});acc.n++;if(r.win)acc.w++;acc.hp+=r.bossHpPct;acc.rd+=r.rounds;for(const[k,v]of Object.entries(r.stats))acc.st[k]=(acc.st[k]||0)+v}
}
console.log(kind,T,JSON.stringify(cfg),'ชนะ',Math.round(acc.w/acc.n*100)+'%','บอสเหลือเลือด',Math.round(acc.hp/acc.n*100)+'%','รอบ',(acc.rd/acc.n).toFixed(1),JSON.stringify(Object.fromEntries(Object.entries(acc.st).map(([k,v])=>[k,(v/acc.n).toFixed(1)]))))
