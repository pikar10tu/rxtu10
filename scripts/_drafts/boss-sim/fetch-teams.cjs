// อ่านอย่างเดียว: users → teams.json (pets/activePets/towerBest)
const os=require('os'),fs=require('fs'),path=require('path')
const auth=require(path.join(process.env.APPDATA,'npm/node_modules/firebase-tools/lib/auth.js'))
const cfg=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config/configstore/firebase-tools.json'),'utf8'))
const val=v=>v==null?null:'stringValue'in v?v.stringValue:'integerValue'in v?+v.integerValue:'doubleValue'in v?v.doubleValue:'booleanValue'in v?v.booleanValue:'nullValue'in v?null:'arrayValue'in v?(v.arrayValue.values||[]).map(val):'mapValue'in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,val(x)])):null
;(async()=>{
 const t=await auth.getAccessToken(cfg.tokens.refresh_token,[]); const tok=t.access_token||t
 const out=[];let pt=''
 do{const r=await fetch(`https://firestore.googleapis.com/v1/projects/rxtu10dashboard/databases/(default)/documents/users?pageSize=300&mask.fieldPaths=pets&mask.fieldPaths=activePets&mask.fieldPaths=towerBest&mask.fieldPaths=nickname${pt?'&pageToken='+pt:''}`,{headers:{Authorization:'Bearer '+tok}});const j=await r.json();if(j.error)throw new Error(JSON.stringify(j.error))
  for(const d of j.documents||[]){const f=Object.fromEntries(Object.entries(d.fields||{}).map(([k,x])=>[k,val(x)]));if((f.pets||[]).length>=3)out.push({pets:f.pets,activePets:f.activePets||[],towerBest:f.towerBest||0})}
  pt=j.nextPageToken}while(pt)
 fs.writeFileSync(path.join(__dirname,'teams.json'),JSON.stringify(out));console.log('users',out.length)
})().catch(e=>{console.error(e.message);process.exit(1)})
