// ════════════════════════════════════════
// APP — Main Entry Point
// ════════════════════════════════════════
import { auth, db, provider, ADMIN_EMAIL, SNAPSHOT_DELAY, PLE_CC_DATE,
         INSTANT_COST, MEGA_COST, IS_DEV, log } from './config.js';
import { signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, onSnapshot,
         collection, getDocs, increment, serverTimestamp, arrayUnion, addDoc,
         orderBy, query, limit, deleteDoc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { RARITY, GRADE_LABELS, GRADE_COPIES, GRADE_MULTI,
         ELEMENTS, _EL_NAME, elementBeats, BASE_STATS, STAT_MULTI, petStats,
         PETS, HATCH_LABELS, EGG_TYPES, R_SCI, R_CARE, RN, DRUGS } from './data.js';
import { buildLeaderboard } from './tabs/leaderboard.js';
import { buildAdmin } from './tabs/admin.js';
import './systems/calc.js';       // attaches window.openCalc / calc functions
import './systems/colortiles.js'; // attaches window.openColorTilesModal etc.
import './systems/leaderboards.js'; // attaches window.buildQuizLb / toggleLb / _qTop1 etc.

const DAILY_RESET_HR = 24;

/** rollPetFromGlowEgg() → B-tier: Common 40% / Rare 38% / Epic 18% / Legendary 4% */
function rollPetFromGlowEgg(){
    const rv=Math.random();
    const rarity = rv<0.40 ? 'common' : rv<0.78 ? 'rare' : rv<0.96 ? 'epic' : 'legendary';
    const pool=PETS.filter(p=>p.rarity===rarity);
    const p=pool[Math.floor(Math.random()*pool.length)];
    return{...p, instId:`${p.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`};
}

/** rollPetFromStarEgg() → B-tier: Rare 35% / Epic 45% / Legendary 20% */
function rollPetFromStarEgg(){
    const rv=Math.random();
    const rarity=rv<0.35?'rare':rv<0.80?'epic':'legendary';
    const pool=PETS.filter(p=>p.rarity===rarity);
    const p=pool[Math.floor(Math.random()*pool.length)];
    return{...p, instId:`${p.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`};
}

/** rollPetFromGuaranteedEgg() → Legendary 100% */
function rollPetFromGuaranteedEgg(){
    const pool=PETS.filter(p=>p.rarity==='legendary');
    const p=pool[Math.floor(Math.random()*pool.length)];
    return{...p, instId:`${p.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`};
}

window.buyGuaranteedEgg=async()=>{
    if(!currentUser){toast('กรุณา Login ก่อน','error');return;}
    const cost=20000;
    if((userData?.coins||0)<cost){toast(`เหรียญไม่พอ! ต้องการ ${cost}🪙`,'error');return;}
    if(!await _confirm(`🎁 ไข่การันตีตำนาน\nราคา ${cost}🪙\n\nLegendary 100% รับประกัน!\n\nยืนยันซื้อ?`))return;
    const pet=rollPetFromGuaranteedEgg();
    const egg={
        eggId:`gtd_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        eggType:'guaranteed', petId:pet.id, petEmoji:pet.emoji,
        petName:pet.name, petRarity:pet.rarity,
        petInstId:pet.instId, hatchMins:1, startedAt:null,
    };
    window.__blockSnapshot=true;
    userData={...userData, coins:(userData.coins||0)-cost, eggs:[...(userData.eggs||[]),egg]};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{coins:increment(-cost),eggs:arrayUnion(egg)});
        await window._spendCoins(cost);
    }catch(e){toast('ซื้อไม่สำเร็จ','error');}
    finally{setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);}
    toast('🎁 ได้รับไข่การันตีตำนานแล้ว! ⭐ Legendary รอฟัก!','success');
};
window.buyStarEgg=async()=>{
    if(!currentUser){toast('กรุณา Login ก่อน','error');return;}
    const cost=3000;
    if((userData?.coins||0)<cost){toast(`เหรียญไม่พอ! ต้องการ ${cost}🪙`,'error');return;}
    if(!await _confirm(`🌠 ไข่ตำนาน\nราคา ${cost}🪙\n\nสุ่ม Rare 35% / Epic 45% / Legendary 20%\n\nยืนยันซื้อ?`))return;
    const pet=rollPetFromStarEgg();
    const egg={
        eggId:`star_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        eggType:'star', petId:pet.id, petEmoji:pet.emoji,
        petName:pet.name, petRarity:pet.rarity,
        petInstId:pet.instId, hatchMins:2, startedAt:null,
    };
    window.__blockSnapshot=true;
    userData={...userData, coins:(userData.coins||0)-cost, eggs:[...(userData.eggs||[]),egg]};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{coins:increment(-cost), eggs:arrayUnion(egg)});
    }catch(e){toast('ซื้อไม่สำเร็จ','error');}
    finally{setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);}
    await window._spendCoins(cost);
    toast(`🌠 ได้รับไข่ตำนานแล้ว! ${pet.rarity==='legendary'?'⭐ Legendary!':'🟣 Epic'}...`,'success');
};
window.buyGlowEgg=async()=>{
    if(!currentUser){toast('กรุณา Login ก่อน','error');return;}
    const cost=1200;
    if((userData?.coins||0)<cost){toast(`เหรียญไม่พอ! ต้องการ ${cost}🪙`,'error');return;}
    if(!await _confirm(`🌐 ไข่เรืองแสง
ราคา ${cost}🪙

สุ่ม Common 40% / Rare 38% / Epic 18% / Legendary 4%

ยืนยันซื้อ?`))return;
    const pet=rollPetFromGlowEgg();
    const egg={
        eggId:`glow_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        eggType:'glow', petId:pet.id, petEmoji:pet.emoji,
        petName:pet.name, petRarity:pet.rarity,
        petInstId:pet.instId, hatchMins:1, startedAt:null,
    };
    window.__blockSnapshot=true;
    userData={...userData, coins:(userData.coins||0)-cost, eggs:[...(userData.eggs||[]),egg]};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{
            coins:increment(-cost), eggs:arrayUnion(egg),
        });
    }catch(e){toast('ซื้อไม่สำเร็จ','error');}
    finally{setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);}
    await window._spendCoins(cost);
    toast(`🌐 ได้รับไข่เรืองแสงแล้ว! ${pet.rarity==='legendary'?'⭐ Legendary!! ✨':pet.rarity==='epic'?'🟣 Epic!':'💎 Rare'}...`,'success');
};
/** rollPetFromEgg(eggType) → pet object with instId
 *  eggType: 'normal' | 'gold' | 'rainbow'
 *  Returns a pet def merged with fresh instId */
function rollPetFromEgg(eggType){
    // ไข่สัตว์เลี้ยง (pet): Common 72%, Rare 25%, Epic 3%, Legendary 0%
    const RARITY_RATES = { common:0.72, rare:0.25, epic:0.03, legendary:0.00 };
    const rarities = Object.keys(RARITY_RATES);
    // สุ่ม rarity ก่อน
    const rv = Math.random(); let rc = 0; let chosenRarity = 'common';
    for(const r of rarities){ rc += RARITY_RATES[r]; if(rv <= rc){ chosenRarity = r; break; } }
    // กรอง PETS ตาม rarity แล้วสุ่มสม่ำเสมอ
    const pool = PETS.filter(p => p.rarity === chosenRarity);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return { ...picked, instId: Date.now() + '_' + Math.random().toString(36).slice(2,8) };
}
function petDailyCoins(p){
    // p = stored pet object {id, grade, rarity, ...}
    const base=RARITY[p.rarity]?.dailyBase||5;
    const g=p.grade||0;
    return base*GRADE_MULTI[g];
}
/** calcTotalDaily(pets) → {base, passive, total}
 *  base: login base (1000🪙/day)
 *  passive: sum ของ petDailyCoins ทุกตัว
 *  total: base + passive */
function calcTotalDaily(pets){
    const passive=(pets||[]).reduce((sum,p)=>sum+petDailyCoins(p),0);
    return {base:1000, passive, total:1000+passive};
}


//    - calcDamage(attacker, defender) → ATK ×(1.5 ถ้าได้เปรียบ element)
//    - battleLoop(state) → turn-based rounds
//    - Battle result → post news + reward coins
// ════════════════════════════════════════

// ════════════════════════════════════════
//  STUDENT DATA
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ DATA — STUDENT LISTS
// ════════════════════════════════════════

// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ RUNTIME STATE
// ════════════════════════════════════════
/**
 * RUNTIME STATE — ตัวแปร global ที่ใช้ทั่วทั้งแอป
 *
 * Auth:      currentUser, userData, unsub (Firestore listener)
 * Members:   mTrack, mSearch (filter state)
 * Quiz:      qScore, qAnswer, qHigh  (member quiz)
 * DrugQuiz:  dqScore, dqAnswer, dqHigh
 * Flags:     __quizTop5Posted, __drugTop5Posted (dedup news)
 *
 * ── FUTURE: quiz engine state จะอยู่ใน __quizEngine object ──
 * window.__quizEngine = { questions:[], currentIdx:0, score:0, ... }
 */
let currentUser=null, userData=null, unsub=null;
// UI state
let mTrack='all', mSearch='';
// Quiz state
let qScore=0, qAnswer=null, qHigh=0;
let dqScore=0, dqAnswer=null, dqHigh=0;
let __quizTop5Posted=false, __drugTop5Posted=false;
// Battle state (future) — เพิ่ม: let battleState=null;

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ QUIZ ENGINE — EXTERNAL QUESTION LOADER  (Phase 2 placeholder)
// ════════════════════════════════════════
/**
 * loadQuizBank(source) — Phase 2: โหลดข้อสอบจากภายนอก
 *
 * ตัวเลือก:
 *   A) JSON file:     fetch('./questions/ple_2568.json')
 *   B) Firestore:     getDocs(collection(db,'questions'))
 *   C) Google Sheets: fetch(SHEETS_API_URL)
 *
 * Schema มาตรฐาน (ดู README หรือ questions/SCHEMA.md):
 * {
 *   id: string, text: string, choices: string[4],
 *   answer: 0-3, explanation: string,
 *   subject: string, year: number, tags: string[]
 * }
 *
 * TODO: implement เมื่อมีไฟล์ข้อสอบพร้อม
 */
// async function loadQuizBank(source='firestore'){ ... }

// ════════════════════════════════════════
// ▶ AUTH & USER MANAGEMENT
// ════════════════════════════════════════
function initStudents() {
    const sci=R_SCI.map(s=>{const[nick,rest]=s.split(' (');return{nickname:nick,id:rest.replace(')',''),track:'sci'};});
    const care=R_CARE.map(s=>{const[nick,rest]=s.split(' (');return{nickname:nick,id:rest.replace(')',''),track:'care'};});
    const names=RN.split(/(?=นาย|นางสาว)/).filter(n=>n.trim()).map(n=>n.replace(/^นาย|^นางสาว/,'').trim());
    // RN เรียงตาม ID sort ascending ของทุกคน (Sci+Care รวม) — map หลัง sort
    const all=[...sci,...care].sort((a,b)=>a.id.localeCompare(b.id));
    all.forEach((s,i)=>{s.realName=names[i]||'ไม่ระบุ';});
    window.__students=all;
}
initStudents();

// ── MEMBER LIVE DATA CACHE ──
window.__fbUsers = {}; // studentId -> liveData
window.__guestUsers = []; // guest users list
let __fbUsersLoading=false;
async function loadFbUsers() {
    if(__fbUsersLoading)return; __fbUsersLoading=true;
    try {
        const snap = await getDocs(collection(db,"users"));
        window.__guestUsers = [];
        snap.forEach(d => {
            const x = d.data();
            if (!x.studentId) return;
            // เก็บเฉพาะ field ที่ใช้ใน member grid — ตัด customPhoto ออก ประหยัด memory
            // (customPhoto ยังอยู่ใน userData ของตัวเอง — ใช้ใน myPhoto())
            const light={
                uid:d.id,
                studentId:x.studentId,
                nickname:x.nickname,
                realName:x.realName,
                track:x.track,
                coins:x.coins,
                quizHigh:x.quizHigh,
                drugHigh:x.drugHigh,
                ctHigh:x.ctHigh,
                towerBest:x.towerBest,
                activePet:x.activePet,
                activePets:x.activePets||[null,null,null],
                pvpVictories:x.pvpVictories||0,contact:x.contact||{phone:'',ig:'',line:''},likes:x.likes||0,likedBy:x.likedBy||{},_uid:d.id,
                pets:x.pets,
                email:x.email,
                googlePhoto:x.googlePhoto,
                // thumb: ถ้ามีใช้ thumb, ถ้าไม่มีใช้ full (compat เก่า)
                customPhoto:x.customPhotoThumb||x.customPhoto||null,
                // เก็บ full ไว้แยกสำหรับ profile modal
                customPhotoFull:x.customPhoto||null,
            };
            if (x.track === 'guest') {
                window.__guestUsers.push(light);
            } else {
                window.__fbUsers[x.studentId] = light;
            }
        });
        if (window.__tab === 'members') {
            const g = document.getElementById('mgrid');
            if (g) g.innerHTML = memberGrid();
            updateGuestBadge();
        }
    } catch(e) {} finally{__fbUsersLoading=false;}
}
function updateGuestBadge(){
    const el=document.getElementById('guest-count-badge');
    if(el) el.textContent=`👋 Guest ${(window.__guestUsers||[]).length} คน`;
}

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
window.loginGoogle=async()=>{
    // หมายเหตุ: ไม่เรียก ensureDoc ที่นี่ — onAuthStateChanged จัดการสร้าง doc ให้แล้ว
    // (กันกรณี auth สำเร็จแต่ Firestore เชื่อมไม่ได้ จะได้ไม่ขึ้น "Login ไม่สำเร็จ" หลอกๆ)
    try{
        provider.setCustomParameters({prompt:'select_account'});
        await signInWithPopup(auth,provider);
    }catch(e){
        console.error('[loginGoogle]', e.code, e.message, e);
        if(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request') return;
        toast("Login ไม่สำเร็จ: "+(e.code||e.message||e),"error",6000);
    }
};
// _confirm(msg) → Promise<boolean> — ใช้ custom modal แทน window.confirm
function _confirm(msg){
    return new Promise(resolve=>{
        const modal=document.getElementById('confirm-modal');
        const msgEl=document.getElementById('confirm-msg');
        const okBtn=document.getElementById('confirm-ok');
        const cancelBtn=document.getElementById('confirm-cancel');
        if(!modal||!okBtn||!cancelBtn){resolve(window.confirm(msg));return;}
        msgEl.innerHTML=msg.split('\n').map(l=>`<div>${l}</div>`).join('');
        modal.classList.add('active');
        let resolved=false;
        const cleanup=(result)=>{
            if(resolved)return; resolved=true;
            modal.classList.remove('active');
            okBtn.onclick=null; cancelBtn.onclick=null;
            modal.removeEventListener('click',backdropHandler);
            resolve(result);
        };
        const backdropHandler=(e)=>{if(e.target===modal)cleanup(false);};
        okBtn.onclick=()=>cleanup(true);
        cancelBtn.onclick=()=>cleanup(false);
        modal.addEventListener('click',backdropHandler);
    });
}
window._confirm = _confirm;

window.__confirmLogout=async()=>{
    document.getElementById('confirm-modal').classList.remove('active');
    clearInterval(window.__hatchTimer);
    try{await signOut(auth);}catch(e){}
    currentUser=userData=null;window.currentUser=null;window.userData=null;window.__fbUsers={};window.__tab='home';renderTab('home');
};
window.logoutUser=()=>{
    document.getElementById('confirm-msg').textContent='ออกจากระบบ?';
    document.getElementById('confirm-ok').onclick=window.__confirmLogout;
    document.getElementById('confirm-modal').classList.add('active');
};

/** Firestore User Document Schema (users/{uid}):
 *  uid, name, email, googlePhoto, customPhoto, customPhotoThumb
 *  coins: number | studentId: string|null | nickname, realName, track
 *  quizHigh, drugHigh: number
 *  pets: [{id, emoji, name, rarity, instId, grade}]  ← no 'effect' field
 *  eggs: [{eggId, eggType, petId, petEmoji, petName, petRarity, petInstId, hatchMins, startedAt}]
 *  activePet: instId string | null
 *  lastDaily: Timestamp | null
 */
async function ensureDoc(u){
    const ref=doc(db,"users",u.uid);const snap=await getDoc(ref);
    if(!snap.exists())await setDoc(ref,{uid:u.uid,name:u.displayName,email:u.email,googlePhoto:u.photoURL,customPhoto:null,coins:2000,pets:[],eggs:[],activePet:null,activePets:[null,null,null],pvpVictories:0,studentId:null,nickname:null,realName:null,track:null,quizHigh:0,drugHigh:0,ctHigh:0,towerFloor:1,towerBest:0,towerLastReset:null,lastDaily:null,contact:{phone:'',ig:'',line:''},likes:0,likedBy:{},totalSpent:0,pityClaimedRounds:0,createdAt:serverTimestamp()});
}

onAuthStateChanged(auth,async u=>{
    currentUser=u; window.currentUser=u;
    if(u){
        await ensureDoc(u);
        if(unsub)unsub();
        unsub=onSnapshot(doc(db,"users",u.uid),snap=>{
            if(window.__blockSnapshot){return;}  // forge/trade กำลัง write อยู่
            userData=snap.data(); window.userData=userData; qHigh=userData?.quizHigh||0;dqHigh=userData?.drugHigh||0;
            // migrate: activePet → activePets[0] (one-time migration)
            if(userData?.activePet && !(userData?.activePets||[]).some(Boolean)){
                const migrateSlots=[userData.activePet,null,null];
                userData={...userData, activePets:migrateSlots};
                updateDoc(doc(db,'users',u.uid),{activePets:migrateSlots}).catch(()=>{});
            }
            if(window.__tab==='home'||!window.__tab) renderAll();
            else { /* อัปเดต userData แต่ไม่ re-render tab อื่น */
                const _t=window.__tab;
                if(_t==='shop') document.getElementById('main-content').innerHTML=buildShop();
                else if(_t==='members'){ const g=document.getElementById('mgrid'); if(g) g.innerHTML=memberGrid(); }
            }
            checkDaily();_startHatchTick();
        });
        loadFbUsers();
        // checkPetDaily removed
    } else renderAll();
});

// ════════════════════════════════════════
//  DAILY
// ════════════════════════════════════════
function checkDaily(){
    if(!currentUser||!userData) return;
    const last = userData.lastDaily?.toDate?.() || null;
    const now  = new Date();
    const sameDay = last && last.toDateString()===now.toDateString();
    const newReady = !last || !sameDay;
    // อัปเดตเฉพาะถ้าสถานะเปลี่ยน เพื่อลด re-render
    if(window.__dailyReady !== newReady){
        window.__dailyReady = newReady;
        window.__lastDailyDate = last;
        _refreshDailyCard();
    } else if(!window.__dailyCardInited){
        window.__dailyCardInited = true;
        _refreshDailyCard();
    }
    // ตั้ง auto-enable ตอนเที่ยงคืน
    if(!sameDay) return; // already ready
    const midnight = new Date(now); midnight.setHours(24,0,0,0);
    clearTimeout(window.__dailyMidnightTimer);
    window.__dailyMidnightTimer = setTimeout(()=>{
        window.__dailyReady = true;
        window.__dailyCardInited = false;
        _refreshDailyCard();
    }, midnight - now + 500);
}
function _refreshDailyCard(){
    const btn=document.getElementById('daily-claim-btn');
    const status=document.getElementById('daily-claim-status');
    if(!btn)return;
    const ready=window.__dailyReady;
    const now=new Date();
    const midnight=new Date(now);midnight.setHours(24,0,0,0);
    const msLeft=midnight-now;
    const hLeft=Math.floor(msLeft/3600000);
    const mLeft=Math.floor((msLeft%3600000)/60000);
    if(ready){
        btn.style.display='';
        btn.style.opacity='1';
        btn.disabled=false;
        btn.textContent='💰 รับ';
        if(status) status.textContent='ต่อวัน';
    } else {
        btn.style.opacity='0.35';
        btn.disabled=true;
        btn.textContent='✓ รับแล้ว';
        if(status) status.textContent=hLeft>0?`รีเซ็ตใน ${hLeft}ชม ${mLeft}น`:`รีเซ็ตใน ${mLeft}น`;
    }
}
window.claimDaily=async()=>{
    if(!currentUser)return;
    if(!window.__dailyReady){toast("รับได้อีกครั้งพรุ่งนี้!","info");return;}
    const {base,passive,total}=calcTotalDaily(userData?.pets||[]);
    try{
        await updateDoc(doc(db,"users",currentUser.uid),{coins:increment(total),lastDaily:serverTimestamp()});
        window.__dailyReady=false;
    }catch(e){ toast('รับ Daily ไม่สำเร็จ กรุณาลองใหม่','error'); log.error('claimDaily',e); return; }
    window.__lastDailyDate=new Date();
    _refreshDailyCard();
    const passiveStr=passive>0?` (base ${base}🪙 + pets ${passive}🪙)`:'';
    toast(`🎁 ได้รับ +${total}🪙${passiveStr}!`,"success",4000);
    confetti({particleCount:80,spread:60,origin:{y:0.6}});
};

// ════════════════════════════════════════
//  DAILY BREAKDOWN MODAL
// ════════════════════════════════════════
window.closeDailyModal=()=>document.getElementById('daily-modal').classList.remove('active');

window.openDailyDetail=()=>{
    if(!currentUser||!userData){toast('กรุณา Login ก่อน','error');return;}
    const {base,passive,total}=calcTotalDaily(userData?.pets||[]);
    const pets=userData?.pets||[];
    const petRows=pets.length===0
        ?'<div style="color:var(--muted);font-size:0.76rem;text-align:center;padding:8px 0">ยังไม่มีสัตว์เลี้ยง</div>'
        :pets.sort((a,b)=>petDailyCoins(b)-petDailyCoins(a)).map(p=>{
            const cfg=RARITY[p.rarity];
            const coins=petDailyCoins(p);
            return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
                <span style="font-size:1.3rem">${p.emoji}</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:0.78rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${formatPetName(p)}</div>
                    <div style="font-size:0.62rem;color:${cfg.color}">${cfg.label}</div>
                </div>
                <div style="font-size:0.82rem;font-weight:800;color:#6ee7b7;white-space:nowrap">+${coins}🪙</div>
            </div>`;
        }).join('');
    const content=document.getElementById('daily-content');
    if(content) content.innerHTML=`
        <div style="padding:4px 0">
            <div style="font-size:1.1rem;font-weight:800;color:var(--text);margin-bottom:14px;text-align:center">📊 รายละเอียดรายได้รายวัน</div>
            <div style="background:var(--bg);border-radius:12px;padding:10px 14px;margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0">
                    <span style="font-size:0.78rem;color:var(--muted)">🏅 รายได้ฐาน</span>
                    <span style="font-size:0.88rem;font-weight:800;color:#b45309">+${base.toLocaleString()}🪙</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-top:1px solid var(--border)">
                    <span style="font-size:0.78rem;color:var(--muted)">🐾 รายได้จากสัตว์เลี้ยง (${pets.length} ตัว)</span>
                    <span style="font-size:0.88rem;font-weight:800;color:#059669">+${passive.toLocaleString()}🪙</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 4px;border-top:2px solid var(--border);margin-top:2px">
                    <span style="font-size:0.82rem;font-weight:700;color:var(--text)">รวมทั้งหมด</span>
                    <span style="font-size:1rem;font-weight:800;color:var(--text)">+${total.toLocaleString()}🪙</span>
                </div>
            </div>
            <div style="font-size:0.72rem;font-weight:700;color:var(--muted);margin-bottom:8px">รายได้จากสัตว์เลี้ยง</div>
            <div style="max-height:260px;overflow-y:auto">${petRows}</div>
            <button onclick="closeDailyModal()" style="width:100%;margin-top:14px;background:var(--bg);border:1px solid var(--border);color:var(--muted);padding:10px;border-radius:12px;font-family:inherit;font-size:0.84rem;cursor:pointer">ปิด</button>
        </div>`;
    document.getElementById('daily-modal').classList.add('active');
};

// ════════════════════════════════════════
//  UPGRADE SELECT MODAL
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ UPGRADE SYSTEM
// ════════════════════════════════════════
window.openUpgradeModal=async(petInstId)=>{
    if(!currentUser||!userData){toast("กรุณา Login","error");return;}
    let owned=userData?.pets||[];
    // หา mainPet: ลอง match instId ก่อน แล้ว fallback id
    let mainPet=owned.find(x=>x.instId&&String(x.instId)===String(petInstId))
        ||owned.find(x=>!x.instId&&x.id===petInstId)
        ||owned.find(x=>x.id===petInstId);
    if(!mainPet){toast("ไม่พบสัตว์เลี้ยง","error");return;}
    if(mainPet.isExpedition){toast("สัตว์กำลังผจญภัยอยู่ ไม่สามารถวิวัฒนาการยีนได้","error");return;}
    // ถ้า pet (หรือใครก็ตาม) ยังไม่มี instId → patch ทั้งหมดก่อน
    if(owned.some(p=>!p.instId)){
        const patchPets=owned.map(p=>({...p,instId:p.instId||(Date.now()+'_'+Math.random().toString(36).slice(2,8))}));
        await updateDoc(doc(db,"users",currentUser.uid),{pets:patchPets});
        // รอ snapshot update — ใช้ patchPets ทำงานต่อทันที
        owned=patchPets;
        // หา mainPet ใหม่จาก patched list (match ด้วย id เพราะ instId เพิ่งเปลี่ยน)
        const origId=mainPet.id;
        mainPet=patchPets.find(p=>p.id===origId&&p.instId)||(patchPets.find(p=>p.id===origId));
        if(!mainPet){toast("เกิดข้อผิดพลาด","error");return;}
    }
    const cfg=RARITY[mainPet.rarity];
    const grade=mainPet.grade||0;
    if(grade>=12){toast("Max Grade แล้ว!","info");return;}
    const nextGrade=grade+1;
    const needed=GRADE_COPIES[nextGrade];
    // สัตว์เดียวกันที่ไม่ใช่ตัวหลัก
    const candidates=owned.filter(x=>x.id===mainPet.id&&String(x.instId)!==String(mainPet.instId)&&!x.isExpedition);
    window.__upgradeState={mainInstId:String(mainPet.instId),selected:[],needed,petId:mainPet.id};
    renderUpgradeModal(mainPet,candidates,cfg,nextGrade);
    document.getElementById('upgrade-modal').classList.add('active');
};
window.closeUpgradeModal=()=>{
    window.__upgradeState=null;
    document.getElementById('upgrade-modal').classList.remove('active');
};

function renderUpgradeModal(mainPet,candidates,cfg,nextGrade){
    const state=window.__upgradeState;
    const selCount=state.selected.length;
    const canConfirm=selCount>=state.needed;
    document.getElementById('upgrade-content').innerHTML=`
        <div style="text-align:center;margin-bottom:12px">
            <div style="font-size:2.4rem">${mainPet.emoji}</div>
            <div style="font-weight:800;font-size:1rem">${mainPet.name}</div>
            <div style="font-size:0.76rem;color:var(--muted)">
                Grade ${mainPet.grade>0?GRADE_LABELS[mainPet.grade]:'ยังไม่วิวัฒน์'} → <b style="color:${cfg.color}">Grade ${GRADE_LABELS[nextGrade]}</b>
            </div>
            <div style="margin-top:6px;font-size:0.84rem">
                เลือก <b style="color:${cfg.color}">${selCount}/${state.needed}</b> ตัวเพื่อสละ
            </div>
            <div style="background:${cfg.bg};border-radius:8px;padding:5px 10px;font-size:0.76rem;margin-top:4px;display:inline-block">
                รายได้ <b>+${Math.round(RARITY[mainPet.rarity].dailyBase*GRADE_MULTI[nextGrade])}🪙/วัน</b> · พลัง ×${STAT_MULTI[nextGrade]}
            </div>
        </div>
        ${candidates.length===0
            ?`<div style="text-align:center;color:var(--muted);padding:16px;font-size:0.84rem">ไม่มี ${mainPet.name} สำรองในกระเป๋า<br><span style="font-size:0.74rem">ต้องการ ${state.needed} ตัวเพิ่ม</span></div>`
            :`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:7px;margin-bottom:12px">
                ${candidates.map(c=>{
                    const isSel=state.selected.includes(String(c.instId));
                    const grade=c.grade||0;
                    return`<div onclick="toggleUpgradeSelect('${c.instId}')"
                        style="background:${isSel?cfg.color+'33':'rgba(255,255,255,.05)'};border:2px solid ${isSel?cfg.color:'rgba(255,255,255,.1)'};border-radius:10px;padding:8px 4px;text-align:center;cursor:pointer;transition:.15s;position:relative">
                        <div style="font-size:1.4rem">${mainPet.emoji}</div>
                        <div style="font-size:0.6rem;font-weight:700;margin-top:2px;color:rgba(255,255,255,.7)">${grade>0?'Grade '+GRADE_LABELS[grade]:'ยังไม่วิวัฒน์'}</div>
                        <div style="font-size:0.55rem;color:rgba(255,255,255,.4)">+${petDailyCoins(c)}🪙</div>
                        ${isSel?`<div style="position:absolute;top:-5px;right:-5px;background:${cfg.color};color:#fff;width:16px;height:16px;border-radius:50%;font-size:0.6rem;display:flex;align-items:center;justify-content:center;font-weight:800">✓</div>`:''}
                    </div>`;
                }).join('')}
            </div>`}
        <div style="display:flex;gap:7px">
            <button class="btn-gold" style="flex:1" onclick="confirmUpgrade()" ${canConfirm?'':'disabled'}>
                ✅ ยืนยัน (${selCount}/${state.needed})
            </button>
            <button class="btn-gray" style="flex:1" onclick="closeUpgradeModal()">ยกเลิก</button>
        </div>`;
}

window.toggleUpgradeSelect=async(instId)=>{
    // ── LOCK: ป้องกัน race condition ขณะรอ confirm dialog ──
    if(window.__upgradeSelecting){ toast('กรุณารอสักครู่','info'); return; }
    const state=window.__upgradeState;if(!state)return;
    const sid=String(instId);
    const idx=state.selected.indexOf(sid);
    if(idx>=0){
        state.selected.splice(idx,1);
    } else if(state.selected.length<state.needed){
        // ── ตรวจว่า pet ที่จะสละมี grade หรือ refine ไหม ──
        const p=(userData?.pets||[]).find(x=>String(x.instId)===sid);
        const g=p?.grade||0; const r=p?.refine||0;
        if(g>0||r>0){
            const warn=[];
            if(g>0) warn.push(`วิวัฒน์ Grade ${GRADE_LABELS[g]}`);
            if(r>0) warn.push(`ตีบวก +${r}`);
            window.__upgradeSelecting=true;
            const ok=await _confirm(
                `⚠️ Pet ที่เลือกไม่ใช่ตัวเริ่มต้น\n\n${p?.emoji||''} ${p?.name||''} (${warn.join(' · ')})\n\nถ้าสละแล้วจะหายถาวร ยืนยันหรือไม่?`
            );
            window.__upgradeSelecting=false;
            if(!ok) return;
        }
        // ── ตรวจอีกครั้งหลัง await เผื่อ state เปลี่ยนระหว่างรอ ──
        if(state.selected.length>=state.needed){ toast(`เลือกครบแล้ว`,'info'); return; }
        if(state.selected.includes(sid)){ return; } // ถูกเลือกไปแล้วในระหว่างรอ
        state.selected.push(sid);
    } else{toast(`เลือกได้แค่ ${state.needed} ตัว`,"info");return;}
    // re-render
    const owned=userData?.pets||[];
    const mainPet=owned.find(x=>String(x.instId)===String(state.mainInstId));
    const cfg=RARITY[mainPet.rarity];
    const grade=mainPet.grade||0;
    const candidates=owned.filter(x=>x.id===mainPet.id&&String(x.instId)!==String(state.mainInstId));
    renderUpgradeModal(mainPet,candidates,cfg,grade+1);
};

window.confirmUpgrade=async()=>{
    const state=window.__upgradeState;if(!state){toast("state หาย reload ใหม่","error");return;}
    if(state.selected.length<state.needed){toast(`เลือกไม่ครบ (${state.selected.length}/${state.needed})`,"error");return;}
    if(!currentUser||!userData)return;
    if(window.__upgradingPet){toast("กำลังดำเนินการ...","info");return;}
    window.__upgradingPet=true;
    const pets=[...(userData.pets||[])];
    // ลบ selected copies ออก
    const toRemove=new Set(state.selected);
    const newPets=pets.filter(p=>!toRemove.has(String(p.instId)));
    // อัพ grade ของตัวหลัก
    const mainIdx=newPets.findIndex(p=>String(p.instId)===String(state.mainInstId));
    if(mainIdx<0){toast("เกิดข้อผิดพลาด","error");return;}
    const newGrade=(newPets[mainIdx].grade||0)+1;
    newPets[mainIdx]={...newPets[mainIdx],grade:newGrade};
    window.__blockSnapshot=true;
    try{
        await updateDoc(doc(db,"users",currentUser.uid),{pets:newPets});
        // sync local userData ทันที ไม่รอ snapshot
        userData={...userData,pets:newPets};
    }catch(e){
        toast('วิวัฒน์ไม่สำเร็จ กรุณาลองใหม่','error');
        log.error('confirmUpgrade',e);
        window.__upgradingPet=false;
        window.__blockSnapshot=false;
        return;
    }finally{ setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY); }
    closeUpgradeModal();
    window.__upgradingPet=false;
    // refresh inventory view ถ้าเปิดอยู่
    if(window.__tab==='home') renderTab('home');
    const pet=newPets[mainIdx];
    const ns=calculatePetStats({...pet,grade:newGrade});toast(`${pet.emoji} Grade ${GRADE_LABELS[newGrade]}! ATK ${ns.atk} · HP ${ns.hp} · +${RARITY[pet.rarity].dailyBase*GRADE_MULTI[newGrade]}🪙/วัน`,'success');
    if(newGrade>=3 && typeof postNews==='function'){
        const _uName=userData?.nickname||userData?.name||'ผู้เล่น';
        await postNews('🧬',`${_uName} วิวัฒน์ ${pet.emoji} ถึง Grade ${GRADE_LABELS[newGrade]}! [${RARITY[pet.rarity].label}]`).catch(()=>{});
    }
    confetti({particleCount:120,spread:70,origin:{y:0.5}});
};

// ════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ HELPER UTILITIES
// ════════════════════════════════════════
/** petDisplayName(p) — ใช้ชื่อจาก PETS master (อัปเดตล่าสุด) ก่อน fallback ไป p.name ที่เก็บใน Firestore */
function petDisplayName(p){
    if(!p) return '???';
    const def=PETS.find(x=>x.id===p.id);
    return def?.name||p.name||'???';
}

function activePet(){
    // slot[0] only — legacy activePet handled by migration
    if(!userData?.pets) return null;
    const slot0=(userData.activePets||[])[0];
    if(!slot0) return null;
    return userData.pets.find(p=>p.instId&&String(p.instId)===String(slot0))
          ||userData.pets.find(p=>p.id===slot0)||null;
}
/** getActivePetsArray() — return array ของ pet objects ตาม activePets slots [0..2] */
function getActivePetsArray(userData_){
    const ud=userData_||userData;
    if(!ud?.pets) return [];
    const slots=ud.activePets||[];
    // legacy: ถ้าไม่มี activePets ให้ใช้ activePet เดี่ยว
    if(!slots.some(Boolean) && ud.activePet){
        const p=ud.pets.find(x=>x.instId&&String(x.instId)===String(ud.activePet))
               ||ud.pets.find(x=>x.id===ud.activePet);
        return p?[p]:[];
    }
    return slots.map(id=>id
        ?(ud.pets.find(x=>x.instId&&String(x.instId)===String(id))
         ||ud.pets.find(x=>x.id===id)||null)
        :null
    ).filter(Boolean);
}

window.awardCoins=async(base,trackKey)=>{
    if(!currentUser)return base;
    await updateDoc(doc(db,"users",currentUser.uid),{coins:increment(base)});
    if(trackKey)window[trackKey]=(window[trackKey]||0)+base;
    return base;
};
function myPhoto(thumb=false){if(!userData)return null;if(thumb)return userData.customPhotoThumb||userData.customPhoto||userData.googlePhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name||'?')}&size=64`;return userData.customPhoto||userData.googlePhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name||'?')}&size=256`;}

// ════════════════════════════════════════
//  NEWS FEED
// ════════════════════════════════════════
function sanitize(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
window.sanitize = sanitize; // exposed for extracted feature modules
async function postNews(icon, msg) {
    try {
        await addDoc(collection(db,"news"), {icon, msg, ts: serverTimestamp()});
        await loadTicker(); // await so ticker updates after write
    } catch(e){}
}
window.postNews = postNews; // exposed for extracted feature modules

async function loadTicker() {
    try {
        const q=query(collection(db,"news"),orderBy("ts","desc"),limit(1));
        const snap=await getDocs(q);
        let latest='ยินดีต้อนรับสู่ RxTU10 Dashboard! 🎉';
        snap.forEach(d=>{const x=d.data();latest=`${sanitize(x.icon)} ${sanitize(x.msg)}`;});
        window.__tickerCache=latest;
        const tickerInnerEl=document.querySelector('.ticker-inner');
        if(tickerInnerEl) tickerInnerEl.textContent=latest;
    } catch(e){}
}


// ════════════════════════════════════════
// ▶ NEWS FEED
// ════════════════════════════════════════
window.openFeed=async()=>{
    document.getElementById('feed-modal').classList.add('active');
    try {
        const q=query(collection(db,"news"),orderBy("ts","desc"),limit(30));
        const snap=await getDocs(q);
        let html='';
        const admin=isAdmin();
        snap.forEach(d=>{
            const x=d.data();const id=d.id;
            const ts=x.ts?.toDate?.();
            const timeStr=ts?ts.toLocaleString('th-TH',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'}):'';
            html+=`<div class="feed-item" id="news-${id}">
                <div class="feed-icon">${x.icon}</div>
                <div style="flex:1"><div class="feed-msg">${sanitize(x.msg)}</div><div class="feed-time">${timeStr}</div></div>
                ${admin?`<button onclick="deleteNews('${id}')" style="background:none;border:none;color:#ef444466;cursor:pointer;font-size:1rem;flex-shrink:0;padding:2px 4px" title="ลบ">🗑️</button>`:''}
            </div>`;
        });
        document.getElementById('feed-list').innerHTML=html||'<div style="text-align:center;color:var(--muted);padding:20px">ยังไม่มีข่าว</div>';
    } catch(e){document.getElementById('feed-list').innerHTML='<div style="color:#ef4444;text-align:center;padding:16px">โหลดไม่ได้</div>';}
};
window.closeFeed=()=>document.getElementById('feed-modal').classList.remove('active');
window.deleteNews=async(newsId)=>{
    if(!isAdmin())return;
    if(!await _confirm('ลบข้อความนี้?'))return;
    try{
        await deleteDoc(doc(db,"news",newsId));
        document.getElementById('news-'+newsId)?.remove();
        toast("ลบแล้ว","success");
        loadTicker();
    }catch(e){toast("ลบไม่ได้","error");}
};

// Megaphone

// ════════════════════════════════════════
// ▶ MEGAPHONE
// ════════════════════════════════════════
window.openMega=()=>{
    if(!currentUser){toast("Login ก่อน","error");return;}
    document.getElementById('mega-coins').textContent=(userData?.coins||0).toLocaleString();
    document.getElementById('mega-text').value='';
    document.getElementById('mega-modal').classList.add('active');
};
window.closeMega=()=>document.getElementById('mega-modal').classList.remove('active');
window.sendMegaphone=async()=>{
    if(!currentUser||!userData){toast("Login ก่อน","error");return;}
    if((userData.coins||0)<MEGA_COST){toast(`เหรียญไม่พอ! ต้องการ ${MEGA_COST}🪙`,"error");return;}
    const msg=sanitize(document.getElementById('mega-text').value.trim());
    if(!msg){toast("กรุณาพิมพ์ข้อความ","error");return;}
    const name=sanitize(userData.nickname?.split(' ')[0]||userData.name||'ไม่ระบุ');
    await updateDoc(doc(db,"users",currentUser.uid),{coins:increment(-MEGA_COST)});
    await postNews("📣",`${name}: ${msg}`);
    closeMega();
    toast("ส่งข้อความแล้ว! 📣","success");
};


// ════════════════════════════════════════
//  ADMIN
// ════════════════════════════════════════
function isAdmin(){return currentUser?.email===ADMIN_EMAIL;}

// ════════════════════════════════════════
//  STUDENT LINKING
// ════════════════════════════════════════
window.openLinkModal=()=>{
    if(!currentUser){toast("กรุณา Login ก่อน","error");return;}
    document.getElementById('link-input').value='';document.getElementById('link-error').textContent='';document.getElementById('link-preview').style.display='none';document.getElementById('link-modal').classList.add('active');
};
window.closeLinkModal=()=>document.getElementById('link-modal').classList.remove('active');
window.showGuestSection=()=>{
    document.getElementById('link-section-student').style.display='none';
    document.getElementById('link-section-guest').style.display='block';
    document.getElementById('guest-name-input').focus();
};
window.showStudentSection=()=>{
    document.getElementById('link-section-guest').style.display='none';
    document.getElementById('link-section-student').style.display='block';
};
window.confirmGuest=async()=>{
    const raw=document.getElementById('guest-name-input').value.trim();
    const err=document.getElementById('guest-error');
    if(!raw){err.textContent='กรุณาใส่ชื่อก่อน';return;}
    if(raw.length<2){err.textContent='ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';return;}
    if(!currentUser)return;
    // Guest: studentId='guest', track='guest', nickname=name ที่ตั้งเอง
    // sanitize ก่อนเก็บ — ชื่อ guest ถูก render ทุกหน้า (ป้องกัน stored XSS)
    const name=sanitize(raw);
    const welcomeEggs=[1,2].map(()=>{const p=rollPetFromEgg('pet');return{eggId:`welcome_${Date.now()}_${Math.random().toString(36).slice(2)}`,eggType:'normal',petId:p.id,petEmoji:p.emoji,petName:p.name,petRarity:p.rarity,petInstId:p.instId,hatchMins:p.hatchMins,startedAt:null};});
    await updateDoc(doc(db,"users",currentUser.uid),{studentId:'guest_'+currentUser.uid.slice(0,8),nickname:name,realName:name,track:'guest',eggs:arrayUnion(welcomeEggs[0],welcomeEggs[1])});
    closeLinkModal();
    toast(`ยินดีต้อนรับ ${raw}! 🎁 ได้รับไข่ 2 ฟอง!`,"success");
    confetti({particleCount:120,spread:70,origin:{y:0.5}});
    await postNews("👋",`${name} เพิ่งเข้าร่วม RxTU10 Dashboard ในฐานะ Guest!`);
};
window.previewLink=()=>{
    const val=document.getElementById('link-input').value.trim();const found=window.__students?.find(s=>s.id===val);
    const err=document.getElementById('link-error');const prev=document.getElementById('link-preview');
    if(!found){err.textContent='ไม่พบรหัสนี้';prev.style.display='none';return;}
    err.textContent='';document.getElementById('lp-nick').textContent=found.nickname;document.getElementById('lp-name').textContent=found.realName;
    const tb=document.getElementById('lp-track');tb.textContent=found.track.toUpperCase();tb.style.background=found.track==='sci'?'var(--sci)':'var(--care)';
    prev.style.display='block';prev.dataset.sid=val;
};
window.confirmLink=async()=>{
    if(userData?.studentId){toast("ผูกรหัสแล้ว!","info");closeLinkModal();return;}
    const prev=document.getElementById('link-preview');if(prev.style.display==='none'){toast("ตรวจสอบรหัสก่อน","error");return;}
    const sid=prev.dataset.sid;const found=window.__students?.find(s=>s.id===sid);if(!found||!currentUser)return;
    const confirmBtn=document.querySelector('#link-section-student .btn-gold');if(confirmBtn)confirmBtn.disabled=true;
    // ตรวจ cache ก่อน — ไม่เสีย Firestore reads
    const cachedAll=[...Object.values(window.__fbUsers||{}),...(window.__guestUsers||[])];
    let claimed=cachedAll.some(u=>u.studentId===sid&&u.uid!==currentUser.uid);
    // fallback getDocs เฉพาะถ้า cache ยังไม่โหลด
    if(!claimed&&Object.keys(window.__fbUsers||{}).length===0){
        const all=await getDocs(collection(db,"users"));
        all.forEach(d=>{if(d.data().studentId===sid&&d.id!==currentUser.uid)claimed=true;});
    }
    if(claimed){toast("รหัสนี้ถูกใช้แล้ว","error");if(confirmBtn)confirmBtn.disabled=false;return;}
    // Welcome package: ไข่ตำนาน×5 + ไข่การันตีตำนาน×1 + 5000🪙
    const _mkStarEgg=()=>{const p=rollPetFromStarEgg();return{eggId:`star_welcome_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,eggType:'star',petId:p.id,petEmoji:p.emoji,petName:p.name,petRarity:p.rarity,petInstId:p.instId,hatchMins:2,startedAt:null};};
    const _mkGtdEgg=()=>{const p=rollPetFromGuaranteedEgg();return{eggId:`gtd_welcome_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,eggType:'guaranteed',petId:p.id,petEmoji:p.emoji,petName:p.name,petRarity:p.rarity,petInstId:p.instId,hatchMins:1,startedAt:null};};
    const welcomeEggs=[_mkStarEgg(),_mkStarEgg(),_mkStarEgg(),_mkStarEgg(),_mkStarEgg(),_mkGtdEgg()];
    try{
        await updateDoc(doc(db,"users",currentUser.uid),{studentId:sid,nickname:found.nickname,realName:found.realName,track:found.track,coins:increment(20000),eggs:arrayUnion(...welcomeEggs)});
    }catch(e){
        toast('ผูกบัญชีไม่สำเร็จ กรุณาลองใหม่','error');
        log.error('confirmLink',e);
        if(confirmBtn) confirmBtn.disabled=false;
        return;
    }
    closeLinkModal();
    // แสดง welcome modal
    document.getElementById('wm-title').textContent=`ยินดีต้อนรับ ${found.nickname}! 🎉`;
    document.getElementById('welcome-modal').classList.add('active');
    confetti({particleCount:180,spread:90,origin:{y:0.5}});
    await postNews("🔗",`ยินดีต้อนรับ ${found.nickname} เข้าสู่ RxTU10 Dashboard! 🎉`);
};

// ════════════════════════════════════════
//  PHOTO UPLOAD
// ════════════════════════════════════════
window.triggerPhoto=()=>document.getElementById('photo-input').click();
window.handlePhoto=async(e)=>{
    const file=e.target.files[0];if(!file||!currentUser)return;
    if(!file.type.startsWith('image/')){toast("ไฟล์ต้องเป็นรูปภาพเท่านั้น","error");return;}
    if(file.size>5*1024*1024){toast("ไฟล์ใหญ่เกิน 5MB","error");return;}
    toast("กำลังประมวลผล...","info");
    const reader=new FileReader();
    reader.onload=ev=>{const img=new Image();img.onload=async()=>{
        // helper: resize canvas แล้ว return base64
        function resizeToB64(maxPx,quality){
            const c=document.createElement('canvas');
            let w=img.width,h=img.height;
            if(w>h){if(w>maxPx){h=Math.round(h*(maxPx/w));w=maxPx;}}
            else{if(h>maxPx){w=Math.round(w*(maxPx/h));h=maxPx;}}
            c.width=w;c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            return c.toDataURL('image/jpeg',quality);
        }
        // full: 200px, quality 0.72
        const full=resizeToB64(200,0.72);
        // thumb: 60px, quality 0.60
        const thumb=resizeToB64(60,0.60);
        // ตรวจ size หลัง encode — Base64 1 char ≈ 0.75 byte
        const fullKB=Math.round(full.length*0.75/1024);
        const thumbKB=Math.round(thumb.length*0.75/1024);
        // Firestore doc limit ~1MB, รูปต้องไม่เกิน 250KB รวมกัน
        if(fullKB+thumbKB>250){
            toast(`รูปหลัง compress ยังใหญ่เกิน (${fullKB+thumbKB}KB) ลองใช้รูปอื่น`,"error");
            return;
        }
        await updateDoc(doc(db,"users",currentUser.uid),{
            customPhoto:full,
            customPhotoThumb:thumb
        });
        toast(`อัพโหลดสำเร็จ! (full ${fullKB}KB · thumb ${thumbKB}KB)`,"success");
    };img.src=ev.target.result;};
    reader.readAsDataURL(file);e.target.value='';
};

// ════════════════════════════════════════
//  GACHA & HATCH
// ════════════════════════════════════════
window.buyEgg=async(eggType='pet')=>{
    if(!currentUser||!userData){toast("กรุณา Login","error");return;}
    const et=EGG_TYPES[eggType];if(!et)return;
    if(userData.coins<et.cost){toast(`เหรียญไม่พอ! ต้องการ ${et.cost}🪙`,"error");return;}
    if(!await _confirm(`🥚 ซื้อ ${et.label}\nราคา ${et.cost}🪙 · คงเหลือ ${(userData.coins||0)-et.cost}🪙\n\n${et.desc}\n\nยืนยันการซื้อ?`))return;
    const pet=rollPetFromEgg(eggType);
    const egg={eggId:Date.now()+'_'+Math.random().toString(36).slice(2),eggType,petId:pet.id,petEmoji:pet.emoji,petName:pet.name,petRarity:pet.rarity,petInstId:pet.instId,hatchMins:pet.hatchMins,startedAt:null};
    await updateDoc(doc(db,"users",currentUser.uid),{coins:increment(-et.cost),eggs:arrayUnion(egg)});
    await window._spendCoins(et.cost);
    toast(`${et.label} ได้แล้ว! ไปฟักใน Inventory 🥚`,"success");
};
// ซื้อ Instant Hatch Ticket เก็บไว้ใช้ทีหลัง
window.buyInstantHatch=async()=>{
    if(!currentUser||!userData){toast("กรุณา Login","error");return;}
    if(userData.coins<INSTANT_COST){toast(`เหรียญไม่พอ! ต้องการ ${INSTANT_COST}🪙`,"error");return;}
    if(!await _confirm(`⚡ ซื้อ Instant Hatch Ticket\nราคา ${INSTANT_COST}🪙 (คงเหลือ ${(userData.coins||0)-INSTANT_COST}🪙)\n\nยืนยันการซื้อ?`))return;
    const tickets=(userData.instantTickets||0)+1;
    await updateDoc(doc(db,"users",currentUser.uid),{coins:increment(-INSTANT_COST),instantTickets:tickets});
    toast(`⚡ ได้ Instant Hatch Ticket! มี ${tickets} ใบ`,"success");
};

// ใช้ ticket กับไข่ที่เลือก (เรียกจากหน้า Home)
window.useInstantHatch=async(eggId)=>{
    if(!currentUser||!userData)return;
    const tickets=userData.instantTickets||0;
    if(tickets<1){toast("ไม่มี Instant Hatch Ticket — ซื้อได้ที่ Shop 🛒","info");return;}
    const egg=(userData.eggs||[]).find(e=>e.eggId===eggId);
    if(!egg){toast("ไม่พบไข่","error");return;}
    if(egg.startedAt && Date.now() >= egg.startedAt + egg.hatchMins*60000){
        toast("ฟักเสร็จแล้ว! กดรับได้เลย","info");return;
    }
    // ฟักทันที: set startedAt=1, hatchMins=0
    const newEggs=(userData.eggs||[]).map(e=>e.eggId===eggId?{...e,startedAt:1,hatchMins:0}:e);
    await updateDoc(doc(db,"users",currentUser.uid),{instantTickets:tickets-1,eggs:newEggs});
    toast(`⚡ ฟักทันที! เหลือ ticket ${tickets-1} ใบ`,"success");
};

window.startHatch=async(eggId)=>{
    if(!currentUser||!userData)return;
    const eggs=(userData.eggs||[]).map(e=>e.eggId===eggId?{...e,startedAt:Date.now()}:e);
    try{
        await updateDoc(doc(db,"users",currentUser.uid),{eggs});
        toast("🔥 เริ่มฟักแล้ว!","info");
    }catch(e){ toast('เริ่มฟักไม่สำเร็จ กรุณาลองใหม่','error'); log.error('startHatch',e); }
};

window.claimEgg=async(eggId)=>{
    if(!currentUser||!userData)return;
    // ป้องกัน double-tap — disable ปุ่มทันที
    const claimBtn=document.querySelector(`[onclick*="claimEgg('${eggId}')"]`);
    if(claimBtn){claimBtn.disabled=true;claimBtn.textContent='กำลังฟัก...';}
    const egg=(userData.eggs||[]).find(e=>e.eggId===eggId);if(!egg||!egg.startedAt)return;
    if(Date.now()<egg.startedAt+egg.hatchMins*60000){toast("ยังฟักไม่เสร็จ!","error");return;}
    const newEggs=(userData.eggs||[]).filter(e=>e.eggId!==eggId);
    // สร้าง pet object ใหม่พร้อม grade:0
    const pet={id:egg.petId,emoji:egg.petEmoji,name:egg.petName,rarity:egg.petRarity,instId:egg.petInstId,grade:0};
    // เช็ค duplicate — ถ้ามีตัวเดิมแล้ว แสดง upgrade popup แทน
    const existing=(userData.pets||[]).find(p=>p.id===pet.id);
    try{
        await updateDoc(doc(db,"users",currentUser.uid),{eggs:newEggs,pets:arrayUnion(pet)});
        userData={...userData,eggs:newEggs,pets:[...(userData.pets||[]),pet]};
    }catch(e){
        toast('ฟักไม่สำเร็จ กรุณาลองใหม่','error');
        log.error('claimEgg',e);
        if(claimBtn){claimBtn.disabled=false;claimBtn.textContent='เปิดไข่!';}
        return;
    }
    if(existing){
        showDuplicatePopup(pet,existing);
    } else {
        showGachaResult(pet);
        if(pet.rarity!=='common'){
            const name=userData.nickname?.split(' ')[0]||userData.name||'?';
            const icons={rare:'✨',epic:'💥',legendary:'🌟'};
            await postNews(icons[pet.rarity]||'🎉',`${name} ฟักได้ ${pet.emoji} ${pet.name} [${RARITY[pet.rarity].label}]!`).catch(()=>{});
        }
    }
};
function showDuplicatePopup(newPet,existing){
    const cfg=RARITY[newPet.rarity];
    const curGrade=existing.grade||0;
    const nextGrade=Math.min(12,curGrade+1);
    const canUpgrade=curGrade<12;
    const copiesOwned=(userData.pets||[]).filter(p=>p.id===newPet.id).length;
    const neededForNext=canUpgrade?GRADE_COPIES[nextGrade]:0;
    const canUpgradeNow=canUpgrade&&copiesOwned>=neededForNext+1;
    _playRoulette(newPet, ()=>{
        confetti({particleCount:40,spread:60,origin:{y:0.5},colors:[cfg.color]});
        document.getElementById('gacha-result').innerHTML=`
            <div class="gacha-inner" style="--glow:${cfg.glow};padding:20px 16px 16px;animation:rouletteReveal .5s ease both">
                <div style="display:flex;gap:6px;justify-content:center;margin-bottom:6px">
                    <div class="gr-badge" style="background:${cfg.color}">${cfg.label}</div>
                    <div class="gr-badge" style="background:#475569">ได้ซ้ำ × ${copiesOwned}</div>
                </div>
                <div class="gr-emoji" style="margin:6px 0">${newPet.emoji}</div>
                <div class="gr-name">${newPet.name}</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,.5);margin:4px 0 10px">
                    Grade ปัจจุบัน <b style="color:#fff">${curGrade>0?GRADE_LABELS[curGrade]:'base'}</b>
                    ${canUpgradeNow?'· <b style="color:#4ade80">พร้อมวิวัฒนาการ!</b>':canUpgrade?'· ยังต้องการ copies อีก <b>'+(neededForNext-(copiesOwned-1))+'</b> ตัว':'· <b style="color:#fbbf24">Max Grade V</b>'}
                </div>
                <button class="btn-gold" style="width:100%;font-size:0.95rem;padding:13px" onclick="closeGacha()">✅ รับ!</button>
            </div>`;
    });
}
function showGachaResult(pet){
    const cfg=RARITY[pet.rarity];
    const def=PETS.find(x=>x.id===pet.id);
    _playRoulette(pet, ()=>{
        const colors=pet.rarity==='legendary'?['#f59e0b','#fbbf24','#fff']:pet.rarity==='epic'?['#a855f7','#c084fc','#fff']:pet.rarity==='rare'?['#3b82f6','#60a5fa','#fff']:['#94a3b8'];
        confetti({particleCount:pet.rarity==='legendary'?120:pet.rarity==='epic'?70:40,spread:75,origin:{y:0.5},colors,scalar:0.9});
        document.getElementById('gacha-result').innerHTML=`
            <div class="gacha-inner" style="--glow:${cfg.glow};padding:20px 16px 16px;animation:rouletteReveal .5s ease both">
                <div class="gr-badge" style="background:${cfg.color}">${cfg.label}</div>
                <div class="gr-emoji" style="margin:8px 0">${pet.emoji}</div>
                <div class="gr-name">${pet.name}</div>
                ${def?.flavor?`<div class="gr-desc" style="margin:4px 0 10px;padding:6px 10px;background:${cfg.bg};border-radius:8px;font-style:italic;color:${cfg.color}">&ldquo;${def.flavor}&rdquo;</div>`:''}
                <button class="btn-gold" style="width:100%;margin-top:6px;font-size:0.95rem;padding:13px" onclick="closeGacha()">✅ รับสัตว์เลี้ยง!</button>
            </div>`;
    });
}
window.closeGacha=()=>document.getElementById('gacha-modal').classList.remove('active');

// ── Roulette spinner helper ──
function _playRoulette(winnerPet, onDone){
    const allEmojis = PETS.map(p=>p.emoji);
    const cfg_w = RARITY[winnerPet.rarity];
    const modal = document.getElementById('gacha-result');
    modal.innerHTML = `
        <div class="gacha-inner" style="--glow:${cfg_w.glow};padding:24px 0 16px">
            <div style="font-size:0.65rem;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px">กำลังฟัก...</div>
            <div id="rl-emoji" style="font-size:5rem;line-height:1;min-height:5rem;filter:drop-shadow(0 0 18px rgba(255,255,255,.2));transition:none">🥚</div>
            <div id="rl-dots" style="display:flex;gap:5px;margin-top:16px">
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2)"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2)"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2)"></div>
            </div>
            <div style="font-size:0.58rem;color:rgba(255,255,255,.2);margin-top:10px;letter-spacing:.5px">แตะเพื่อข้าม</div>
        </div>`;
    window.__rouletteRunning = true;
    window.__rouletteSkip = false;
    document.getElementById('gacha-modal').classList.add('active');

    // กดตรงไหนก็ได้ขณะหมุน → skip ไปผลทันที
    const _skipHandler = () => { window.__rouletteSkip = true; };
    document.getElementById('gacha-modal').addEventListener('click', _skipHandler, {once:true});

    const el = document.getElementById('rl-emoji');
    if(!el) return;

    // กำหนด schedule: เร็ว → ปานกลาง → ช้า → หยุด
    // intervals เป็น ms: เริ่ม 60ms → 100 → 150 → 220 → 320 → หยุด
    const schedule = [
        {count:12, interval:60},
        {count:8,  interval:110},
        {count:5,  interval:180},
        {count:3,  interval:280},
        {count:2,  interval:400},
    ];

    let phase=0, tick=0;
    const doTick = () => {
        if(phase >= schedule.length || window.__rouletteSkip){ 
            // หยุดที่ winner
            el.style.transition='none';
            el.textContent = winnerPet.emoji;
            el.style.filter = `drop-shadow(0 0 24px ${cfg_w.glow})`;
            // flash glow
            setTimeout(()=>{
                el.style.animation='shufflePop .4s ease';
                const dots = document.getElementById('rl-dots');
                if(dots) dots.innerHTML = `<div style="font-size:0.72rem;color:${cfg_w.color};font-weight:800;letter-spacing:1px">${cfg_w.label}</div>`;
                setTimeout(()=>{ 
                    window.__rouletteRunning=false; 
                    window.__rouletteSkip=false;
                    document.getElementById('gacha-modal')?.removeEventListener('click', _skipHandler);
                    onDone(); 
                }, 500);
            }, 80);
            return;
        }
        const {count, interval} = schedule[phase];
        // สุ่ม emoji จาก pool (ไม่ให้ซ้ำกับ winner จนถึง phase สุดท้าย)
        const pool = phase < schedule.length-1
            ? allEmojis.filter(e=>e!==winnerPet.emoji)
            : allEmojis;
        el.textContent = pool[Math.floor(Math.random()*pool.length)];
        el.style.animation='none'; void el.offsetWidth; el.style.animation='shufflePop .12s ease';
        tick++;
        if(tick >= count){ phase++; tick=0; }
        setTimeout(doTick, interval);
    };
    setTimeout(doTick, 100);
}

/** togglePetSlot(slotIdx, instOrId) — ใส่/ถอด activePets slot 0-2 */
window.togglePetSlot=async(slotIdx, instOrId)=>{
    if(!currentUser) return;
    const id=String(instOrId);
    const slots=[...(userData?.activePets||[null,null,null])];
    while(slots.length<3) slots.push(null);
    const curSlot=slots.findIndex(s=>s&&String(s)===id);
    const p=(userData?.pets||[]).find(x=>String(x.instId||x.id)===id);
    if(curSlot===slotIdx){
        slots[slotIdx]=null;
        toast(`ถอด ${p?.emoji||''} ออกจาก ${slotIdx+1}`,'info');
    } else {
        if(curSlot>=0) slots[curSlot]=null;
        const oldId=slots[slotIdx];
        slots[slotIdx]=id;
        toast(`${p?.emoji||''} ${p?formatPetName(p):''} → ${slotIdx+1}${oldId?' (แทนที่)':''}!`,'success');
    }
    window.__blockSnapshot=true;
    userData={...userData, activePets:slots};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{activePets:slots});
        loadFbUsers();
    }catch(e){ toast('เซฟผิดพลาด','error'); }
    finally{ setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY); }
};
// Legacy shim — gacha "ใช้งานเลย!" button uses setActive
window.setActive=async(instId)=>togglePetSlot(0, instId);

window.showPetInfo=async(petInstId)=>{
    const owned=userData?.pets||[];
    const p=owned.find(x=>x.instId&&String(x.instId)===String(petInstId))
        ||owned.find(x=>x.id===petInstId);
    if(!p)return;
    // patch instId ถ้า pet เก่าไม่มี
    if(!p.instId&&currentUser){
        p.instId=Date.now()+'_'+Math.random().toString(36).slice(2,8);
        const patched=owned.map(q=>{
            if(q===p)return{...q,instId:p.instId};
            if(!q.instId)return{...q,instId:Date.now()+'_'+Math.random().toString(36).slice(2,8)};
            return q;
        });
        await updateDoc(doc(db,"users",currentUser.uid),{pets:patched});
    }
    const cfg=RARITY[p.rarity];
    const grade=p.grade||0;
    const daily=petDailyCoins(p);
    const stats=calculatePetStats(p);
    const copiesOwned=owned.filter(x=>x.id===p.id).length;
    const isMax=grade>=12;
    const nextGrade=Math.min(12,grade+1);
    const neededForNext=isMax?0:GRADE_COPIES[nextGrade];
    const totalNeeded=isMax?0:neededForNext+1;
    const canUpgrade=!isMax&&copiesOwned>=totalNeeded;
    const _slots=(userData?.activePets||[]);
    const _mySlot=_slots.findIndex(id=>id&&String(id)===String(p.instId||p.id));
    const isActive=_mySlot>=0;
    const isOnExp=!!p.isExpedition;
    const def=PETS.find(x=>x.id===p.id);
    const el=def?.element;const elInfo=ELEMENTS[el]||null;
    const refine=p.refine||0;
    const gradeHtml=grade>0?`<div class="gr-badge" style="background:#475569;margin-left:5px">Grade ${GRADE_LABELS[grade]}</div>`:'';
    const refineHtml=refine>0?`<div class="gr-badge" style="background:rgba(0,0,0,.5);color:${refineColor(refine)};margin-left:5px;border:1px solid ${refineColor(refine)}44">+${refine}${refine>=15?' 👑':''}</div>`:''; 
        document.getElementById('petinfo-content').innerHTML=
        '<div style="text-align:center">'
        +'<div style="display:flex;justify-content:center;gap:6px;margin-bottom:6px">'
        +`<div class="gr-badge" style="background:${cfg.color}">${cfg.label}</div>`
        +(elInfo?`<div class="gr-badge" style="background:#f1f5f9;color:#334155;font-size:1rem">${elInfo.emoji}</div>`:'')
        +'</div>'
        +`<div style="font-size:3rem;margin:4px 0;filter:drop-shadow(0 0 10px ${cfg.glow})">${p.emoji}</div>`
        +`<div style="font-size:1.2rem;font-weight:800;margin-bottom:2px">${formatPetName(p)}</div>`
        +`<div style="font-size:0.74rem;color:var(--muted);margin-bottom:8px">มี ${copiesOwned} ตัว</div>`
        +(def?.flavor?`<div style="font-size:0.74rem;color:${cfg.color};font-style:italic;margin-bottom:10px;padding:6px 10px;background:${cfg.bg};border-radius:8px;border-left:3px solid ${cfg.color}44">"${def.flavor}"</div>`:'')
        // stats block
        +`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">`
        +`<div style="background:${cfg.bg};border-radius:10px;padding:8px 4px;text-align:center">`
        +`<div style="font-size:0.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">ATK</div>`
        +`<div style="font-size:1.1rem;font-weight:800;color:#ef4444">⚔️ ${stats.atk}</div></div>`
        +`<div style="background:${cfg.bg};border-radius:10px;padding:8px 4px;text-align:center">`
        +`<div style="font-size:0.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">HP</div>`
        +`<div style="font-size:1.1rem;font-weight:800;color:#10b981">❤️ ${stats.hp}</div></div>`
        +`<div style="background:${cfg.bg};border-radius:10px;padding:8px 4px;text-align:center">`
        +`<div style="font-size:0.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Daily</div>`
        +`<div style="font-size:1.1rem;font-weight:800;color:${cfg.color}">+${daily}🪙</div></div>`
        +'</div>'
        +(elInfo?`<div style="background:var(--bg);border-radius:10px;padding:8px 12px;font-size:0.78rem;color:var(--text);margin-bottom:8px;display:flex;align-items:center;gap:8px">`
        +`<span style="font-size:1.1rem">${elInfo.emoji}</span>`
        +`<span>ชนะ <b style="color:#b45309">${ELEMENTS[elInfo.beats]?.emoji||''}</b> · แพ้ <b style="color:#ef4444">${Object.values(ELEMENTS).find(e=>e.beats===el)?.emoji||''}</b></span></div>`:'')
        +`<div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">`
        +`<button class="btn-gold full" onclick="closePetInfo();openUpgradeModal('${p.instId||p.id}')" ${(isMax||isOnExp)?'disabled':''}>🧬 ${isOnExp?'⏳ กำลังผจญภัย':'วิวัฒนาการยีน '+(isMax?'(Max Grade XII)':'→ Grade '+GRADE_LABELS[nextGrade])}</button>`
        +`<button style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:10px;padding:10px;color:#fff;font-family:inherit;font-size:0.85rem;font-weight:800;cursor:pointer" onclick="closePetInfo();openForgeModal('${p.instId||p.id}')">🔨 ตีบวก</button>`
        +'</div></div>';
    // Build slot buttons — 3 slots
    const _buildSlotButtons=()=>{
        const slots=userData?.activePets||[null,null,null];
        return [0,1,2].map(i=>{
            const isMine=slots[i]&&String(slots[i])===String(p.instId||p.id);
            const hasOther=slots[i]&&!isMine;
            const label=isMine?`✅ ${i+1} (ถอด)`:hasOther?`🔄 ${i+1}`:`➕ ${i+1}`;
            const bg=isMine?'#dc2626':hasOther?'#7c3aed':'#059669';
            return `<button onclick="togglePetSlot(${i},'${String(p.instId||p.id)}');closePetInfo()" style="flex:1;background:${bg};color:#fff;border:none;border-radius:9px;padding:7px 4px;font-family:inherit;font-size:0.68rem;font-weight:700;cursor:pointer">${label}</button>`;
        }).join('');
    };
    document.getElementById('petinfo-actions').innerHTML=isOnExp
        ?`<button class="btn-gray" style="flex:1" disabled>⏳ ผจญภัย</button><button class="btn-gray" style="flex:1" onclick="closePetInfo()">ปิด</button>`
        :`<div style="display:flex;gap:5px;width:100%">${_buildSlotButtons()}</div><button class="btn-gray" style="margin-top:6px;width:100%" onclick="closePetInfo()">ปิด</button>`;
    document.getElementById('petinfo-modal').classList.add('active');
};
window.closePetInfo=()=>document.getElementById('petinfo-modal').classList.remove('active');

// ════════════════════════════════════════
//  TRADE
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ TRADE SYSTEM
// ════════════════════════════════════════

// ════════════════════════════════════════
// ▶ LAB SYSTEM — Selective DNA Fusion + Force Mutation
// ════════════════════════════════════════
let __labTab='fuse';        // 'fuse' | 'mutate'
let __labFuseTarget=null;   // petId ที่เลือกใน fuse
let __labSlots=[];          // instId ที่เลือกเป็น sacrifice (max 3)
let __labFilterRarity=null; // rarity lock หลังเลือกตัวแรก (mutate)

window.openTrade=()=>{
    if(!currentUser){toast('Login ก่อน','error');return;}
    __labTab='fuse'; __labFuseTarget=null; __labSlots=[]; __labFilterRarity=null;
    document.getElementById('trade-panel').classList.add('active');
    _renderLabBody();
};
window.closeTrade=()=>{
    document.getElementById('trade-panel').classList.remove('active');
};
window.switchLabTab=(tab)=>{
    __labTab=tab; __labFuseTarget=null; __labSlots=[]; __labFilterRarity=null;
    document.getElementById('lab-tab-fuse').classList.toggle('active',tab==='fuse');
    document.getElementById('lab-tab-mutate').classList.toggle('active',tab==='mutate');
    _renderLabBody();
};

function _labMkInstId(p){ return String(p.instId||p.id); }

function _renderLabBody(){
    const el=document.getElementById('lab-body');
    if(!el) return;
    if(__labTab==='fuse') _renderLabFuse(el);
    else _renderLabMutate(el);
}

// ── Selective DNA Fusion ──────────────────────────────────────────
function _renderLabFuse(el){
    const RARITY_ORDER={legendary:0,epic:1,rare:2,common:3};
    const allPets=[...PETS].sort((a,b)=>(RARITY_ORDER[a.rarity]??9)-(RARITY_ORDER[b.rarity]??9));
    const owned=new Set((userData?.pets||[]).map(p=>p.id));
    const rarityGroups=['legendary','epic','rare','common'];

    // slot display
    const slotsHtml=`
        <div style="font-size:0.62rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:1px;margin-bottom:6px">SACRIFICE SLOTS (${__labSlots.length}/3)</div>
        <div class="lab-slot-row">${[0,1,2].map(i=>{
            const id=__labSlots[i];
            const p=id?(userData?.pets||[]).find(x=>_labMkInstId(x)===id):null;
            return`<div class="lab-slot${p?' filled':''}" ${p?`onclick="labRemoveSlot(${i})" title="คลิกเพื่อถอด"`:''}>
                ${p?`<div style="font-size:1.6rem">${p.emoji}</div><button style="position:absolute;top:-5px;right:-5px;background:#ef4444;border:none;color:#fff;width:14px;height:14px;border-radius:50%;font-size:0.5rem;cursor:pointer;padding:0" onclick="event.stopPropagation();labRemoveSlot(${i})">✕</button>`:'<span style="color:rgba(255,255,255,.15);font-size:1.2rem">＋</span>'}
            </div>`;
        }).join('')}</div>`;

    // target pet grid (all PETS pool grouped by rarity)
    const targetHtml=rarityGroups.map(r=>{
        const group=allPets.filter(p=>p.rarity===r);
        if(!group.length) return '';
        const cfg=RARITY[r];
        return`<div style="margin-bottom:10px">
            <div style="font-size:0.6rem;font-weight:800;color:${cfg.color};letter-spacing:1px;margin-bottom:5px">${cfg.label}</div>
            <div class="lab-pet-grid">${group.map(p=>{
                const isSel=__labFuseTarget===p.id;
                // check ถ้าเลือก target แล้ว slot ต้องเป็น rarity เดียวกัน
                const ownCount=(userData?.pets||[]).filter(x=>x.id===p.id).length;
                return`<div class="lab-pet-card${isSel?' sel':''}" onclick="labPickFuseTarget('${p.id}')">
                    <div style="font-size:1.5rem">${p.emoji}</div>
                    <div style="font-size:0.48rem;color:rgba(255,255,255,.7);font-weight:700;line-height:1.3;margin-top:2px">${p.name}</div>
                    <div style="font-size:0.44rem;color:rgba(255,255,255,.3)">มี ${ownCount} ตัว</div>
                </div>`;
            }).join('')}</div>
        </div>`;
    }).join('');

    // sacrifice pool — filter rarity เดียวกับ target
    const targetDef=__labFuseTarget?PETS.find(x=>x.id===__labFuseTarget):null;
    const sacrificeHtml=targetDef?`
        <div style="font-size:0.62rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:1px;margin-bottom:5px">SACRIFICE — ${RARITY[targetDef.rarity].label} (${__labSlots.length}/3)</div>
        <div class="lab-pet-grid">${(userData?.pets||[]).filter(p=>p.rarity===targetDef.rarity).map(p=>{
            const id=_labMkInstId(p); const cfg=RARITY[p.rarity];
            const isSel=__labSlots.includes(id);
            const onExp=!!p.isExpedition;
            return`<div class="lab-pet-card${isSel?' sel':''}${onExp?' disabled':''}" onclick="${onExp?'void 0':`labToggleSacrifice('${id}')`}">
                <div style="font-size:1.4rem;${onExp?'filter:grayscale(1)':''}">${p.emoji}</div>
                <div style="font-size:0.48rem;color:rgba(255,255,255,.7);font-weight:600;margin-top:2px">${formatPetName(p)}</div>
                ${onExp?'<div style="font-size:0.42rem;color:#f59e0b">⏳ ผจญภัย</div>':''}
            </div>`;
        }).join('')}</div>`
        :'<div style="font-size:0.74rem;color:rgba(255,255,255,.3);text-align:center;padding:8px 0">← เลือก pet เป้าหมายก่อน</div>';

    const canFuse=__labFuseTarget&&__labSlots.length===3;
    const fuseLabel=targetDef?`สังเคราะห์ ${targetDef.emoji} ${targetDef.name}`:'เลือก target + sacrifice 3 ตัว';

    el.innerHTML=`
        <div style="background:rgba(109,40,217,.08);border:1px solid rgba(109,40,217,.2);border-radius:12px;padding:10px 12px;margin-bottom:10px">
            <div style="font-size:0.72rem;font-weight:800;color:#a78bfa;margin-bottom:2px">🧬 Selective DNA Fusion</div>
            <div style="font-size:0.62rem;color:rgba(255,255,255,.4);line-height:1.5">รวม DNA จากสายพันธุ์เดียวกัน 3 ตัว เพื่อสังเคราะห์ตัวใหม่ที่ต้องการ (grade 0, refine 0)</div>
        </div>
        <div style="font-size:0.62rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:1px;margin-bottom:6px">TARGET PET</div>
        ${targetHtml}
        <div style="height:1px;background:rgba(255,255,255,.08);margin:10px 0"></div>
        ${slotsHtml}
        ${sacrificeHtml}
        <button onclick="labConfirmFuse()" ${canFuse?'':'disabled'} style="width:100%;margin-top:10px;background:${canFuse?'linear-gradient(135deg,#6d28d9,#7c3aed)':'rgba(255,255,255,.06)'};border:none;border-radius:12px;padding:12px;color:${canFuse?'#fff':'rgba(255,255,255,.25)'};font-family:inherit;font-size:0.84rem;font-weight:800;cursor:${canFuse?'pointer':'not-allowed'}">${fuseLabel}</button>
    `;
}

// ── Force Mutation ──────────────────────────────────────────────
function _renderLabMutate(el){
    const ownedPets=(userData?.pets||[]).filter(p=>p.rarity!=='legendary');
    const selSlots=__labSlots;
    const filterR=__labFilterRarity;

    const petCards=ownedPets.map(p=>{
        const id=_labMkInstId(p); const cfg=RARITY[p.rarity];
        const isSel=selSlots.includes(id);
        const onExp=!!p.isExpedition;
        const dimmed=filterR&&p.rarity!==filterR&&!isSel;
        return`<div class="lab-pet-card${isSel?' sel':''}${(onExp||dimmed)?' disabled':''}" onclick="${(onExp||dimmed)?'void 0':`labToggleMutate('${id}')`}">
            <div style="font-size:1.4rem;${onExp||dimmed?'filter:grayscale(.8) opacity(.4)':''}">${p.emoji}</div>
            <div style="font-size:0.48rem;color:rgba(255,255,255,.7);font-weight:600;margin-top:2px;line-height:1.3">${formatPetName(p)}</div>
            <div style="font-size:0.44rem;color:${cfg.color};font-weight:700">${cfg.label}</div>
            ${onExp?'<div style="font-size:0.4rem;color:#f59e0b">⏳</div>':''}
        </div>`;
    }).join('');

    const slotsHtml=`
        <div class="lab-slot-row">${[0,1,2].map(i=>{
            const id=selSlots[i];
            const p=id?(userData?.pets||[]).find(x=>_labMkInstId(x)===id):null;
            return`<div class="lab-slot${p?' filled':''}">
                ${p?`<div style="font-size:1.6rem">${p.emoji}</div><button style="position:absolute;top:-5px;right:-5px;background:#ef4444;border:none;color:#fff;width:14px;height:14px;border-radius:50%;font-size:0.5rem;cursor:pointer;padding:0" onclick="labRemoveMutate('${_labMkInstId(p)}')">✕</button>`:'<span style="color:rgba(255,255,255,.15);font-size:1.2rem">＋</span>'}
            </div>`;
        }).join('')}</div>`;

    const nextRarity={common:'rare',rare:'epic',epic:'legendary'};
    const resultLabel=filterR?`→ สุ่ม <b style="color:${RARITY[nextRarity[filterR]].color}">${RARITY[nextRarity[filterR]].label}</b>`:'เลือก 3 ตัว rarity เดียวกัน';
    const canMutate=selSlots.length===3&&filterR;

    el.innerHTML=`
        <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:10px 12px;margin-bottom:10px">
            <div style="font-size:0.72rem;font-weight:800;color:#fbbf24;margin-bottom:2px">⚗️ Force Mutation</div>
            <div style="font-size:0.62rem;color:rgba(255,255,255,.4);line-height:1.5">บังคับกลายพันธุ์โดยใช้ DNA ดิบ 3 สาย — ผลลัพธ์จะก้าวกระโดดสู่สายพันธุ์ที่สูงกว่า</div>
        </div>
        ${slotsHtml}
        <div style="text-align:center;font-size:0.72rem;color:rgba(255,255,255,.5);margin-bottom:8px">${resultLabel}</div>
        <div style="font-size:0.6rem;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:1px;margin-bottom:5px">เลือก SACRIFICE (ไม่รวม Legendary)</div>
        <div class="lab-pet-grid">${petCards||'<div style="color:rgba(255,255,255,.3);font-size:0.74rem;padding:8px">ไม่มีสัตว์ที่ใช้ได้</div>'}</div>
        <button onclick="labConfirmMutate()" ${canMutate?'':'disabled'} style="width:100%;margin-top:10px;background:${canMutate?'linear-gradient(135deg,#d97706,#f59e0b)':'rgba(255,255,255,.06)'};border:none;border-radius:12px;padding:12px;color:${canMutate?'#fff':'rgba(255,255,255,.25)'};font-family:inherit;font-size:0.84rem;font-weight:800;cursor:${canMutate?'pointer':'not-allowed'}">⚗️ Force Mutation!</button>
    `;
}

// ── Lab interaction handlers ──────────────────────────────────────
window.labPickFuseTarget=(petId)=>{
    __labFuseTarget=(__labFuseTarget===petId)?null:petId;
    __labSlots=[];
    _renderLabBody();
};
window.labToggleSacrifice=async(id)=>{
    if(window.__labFuseSelecting){ toast('กรุณารอสักครู่','info'); return; }
    if(__labSlots.includes(id)){
        __labSlots=__labSlots.filter(x=>x!==id);
    } else if(__labSlots.length<3){
        // ── ตรวจ grade/refine ก่อนสละ ──
        const p=(userData?.pets||[]).find(x=>_labMkInstId(x)===id);
        const g=p?.grade||0; const r=p?.refine||0;
        if(g>0||r>0){
            const warn=[];
            if(g>0) warn.push(`วิวัฒน์ Grade ${GRADE_LABELS[g]}`);
            if(r>0) warn.push(`ตีบวก +${r}`);
            window.__labFuseSelecting=true;
            const ok=await _confirm(
                `⚠️ Pet ที่เลือกไม่ใช่ตัวเริ่มต้น\n\n${p?.emoji||''} ${p?.name||''} (${warn.join(' · ')})\n\nถ้าสละใน Fusion แล้วจะหายถาวร ยืนยันหรือไม่?`
            );
            window.__labFuseSelecting=false;
            if(!ok) return;
        }
        if(__labSlots.length>=3){ toast('เลือกได้สูงสุด 3 ตัว','info'); return; }
        if(__labSlots.includes(id)){ return; }
        __labSlots.push(id);
    } else{ toast('เลือกได้สูงสุด 3 ตัว','info'); return; }
    _renderLabBody();
};
window.labRemoveSlot=(i)=>{ __labSlots.splice(i,1); _renderLabBody(); };
window.labToggleMutate=async(id)=>{
    if(window.__labMutateSelecting){ toast('กรุณารอสักครู่','info'); return; }
    if(__labSlots.includes(id)){
        __labSlots=__labSlots.filter(x=>x!==id);
        if(__labSlots.length===0) __labFilterRarity=null;
        else {
            const firstPet=(userData?.pets||[]).find(x=>_labMkInstId(x)===__labSlots[0]);
            __labFilterRarity=firstPet?.rarity||null;
        }
    } else if(__labSlots.length<3){
        const p=(userData?.pets||[]).find(x=>_labMkInstId(x)===id);
        if(!p) return;
        if(__labFilterRarity&&p.rarity!==__labFilterRarity){ toast('ต้องเลือก rarity เดียวกัน','info'); return; }
        // ── ตรวจ grade/refine ก่อนสละ ──
        const g=p?.grade||0; const r=p?.refine||0;
        if(g>0||r>0){
            const warn=[];
            if(g>0) warn.push(`วิวัฒน์ Grade ${GRADE_LABELS[g]}`);
            if(r>0) warn.push(`ตีบวก +${r}`);
            window.__labMutateSelecting=true;
            const ok=await _confirm(
                `⚠️ Pet ที่เลือกไม่ใช่ตัวเริ่มต้น\n\n${p?.emoji||''} ${p?.name||''} (${warn.join(' · ')})\n\nถ้าสละใน Mutation แล้วจะหายถาวร ยืนยันหรือไม่?`
            );
            window.__labMutateSelecting=false;
            if(!ok) return;
        }
        if(__labSlots.length>=3){ toast('เลือกได้สูงสุด 3 ตัว','info'); return; }
        if(__labSlots.includes(id)){ return; }
        __labSlots.push(id);
        if(__labSlots.length===1) __labFilterRarity=p.rarity;
    } else { toast('เลือกได้สูงสุด 3 ตัว','info'); return; }
    _renderLabBody();
};
window.labRemoveMutate=(id)=>{ 
    __labSlots=__labSlots.filter(x=>x!==id);
    if(__labSlots.length===0) __labFilterRarity=null;
    _renderLabBody();
};

// ── Confirm Fuse ─────────────────────────────────────────────────
window.labConfirmFuse=async()=>{
    if(!currentUser||!userData) return;
    const targetDef=PETS.find(x=>x.id===__labFuseTarget);
    if(!targetDef||__labSlots.length!==3){ toast('ข้อมูลไม่ครบ','error'); return; }
    const sNames=__labSlots.map(id=>{const p=(userData.pets||[]).find(x=>_labMkInstId(x)===id); return p?p.emoji:'?';}).join(' ');
    if(!await _confirm(`🧬 Selective DNA Fusion\n${sNames} → ${targetDef.emoji} ${targetDef.name}\n\nสละ 3 ตัว เพื่อสังเคราะห์ตัวใหม่ grade 0 refine 0\n\nยืนยัน?`)) return;

    // สร้าง pet ใหม่
    const newPet={...targetDef, instId:`${targetDef.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, grade:0, refine:0};
    // ลบ sacrifice
    let pets=[...(userData.pets||[])];
    for(const id of __labSlots){
        const idx=pets.findIndex(x=>_labMkInstId(x)===id);
        if(idx>=0) pets.splice(idx,1);
    }
    pets.push(newPet);

    window.__blockSnapshot=true;
    userData={...userData,pets};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{pets});
        const _name=userData?.nickname||userData?.name||'ผู้เล่น';
        await postNews('🧬',`${_name} สังเคราะห์ ${newPet.emoji} ${newPet.name} สำเร็จ!`).catch(()=>{});
    }catch(e){ toast('บันทึกผิดพลาด','error'); }
    finally{ setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY); }

    __labFuseTarget=null; __labSlots=[];
    closeTrade();
    // แสดงผลผ่าน roulette
    document.getElementById('gacha-modal').classList.add('active');
    showGachaResult(newPet);
    toast(`🧬 สังเคราะห์สำเร็จ! ได้ ${newPet.emoji} ${newPet.name}!`,'success');
};

// ── Confirm Mutation ─────────────────────────────────────────────
window.labConfirmMutate=async()=>{
    if(!currentUser||!userData||__labSlots.length!==3||!__labFilterRarity) return;
    const nextRarity={common:'rare',rare:'epic',epic:'legendary'};
    const resultRarity=nextRarity[__labFilterRarity];
    if(!resultRarity){ toast('ไม่สามารถ Mutate ได้','error'); return; }
    const sNames=__labSlots.map(id=>{const p=(userData.pets||[]).find(x=>_labMkInstId(x)===id);return p?p.emoji:'?';}).join(' ');
    if(!await _confirm(`⚗️ Force Mutation\n${sNames} → สุ่ม ${RARITY[resultRarity].label}\n\nสละ 3 ตัว เพื่อบังคับกลายพันธุ์\n\nยืนยัน?`)) return;

    // สุ่ม pet จาก pool ของ resultRarity
    const pool=PETS.filter(p=>p.rarity===resultRarity);
    const picked=pool[Math.floor(Math.random()*pool.length)];
    const newPet={...picked, instId:`${picked.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, grade:0, refine:0};

    let pets=[...(userData.pets||[])];
    for(const id of __labSlots){
        const idx=pets.findIndex(x=>_labMkInstId(x)===id);
        if(idx>=0) pets.splice(idx,1);
    }
    pets.push(newPet);

    window.__blockSnapshot=true;
    userData={...userData,pets};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{pets});
        const _name=userData?.nickname||userData?.name||'ผู้เล่น';
        await postNews('⚗️',`${_name} Force Mutation สำเร็จ! ได้ ${newPet.emoji} ${newPet.name} [${RARITY[newPet.rarity].label}]!`).catch(()=>{});
    }catch(e){ toast('บันทึกผิดพลาด','error'); }
    finally{ setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY); }

    __labSlots=[]; __labFilterRarity=null;
    closeTrade();
    document.getElementById('gacha-modal').classList.add('active');
    showGachaResult(newPet);
};

// ════════════════════════════════════════
//  QUIZ — ทายชื่อเพื่อน
// ════════════════════════════════════════
window.startQuiz=()=>{
    qScore=0;__quizTop5Posted=false;window.__qCoinsEarned=0;
    const qs=document.getElementById('q-score');if(qs){qs.textContent='0';qs.classList.remove('score-flash');}
    document.getElementById('quiz-start').style.display='none';document.getElementById('quiz-play').style.display='block';nextQ();
};
window.nextQ=()=>{
    const s=window.__students;if(!s?.length)return;
    const st=s[Math.floor(Math.random()*s.length)];qAnswer=st.realName;
    document.getElementById('q-nick').textContent=st.nickname.split(' ')[0];
    // shuffle แทน while-loop: สุ่ม pool แล้ว slice — ป้องกัน infinite loop
    const wrongPool=[...new Set(s.map(x=>x.realName))].filter(n=>n!==qAnswer).sort(()=>Math.random()-.5);
    const opts=[qAnswer,...wrongPool.slice(0,3)].sort(()=>Math.random()-.5);
    opts.sort(()=>Math.random()-0.5);
    document.getElementById('q-opts').innerHTML=opts.map(o=>`<button class="q-btn" onclick="answerQ(this,'${o.replace(/'/g,"\\'")}')">${o}</button>`).join('');
};
window.answerQ=async(btn,ans)=>{
    document.querySelectorAll('.q-btn').forEach(b=>{
        b.disabled=true;
        if(b.textContent===qAnswer) b.classList.add('correct');
        else if(b.textContent===ans) b.classList.add('wrong');
    });
    if(ans===qAnswer){
        qScore++;
        const qs=document.getElementById('q-score');qs.textContent=qScore;qs.classList.remove('score-flash');void qs.offsetWidth;qs.classList.add('score-flash');
        await window.awardCoins(20,'__qCoinsEarned');
        confetti({particleCount:25,spread:50,origin:{y:0.7},colors:['#10b981']});
        setTimeout(nextQ,700);
    } else {
        const finalScore=qScore;
        const name=userData?.nickname?.split(' ')[0]||userData?.name||'?';
        if(currentUser&&finalScore>qHigh){
            qHigh=finalScore;
            await updateDoc(doc(db,"users",currentUser.uid),{quizHigh:finalScore});
            if(finalScore>30) await postNews("🏆",`${name} ทำคะแนน ${finalScore} ในเกม ทายชื่อเพื่อน`);
            // อัพ quizHigh ใน cache ด้วย
            if(userData?.studentId&&window.__fbUsers?.[userData.studentId])window.__fbUsers[userData.studentId].quizHigh=finalScore;
        } else if(currentUser&&finalScore>=10&&!__quizTop5Posted){
            __quizTop5Posted=true;
            if(finalScore>30) await postNews("🎮",`${name} ทำคะแนน ${finalScore} ในเกม ทายชื่อเพื่อน`);
        }
        setTimeout(()=>{
            document.getElementById('quiz-start').style.display='block';
            document.getElementById('quiz-play').style.display='none';
            const earned=window.__qCoinsEarned||0;
            document.getElementById('q-msg').innerHTML=`ตอบผิด! ชื่อจริงคือ <b style="color:#fbbf24">${qAnswer}</b><br>คะแนน: ${finalScore} · ได้ <b style="color:#fbbf24">+${earned}🪙</b><br><span style="font-size:0.76rem;opacity:.7">สถิติ: ${Math.max(finalScore,qHigh)}</span>`;
            // refresh leaderboard
            const qlb=document.getElementById('qlb');if(qlb&&qlb.style.display!=='none')qlb.innerHTML=window.buildQuizLb();
        },1000);
    }
};

// ════════════════════════════════════════
//  DRUG QUIZ — MCQ
// ════════════════════════════════════════
window.startDrugQuiz=()=>{
    dqScore=0;__drugTop5Posted=false;window.__dqCoinsEarned=0;
    const ds=document.getElementById('dq-score');if(ds){ds.textContent='0';ds.classList.remove('score-flash');}
    document.getElementById('dquiz-start').style.display='none';document.getElementById('dquiz-play').style.display='block';nextDQ();
};
window.nextDQ=()=>{
    const d=DRUGS[Math.floor(Math.random()*DRUGS.length)];dqAnswer=d.a;
    document.getElementById('dq-drug').textContent=d.n;
    const wrongDQ=[...new Set(DRUGS.map(x=>x.a))].filter(a=>a!==d.a).sort(()=>Math.random()-.5);
    const opts=[d.a,...wrongDQ.slice(0,3)].sort(()=>Math.random()-.5);
    opts.sort(()=>Math.random()-0.5);
    document.getElementById('dq-opts').innerHTML=opts.map(o=>`<button class="q-btn" onclick="answerDQ(this,'${o.replace(/'/g,"\\'")}')" style="font-size:0.76rem;text-align:left;padding:9px 10px">${o}</button>`).join('');
};
window.answerDQ=async(btn,ans)=>{
    document.querySelectorAll('#dq-opts .q-btn').forEach(b=>{b.disabled=true;if(b.textContent===dqAnswer)b.classList.add('correct');else if(b.textContent===ans)b.classList.add('wrong');});
    if(ans===dqAnswer){
        dqScore++;
        const ds=document.getElementById('dq-score');ds.textContent=dqScore;ds.classList.remove('score-flash');void ds.offsetWidth;ds.classList.add('score-flash');
        await window.awardCoins(20,'__dqCoinsEarned');confetti({particleCount:25,spread:50,origin:{y:0.7},colors:['#818cf8','#a5b4fc']});
        setTimeout(nextDQ,700);
    } else {
        const finalScore=dqScore;
        const name2=userData?.nickname?.split(' ')[0]||userData?.name||'?';
        if(currentUser&&finalScore>dqHigh){
            dqHigh=finalScore;await updateDoc(doc(db,"users",currentUser.uid),{drugHigh:finalScore});
            if(finalScore>30) await postNews("💊",`${name2} ทำคะแนน ${finalScore} ในเกม ทายยา`);
            if(userData?.studentId&&window.__fbUsers?.[userData.studentId])window.__fbUsers[userData.studentId].drugHigh=finalScore;
        } else if(currentUser&&finalScore>=10&&!__drugTop5Posted){
            __drugTop5Posted=true;
            if(finalScore>30) await postNews("🎮",`${name2} ทำคะแนน ${finalScore} ในเกม ทายยา`);
        }
        setTimeout(()=>{
            document.getElementById('dquiz-start').style.display='block';
            document.getElementById('dquiz-play').style.display='none';
            const earned2=window.__dqCoinsEarned||0;
            document.getElementById('dq-msg').innerHTML=`ตอบผิด! Drug Class คือ <b style="color:#a5b4fc">${dqAnswer}</b><br>คะแนน: ${finalScore} · ได้ <b style="color:#fbbf24">+${earned2}🪙</b><br><span style="font-size:0.76rem;opacity:.7">สถิติ: ${Math.max(finalScore,dqHigh)}</span>`;
            const dqlb=document.getElementById('dqlb');if(dqlb&&dqlb.style.display!=='none')dqlb.innerHTML=window.buildDrugLb();
        },1000);
    }
};

// ════════════════════════════════════════
//  RENDER ENGINE
// ════════════════════════════════════════
/** renderAll() — เรียกเมื่อ userData เปลี่ยน (Firestore snapshot)
 *  Guard: ไม่ re-render ถ้ากำลังเล่นเกมอยู่ (จะทำลาย game state) */
window.renderAll=()=>{
    const tab=window.__tab||'home';
    if(tab==='play'){
        const inGame=document.getElementById('quiz-play')?.style.display==='block'
                  || document.getElementById('dquiz-play')?.style.display==='block';
        if(inGame) return;
    }
    renderTab(tab);
};


window.switchTab=(tab)=>{
    window.__tab=tab;
    document.querySelectorAll('.bn-item').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
    renderTab(tab);
    const mc=document.getElementById('main-content');if(mc)mc.scrollTop=0;
};

function renderTab(tab){
    const main=document.getElementById('main-content');
    if(tab==='home')    main.innerHTML=buildHome();
    if(tab==='members') main.innerHTML=buildMembers();
    if(tab==='play'){ main.innerHTML=buildPlay(); loadTicker(); }
    if(tab==='shop')    main.innerHTML=buildShop();
    if(tab==='rank')    main.innerHTML=buildLeaderboard();
    if(tab==='admin')   main.innerHTML=buildAdmin();
}

// ════════════════════════════════════════
//  TAB: HOME
// ════════════════════════════════════════
const GOOGLE_SVG=`<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

// ════════════════════════════════════════
// ▶ TAB BUILDERS — HOME
// ════════════════════════════════════════
function buildHome(){
    if(!currentUser)return`
        <div style="background:linear-gradient(160deg,#4338ca,#4f46e5,#6366f1);border-radius:24px;padding:40px 20px 36px;text-align:center;color:#fff;box-shadow:0 8px 32px rgba(79,70,229,.3)">
            <div style="font-size:4.5rem;margin-bottom:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.2))">💊</div>
            <div style="font-size:2rem;font-weight:800;letter-spacing:-1px;margin-bottom:2px">RxTU10</div>
            <div style="color:rgba(255,255,255,.75);margin-bottom:28px;font-size:0.84rem;letter-spacing:.5px">CLASS DASHBOARD · Rx 2565 · THAMMASAT</div>
            <button class="btn-google big" onclick="loginGoogle()" style="border-radius:14px;padding:13px 22px;font-size:0.95rem">${GOOGLE_SVG}Login ด้วย Google</button>
            <p style="font-size:0.74rem;color:rgba(255,255,255,.6);margin-top:14px">Login แล้วผูกรหัสนักศึกษาเพื่อเข้าถึงทุกฟีเจอร์</p>
        </div>`;
    const pet=activePet();const tc=userData?.track==='sci'?'var(--sci)':'var(--care)';

    const linked=userData?.studentId;
    const dailyTotal=calcTotalDaily(userData?.pets||[]).total;
    const profileBlock=linked?`
        <div class="home-hero" style="margin:-12px -12px 10px">
            <div class="hero-bg">
                <div class="hero-top">
                    <div class="pc-img-wrap">
                        <img loading="lazy" src="${myPhoto()}" class="pc-img" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=?'">
                        <button class="pc-cam" onclick="triggerPhoto()">📷</button>
                    </div>
                    <div style="flex:1;min-width:0">
                        <div class="pc-nick">${userData.nickname}</div>
                        <div class="pc-real">${userData.realName}</div>
                        <div class="pc-id">${userData.studentId}</div>
                        <div style="display:flex;align-items:center;gap:5px;margin-top:4px;flex-wrap:wrap">
                            <span class="track-badge" style="background:${tc}">${userData.track?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div class="hero-actions">
                    <div class="coin-pill" onclick="switchTab('shop')">🪙 ${(userData.coins||0).toLocaleString()}</div>
                    <button class="btn-out-hero" onclick="logoutUser()">ออก</button>
                </div>
            </div>
            <!-- Pet Team Slots -->
            <div style="background:rgba(0,0,0,.12);border-top:1px solid rgba(255,255,255,.15);padding:10px 14px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">                ${[0,1,2].map(i=>{
                    const slotId=(userData?.activePets||[])[i]||null;
                    const p=slotId?(userData?.pets||[]).find(x=>x.instId&&String(x.instId)===String(slotId)||(x.id===slotId)):null;
                    const cfg=p?RARITY[p.rarity]:null;
                    return p
                        ?`<div onclick="showPetInfo('${String(p.instId||p.id)}')" style="background:${cfg.bg};border:1.5px solid ${cfg.color}44;border-radius:12px;padding:8px 4px;text-align:center;cursor:pointer;transition:.15s;">
                            <div style="font-size:1.8rem;filter:drop-shadow(0 0 6px ${cfg.glow})">${p.emoji}</div>
                            <div style="font-size:0.58rem;font-weight:700;color:${cfg.color};margin-top:2px;line-height:1.2">${formatPetName(p)}</div>
                            <div style="font-size:0.5rem;color:rgba(255,255,255,.65)">Slot ${i+1}</div>
                          </div>`
                        :`<div onclick="switchTab('home')" style="background:rgba(255,255,255,.12);border:1.5px dashed rgba(255,255,255,.4);border-radius:12px;padding:8px 4px;text-align:center;cursor:pointer;">
                            <div style="font-size:1.4rem;opacity:.5">➕</div>
                            <div style="font-size:0.55rem;color:rgba(255,255,255,.6);margin-top:2px">Slot ${i+1}</div>
                          </div>`;
                }).join('')}
            </div>
            <div class="hero-stats" style="grid-template-columns:repeat(4,1fr)">
                <div class="hs-cell"><b>${userData.quizHigh||0}</b><small>👥 Quiz</small></div>
                <div class="hs-cell"><b>${userData.drugHigh||0}</b><small>💊 Drug</small></div>
                <div class="hs-cell"><b>${userData.towerBest||0}</b><small>🗼 Tower</small></div>
                <div class="hs-cell"><b>${userData.pvpVictories||0}</b><small>⚔️ PvP</small></div>
            </div>
            <div style="background:#f8fafc;border-top:1px solid var(--border);padding:12px 14px">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <span style="font-size:0.62rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase">ช่องทางติดต่อ</span>
                    <div style="display:flex;align-items:center;gap:8px">
                        <button onclick="openContactEdit()" style="background:var(--primary-light);border:1px solid #c7d2fe;color:var(--primary);border-radius:8px;padding:5px 11px;font-size:0.68rem;font-weight:700;cursor:pointer;font-family:inherit">✏️ แก้ไขข้อมูลติดต่อ</button>
                    </div>
                </div>
                ${(()=>{const c=userData?.contact||{};return[
                    {icon:'📱',label:'เบอร์',val:c.phone},
                    {icon:'📸',label:'IG',   val:c.ig},
                    {icon:'💬',label:'LINE', val:c.line}
                ].map(x=>`<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;background:var(--surface);border-radius:9px;border:1px solid var(--border);margin-bottom:6px">
                    <span style="font-size:1rem;width:20px;text-align:center">${x.icon}</span>
                    <span style="font-size:0.68rem;color:var(--muted);width:32px;flex-shrink:0">${x.label}</span>
                    <span style="font-size:0.82rem;color:${x.val?'var(--text)':'#cbd5e1'};font-family:'Space Mono',monospace;font-weight:${x.val?700:400}">${x.val||'—'}</span>
                </div>`).join('');})()}
            </div>
        </div>
`
        :`<div style="background:var(--surface);border-radius:20px;padding:0;overflow:hidden;margin-bottom:10px;border:1px solid var(--border);box-shadow:var(--shadow-md)">
            <div style="padding:20px 18px 16px;display:flex;align-items:center;gap:14px">
                <img loading="lazy" src="${myPhoto()}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=?'">
                <div style="flex:1;min-width:0">
                    <div style="font-weight:800;font-size:1rem;color:var(--text)">${userData?.name||'ยินดีต้อนรับ!'}</div>
                    <div style="font-size:0.78rem;color:var(--muted);margin-top:2px">Login แล้ว — ผูกรหัสเพื่อเข้าถึงทุกฟีเจอร์</div>
                </div>
                <button class="btn-gray" onclick="logoutUser()" style="flex-shrink:0">ออก</button>
            </div>
            <div style="padding:0 18px 18px">
                <button onclick="openLinkModal()" style="width:100%;background:linear-gradient(135deg,var(--primary),#4338ca);color:#fff;border:none;border-radius:14px;padding:14px;font-family:inherit;font-size:1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 14px rgba(79,70,229,.3);transition:.2s">
                    🔗 ผูกรหัสนักศึกษา
                </button>
                <div style="text-align:center;margin-top:10px;font-size:0.74rem;color:var(--muted)">
                    ไม่มีรหัสนักศึกษา? <button onclick="openLinkModal()" style="background:none;border:none;color:var(--primary);font-size:0.74rem;cursor:pointer;font-family:inherit;text-decoration:underline">เข้าแบบ Guest</button>
                </div>
            </div>
        </div>`;

    // ── Achievement / Collection stats ──
    const pets=userData?.pets||[];
    const uniqueIds=[...new Set(pets.map(p=>p.id))];
    const total=PETS.length; // 21
    const pct=Math.round(uniqueIds.length/total*100);
    const byRarity={common:0,rare:0,epic:0,legendary:0};
    uniqueIds.forEach(id=>{const def=PETS.find(x=>x.id===id);if(def)byRarity[def.rarity]++;});
    const tiers=[
        {label:'🔰 นักเก็บมือใหม่', need:1,  reward:''},
        {label:'🐾 นักสำรวจ',       need:5,  reward:''},
        {label:'🌿 ผู้เลี้ยงสัตว์',  need:10, reward:''},
        {label:'🏆 นักสะสมตัวยง',   need:15, reward:''},
        {label:'👑 Master Collector',need:21, reward:''},
    ];
    const achieved=tiers.filter(t=>uniqueIds.length>=t.need);
    const nextTier=tiers.find(t=>uniqueIds.length<t.need);
    const achTitle=achieved.length?achieved[achieved.length-1].label:'';
    const {base,passive,total:todayTotal}=calcTotalDaily(pets);

    const achieveBlock=`
    <div class="coll-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
                <div style="font-size:0.68rem;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px">🏅 คอลเลกชัน</div>
                <div style="font-weight:800;font-size:1.1rem;color:var(--text)">${uniqueIds.length} <span style="color:var(--muted);font-size:0.8rem">/ ${total} สายพันธุ์</span></div>
                ${achTitle?`<div style="font-size:0.74rem;color:#fbbf24;font-weight:600;margin-top:2px">${achTitle}</div>`:''}
            </div>
            <div style="text-align:right">
                <div style="font-size:0.64rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">daily income</div>
                <div style="display:flex;align-items:center;gap:6px">
                    <div style="font-size:1.2rem;font-weight:800;color:#059669">+${todayTotal}🪙</div>
                    <button id="daily-claim-btn" onclick="claimDaily()" style="background:linear-gradient(135deg,#059669,#047857);border:none;border-radius:8px;padding:3px 9px;color:#fff;font-family:inherit;font-size:0.65rem;font-weight:800;cursor:pointer;white-space:nowrap;transition:.2s;line-height:1.4">💰 รับ</button>
                </div>
                <div style="font-size:0.62rem;color:var(--muted)" id="daily-claim-status">ต่อวัน</div>
                <div style="font-size:0.6rem;color:var(--primary);margin-top:3px;cursor:pointer;text-decoration:underline;text-underline-offset:2px" onclick="openDailyDetail()">ดูรายละเอียด</div>
            </div>
        </div>
        <div class="coll-bar-bg"><div class="coll-bar-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">
            ${[['common','#94a3b8'],[' rare','#60a5fa'],['epic','#c084fc'],['legendary','#fbbf24']].map(([r,c])=>`
            <span class="rarity-chip" style="background:${c}18;color:${c};border-color:${c}33">
                ${r.trim().toUpperCase()} ${byRarity[r.trim()]}/${PETS.filter(p=>p.rarity===r.trim()).length}
            </span>`).join('')}
        </div>
        ${nextTier
            ?`<div style="margin-top:9px;font-size:0.74rem;color:var(--muted)">🎯 ถัดไป: <span style="color:#b45309;font-weight:700">${nextTier.label}</span> (สะสม ${nextTier.need} สายพันธุ์)</div>`
            :'<div style="margin-top:9px;font-size:0.78rem;color:#fbbf24;font-weight:700">🏆 Master Collector!</div>'}
    </div>`;

    // Inventory: hatching eggs first
    const eggs=userData?.eggs||[];const now=Date.now();
    const eggSection=eggs.length?`
        <div class="egg-section-head"><span>🥚 ไข่ที่มี (${eggs.length})</span></div>
        <div class="card">${eggs.map(egg=>{
            const hatching=!!egg.startedAt;const done=hatching&&(now>=egg.startedAt+egg.hatchMins*60000);
            // ซ่อน rarity จนกว่าจะฟักเสร็จ — แสดงแค่เวลาฟัก
            const cfg={color:'rgba(255,255,255,.4)',bg:'rgba(255,255,255,.05)',label:'???'}; // ซ่อน rarity ก่อนเปิด
            let timeLeft='';if(hatching&&!done){const ms=(egg.startedAt+egg.hatchMins*60000)-now;const h=Math.floor(ms/3600000);const m=Math.floor((ms%3600000)/60000);const s=Math.floor((ms%60000)/1000);timeLeft=h>0?`${h}ชม ${m}น`:m>0?`${m}น ${s}ว`:`${s}ว`;}
            const pct=hatching&&!done?Math.min(100,Math.floor((now-egg.startedAt)/(egg.hatchMins*60000)*100)):0;
            const eggEmoji=egg.eggType==='star'?'🌠':egg.eggType==='glow'?'🌐':egg.eggType==='guaranteed'?'🎁':'🥚';
            const eggLabel=egg.eggType==='star'?'ไข่ตำนาน 🌠':egg.eggType==='glow'?'ไข่เรืองแสง 🌐':egg.eggType==='guaranteed'?'ไข่การันตีตำนาน 🎁':'ไข่ปริศนา 🔮';
            return`<div class="egg-bag-item" style="--rc:${cfg.color};--rb:${cfg.bg}">
                <div style="font-size:2rem;flex-shrink:0">${done?'❓':eggEmoji}</div>
                <div style="flex:1;min-width:0">
                    <div style="font-weight:700;font-size:0.86rem">${eggLabel}</div>
                    <div style="font-size:0.68rem;color:${cfg.color};font-weight:700">${done?cfg.label+' • '+HATCH_LABELS[egg.petRarity]:'กำลังรอฟัก...'}</div>
                    ${hatching&&!done?`<div class="hatch-bar"><div class="hatch-fill" style="width:${pct}%;background:#94a3b8"></div></div><div id="hatch-cd-${egg.eggId}" style="font-size:0.67rem;color:var(--muted)">เหลือ ${timeLeft}</div>`:''}
                    ${done?`<div style="font-size:0.72rem;color:var(--care);font-weight:600">✅ ฟักเสร็จ!</div>`:''}
                    ${!hatching?`<div style="font-size:0.67rem;color:var(--muted)">กดปุ่มเพื่อเริ่มฟัก</div>`:''}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0">
                    ${done
                        ? `<button class="btn-gold sm" onclick="claimEgg('${egg.eggId}')">รับ!</button>`
                        : !hatching
                            ? `<button class="btn-gray sm" onclick="startHatch('${egg.eggId}')">🔥 ฟัก</button>`
                            : `<span style="font-size:1.1rem">⏳</span>`
                    }
                    ${!done && (userData?.instantTickets||0)>0
                        ? `<button onclick="useInstantHatch('${egg.eggId}')" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:7px;padding:3px 8px;color:#fff;font-size:0.68rem;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit">⚡ ใช้ ticket</button>`
                        : ''
                    }
                </div>
            </div>`;
        }).join('')}</div>`:''

    // Sort logic — global fn เพื่อให้ onclick ทำงานได้เสมอ
    if(!window.setInvSort){
        window.setInvSort = (mode) => { window.__invSort=mode; renderTab('home'); };
    }
    const RARITY_ORDER = {legendary:0,epic:1,rare:2,common:3};
    const __sortMode = window.__invSort||'rarity';
    const sortedPets = [...pets].sort((a,b)=>{
        if(__sortMode==='rarity'){
            const ra = RARITY_ORDER[a.rarity] ?? 9;
            const rb = RARITY_ORDER[b.rarity] ?? 9;
            if(ra!==rb) return ra-rb;
            return (b.grade||0)-(a.grade||0);
        }
        if(__sortMode==='grade') return ((b.grade||0)*16+(b.refine||0))-((a.grade||0)*16+(a.refine||0));
        if(__sortMode==='daily') return petDailyCoins(b)-petDailyCoins(a);
        if(__sortMode==='slot'){
            const slots=userData?.activePets||[];
            const ai=slots.findIndex(id=>id&&String(id)===String(a.instId||a.id));
            const bi=slots.findIndex(id=>id&&String(id)===String(b.instId||b.id));
            const as=ai>=0?ai:99; const bs=bi>=0?bi:99;
            return as-bs||petDailyCoins(b)-petDailyCoins(a);
        }
        return 0;
    });
    const SORT_LABELS = {rarity:'⭐ Rarity',grade:'🧬 Grade',daily:'🪙 Daily',slot:'🎯 Team'};
    const sortBtns = ['rarity','grade','daily','slot'].map(m=>{
        const active = __sortMode===m;
        return `<button onclick="setInvSort('${m}')" style="background:${active?'rgba(99,102,241,.35)':'rgba(255,255,255,.05)'};border:1px solid ${active?'rgba(99,102,241,.6)':'rgba(255,255,255,.12)'};color:${active?'#a5b4fc':'rgba(255,255,255,.5)'};border-radius:7px;padding:3px 9px;font-size:0.62rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:.15s">${SORT_LABELS[m]}</button>`;
    }).join('');

    const invBlock=pets.length===0?`<div class="inv-empty">ยังไม่มีสัตว์เลี้ยง — ฟักไข่ใน 🛒 Shop ก่อน!</div>`
        :`<div style="display:flex;align-items:center;gap:5px;margin-bottom:8px;flex-wrap:wrap">
            <span style="font-size:0.6rem;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:1px">เรียงโดย</span>
            ${sortBtns}
          </div>
          <div class="inv-grid">${sortedPets.map(p=>{const cfg=RARITY[p.rarity];const _activePetSlots=(userData?.activePets||[]);const _slotIdx=_activePetSlots.findIndex(id=>id&&String(id)===String(p.instId||p.id));const on=_slotIdx>=0;const gr=p.grade||0;const pDef=PETS.find(x=>x.id===p.id);const elEmoji=ELEMENTS[pDef?.element]?.emoji||'';return(()=>{const onExp=!!p.isExpedition;return`<div class="inv-item${on?' on':''}" style="--rc:${cfg.color};--rb:${cfg.bg};position:relative;${onExp?'opacity:.45;':''}" onclick="${onExp?'void toast(\'กำลังผจญภัยอยู่\',\'info\')':'showPetInfo(\''+String(p.instId||p.id)+'\')'}"><div class="inv-em" style="${onExp?'filter:grayscale(.7)':''}">${p.emoji}</div><div class="inv-nm">${formatPetName(p)}</div><div style="font-size:0.55rem;color:${cfg.color};font-weight:700">${cfg.label}</div><div style="font-size:0.52rem;color:var(--care)">+${petDailyCoins(p)}🪙</div>${on?`<div class="inv-on" style="font-size:0.5rem">${_slotIdx+1}</div>`:''}${onExp?'<div style="position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:3px;border-radius:10px"><span style="background:rgba(0,0,0,.6);color:#e2e8f0;font-size:0.48rem;font-weight:700;padding:1px 5px;border-radius:4px">⏳ ผจญภัย</span></div>':''}</div>`;})()}).join('')}</div>
        <div style="display:flex;gap:7px;justify-content:center;margin-top:8px;flex-wrap:wrap">
            
            ${pets.length?`<button class="btn-gray sm" onclick="openTrade()">🔬 ห้องทดลอง</button>`:''}
            <button class="btn-gray sm" onclick="openMega()">📣 โทรโข่ง</button>
            ${pets.length?`<button onclick="openForgeModal()" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:9px;padding:5px 12px;color:#fff;font-family:inherit;font-size:0.76rem;font-weight:700;cursor:pointer;white-space:nowrap">🔨 ตีบวก</button>`:''}
            ${pets.length?`<button onclick="openBattle()" style="background:linear-gradient(135deg,#ef4444,#dc2626);border:none;border-radius:9px;padding:5px 12px;color:#fff;font-family:inherit;font-size:0.76rem;font-weight:700;cursor:pointer;white-space:nowrap">⚔️ ลองต่อสู้</button>`:''}
        </div>
`;

    // Daily income breakdown
    const {base:dBase,passive:dPassive,total:dTotal}=calcTotalDaily(pets);
    const collBtn=`<div style="margin-bottom:8px">
        <button id="coll-toggle-btn" onclick="toggleCollection()" style="width:100%;background:linear-gradient(135deg,#1e293b,#0f172a);border:1.5px solid rgba(255,255,255,.12);border-radius:14px;padding:9px 14px;color:rgba(255,255,255,.75);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">🗂️ คอลเลกชั่น <span style="font-size:0.68rem;color:rgba(255,255,255,.35)">${uniqueIds.length}/${PETS.length}</span></button>
    </div><div id="collection-panel" style="display:none" class="card"></div>`;
    return`${profileBlock}<input type="file" id="photo-input" accept="image/*" style="display:none" onchange="handlePhoto(event)">
        ${achieveBlock}
        ${collBtn}
        ${eggSection}
        <div class="egg-section-head"><span>🐾 สัตว์เลี้ยง (${pets.length} ตัว)</span></div>
        <div class="card">${invBlock}</div>`;
}

// ════════════════════════════════════════
//  TAB: MEMBERS
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ TAB BUILDERS — MEMBERS
// ════════════════════════════════════════
window._buildMembersTopBar=function _buildMembersTopBar(){
    const ple = new Date(PLE_CC_DATE);
    const diffDays = Math.ceil((ple - new Date()) / 86400000);
    let pleHtml;
    if(diffDays > 0){
        pleHtml = '<div style="flex:1;background:linear-gradient(135deg,rgba(239,68,68,.15),rgba(220,38,38,.1));border:1.5px solid rgba(239,68,68,.25);border-radius:14px;padding:10px 12px;display:flex;align-items:center;gap:10px">'
            + '<div style="font-size:1.6rem;line-height:1">📅</div>'
            + '<div>'
            + '<div style="font-size:0.58rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.5px">PLE-CC</div>'
            + '<div style="font-size:1.2rem;font-weight:800;color:#f87171;line-height:1">'+diffDays+' <span style="font-size:0.7rem;font-weight:600">วัน</span></div>'
            + '<div style="font-size:0.55rem;color:rgba(255,255,255,.3);margin-top:1px">11 ธ.ค. 2569</div>'
            + '</div></div>';
    } else if(diffDays === 0){
        pleHtml = '<div style="flex:1;background:linear-gradient(135deg,rgba(239,68,68,.3),rgba(220,38,38,.2));border:1.5px solid rgba(239,68,68,.5);border-radius:14px;padding:10px 12px;text-align:center"><div style="font-size:0.72rem;font-weight:800;color:#f87171">🚨 วันนี้คือวันสอบ PLE-CC!</div></div>';
    } else {
        pleHtml = '<div style="flex:1;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:14px;padding:10px 12px;text-align:center"><div style="font-size:0.72rem;color:rgba(255,255,255,.3)">✅ PLE-CC ผ่านไปแล้ว</div></div>';
    }
    return '<div style="display:flex;gap:8px;margin-bottom:8px">'
        + pleHtml
        + '<button onclick="openCalc()" style="flex:1;background:linear-gradient(135deg,rgba(109,40,217,.25),rgba(124,58,237,.2));border:1.5px solid rgba(167,139,250,.3);border-radius:14px;padding:10px 12px;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:8px">'
        + '<div style="font-size:1.6rem;line-height:1">🧮</div>'
        + '<div><div style="font-size:0.68rem;font-weight:800;color:var(--primary);line-height:1.3">เครื่องมือที่น่าจะ<br>เป็นประโยชน์</div>'
        + '<span style="font-size:0.5rem;background:var(--primary-light);color:var(--primary);padding:1px 6px;border-radius:5px;font-weight:700">beta</span></div>'
        + '<div style="margin-left:auto;color:var(--muted);font-size:0.8rem">›</div>'
        + '</button></div>';
}
function buildMembers(){
    const all=window.__students||[];const sci=all.filter(s=>s.track==='sci').length;const care=all.filter(s=>s.track==='care').length;const tot=all.length;
    const guestCount=(window.__guestUsers||[]).length;
    return`
        <div class="card" style="margin-bottom:8px;">
            <div style="font-weight:700;font-size:0.95rem;text-align:center;margin-bottom:8px;color:var(--text)">💊 RxTU10 — ${tot} คน</div>
            <div><div class="prog-bar"><div class="pb-sci" style="width:${(sci/tot*100).toFixed(1)}%"></div><div class="pb-care" style="width:${(care/tot*100).toFixed(1)}%"></div></div>
            <div class="prog-lbls"><span style="color:var(--sci)">Sci ${sci}</span><span style="color:var(--care)">Care ${care}</span></div></div>
            ${guestCount?`<div style="text-align:center;margin-top:8px"><button onclick="openGuestList()" id="guest-count-badge" style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;padding:4px 12px;font-size:0.75rem;color:var(--muted);cursor:pointer;font-family:inherit">👋 Guest ${guestCount} คน</button></div>`:''}
        </div>
        ${_buildMembersTopBar()}
        <div class="filter-row">
            <button class="fbtn${mTrack==='all'?' fa':''}" onclick="mFilter('all')">รวม ${tot}</button>
            <button class="fbtn${mTrack==='sci'?' fs':''}" onclick="mFilter('sci')">Sci ${sci}</button>
            <button class="fbtn${mTrack==='care'?' fc':''}" onclick="mFilter('care')">Care ${care}</button>
        </div>
        <div class="search-box"><input class="srch-inp" id="msearch" placeholder="🔍 ชื่อเล่น / รหัส / ชื่อจริง..." value="${mSearch}" oninput="mSearchFn(this.value)"></div>
        <div id="mgrid">${memberGrid()}</div>`;
}
function memberGrid(){
    let list=window.__students||[];
    if(mTrack!=='all')list=list.filter(s=>s.track===mTrack);
    if(mSearch){const q=mSearch.toLowerCase();list=list.filter(s=>s.nickname.toLowerCase().includes(q)||s.id.includes(q)||s.realName.toLowerCase().includes(q));}
    if(!list.length)return `<div style="text-align:center;padding:32px 16px;color:var(--muted);font-size:0.85rem">ไม่พบสมาชิก</div>`;
    return`<div class="mgrid">${list.map(s=>{
        const tc=s.track==='sci'?'var(--sci)':'var(--care)';
        const live=window.__fbUsers?.[s.id];
        const photoSrc=live?.customPhoto||live?.googlePhoto||`img/${s.id}.jpg`;
        const def=`https://ui-avatars.com/api/?name=${encodeURIComponent(s.nickname.split(' ')[0])}&background=${s.track==='sci'?'2563eb':'10b981'}&color=fff&size=128`;
        // activePet: match instId ก่อน (ใหม่) fallback id (legacy)
        const _isLinked=s.id&&!String(s.id).startsWith('guest_');
        const _apSlot0=_isLinked?((live?.activePets||[])[0]||live?.activePet||null):null;
        const petData=_apSlot0
            ?(live.pets||[]).find(p=>p.instId&&String(p.instId)===String(_apSlot0))
              ||(live.pets||[]).find(p=>p.id===_apSlot0)
            :null;
        const petGrade=petData?(petData.grade||0):0;
        const petColor=petData?(RARITY[petData.rarity]?.color||'#64748b'):'';
        const hasLive = !!live;
        if(!hasLive){
            return`<div class="mcard" onclick="openProfileModal('${s.id}')" style="background:linear-gradient(135deg,${tc}15,${tc}06);border:1.5px solid ${tc}30">
                <div style="width:52px;height:52px;border-radius:50%;background:${tc}20;border:2px solid ${tc}40;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:6px">
                    ${s.track==='sci'?'🔬':'💊'}
                </div>
                <div class="mc-nick" style="font-size:0.77rem">${s.nickname}</div>
                <div style="font-size:0.58rem;color:var(--muted);margin-top:1px;line-height:1.3;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.realName}</div>
                <span class="track-badge" style="background:${tc};font-size:0.5rem;padding:2px 6px;margin-top:4px">${s.track==='sci'?'SCI':'CARE'}</span>
            </div>`;
        }
        return`<div class="mcard" onclick="openProfileModal('${s.id}')" style="position:relative">
            <div style="position:relative;width:64px;height:64px;margin-bottom:4px">
                <img loading="lazy" src="${photoSrc}" onerror="this.onerror=null;this.src='${def}'" class="mc-img" style="width:64px;height:64px">
                ${petData?`<div style="position:absolute;bottom:-6px;right:-6px;font-size:1.3rem;filter:drop-shadow(0 1px 4px rgba(0,0,0,.5));line-height:1">${petData.emoji}</div>`:''}
            </div>
            <div class="mc-nick">${s.nickname}</div>
            <span class="track-badge" style="background:${tc};font-size:0.52rem;padding:2px 6px;margin-top:1px">${s.track==='sci'?'SCI':'CARE'}</span>
        </div>`;
    }).join('')}</div>`;
}
window.mFilter=t=>{
    mTrack=t;
    const g=document.getElementById('mgrid');
    if(g) g.innerHTML=memberGrid();
    // อัปเดต active class บน filter buttons
    const btns=document.querySelectorAll('.filter-row .fbtn');
    if(btns.length>=3){
        btns[0].className='fbtn'+(t==='all'?' fa':'');
        btns[1].className='fbtn'+(t==='sci'?' fs':'');
        btns[2].className='fbtn'+(t==='care'?' fc':'');
    }
};
window.mSearchFn=v=>{mSearch=v;const g=document.getElementById('mgrid');if(g)g.innerHTML=memberGrid();};

window.openProfileModal=(id)=>{
    const s=window.__students?.find(x=>x.id===id);if(!s)return;
    const liveData=window.__fbUsers?.[id]||null;
    const isMe = userData?.studentId === id;
    const tc=s.track==='sci'?'var(--sci)':'var(--care)';
    const def=`https://ui-avatars.com/api/?name=${encodeURIComponent(s.nickname.split(' ')[0])}&background=${s.track==='sci'?'2563eb':'10b981'}&color=fff&size=256`;
    const photo=liveData?.customPhotoFull||liveData?.customPhoto||liveData?.googlePhoto||`img/${s.id}.jpg`;

    // ── Team slots (activePets 3 slots) ──
    const buildTeamSlots=(ud,clickable,ownerSid)=>{
        const slots=(ud?.activePets||[null,null,null]).slice(0,3);
        while(slots.length<3) slots.push(null);
        return slots.map((instId,i)=>{
            const p=instId?(ud.pets||[]).find(x=>String(x.instId||x.id)===String(instId)):null;
            if(!p) return `<div class="pm-team-slot${clickable?' active-slot':''}" ${clickable?`onclick="pmPickSlot(${i})"`:''}><span class="slot-label${clickable?' filled':''}">Slot ${i+1}</span><span style="opacity:.3;font-size:1.1rem">＋</span></div>`;
            const cfg=RARITY[p.rarity];
            const s2=calculatePetStats(p);
            const friendClick=(!clickable&&ownerSid&&p.instId)?`onclick="openFriendPetInfo('${ownerSid}','${String(p.instId||p.id)}')"`:'';
            const friendStyle=(!clickable&&p.instId)?'cursor:pointer;':'';
            return `<div class="pm-team-slot filled${clickable?' active-slot':''}" ${clickable?`onclick="pmPickSlot(${i})"`:friendClick} style="${friendStyle}"><span class="slot-label filled">Slot ${i+1}</span><div class="slot-em">${p.emoji}</div><div class="slot-name">${formatPetName(p)}</div><div class="slot-stats">⚔️${s2.atk} ❤️${s2.hp}</div></div>`;
        }).join('');
    };

    // ── Stats section ──
    const statsHtml=liveData?`
    <div class="pm-section">
        <div class="pm-section-label">สถิติการเล่น</div>
        <div class="pm-stats-grid" style="grid-template-columns:repeat(2,1fr)">
            <div class="pm-stat-cell"><b>🗼${liveData.towerBest||0}</b><small>Tower สูงสุด</small></div>
            <div class="pm-stat-cell"><b>🏆${liveData.pvpVictories||0}</b><small>PvP ชนะ</small></div>
            <div class="pm-stat-cell"><b>${liveData.quizHigh||0}</b><small>👥 Quiz</small></div>
            <div class="pm-stat-cell"><b>${liveData.drugHigh||0}</b><small>💊 Drug</small></div>
        </div>
    </div>`:'';

    // ── My profile: slot editor ──
    const myTeamEditor=isMe?`
    <div class="pm-section">
        <div class="pm-section-label">🐾 ทีมสัตว์เลี้ยง (กด Slot เพื่อเปลี่ยน)</div>
        <div id="pm-team-slots" class="pm-team">${buildTeamSlots(userData,true)}</div>
        <div id="pm-pick-grid" style="display:none;margin-top:10px"></div>
        <button id="pm-save-team-btn" onclick="pmSaveTeam()" style="display:none;width:100%;margin-top:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;border-radius:10px;padding:10px;color:#fff;font-family:inherit;font-size:0.82rem;font-weight:800;cursor:pointer">💾 บันทึกทีม</button>
    </div>`:(liveData?`
    <div class="pm-section">
        <div class="pm-section-label">🐾 ทีมสัตว์เลี้ยง</div>
        <div class="pm-team">${buildTeamSlots(liveData,false,id)}</div>
    </div>`:'');

    // ── Contact info section ──
    const contactHtml = liveData ? (()=>{
        const c = liveData.contact||{};
        const fields = [
            {icon:'📱', label:'เบอร์', val:c.phone},
            {icon:'📸', label:'IG',    val:c.ig},
            {icon:'💬', label:'LINE',  val:c.line},
        ];
        const hasAny = fields.some(f=>f.val);
        return `<div class="pm-section">
            <div class="pm-section-label">📋 ช่องทางติดต่อ</div>
            <div style="display:flex;flex-direction:column;gap:7px">
            ${fields.map(f=>`
                <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(255,255,255,.07)">
                    <span style="font-size:1rem;width:22px;text-align:center">${f.icon}</span>
                    <span style="font-size:0.7rem;color:rgba(255,255,255,.35);width:34px;flex-shrink:0">${f.label}</span>
                    <span style="font-size:0.8rem;color:${f.val?'rgba(255,255,255,.85)':'rgba(255,255,255,.2)'};font-family:'Space Mono',monospace;font-weight:${f.val?700:400}">${f.val||'—'}</span>
                </div>`).join('')}
            </div>
        </div>`;
    })() : '';

    // ── Challenge button ──
    const challengeBtn=(!isMe&&liveData)?`
    <div class="pm-section" style="padding-bottom:8px">
        <button class="btn-pvp" onclick="startPvpChallenge('${id}')">⚔️ ท้าทาย ${s.nickname}</button>
    </div>`:'';

    document.getElementById('pm-content').innerHTML=`
    <div class="pm-card">
        <div class="pm-hero">
            <img loading="lazy" src="${photo}" onerror="this.onerror=null;this.src='${def}'" class="pm-avatar">
            <div class="pm-info">
                <div class="name">${s.nickname}${(()=>{ const slot0=(liveData?.activePets||[])[0]||liveData?.activePet||null; if(!slot0)return ''; const ep=(liveData?.pets||[]).find(p=>p.instId&&String(p.instId)===String(slot0)||(p.id===slot0)); return ep?' '+ep.emoji:''; })()}</div>
                <div class="realname">${s.realName}</div>
                <div class="sid">${s.id}</div>
                <div style="margin-top:5px;display:flex;gap:5px;align-items:center">
                    <span class="track-badge" style="background:${tc};display:inline-block">${s.track.toUpperCase()}</span>
                </div>
            </div>
            <button onclick="closePM()" style="background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.5);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:0.9rem;flex-shrink:0;align-self:flex-start">✕</button>
        </div>
        ${contactHtml}
        ${myTeamEditor}
        ${challengeBtn}
        ${statsHtml}
    </div>`;
    document.getElementById('profile-modal').classList.add('active');
    // Store for slot picker
    window.__pmEditId = id;
    window.__pmPickingSlot = null;
};
window.closePM=()=>document.getElementById('profile-modal').classList.remove('active');

// ══════════════════════════════════════════════════
// ▶ CONTACT EDIT
// ══════════════════════════════════════════════════
window.openContactEdit = () => {
    const c = userData?.contact || {};
    let overlay = document.getElementById('contact-edit-overlay');
    if(!overlay){ overlay=document.createElement('div'); overlay.id='contact-edit-overlay'; document.body.appendChild(overlay); }
    overlay.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:9100;display:flex;align-items:flex-end;justify-content:center;padding:16px;backdrop-filter:blur(4px);';
    overlay.innerHTML=`
    <div onclick="event.stopPropagation()" style="background:#fff;border-radius:20px 20px 16px 16px;padding:22px 18px 28px;width:100%;max-width:420px;border:1px solid var(--border);box-shadow:0 -8px 40px rgba(15,23,42,.15)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
            <div style="font-weight:800;font-size:1rem;color:var(--text)">📋 ช่องทางติดต่อ</div>
            <button onclick="document.getElementById('contact-edit-overlay').remove()" style="background:var(--bg);border:1px solid var(--border);color:var(--muted);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:0.9rem">✕</button>
        </div>
        ${[
            {key:'phone', icon:'📱', label:'เบอร์โทร', placeholder:'0XX-XXX-XXXX'},
            {key:'ig',    icon:'📸', label:'Instagram ID', placeholder:'@username'},
            {key:'line',  icon:'💬', label:'LINE ID', placeholder:'line_id'},
        ].map(f=>`
        <div style="margin-bottom:14px">
            <div style="font-size:0.68rem;color:var(--muted);font-weight:700;letter-spacing:1px;margin-bottom:5px">${f.icon} ${f.label}</div>
            <input id="cedit-${f.key}" maxlength="20" value="${(c[f.key]||'').replace(/"/g,'&quot;')}" placeholder="${f.placeholder}"
                style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 13px;color:var(--text);font-family:'Kanit',sans-serif;font-size:0.85rem;outline:none;box-sizing:border-box">
        </div>`).join('')}
        <div style="font-size:0.6rem;color:var(--muted);margin-bottom:14px;text-align:right">จำกัด 20 ตัวอักษรต่อรายการ</div>
        <button onclick="saveContact()" style="width:100%;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:12px;padding:12px;color:#fff;font-family:inherit;font-size:0.88rem;font-weight:800;cursor:pointer">💾 บันทึก</button>
    </div>`;
};

window.saveContact = async () => {
    if(!currentUser) return;
    const trim20 = v => sanitize((v||'').trim().slice(0,20));
    const contact = {
        phone: trim20(document.getElementById('cedit-phone')?.value),
        ig:    trim20(document.getElementById('cedit-ig')?.value),
        line:  trim20(document.getElementById('cedit-line')?.value),
    };
    try {
        await updateDoc(doc(db,'users',currentUser.uid),{contact});
        userData = {...userData, contact};
        document.getElementById('contact-edit-overlay')?.remove();
        toast('💾 บันทึกข้อมูลติดต่อแล้ว!','success');
        renderTab('home');
    } catch(e){ toast('บันทึกผิดพลาด','error'); }
};


// ── Active Pets Slot Picker ──
let __pmSlots = [null,null,null]; // working copy
window.pmPickSlot=(slotIdx)=>{
    window.__pmPickingSlot = slotIdx;
    __pmSlots = [...(userData?.activePets||[null,null,null])].slice(0,3);
    while(__pmSlots.length<3)__pmSlots.push(null);
    const pets=(userData?.pets||[]).filter(p=>!p.isExpedition);
    const grid=document.getElementById('pm-pick-grid');
    if(!grid) return;
    grid.style.display='grid';
    grid.style.gridTemplateColumns='repeat(auto-fill,minmax(64px,1fr))';
    grid.style.gap='6px';
    grid.innerHTML=`<div style="grid-column:1/-1;font-size:0.62rem;color:rgba(255,255,255,.4);margin-bottom:4px">เลือกสัตว์สำหรับ Slot ${slotIdx+1} (กดอีกครั้งเพื่อเอาออก)</div>`
    +pets.map(p=>{
        const cfg=RARITY[p.rarity];
        const isSel=__pmSlots[slotIdx]===String(p.instId||p.id);
        const usedInOther=__pmSlots.some((id,i)=>i!==slotIdx&&id===String(p.instId||p.id));
        const onExp=!!p.isExpedition;
        return `<div onclick="pmSelectPet('${String(p.instId||p.id)}')" style="background:${isSel?'rgba(167,139,250,.2)':'rgba(255,255,255,.05)'};border:2px solid ${isSel?'#a78bfa':'rgba(255,255,255,.1)'};border-radius:10px;padding:7px 3px;text-align:center;cursor:pointer;opacity:${usedInOther?.5:1};position:relative">
            ${onExp?'<span style="position:absolute;top:2px;right:3px;font-size:0.4rem;color:#f59e0b;font-weight:800">⏳</span>':''}
            <div style="font-size:1.4rem">${p.emoji}</div>
            <div style="font-size:0.48rem;color:rgba(255,255,255,.7);font-weight:700;margin-top:2px;line-height:1.2">${formatPetName(p)}</div>
            <div style="font-size:0.44rem;color:${cfg.color}">${cfg.label}</div>
        </div>`;
    }).join('');
    document.getElementById('pm-save-team-btn').style.display='block';
};
window.pmSelectPet=(instOrId)=>{
    const slot=window.__pmPickingSlot;
    if(slot===null) return;
    const id=String(instOrId);
    // toggle: ถ้าเลือกซ้ำ = เอาออก
    if(__pmSlots[slot]===id) __pmSlots[slot]=null;
    else __pmSlots[slot]=id;
    window.__pmPickingSlot=null;
    document.getElementById('pm-pick-grid').style.display='none';
    // refresh slot display
    const buildSlotsForEdit=()=>{
        return [0,1,2].map(i=>{
            const iid=__pmSlots[i];
            const p=iid?(userData?.pets||[]).find(x=>String(x.instId||x.id)===iid):null;
            if(!p) return `<div class="pm-team-slot active-slot" onclick="pmPickSlot(${i})"><span class="slot-label">Slot ${i+1}</span><span style="opacity:.3;font-size:1.1rem">＋</span></div>`;
            const s2=calculatePetStats(p);
            return `<div class="pm-team-slot filled active-slot" onclick="pmPickSlot(${i})"><span class="slot-label filled">Slot ${i+1}</span><div class="slot-em">${p.emoji}</div><div class="slot-name">${formatPetName(p)}</div><div class="slot-stats">⚔️${s2.atk} ❤️${s2.hp}</div></div>`;
        }).join('');
    };
    const slotsEl=document.getElementById('pm-team-slots');
    if(slotsEl) slotsEl.innerHTML=buildSlotsForEdit();
};
window.pmSaveTeam=async()=>{
    if(!currentUser) return;
    const newSlots=[...__pmSlots];
    window.__blockSnapshot=true;
    userData={...userData,activePets:newSlots};
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{activePets:newSlots});
        toast('💾 บันทึกทีมแล้ว!','success');
        renderAll(); loadFbUsers();
    } catch(e){ toast('เซฟผิดพลาด','error'); }
    finally{ setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY); }
    document.getElementById('pm-save-team-btn').style.display='none';
    document.getElementById('pm-pick-grid').style.display='none';
};


// แสดงรายละเอียด pet ของเพื่อน (read-only) — เปิดบน profile modal
window.openFriendPetInfo=(studentId,instOrId)=>{
    const liveData=window.__fbUsers?.[studentId];
    if(!liveData?.pets)return;
    const p=liveData.pets.find(x=>String(x.instId||x.id)===String(instOrId));
    if(!p)return;
    const cfg=RARITY[p.rarity];
    const grade=p.grade||0;
    const daily=petDailyCoins(p);
    const def=PETS.find(x=>x.id===p.id);
    // สร้าง overlay บน pm-content
    const overlay=document.createElement('div');
    // ใช้ fixed เพื่อครอบทับ modal เสมอแม้จะ scroll
    const modalRect = document.querySelector('#profile-modal .modal-box')?.getBoundingClientRect()||{top:0,left:0,width:400,height:window.innerHeight*0.88};
    overlay.style.cssText=`position:fixed;top:${modalRect.top}px;left:${modalRect.left}px;width:${modalRect.width}px;height:${modalRect.height}px;background:#fff;border-radius:20px;padding:20px 16px;overflow-y:auto;z-index:9200;animation:popIn .25s ease;border:1px solid #e2e8f0;`;
    const stats=calculatePetStats(p);
    const el=def?.element;const elInfo=ELEMENTS[el]||null;
    overlay.innerHTML=`
        <button onclick="this.parentElement.remove()" style="position:absolute;top:10px;right:10px;background:var(--border);border:none;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:0.85rem">✕</button>
        <div style="text-align:center">
            <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px">
                <span style="background:${cfg.color};color:#fff;padding:3px 12px;border-radius:16px;font-size:0.72rem;font-weight:800">${cfg.label}</span>
                ${grade>0?`<span style="background:#e2e8f0;color:#334155;padding:3px 12px;border-radius:16px;font-size:0.72rem;font-weight:800">Grade ${GRADE_LABELS[grade]}</span>`:''}
                ${elInfo?`<span style="background:#f1f5f9;color:#334155;padding:3px 10px;border-radius:16px;font-size:1rem">${elInfo.emoji}</span>`:''}
            </div>
            <div style="font-size:3.5rem;margin:4px 0;filter:drop-shadow(0 0 14px ${cfg.glow})">${p.emoji}</div>
            <div style="font-size:1.2rem;font-weight:800;margin-bottom:4px;color:var(--text)">${formatPetName(p)}</div>
            ${def?.flavor?`<div style="font-size:0.74rem;color:${cfg.color};font-style:italic;padding:7px 12px;background:${cfg.bg};border-radius:9px;border-left:3px solid ${cfg.color}44;text-align:left;margin-bottom:10px">"${def.flavor}"</div>`:''}
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
                <div style="background:${cfg.bg};border-radius:10px;padding:8px 4px">
                    <div style="font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">ATK</div>
                    <div style="font-size:1.15rem;font-weight:800;color:#ef4444">⚔️ ${stats.atk}</div>
                </div>
                <div style="background:${cfg.bg};border-radius:10px;padding:8px 4px">
                    <div style="font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">HP</div>
                    <div style="font-size:1.15rem;font-weight:800;color:#10b981">❤️ ${stats.hp}</div>
                </div>
                <div style="background:${cfg.bg};border-radius:10px;padding:8px 4px">
                    <div style="font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px">Daily</div>
                    <div style="font-size:1.15rem;font-weight:800;color:${cfg.color}">+${petDailyCoins(p)}🪙</div>
                </div>
            </div>
            ${elInfo?`<div style="background:var(--bg);border-radius:10px;padding:8px 12px;font-size:0.78rem;color:var(--text);display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:1.1rem">${elInfo.emoji}</span>
                <span>ชนะ <b style="color:#b45309">${ELEMENTS[elInfo.beats]?.emoji||''}</b> · แพ้ <b style="color:#ef4444">${Object.values(ELEMENTS).find(e=>e.beats===el)?.emoji||''}</b></span>
            </div>`:''}
        </div>`;
    document.body.appendChild(overlay);
};

window.openGuestList=()=>{
    const guests=window.__guestUsers||[];
    if(!guests.length){toast("ยังไม่มี Guest","info");return;}
    const html=guests.map(g=>{
        const photo=g.customPhotoFull||g.customPhoto||g.googlePhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent(g.nickname||'?')}&background=64748b&color=fff&size=128`;
        const _g_slot0=(g.activePets||[])[0]||g.activePet||null;
        const petData=_g_slot0?(g.pets||[]).find(p=>String(p.instId||p.id)===String(_g_slot0)):null;
        return`<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
            <img loading="lazy" src="${photo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--border)" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=?&background=64748b&color=fff'">
            <div style="flex:1">
                <div style="font-weight:700;font-size:0.88rem">${g.nickname||'ไม่ระบุ'} ${petData?petData.emoji:''}</div>
                <div style="font-size:0.68rem;color:var(--muted)">Quiz ${g.quizHigh||0} • Drug ${g.drugHigh||0}</div>
            </div>
            <span style="background:#64748b;color:#fff;font-size:0.55rem;font-weight:700;padding:2px 7px;border-radius:5px">GUEST</span>
        </div>`;
    }).join('');
    document.getElementById('pm-content').innerHTML=`
        <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">👋 Guest ทั้งหมด</div>
        ${html}`;
    document.getElementById('profile-modal').classList.add('active');
};

// ════════════════════════════════════════
//  TAB: PLAY
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ TAB BUILDERS — PLAY
// ════════════════════════════════════════
function buildPlay(){
    const tickerText=window.__tickerCache||(document.getElementById('ticker-text')?.textContent||'').trim()||'ยินดีต้อนรับสู่ RxTU10 Dashboard! 🎉';
    const ctHigh=userData?.ctHigh||0;

    // ── นับสถานะ expedition เพื่อแสดง notify dot ──
    const exps=userData?.expeditions||[];
    const now=Date.now();
    const expActive=exps.some(e=>now<e.endTime);
    const expDone=exps.some(e=>now>=e.endTime);
    const expNotify=expDone; // มีรางวัลรอรับ = dot สีเหลือง

    return`
    <div class="news-banner" onclick="openFeed()">
        <div class="ticker-label">📢 ข่าว</div>
        <div class="ticker-scroll"><div class="ticker-inner">${tickerText}</div></div>
    </div>

    <!-- GAME HUB HEADER -->
    <div style="padding:2px 0 14px">
        <div style="font-size:0.65rem;color:rgba(0,0,0,.35);letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:4px">🎮 Game Hub</div>
        <div style="font-size:0.82rem;color:var(--muted)">เลือกโหมดเกมที่ต้องการเล่น</div>
    </div>

    <!-- 🐾 Pet Games group -->
    <div style="font-size:0.6rem;color:var(--muted);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">🐾 สัตว์เลี้ยง</div>
    <div class="hub-grid" style="margin-bottom:14px">
        <!-- Expedition -->
        <div class="hub-card live" style="--hc-glow:rgba(124,58,237,.2);background:linear-gradient(145deg,#f3e8ff,#ede9fe);border-color:#e9d5ff;" onclick="openExpModal()">
            ${expNotify?'<div class="hub-notify"></div>':''}
            ${expActive&&!expNotify?'<div class="hub-badge">⏳ กำลังไป</div>':''}
            <div class="hub-card-icon">🏕️</div>
            <div class="hub-card-title">ส่งสัตว์ผจญภัย</div>
            <div class="hub-card-sub">${expNotify?'🎁 มีรางวัลรอรับ!':expActive?'กำลังออกเดินทาง...':'ส่งสัตว์หาของรางวัล'}</div>
        </div>
        <!-- Tower -->
        <div class="hub-card live" style="--hc-glow:rgba(124,58,237,.2);background:linear-gradient(145deg,#f3e8ff,#ede9fe);border-color:#e9d5ff;" onclick="openTower()">
            <div class="hub-card-icon">🗼</div>
            <div class="hub-card-title">หอคอยไร้สิ้นสุด</div>
            <div class="hub-card-sub">ชั้นสูงสุด: ${userData?.towerBest||0} ชั้น</div>
        </div>
    </div>

    <!-- 🎮 Mini Games group -->
    <div style="font-size:0.6rem;color:var(--muted);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">🎮 มินิเกม</div>
    <div class="hub-grid">
        <!-- Quiz: ชื่อเพื่อน -->
        <div class="hub-card live" style="--hc-glow:rgba(37,99,235,.2);background:linear-gradient(145deg,#dbeafe,#eff6ff);border-color:#bfdbfe;" onclick="openQuizModal()">
            <div class="hub-card-icon">🕵️</div>
            <div class="hub-card-title">ทายชื่อเพื่อน</div>
            <div class="hub-card-sub">เห็นชื่อเล่น → ทายชื่อจริง</div><div style="font-size:0.72rem;font-weight:800;color:#b45309;margin-top:2px">🏆 ${qHigh} คะแนน</div>
        </div>
        <!-- Quiz: ยา -->
        <div class="hub-card live" style="--hc-glow:rgba(99,102,241,.2);background:linear-gradient(145deg,#e0e7ff,#eef2ff);border-color:#c7d2fe;" onclick="openDrugModal()">
            <div class="hub-card-icon">💊</div>
            <div class="hub-card-title">ทายยา</div>
            <div class="hub-card-sub">Drug Class Quiz</div><div style="font-size:0.72rem;font-weight:800;color:#b45309;margin-top:2px">🏆 ${dqHigh} คะแนน</div>
        </div>
        <!-- Color Tiles -->
        <div class="hub-card live" style="--hc-glow:rgba(16,185,129,.2);background:linear-gradient(145deg,#dcfce7,#f0fdf4);border-color:#bbf7d0;" onclick="openColorTilesModal()">
            <div class="hub-card-icon">🟩</div>
            <div class="hub-card-title">Color Tiles</div>
            <div class="hub-card-sub">Piano Tiles สไตล์</div><div style="font-size:0.72rem;font-weight:800;color:#b45309;margin-top:2px">🏆 ${ctHigh} คะแนน</div>
        </div>
        <!-- CC Exam (Easter Egg — Coming Soon facade) -->
        <div class="hub-card soon" style="background:linear-gradient(145deg,#fef3c7,#fffbeb);border-color:#fde68a;" onclick="openCCExam()">
            <div class="hub-badge">เร็วๆ นี้</div>
            <div class="hub-card-icon" style="filter:grayscale(.4)">📝</div>
            <div class="hub-card-title">ข้อสอบ CC ย้อนหลัง</div>
            <div class="hub-card-sub">Pharm Board Exam<br>Coming Soon</div>
        </div>
    </div>`;
}

// ════════════════════════════════════════
// ▶ GAME HUB — MODAL OPENERS
// ════════════════════════════════════════

// ── Expedition Modal ──
window.openExpModal=()=>{
    if(!currentUser){toast('กรุณา Login ก่อน','error');return;}
    __expSelPets=[];
    document.getElementById('exp-modal-body').innerHTML=buildExpeditionUI();
    document.getElementById('exp-modal').classList.add('active');
    _startExpTimers();
};
window.closeExpModal=()=>{
    document.getElementById('exp-modal').classList.remove('active');
};

// ── Quiz Modal: ชื่อเพื่อน ──
window.openQuizModal=()=>{
    window.__quizModalOpen=true;
    const el=document.getElementById('quiz-modal');
    if(el){
        document.getElementById('quiz-modal-body').innerHTML=buildQuizBody();
        el.classList.add('active');
    }
};
window.closeQuizModal=()=>{
    window.__quizModalOpen=false;
    const el=document.getElementById('quiz-modal');
    if(el) el.classList.remove('active');
};

// ── Drug Quiz Modal ──
window.openDrugModal=()=>{
    window.__drugModalOpen=true;
    const el=document.getElementById('drug-modal');
    if(el){
        document.getElementById('drug-modal-body').innerHTML=buildDrugBody();
        el.classList.add('active');
    }
};
window.closeDrugModal=()=>{
    window.__drugModalOpen=false;
    const el=document.getElementById('drug-modal');
    if(el) el.classList.remove('active');
};

// ════════════════════════════════════════
//  EXPEDITION SYSTEM
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ EXPEDITION SYSTEM
// ════════════════════════════════════════
const EXP_DURATIONS = [
    { label:'15 นาที', mins:15,  mult:[0.1,0.75], eggVar:1 },
    { label:'1 ชั่วโมง', mins:60,  mult:[0.2,1.5],  eggVar:2 },
    { label:'8 ชั่วโมง', mins:480, mult:[1.0,4.0],  eggVar:5 },
];
let __expSelPets=[]; // instIds ที่เลือกสำหรับ expedition ใหม่
let __expSelDur=0;   // index ของ EXP_DURATIONS ที่เลือก

function buildExpeditionUI(){
    if(!currentUser||!userData)return`<div style="color:rgba(255,255,255,.4);text-align:center;padding:16px;font-size:0.84rem">กรุณา Login</div>`;
    const exps=userData.expeditions||[];
    const now=Date.now();
    // single queue: หาเฉพาะคิวแรก
    const activeExp=exps.find(e=>now<e.endTime)||null;
    const doneExp=exps.find(e=>now>=e.endTime)||null;
    const hasQueue=!!(activeExp||doneExp);
    let out='';

    // ── กำลังผจญภัย ──
    if(activeExp){
        const e=activeExp;
        const epets=(userData.pets||[]).filter(p=>e.petInstIds.includes(String(p.instId||p.id)));
        const ms=e.endTime-now;
        const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);
        const tStr=h>0?`${h}ชม ${m}น ${s}ว`:m>0?`${m}น ${s}ว`:`${s}ว`;
        out+=`<div class="exp-active-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
                <div style="font-size:0.68rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">🗺️ ${e.durLabel}</div>
                <div class="exp-timer" id="exp-timer-${e.id}">${tStr}</div>
            </div>
            <div class="exp-pets-grid">${epets.map(p=>`<div style="text-align:center"><div style="font-size:1.5rem">${p.emoji}</div><div style="font-size:0.58rem;color:rgba(255,255,255,.45)">${formatPetName(p)}</div></div>`).join('')}</div>
        </div>`;
    }

    // ── รับรางวัล ──
    if(doneExp){
        const e=doneExp;
        const epets=(userData.pets||[]).filter(p=>e.petInstIds.includes(String(p.instId||p.id)));
        out+=`<div class="exp-active-card" style="border-color:rgba(251,191,36,.5);background:rgba(251,191,36,.07)">
            <div style="display:flex;align-items:center;justify-content:space-between">
                <div>
                    <div style="font-size:0.7rem;color:#fbbf24;font-weight:700;margin-bottom:4px">✅ ผจญภัยสำเร็จ! · ${e.durLabel}</div>
                    <div style="display:flex;gap:4px">${epets.map(p=>`<span style="font-size:1.4rem">${p.emoji}</span>`).join('')}</div>
                </div>
                <button onclick="claimExpedition('${e.id}')" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:10px;padding:8px 14px;color:#fff;font-family:inherit;font-size:0.82rem;font-weight:800;cursor:pointer;box-shadow:0 3px 10px rgba(245,158,11,.4);white-space:nowrap">🎁 รับรางวัล</button>
            </div>
        </div>`;
    }

    if(!hasQueue) out+=`<div style="text-align:center;color:rgba(255,255,255,.3);font-size:0.78rem;padding:4px 0 10px">ยังไม่มีการผจญภัย</div>`;

    // ── ฟอร์มส่งใหม่ (เฉพาะเมื่อไม่มีคิว) ──
    if(!hasQueue){
        const busyIds=exps.flatMap(e=>e.petInstIds);
        const avail=(userData.pets||[]).filter(p=>
            String(p.instId||p.id)!==String(userData.activePet) &&
            !p.isExpedition &&
            !busyIds.includes(String(p.instId||p.id))
        );

        out+=`<div style="border-top:1px solid rgba(255,255,255,.08);padding-top:12px;margin-top:4px">
            <div style="font-size:0.7rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.5px;margin-bottom:7px">🆕 ส่งออกเดินทาง (1–3 ตัว)</div>
            ${avail.length===0
                ?`<div style="color:rgba(255,255,255,.3);font-size:0.78rem;text-align:center;padding:8px 0">ไม่มีสัตว์ว่าง</div>`
                :`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:6px;margin-bottom:10px">
                    ${avail.map(p=>{
                        const sel=__expSelPets.includes(String(p.instId||p.id));
                        const cfg=RARITY[p.rarity];
                        return`<div onclick="toggleExpPet('${p.instId||p.id}')"
                            style="background:${sel?cfg.color+'22':'rgba(255,255,255,.04)'};border:2px solid ${sel?cfg.color:'rgba(255,255,255,.12)'};border-radius:12px;padding:6px 3px;text-align:center;cursor:pointer;transition:.15s;position:relative">
                            <div style="font-size:1.4rem">${p.emoji}</div>
                            <div style="font-size:0.58rem;font-weight:600;color:rgba(255,255,255,.7)">${formatPetName(p)}</div>
                            <div style="font-size:0.5rem;color:${cfg.color}">${cfg.label}</div>
                            <div style="font-size:0.48rem;color:rgba(255,255,255,.35)">+${petDailyCoins(p)}🪙/วัน</div>
                            ${sel?`<div style="position:absolute;top:-4px;right:-4px;background:${cfg.color};color:#fff;width:14px;height:14px;border-radius:50%;font-size:0.55rem;display:flex;align-items:center;justify-content:center;font-weight:800">✓</div>`:''}
                        </div>`;
                    }).join('')}
                </div>`
            }
            <div style="font-size:0.7rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.5px;margin-bottom:6px">⏱️ ระยะเวลา</div>
            <div style="display:flex;gap:6px;margin-bottom:10px">
                ${EXP_DURATIONS.map((d,i)=>{
                    const sel=__expSelDur===i;
                    const n=__expSelPets.length||1;
                    // แสดงรางวัลจากสัตว์ที่เลือก ถ้ายังไม่เลือกแสดง 0
                    const selPets=(userData.pets||[]).filter(p=>__expSelPets.includes(String(p.instId||p.id)));
                    const selPassive=selPets.reduce((s,p)=>s+petDailyCoins(p),0);
                    const minC=Math.floor(d.mult[0]*(selPassive||0));
                    const maxC=Math.floor(d.mult[1]*(selPassive||0));
                    const drop=Math.min(100,5*n*d.eggVar);
                    return`<button class="exp-dur-btn${sel?' sel':''}" onclick="selectExpDur(${i})">
                        <div style="font-size:0.78rem">${d.label}</div>
                        <div style="font-size:0.62rem;color:${sel?'#c4b5fd':'rgba(255,255,255,.3)'};margin-top:2px">${selPassive?minC+'–'+maxC+'🪙':'เลือกสัตว์ก่อน'}</div>
                        <div style="font-size:0.58rem;color:${sel?'#86efac':'rgba(255,255,255,.25)'}">🥚${drop}%</div>
                    </button>`;
                }).join('')}
            </div>
            <button onclick="startExpedition()" ${__expSelPets.length>0?'':'disabled'}
                style="width:100%;background:${__expSelPets.length>0?'linear-gradient(135deg,#7c3aed,#6d28d9)':'rgba(255,255,255,.06)'};border:none;border-radius:12px;padding:11px;color:${__expSelPets.length>0?'#fff':'rgba(255,255,255,.25)'};font-family:inherit;font-size:0.88rem;font-weight:800;cursor:${__expSelPets.length>0?'pointer':'not-allowed'};transition:.2s;box-shadow:${__expSelPets.length>0?'0 4px 14px rgba(124,58,237,.4)':'none'}">
                🗺️ ${__expSelPets.length>0?`ส่ง ${__expSelPets.length} ตัวออกเดินทาง!`:'เลือกสัตว์ก่อน'}
            </button>
        </div>`;
    } else {
        out+=`<div style="margin-top:8px;text-align:center;font-size:0.7rem;color:rgba(255,255,255,.25)">📌 1 คิวต่อครั้ง — กดรับรางวัลก่อนจึงจะส่งได้อีก</div>`;
    }

    // ── ประวัติ expedition log ──
    const logs=(userData.expeditionLogs||[]).slice().reverse();
    if(logs.length){
        out+=`<div style="border-top:1px solid rgba(255,255,255,.06);margin-top:12px;padding-top:10px">
            <div style="font-size:0.68rem;color:rgba(255,255,255,.3);font-weight:700;letter-spacing:.5px;margin-bottom:6px">📜 ประวัติล่าสุด</div>
            ${logs.slice(0,5).map(l=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:0.7rem">
                <div style="color:rgba(255,255,255,.4)">${l.pets||''} · ${l.dur||''}</div>
                <div style="color:#6ee7b7;font-weight:700">+${l.coins}🪙${l.egg?' 🥚':''}</div>
            </div>`).join('')}
        </div>`;
    }

    return out;
}
function _refreshExpeditionUI(){
    // Update modal body (primary)
    const modalBody=document.getElementById('exp-modal-body');
    if(modalBody) modalBody.innerHTML=buildExpeditionUI();
    _startExpTimers();
    // Also refresh play tab hub notify dot if visible
    if(window.__tab==='play') renderTab('play');
}

function _startExpTimers(){
    (userData?.expeditions||[]).filter(e=>Date.now()<e.endTime).forEach(e=>{
        const el=document.getElementById(`exp-timer-${e.id}`);
        if(!el||el.__running)return;
        el.__running=true;
        const tick=()=>{
            if(!el.isConnected)return;
            const ms=e.endTime-Date.now();
            if(ms<=0){_refreshExpeditionUI();return;}
            const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);
            el.textContent=h>0?`${h}ชม ${m}น ${s}ว`:m>0?`${m}น ${s}ว`:`${s}ว`;
            setTimeout(tick,1000);
        };
        setTimeout(tick,1000);
    });
}

window.toggleExpPet=(instId)=>{
    const id=String(instId);
    const i=__expSelPets.indexOf(id);
    if(i>=0) __expSelPets.splice(i,1);
    else if(__expSelPets.length<3) __expSelPets.push(id);
    else{toast('เลือกได้สูงสุด 3 ตัว','info');return;}
    _refreshExpeditionUI();
};

window.selectExpDur=(i)=>{ __expSelDur=i; _refreshExpeditionUI(); };

window.startExpedition=async()=>{
    if(!currentUser||!userData)return;
    if(__expSelPets.length===0){toast('เลือกสัตว์ก่อน','error');return;}
    if(__expSelPets.length>3){toast('เลือกได้สูงสุด 3 ตัว','error');return;}
    if((userData.expeditions||[]).length>0){toast('มีคิวผจญภัยอยู่แล้ว — รับรางวัลก่อน!','error');return;}
    const dur=EXP_DURATIONS[__expSelDur];
    const now=Date.now();
    const expId=`exp_${now}_${Math.random().toString(36).slice(2,7)}`;
    const newExp={id:expId,petInstIds:[...__expSelPets],durLabel:dur.label,
        durMins:dur.mins,multMin:dur.mult[0],multMax:dur.mult[1],eggVar:dur.eggVar,
        endTime:now+dur.mins*60000,startTime:now};
    const newPets=(userData.pets||[]).map(p=>
        __expSelPets.includes(String(p.instId||p.id))?{...p,isExpedition:true}:p
    );
    // ── Optimistic update: อัปเดต userData local ทันที ไม่รอ onSnapshot ──
    userData = {
        ...userData,
        expeditions: [...(userData.expeditions||[]), newExp],
        pets: newPets,
    };
    __expSelPets = [];
    // รีเฟรช UI ทันที
    _refreshExpeditionUI();
    toast(`🗺️ ส่ง ${newExp.petInstIds.length} ตัวออกเดินทาง ${dur.label}!`,'success');
    // เซฟ Firestore ใน background
    updateDoc(doc(db,'users',currentUser.uid),{
        expeditions:arrayUnion(newExp),pets:newPets,
    }).catch(e=>{ toast('เซฟข้อมูลผิดพลาด','error'); log.error('contact-save',e); });
};

window.claimExpedition=async(expId)=>{
    if(!currentUser||!userData)return;
    const exps=userData.expeditions||[];
    const exp=exps.find(e=>e.id===expId);
    if(!exp){toast('ไม่พบข้อมูล','error');return;}
    if(Date.now()<exp.endTime){toast('ยังไม่ถึงเวลา!','info');return;}
    // รางวัล coins
    const epets=(userData.pets||[]).filter(p=>exp.petInstIds.includes(String(p.instId||p.id)));
    const passiveSum=epets.reduce((s,p)=>s+petDailyCoins(p),0);
    const mult=exp.multMin+Math.random()*(exp.multMax-exp.multMin);
    const coinReward=Math.max(1,Math.floor(mult*passiveSum));
    // โอกาสดรอปไข่
    const dropPct=Math.min(100,5*exp.petInstIds.length*exp.eggVar)/100;
    const gotEgg=Math.random()<dropPct;
    let newEggs=[...(userData.eggs||[])];
    let eggMsg='';
    if(gotEgg){
        const pet=rollPetFromEgg('pet');
        newEggs.push({eggId:Date.now()+'_'+Math.random().toString(36).slice(2,6),
            eggType:'pet',petId:pet.id,petEmoji:pet.emoji,petName:pet.name,
            petRarity:pet.rarity,petInstId:pet.instId,hatchMins:pet.hatchMins,startedAt:null});
        eggMsg=` + 🥚 ได้ไข่ปริศนา (${pet.emoji} ${pet.rarity||''})!`;
    }
    // clear expedition + unmark pets
    const remainExps=exps.filter(e=>e.id!==expId);
    const updatedPets=(userData.pets||[]).map(p=>
        exp.petInstIds.includes(String(p.instId||p.id))?{...p,isExpedition:false}:p
    );
    await updateDoc(doc(db,'users',currentUser.uid),{
        expeditions:remainExps,pets:updatedPets,
        coins:increment(coinReward),eggs:newEggs,
    });
    // เพิ่ม expedition log (สูงสุด 10 รายการ)
    const logEntry={coins:coinReward,egg:gotEgg,dur:exp.durLabel,pets:epets.map(p=>p.emoji).join(''),ts:Date.now()};
    const newLogs=[...(userData.expeditionLogs||[]),logEntry].slice(-10);
    await updateDoc(doc(db,'users',currentUser.uid),{expeditionLogs:newLogs});
    // ── Optimistic update: อัปเดต userData local แล้วรีเฟรช UI ทันที ──
    userData = {
        ...userData,
        expeditions: remainExps,
        pets: updatedPets,
        coins: (userData.coins||0) + coinReward,
        eggs: newEggs,
        expeditionLogs: newLogs,
    };
    _refreshExpeditionUI();
    toast(`🎉 ได้รับ +${coinReward}🪙${eggMsg}`,'success',5000);
    confetti({particleCount:100,spread:70,origin:{y:0.5}});
};


// ════════════════════════════════════════
// ▶ GAME MODAL BODY BUILDERS
// ════════════════════════════════════════
function buildQuizBody(){
    return`<div style="padding:4px 0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:0.8rem;color:rgba(255,255,255,.5)">เห็นชื่อเล่น → ทายชื่อจริง<br><span style="font-size:0.7rem;color:rgba(255,255,255,.35)">ตอบถูกต่อเนื่อง +5🪙/ข้อ</span></div>
            <div style="display:flex;align-items:center;gap:8px">
                <button onclick="toggleLb('qlb')" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:3px 9px;color:rgba(255,255,255,.6);font-size:0.68rem;cursor:pointer;font-family:inherit">🏆 กระดาน</button>
                <div class="score-badge">🏆 <b id="q-score">${window._qTop1()}</b></div>
            </div>
        </div>
        <div id="qlb" style="display:none;margin-bottom:10px">${window.buildQuizLb()}</div>
        <div id="quiz-start">
            <div class="game-start">
                <span class="game-start-icon">🕵️</span>
                <div class="game-start-hi">High Score: ${qHigh} คะแนน</div>
                <div class="game-start-desc" id="q-msg">เห็นชื่อเล่น → ทายชื่อจริง<br>ตอบถูกต่อเนื่อง +20🪙/ข้อ</div>
                <button class="btn-play" onclick="startQuiz()">▶ เริ่มเกม</button>
            </div>
        </div>
        <div id="quiz-play" style="display:none">
            <div class="q-prompt">
                <div style="font-size:0.72rem;color:rgba(255,255,255,.4);margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">ชื่อเล่นคือ</div>
                <div class="q-nick" id="q-nick">...</div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,.4);margin-top:6px">ชื่อจริงคืออะไร?</div>
            </div>
            <div class="q-grid" id="q-opts"></div>
        </div>
    </div>`;
}

function buildDrugBody(){
    return`<div style="padding:4px 0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:0.8rem;color:rgba(255,255,255,.5)">เห็นชื่อยา → ทาย Drug Class<br><span style="font-size:0.7rem;color:rgba(255,255,255,.35)">ตอบถูกต่อเนื่อง +5🪙/ข้อ</span></div>
            <div style="display:flex;align-items:center;gap:8px">
                <button onclick="toggleLb('dqlb')" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:3px 9px;color:rgba(255,255,255,.6);font-size:0.68rem;cursor:pointer;font-family:inherit">🏆 กระดาน</button>
                <div class="score-badge">🏆 <b id="dq-score">${window._dqTop1()}</b></div>
            </div>
        </div>
        <div id="dqlb" style="display:none;margin-bottom:10px">${window.buildDrugLb()}</div>
        <div id="dquiz-start">
            <div class="game-start">
                <span class="game-start-icon">💊</span>
                <div class="game-start-hi">High Score: ${dqHigh} คะแนน</div>
                <div class="game-start-desc" id="dq-msg">เห็นชื่อยา → ทาย Drug Class<br>ตอบถูกต่อเนื่อง +20🪙/ข้อ</div>
                <button class="btn-play" onclick="startDrugQuiz()">▶ เริ่มเกม</button>
            </div>
        </div>
        <div id="dquiz-play" style="display:none">
            <div class="q-prompt">
                <div style="font-size:0.72rem;color:rgba(255,255,255,.4);margin-bottom:8px;letter-spacing:1px;text-transform:uppercase">ยาชนิดนี้คือ</div>
                <div class="q-drug-name" id="dq-drug">...</div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,.4);margin-top:8px">จัดอยู่ใน Drug Class ใด?</div>
            </div>
            <div class="q-grid" id="dq-opts"></div>
        </div>
    </div>`;
}

// ════════════════════════════════════════
// ▶ FORGE (ตีบวก) SYSTEM
// ════════════════════════════════════════

// ── Forge rate table ──
const FORGE_RATES = [
    null, // 0 = unused
    {cost:100,  chance:100}, // +1
    {cost:200,  chance:95},  // +2
    {cost:300,  chance:90},  // +3
    {cost:400,  chance:85},  // +4
    {cost:500,  chance:80},  // +5
    {cost:600,  chance:75},  // +6
    {cost:700,  chance:70},  // +7
    {cost:800,  chance:65},  // +8
    {cost:1000, chance:60},  // +9
    {cost:1200, chance:55},  // +10
    {cost:1500, chance:50},  // +11
    {cost:1800, chance:45},  // +12
    {cost:2200, chance:40},  // +13
    {cost:2600, chance:30},  // +14
    {cost:3000, chance:25},  // +15
];

// ── Forge bonus % per refine level ──
function forgeBonus(refine){
    if(refine<=0)  return 0;
    if(refine<=5)  return refine*5;           // +5% per level (×1→×5)
    if(refine<=10) return 25+(refine-5)*8;    // +8% per level (×6→×10)
    return 65+(refine-10)*12;                 // +12% per level (×11→×15)
}

/** calculatePetStats(p) — realtime stats พร้อม grade + forge bonus */
function calculatePetStats(p){
    const base = BASE_STATS[p.rarity]||BASE_STATS.common;
    const gm   = STAT_MULTI[p.grade||0];
    const fb   = 1 + forgeBonus(p.refine||0)/100;
    return {
        atk: Math.round(base.atk * gm * fb),
        hp:  Math.round(base.hp  * gm * fb),
    };
}

// ── Refine color ──
function refineColor(r){
    if(!r||r<=0)  return 'rgba(255,255,255,.6)';
    if(r<=4)      return '#334155';
    if(r<=9)      return '#047857';
    if(r<=14)     return '#581c87';
    return '#9a3412';  // deep gold-brown for +15
}

// ── formatPetName(p) ──
function formatPetName(p){
    const base = petDisplayName(p);
    const grade = p.grade||0;
    const refine = p.refine||0;
    const gradePart  = grade>=1 ? ' '+GRADE_LABELS[grade] : '';
    const refinePart = refine>=1 ? ` +${refine}${refine>=15?' 👑':''}` : '';
    return base + gradePart + refinePart;
}

// ── Forge Modal state ──
let __forgeSelPet = null; // instId ที่เลือก

window.openForgeModal = (preselect)=>{
    if(!currentUser){ toast('กรุณา Login ก่อน','error'); return; }
    __forgeSelPet = preselect ? String(preselect) : null;
    _renderForgeBody();
    document.getElementById('forge-modal').classList.add('active');
};
window.closeForgeModal = ()=>{
    document.getElementById('forge-modal').classList.remove('active');
    __forgeSelPet = null;
};

window.forgeSelectPet = (instId)=>{
    __forgeSelPet = instId;
    _renderForgeBody();
};

function _renderForgeBody(){
    const body = document.getElementById('forge-body');
    if(!body) return;
    const pets = (userData?.pets||[]).filter(p=>!p.isExpedition);
    const coins = userData?.coins||0;

    if(!pets.length){
        body.innerHTML = `<div style="text-align:center;color:rgba(255,255,255,.4);padding:24px;font-size:0.84rem">ยังไม่มีสัตว์เลี้ยง</div>`;
        return;
    }

    // ── Selected pet hero (shown at top when selected) ──
    const selPet = __forgeSelPet ? pets.find(x=>String(x.instId||x.id)===String(__forgeSelPet)) : null;

    // Pet select — ย้ายลงล่าง
    const petListHTML = `
    <div style="font-size:0.7rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.5px;margin-bottom:8px;margin-top:${selPet?'12px':'0'}">เลือกสัตว์ที่ต้องการตีบวก</div>
    <div class="forge-pet-grid">
        ${pets.map(p=>{
            const cfg = RARITY[p.rarity];
            const r = p.refine||0;
            const sel = __forgeSelPet===String(p.instId||p.id);
            const maxed = r>=15;
            return `<div class="forge-pet-card${sel?' sel':''}" onclick="forgeSelectPet('${String(p.instId||p.id)}')" style="${maxed?'opacity:.45;cursor:default;':''}">
                <div style="font-size:1.5rem">${p.emoji}</div>
                <div style="font-size:0.55rem;font-weight:700;color:${cfg.color};margin-top:2px">${cfg.label}</div>
                <div style="font-size:0.6rem;font-weight:800;color:${refineColor(r)}">${r>0?'+'+r:p.grade>0?GRADE_LABELS[p.grade]:'—'}</div>
                ${maxed?'<div style="font-size:0.5rem;color:#eab308">MAX</div>':''}
            </div>`;
        }).join('')}
    </div>`;

    // Detail panel
    let detailHTML = '';
    if(__forgeSelPet){
        const p = pets.find(x=>String(x.instId||x.id)===String(__forgeSelPet));
        if(p){
            const r = p.refine||0;
            const cfg = RARITY[p.rarity];
            if(r>=15){
                detailHTML = `<div style="text-align:center;color:#eab308;font-weight:800;padding:16px;font-size:1rem">👑 ตีบวก +15 สูงสุดแล้ว!</div>`;
            } else {
                const nextR = r+1;
                const rate = FORGE_RATES[nextR];
                const canAfford = coins >= rate.cost;
                const statNow  = calculatePetStats(p);
                const statNext = calculatePetStats({...p, refine:nextR});
                const chancePct = rate.chance;
                const chanceColor = chancePct>=80?'#4ade80':chancePct>=50?'#fbbf24':'#f87171';

                detailHTML = `
                <div style="background:rgba(255,255,255,.04);border-radius:16px;padding:14px;border:1px solid rgba(255,180,0,.12);margin-top:4px">
                    <!-- Pet header -->
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                        <div style="font-size:2.5rem;filter:drop-shadow(0 0 8px ${cfg.glow})">${p.emoji}</div>
                        <div>
                            <div style="font-size:0.9rem;font-weight:800;color:#fff">${formatPetName(p)}</div>
                            <div style="font-size:0.7rem;color:${cfg.color}">${cfg.label}</div>
                            <div style="font-size:0.78rem;margin-top:2px">
                                <span style="color:rgba(255,255,255,.5)">ระดับปัจจุบัน: </span>
                                <span style="color:${refineColor(r)};font-weight:800">${r>0?'+'+r:'ยังไม่ได้ตี'}</span>
                                <span style="color:rgba(255,255,255,.3);margin:0 4px">→</span>
                                <span style="color:${refineColor(nextR)};font-weight:800">+${nextR}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Stats preview -->
                    <div style="background:rgba(0,0,0,.3);border-radius:10px;padding:10px;margin-bottom:10px">
                        <div class="forge-stat-row">
                            <div class="forge-stat-before">⚔️ ${statNow.atk}</div>
                            <div class="forge-stat-arrow">→</div>
                            <div class="forge-stat-after">⚔️ ${statNext.atk}</div>
                        </div>
                        <div class="forge-stat-row">
                            <div class="forge-stat-before">❤️ ${statNow.hp}</div>
                            <div class="forge-stat-arrow">→</div>
                            <div class="forge-stat-after">❤️ ${statNext.hp}</div>
                        </div>
                        <div style="font-size:0.65rem;color:rgba(255,255,255,.3);text-align:center;margin-top:4px">
                            โบนัส ${forgeBonus(r)}% → ${forgeBonus(nextR)}% (+${forgeBonus(nextR)-forgeBonus(r)}%)
                        </div>
                    </div>

                    <!-- Cost + Chance -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <div>
                            <div style="font-size:0.65rem;color:rgba(255,255,255,.35)">ราคา</div>
                            <div style="font-size:1rem;font-weight:800;color:${canAfford?'#fbbf24':'#f87171'}">${rate.cost.toLocaleString()}🪙</div>
                            ${!canAfford?`<div style="font-size:0.6rem;color:#f87171">เหรียญไม่พอ (มี ${coins.toLocaleString()})</div>`:`<div style="font-size:0.6rem;color:rgba(255,255,255,.3)">คงเหลือ ${(coins-rate.cost).toLocaleString()}🪙</div>`}
                        </div>
                        <div style="text-align:right">
                            <div style="font-size:0.65rem;color:rgba(255,255,255,.35)">โอกาสสำเร็จ</div>
                            <div style="font-size:1.3rem;font-weight:800;color:${chanceColor}">${chancePct}%</div>
                        </div>
                    </div>
                    <div class="forge-chance-bar">
                        <div class="forge-chance-fill" style="width:${chancePct}%;background:${chanceColor}"></div>
                    </div>
                    <div style="font-size:0.66rem;color:rgba(255,255,255,.3);margin-bottom:10px">ตีแหก = เสียแค่เงิน ระดับไม่ลด</div>

                    <button onclick="confirmForge()" ${canAfford?'':'disabled'}
                        style="width:100%;background:${canAfford?'linear-gradient(135deg,#f59e0b,#d97706)':'rgba(255,255,255,.06)'};border:none;border-radius:12px;padding:12px;color:${canAfford?'#fff':'rgba(255,255,255,.25)'};font-family:inherit;font-size:0.95rem;font-weight:800;cursor:${canAfford?'pointer':'not-allowed'};box-shadow:${canAfford?'0 4px 14px rgba(245,158,11,.4)':'none'}">
                        🔨 ตีบวก +${nextR} &nbsp;·&nbsp; ${chancePct}% &nbsp;·&nbsp; ${rate.cost.toLocaleString()}🪙
                    </button>
                </div>`;
            }
        }
    }

    body.innerHTML = detailHTML + petListHTML;
}

window.confirmForge = async ()=>{
    if(!currentUser||!userData) return;
    if(!__forgeSelPet){ toast('เลือกสัตว์ก่อน','error'); return; }
    const pets = userData.pets||[];
    const p = pets.find(x=>String(x.instId||x.id)===String(__forgeSelPet));
    if(!p){ toast('ไม่พบสัตว์','error'); return; }
    if(p.isExpedition){ toast('สัตว์กำลังผจญภัยอยู่ ไม่สามารถตีบวกได้','error'); return; }
    const r = p.refine||0;
    if(r>=15){ toast('ตีบวก +15 สูงสุดแล้ว!','info'); return; }
    const nextR = r+1;
    const rate = FORGE_RATES[nextR];
    const coins = userData.coins||0;
    if(coins < rate.cost){ toast(`เหรียญไม่พอ! ต้องการ ${rate.cost}🪙`,'error'); return; }
    if(!await _confirm(`🔨 ตีบวก +${nextR}
${formatPetName(p)}
ราคา ${rate.cost.toLocaleString()}🪙 · โอกาส ${rate.chance}%

ยืนยันการตีบวก?`)) return;

    const success = Math.random()*100 < rate.chance;
    const newPets = pets.map(x=>{
        if(String(x.instId||x.id)!==String(__forgeSelPet)) return x;
        return success ? {...x, refine:nextR} : x; // fail = ไม่เปลี่ยน refine
    });
    const newCoins = coins - rate.cost;

    // Optimistic update
    userData = {...userData, pets:newPets, coins:newCoins};
    _renderForgeBody();

    if(success){
        const statNew = calculatePetStats({...p, refine:nextR});
        toast(`✨ ตีบวก +${nextR} สำเร็จ! ATK ${statNew.atk} · HP ${statNew.hp}`,'success',4000);
        if(nextR>=10) confetti({particleCount:80,spread:60,origin:{y:0.5},colors:['#f59e0b','#a855f7','#fff']});
        if(nextR>=7 && typeof postNews==='function'){
            const _fName=userData?.nickname||userData?.name||'ผู้เล่น';
            await postNews('🔨',`${_fName} ตีบวก ${p.emoji} สำเร็จถึง +${nextR}${nextR>=15?' 👑':''}! [${RARITY[p.rarity].label}]`).catch(()=>{});
        }
    } else {
        toast(`💔 ตีแหก! +${r} → +${r} (เสียแค่ ${rate.cost}🪙)`,'error',3500);
    }

    // Block onSnapshot ระหว่าง write เพื่อป้องกัน race condition
    window.__blockSnapshot = true;
    try {
        await updateDoc(doc(db,'users',currentUser.uid),{pets:newPets,coins:newCoins});
    } catch(e) {
        log.error('forge-save',e);
        toast('เซฟข้อมูลผิดพลาด กรุณาลองใหม่','error');
    } finally {
        // คืน flag หลัง Firestore acknowledge — snapshot ถัดไปจะมีค่าใหม่แล้ว
        setTimeout(()=>{ window.__blockSnapshot=false; }, 1500);
    }
};

// ════════════════════════════════════════
//  TAB: SHOP
// ════════════════════════════════════════
// ════════════════════════════════════════
// ▶ TAB BUILDERS — SHOP
// ════════════════════════════════════════
/** _spendCoins(amount) — บันทึกยอดใช้จ่ายสะสม (ไม่ให้รางวัลทันที ต้องกดรับเอง) */
window._spendCoins=async(amount)=>{
    if(!currentUser||!userData||amount<=0) return;
    const prev=userData?.totalSpent||0;
    const next=prev+amount;
    window.__blockSnapshot=true;
    userData={...userData,totalSpent:next};
    setTimeout(()=>{window.__blockSnapshot=false;},200);
    try{ await updateDoc(doc(db,'users',currentUser.uid),{totalSpent:next}); }
    catch(e){ log.error('spendCoins-save',e); }
    // refresh shop ถ้า tab shop เปิดอยู่
    if(document.querySelector('.tab-btn.active')?.dataset?.tab==='shop'){
        const main=document.getElementById('main-content');
        if(main&&typeof buildShop==='function') main.innerHTML=buildShop();
    }
};

/** claimPityReward() — กดรับไข่การันตีตำนานจากยอดใช้จ่ายสะสม */
window.claimPityReward=async()=>{
    if(!currentUser||!userData) return;
    const PITY=15000;
    const totalSpent=userData?.totalSpent||0;
    const claimedRounds=userData?.pityClaimedRounds||0;
    const earnedRounds=Math.floor(totalSpent/PITY);
    const pending=earnedRounds-claimedRounds;
    if(pending<=0){ toast('ยังไม่ครบยอด','info'); return; }
    const newEggs=[...(userData?.eggs||[])];
    for(let k=0;k<pending;k++){
        const p=rollPetFromGuaranteedEgg();
        newEggs.push({eggId:`pity_${Date.now()}_${k}_${Math.random().toString(36).slice(2,6)}`,eggType:'guaranteed',petId:p.id,petEmoji:p.emoji,petName:p.name,petRarity:p.rarity,petInstId:p.instId,hatchMins:1,startedAt:null});
    }
    const newClaimed=claimedRounds+pending;
    window.__blockSnapshot=true;
    userData={...userData,eggs:newEggs,pityClaimedRounds:newClaimed};
    renderAll();
    setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{eggs:arrayUnion(...newEggs.slice(-pending)),pityClaimedRounds:newClaimed});
    }catch(e){ toast('บันทึกผิดพลาด','error'); return; }
    toast(`🎁 รับไข่การันตีตำนาน ${pending} ใบแล้ว! ⭐`,'success');
    if(typeof confetti==='function') confetti({particleCount:100,spread:70,origin:{y:0.5},scalar:0.9});
};

function buildShop(){
    const coins=userData?.coins||0;const canMega=!!currentUser&&coins>=MEGA_COST;
    const owned=new Set((userData?.pets||[]).map(p=>p.id));
    const pendingEgg=(userData?.eggs||[]).some(e=>!e.startedAt);
    const isAdmin=userData?.email===ADMIN_EMAIL;
    const PITY=15000;
    const totalSpent=userData?.totalSpent||0;
    const claimedRounds=userData?.pityClaimedRounds||0;
    const earnedRounds=Math.floor(totalSpent/PITY);
    const pendingPity=earnedRounds-claimedRounds;
    const pityProgress=totalSpent%PITY;
    const pityPct=Math.min(100,pityProgress/PITY*100);
    return`
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between">
            <div>
                <div style="font-size:0.68rem;color:rgba(255,255,255,.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">🛒 ร้านค้า</div>
                <div style="font-size:1.4rem;font-weight:800;color:#fbbf24">🪙 ${coins.toLocaleString()}</div>
                <div style="font-size:0.68rem;color:rgba(255,255,255,.4)">เหรียญที่มี</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:0.68rem;color:rgba(255,255,255,.4);margin-bottom:4px">ซื้อไข่เพื่อฟักสัตว์เลี้ยง</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,.5)">Normal → Rare → Epic → Legendary</div>
            </div>
        </div>
        <!-- ใช้จ่ายสะสม progress bar -->
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:14px;padding:12px 16px;margin-bottom:10px;border:1px solid rgba(251,191,36,.15)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <div>
                    <div style="font-size:0.68rem;color:#fbbf24;font-weight:800;letter-spacing:1px">🎁 ใช้จ่ายสะสม</div>
                    <div style="font-size:0.6rem;color:rgba(255,255,255,.4);margin-top:1px">ทุก ${PITY.toLocaleString()}🪙 รับไข่การันตีตำนาน</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:0.78rem;font-weight:800;color:#fff">${pityProgress.toLocaleString()} <span style="color:rgba(255,255,255,.3);font-size:0.62rem">/ ${PITY.toLocaleString()}</span></div>
                    <div style="font-size:0.58rem;color:rgba(255,255,255,.35)">รวมใช้ไป ${totalSpent.toLocaleString()}🪙</div>
                </div>
            </div>
            <div style="height:10px;background:rgba(255,255,255,.08);border-radius:50px;overflow:hidden;margin-bottom:8px">
                <div style="width:${pityPct}%;height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:50px;transition:width .5s ease"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">
                <div style="font-size:0.6rem;color:rgba(255,255,255,.35)">
                    ${pendingPity>0?`มี <b style="color:#fbbf24">${pendingPity} ใบ</b> รอรับ!`:`เหลืออีก ${Math.max(0,PITY-pityProgress).toLocaleString()}🪙`}
                </div>
                ${pendingPity>0
                    ?`<button onclick="claimPityReward()" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:9px;padding:5px 14px;color:#fff;font-family:inherit;font-size:0.72rem;font-weight:800;cursor:pointer;animation:wobble 1.5s ease infinite">🎁 กดรับ ${pendingPity} ใบ!</button>`
                    :`<div style="font-size:0.58rem;color:rgba(255,255,255,.2)">ครบ ${PITY.toLocaleString()}🪙 = 1 ใบ</div>`}
            </div>
        </div>
        <div class="card">
            <div style="font-weight:800;font-size:0.95rem;margin-bottom:12px;text-align:center">🥚 ไข่สัตว์เลี้ยง</div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
                <span style="font-size:3rem;animation:wobble 2.5s ease infinite;display:inline-block">🥚</span>
                <div style="flex:1">
                    <div style="font-weight:800;font-size:1rem;margin-bottom:2px">ไข่สัตว์เลี้ยง</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                        <span style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">⬜ Common 72%</span>
                        <span style="background:rgba(59,130,246,.2);color:#93c5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🔵 Rare 25%</span>
                        <span style="background:rgba(168,85,247,.2);color:#c4b5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🟣 Epic 3%</span>
                    </div>
                </div>
                <button class="btn-gold" onclick="buyEgg('pet')" ${currentUser&&coins>=150?'':'disabled'} style="white-space:nowrap">150🪙</button>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
                    <span style="font-size:3rem;animation:wobble 3s ease infinite 0.5s;display:inline-block;filter:drop-shadow(0 0 8px rgba(99,102,241,.6))">🌐</span>
                    <div style="flex:1">
                        <div style="font-weight:800;font-size:1rem;margin-bottom:2px">ไข่เรืองแสง <span style="font-size:0.62rem;color:#6366f1;background:#eef2ff;padding:1px 6px;border-radius:8px;font-weight:700">ระดับกลาง</span></div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                            <span style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">⬜ Common 40%</span>
                            <span style="background:rgba(59,130,246,.2);color:#93c5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🔵 Rare 38%</span>
                            <span style="background:rgba(168,85,247,.2);color:#c4b5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🟣 Epic 18%</span>
                            <span style="background:rgba(245,158,11,.2);color:#fcd34d;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">⭐ Legendary 4%</span>
                        </div>
                    </div>
                    <button class="btn-gold" onclick="buyGlowEgg()" ${currentUser&&(userData?.coins||0)>=1200?'':'disabled'} style="white-space:nowrap">1200🪙</button>
                </div>
                ${isAdmin?`<div style="display:flex;align-items:center;gap:12px;padding-top:10px;border-top:1px solid var(--border)">
                    <span style="font-size:3rem;animation:wobble 2s ease infinite;display:inline-block;filter:drop-shadow(0 0 18px rgba(251,191,36,1))">🎁</span>
                    <div style="flex:1">
                        <div style="font-weight:800;font-size:1rem;margin-bottom:2px">ไข่การันตีตำนาน <span style="font-size:0.62rem;color:#f59e0b;background:#fffbeb;padding:1px 6px;border-radius:8px;font-weight:700">Admin</span></div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                            <span style="background:rgba(245,158,11,.2);color:#fcd34d;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">⭐ Legendary 100%</span>
                        </div>
                    </div>
                    <button class="btn-gold" onclick="buyGuaranteedEgg()" ${(userData?.coins||0)>=20000?'':'disabled'} style="white-space:nowrap">20000🪙</button>
                </div>`:``}
                <div style="display:flex;align-items:center;gap:12px;padding-top:10px;border-top:1px solid var(--border)">
                    <span style="font-size:3rem;animation:wobble 3.5s ease infinite 1s;display:inline-block;filter:drop-shadow(0 0 14px rgba(245,158,11,.8))">🌠</span>
                    <div style="flex:1">
                        <div style="font-weight:800;font-size:1rem;margin-bottom:2px">ไข่ตำนาน <span style="font-size:0.62rem;color:#d97706;background:#fffbeb;padding:1px 6px;border-radius:8px;font-weight:700">ระดับสูง</span></div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                            <span style="background:rgba(59,130,246,.2);color:#93c5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🔵 Rare 35%</span>
                            <span style="background:rgba(168,85,247,.2);color:#c4b5fd;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">🟣 Epic 45%</span>
                            <span style="background:rgba(245,158,11,.2);color:#fcd34d;padding:2px 8px;border-radius:10px;font-size:0.68rem;font-weight:700">⭐ Legendary 20%</span>
                        </div>
                    </div>
                    <button class="btn-gold" onclick="buyStarEgg()" ${currentUser&&(userData?.coins||0)>=3000?'':'disabled'} style="white-space:nowrap">3000🪙</button>
                </div>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:10px;display:flex;align-items:center;gap:10px">
                <div style="font-size:1.5rem;flex-shrink:0">⚡</div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:0.88rem">Instant Hatch Ticket</div>
                    <div style="font-size:0.72rem;color:var(--muted)">ซื้อเก็บไว้ กดใช้ที่ไข่ใบไหนก็ได้ · มีอยู่ <b>${userData?.instantTickets||0}</b> ใบ</div>
                </div>
                <button class="btn-gold sm" onclick="buyInstantHatch()" ${currentUser&&coins>=INSTANT_COST?'':'disabled'}>${INSTANT_COST}🪙</button>
            </div>
        </div>


        <div class="sec-head">📣 ไอเทมพิเศษ</div>
        <div class="card">
            <div style="display:flex;align-items:center;gap:12px;padding:4px 0">
                <div style="font-size:2.4rem;flex-shrink:0">📣</div>
                <div style="flex:1">
                    <div style="font-weight:700;font-size:0.95rem">โทรโข่ง</div>
                    <div style="font-size:0.76rem;color:var(--muted)">ส่งข้อความถึงทุกคน — ${MEGA_COST}🪙</div>
                </div>
                <button class="btn-gold sm" onclick="openMega()" ${canMega?'':'disabled'}>${MEGA_COST}🪙</button>
            </div>
        </div>

    `;
}

// คอลเลกชั่นสัตว์เลี้ยง — สร้าง HTML (เรียกจาก Home)

// ════════════════════════════════════════
// ▶ TAB BUILDERS — COLLECTION
// ════════════════════════════════════════
function buildCollection(){
    const owned=new Set((userData?.pets||[]).map(p=>p.id));
    return['common','rare','epic','legendary'].map(r=>{
        const list=PETS.filter(p=>p.rarity===r);const cfg=RARITY[r];
        return`<div style="margin-bottom:14px">
            <div style="font-weight:700;color:${cfg.color};font-size:0.74rem;margin-bottom:6px;display:flex;align-items:center;gap:6px">
                <span>${cfg.label}</span>
                <span style="color:var(--muted);font-weight:400">+${cfg.dailyBase}🪙/วัน · ฟัก ${HATCH_LABELS[r]}</span>
                <span style="margin-left:auto;font-size:0.68rem;color:${cfg.color}">${[...owned].filter(id=>PETS.find(p=>p.id===id&&p.rarity===r)).length}/${list.length}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:5px">
                ${list.map(p=>{
                    const have=owned.has(p.id);const elEm=ELEMENTS[p.element]?.emoji||'';
                    return`<div style="background:${have?cfg.bg:'#f8fafc'};border-radius:10px;padding:7px 3px;text-align:center;border:1.5px solid ${have?cfg.color+'66':cfg.color+'22'};position:relative;opacity:${have?1:0.5}">
                        <div style="font-size:1.4rem">${have?p.emoji:'❓'}</div>
                        <div style="font-size:0.6rem;font-weight:700;margin-top:2px;line-height:1.2">${have?p.name:'???'}</div>
                        <div style="font-size:0.65rem;margin-top:1px">${have?elEm:'??'}</div>
                        ${have?`<div style="position:absolute;top:3px;right:4px;font-size:0.46rem;color:${cfg.color}">✓</div>`:''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
}
window.toggleCollection=()=>{
    const el=document.getElementById('collection-panel');
    if(!el)return;
    const show=el.style.display==='none'||!el.style.display;
    el.style.display=show?'block':'none';
    if(show)el.innerHTML=buildCollection();
    const tb=document.getElementById('coll-toggle-btn');if(tb)tb.innerHTML=show?'▲ ซ่อน':`🗂️ ดูคอลเลกชั่น <span style="font-size:0.68rem;color:rgba(255,255,255,.35)">${(userData?.pets||[]).filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i).length}/${PETS.length} สายพันธุ์</span>`;
};


// ════════════════════════════════════════
//  BATTLE SYSTEM — Sandbox (Phase 1)
//  - เลือก pet 2 ตัวจาก inventory
//    (ถ้ามีแค่ 1 ตัว → สุ่ม AI จาก PETS pool)
//  - Auto turn-based: สุ่ม 50/50 ว่าใครเริ่มก่อน
//    จากนั้นผลัดกันทีละ turn
//  - Element advantage → ×1.5 (เฉพาะฝ่ายได้เปรียบ)
//  - Critical 20% → ×2 (stack ได้ max ×3.0)
//  - Max 40 turns → Draw
// ════════════════════════════════════════


// ════════════════════════════════════════
// ▶ BATTLE SYSTEM  (sandbox + pve)
// ════════════════════════════════════════
window.openBattle = () => {
    if(!currentUser){ toast('กรุณา Login ก่อน','error'); return; }
    window.__bSelA = null; window.__bSelB = null;
    window.__bMode = 'sandbox'; window.__bRandom = false;
    document.getElementById('battle-modal').classList.add('active');
    _renderBattleSetup();
};
window.closeBattle = () => {
    if(__core?.cfg?.mode==='sandbox'||__core?.cfg?.mode==='pve'){
        clearInterval(__core.timer); clearTimeout(__core.timer); __core=null;
    }
    document.getElementById('battle-modal').classList.remove('active');
};

// ── SETUP SCREENS ──
function _renderBattleSetup() {
    const mode  = window.__bMode || 'sandbox';
    const pets  = (userData?.pets||[]).filter(p=>!p.isExpedition);
    const petCard = (p, slot) => {
        const sel = slot==='A' ? window.__bSelA===p.instId : window.__bSelB===p.instId;
        const cfg = RARITY[p.rarity];
        return `<div onclick="bPick('${p.instId}','${slot}')" style="background:${sel?'rgba(167,139,250,.25)':'rgba(255,255,255,.05)'};
            border:2px solid ${sel?'#a78bfa':'rgba(255,255,255,.1)'};border-radius:10px;padding:7px 5px;text-align:center;cursor:pointer">
            <div style="font-size:1.6rem">${p.emoji}</div>
            <div style="font-size:0.56rem;font-weight:700;color:rgba(255,255,255,.8);margin-top:2px">${formatPetName(p)}</div>
            <div style="font-size:0.48rem;color:${cfg.color}">${cfg.label}</div>
        </div>`;
    };
    const sandboxBody = () => {
        const selA = window.__bSelA;
        return `<div style="font-size:0.66rem;color:rgba(255,255,255,.4);margin-bottom:8px">เลือกสัตว์เลี้ยงที่จะลองวัดพลัง</div>
        <div class="battle-select-grid">${pets.map(p=>petCard(p,'A')).join('')}</div>
        <button class="btn-battle" onclick="startSandbox()" ${selA?'':'disabled'}>
            🪨 ${selA?'ตีหุ่น!':'เลือกสัตว์ก่อน'}
        </button>`;
    };
    const rnd = window.__bRandom;
    const battleBody = () => {
        const canStart = !!window.__bSelA && (rnd || !!window.__bSelB);
        return `<div style="font-size:0.66rem;color:rgba(255,255,255,.4);margin-bottom:8px">ฝั่ง A (เรา)</div>
        <div class="battle-select-grid" style="margin-bottom:8px">${pets.map(p=>petCard(p,'A')).join('')}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="font-size:0.66rem;color:rgba(255,255,255,.4)">ฝั่ง B</div>
            <button onclick="bSetRandom(!window.__bRandom)" style="padding:4px 10px;border-radius:8px;border:1.5px solid ${rnd?'#f43f5e':'rgba(255,255,255,.1)'};
                background:${rnd?'rgba(244,63,94,.15)':'rgba(255,255,255,.04)'};color:rgba(255,255,255,.7);font-family:inherit;font-size:0.7rem;cursor:pointer">🎲 สุ่ม AI</button>
        </div>
        ${!rnd ? `<div class="battle-select-grid" style="margin-bottom:8px">${pets.map(p=>petCard(p,'B')).join('')}</div>` : ''}
        <button class="btn-battle" onclick="startBattle()" ${canStart?'':'disabled'}>
            ⚔️ ${canStart?'เริ่มสู้!':'เลือกฝั่ง A ก่อน'}
        </button>`;
    };
    document.getElementById('battle-content').innerHTML = `
    <div class="battle-arena" style="border-radius:20px">
        <div class="battle-header">
            <span class="battle-title">⚔️ Battle</span>
            <button onclick="closeBattle()" style="background:rgba(255,255,255,.1);border:none;
                color:rgba(255,255,255,.5);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:0.9rem;flex-shrink:0">✕</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px">
            <button onclick="bSetMode('sandbox')" style="flex:1;padding:7px;border-radius:10px;border:1.5px solid ${mode==='sandbox'?'#10b981':'rgba(255,255,255,.1)'};
                background:${mode==='sandbox'?'rgba(16,185,129,.15)':'rgba(255,255,255,.04)'};color:rgba(255,255,255,.75);font-family:inherit;font-size:0.75rem;font-weight:700;cursor:pointer">
                🪨 ตีหุ่น</button>
            <button onclick="bSetMode('battle')" style="flex:1;padding:7px;border-radius:10px;border:1.5px solid ${mode==='battle'?'#f43f5e':'rgba(255,255,255,.1)'};
                background:${mode==='battle'?'rgba(244,63,94,.15)':'rgba(255,255,255,.04)'};color:rgba(255,255,255,.75);font-family:inherit;font-size:0.75rem;font-weight:700;cursor:pointer">
                ⚔️ ต่อสู้ (2 ตัว)</button>
        </div>
        ${mode==='sandbox' ? sandboxBody() : battleBody()}
    </div>`;
}
window.bPick=(instId,slot)=>{
    if(slot==='A'){ window.__bSelA=window.__bSelA===instId?null:instId; if(window.__bSelA===window.__bSelB)window.__bSelB=null; }
    else          { window.__bSelB=window.__bSelB===instId?null:instId; if(window.__bSelA===window.__bSelB)window.__bSelA=null; }
    _renderBattleSetup();
};
window.bSetRandom=(val)=>{ window.__bRandom=val; if(val)window.__bSelB=null; _renderBattleSetup(); };
window.bSetMode=(mode)=>{ window.__bMode=mode; window.__bSelA=null; window.__bSelB=null; window.__bRandom=false; _renderBattleSetup(); };

// ── Sandbox ──
window.startSandbox=()=>{
    const pets=userData?.pets||[];
    const petA=pets.find(p=>p.instId===window.__bSelA);
    if(!petA){toast('เลือกสัตว์ก่อน','error');return;}
    const DUMMY_HP=1000;
    const dummyEl=['fist','scissors','paper'][Math.floor(Math.random()*3)];
    const petB={id:'dummy',emoji:'🪆',name:'หุ่นทดสอบ',rarity:'common',grade:0,instId:'dummy_target'};
    const defA=PETS.find(x=>x.id===petA.id); const defB={id:'dummy',element:dummyEl};
    const sA=calculatePetStats(petA); const sB={atk:0,hp:DUMMY_HP};
    _startCoreBattle({
        mode:'sandbox',
        sides:[
            {pet:petA, def:defA, stats:sA, hp:sA.hp, maxHp:sA.hp},
            {pet:petB, def:defB, stats:sB, hp:DUMMY_HP, maxHp:DUMMY_HP},
        ],
        firstIdx:0, maxTurns:100, tickMs:600,
        container:'battle-content', arenaId:'battle-wrap', fieldId:'battle-field',
        titleHtml:'🪨 ตีหุ่น',
        onClose:()=>closeBattle(),
        onWin:null, onLose:null,
    });
};
// ── PvE (2 ตัว) ──
window.startBattle=()=>{
    const pets=userData?.pets||[];
    const petA=pets.find(p=>p.instId===window.__bSelA);
    if(!petA){toast('เลือกฝั่ง A ก่อน','error');return;}
    let petB;
    if(window.__bRandom||pets.length===1){
        const pool=PETS.filter(x=>x.id!==petA.id);
        const rnd=pool[Math.floor(Math.random()*pool.length)];
        petB={id:rnd.id,emoji:rnd.emoji,name:rnd.name,rarity:rnd.rarity,grade:0,instId:'ai_'+rnd.id};
    } else {
        petB=pets.find(p=>p.instId===window.__bSelB);
        if(!petB){toast('เลือกฝั่ง B ก่อน','error');return;}
    }
    const defA=PETS.find(x=>x.id===petA.id); const defB=PETS.find(x=>x.id===petB.id);
    const sA=calculatePetStats(petA); const sB=calculatePetStats(petB);
    _startCoreBattle({
        mode:'pve',
        sides:[
            {pet:petA, def:defA, stats:sA, hp:sA.hp, maxHp:sA.hp},
            {pet:petB, def:defB, stats:sB, hp:sB.hp, maxHp:sB.hp},
        ],
        firstIdx:Math.random()<0.5?0:1, maxTurns:40, tickMs:780,
        container:'battle-content', arenaId:'battle-wrap', fieldId:'battle-field',
        titleHtml:'⚔️ Battle',
        onClose:()=>closeBattle(),
        onWin:null, onLose:null,
    });
};


// ════════════════════════════════════════
// ▶ CORE BATTLE ENGINE  (shared by sandbox / pve / tower / pvp)
// ════════════════════════════════════════
/*
 * _startCoreBattle(cfg) — universal battle launcher
 *
 * cfg.mode:       'sandbox' | 'pve' | 'tower' | 'pvp'
 * cfg.sides:      [{pet, def, stats, hp, maxHp}, ...]  (2 sides, each can be relay array)
 *                 For relay modes: sides[0] / sides[1] are ARRAYS of combatants
 *                 For single modes: sides[0] / sides[1] are single objects
 * cfg.firstIdx:   0 = side[0] goes first, 1 = side[1] goes first
 * cfg.maxTurns:   draw cutoff (40 pve, 999 tower/pvp)
 * cfg.tickMs:     interval between ticks
 * cfg.container:  element id for innerHTML writes
 * cfg.fieldId:    element id for damage float anchoring
 * cfg.titleHtml:  string shown in header
 * cfg.onClose():  called when ✕ pressed
 * cfg.onWin():    async, called when side[0] wins  (null = no-op)
 * cfg.onLose():   async, called when side[0] loses (null = no-op)
 * cfg.renderExtra(state): optional fn → HTML appended below log
 */

let __core = null; // single global core state

window.__coreClose = () => { if(__core?.cfg?.onClose) __core.cfg.onClose(); };
function _startCoreBattle(cfg) {
    if(__core?.timer){ clearInterval(__core.timer); clearTimeout(__core.timer); }

    // Normalise sides to arrays
    const normSide = (raw) => Array.isArray(raw) ? raw.map(s=>({...s})) : [{...raw}];
    const sA = normSide(cfg.sides[0]);
    const sB = normSide(cfg.sides[1]);

    __core = {
        cfg,
        sA, sB,        // arrays of {pet,def,stats,hp,maxHp}
        iA: 0, iB: 0,  // current combatant index
        turn: 0,
        whoseTurn: cfg.firstIdx===1 ? 1 : 0,  // 0=sideA, 1=sideB
        log: [],
        running: true,
        timer: null,
        mode: cfg.mode,
    };

    _coreRender();
    const tickFn = cfg.mode==='sandbox' ? _coreSandboxTick : _coreTick;
    // setTimeout loop แทน setInterval — ป้องกัน tick stacking
    const _loopTick = ()=>{
        if(!__core||!__core.running) return;
        tickFn();
        if(__core?.running) __core.timer = setTimeout(_loopTick, cfg.tickMs);
    };
    __core.timer = setTimeout(_loopTick, cfg.tickMs);
}

// ── Main tick ──
function _coreTick() {
    const c = __core; if(!c||!c.running) return;
    const maxT = c.cfg.maxTurns || 40;

    // get current combatants
    const attSide = c.whoseTurn===0 ? c.sA[c.iA] : c.sB[c.iB];
    const defSide = c.whoseTurn===0 ? c.sB[c.iB] : c.sA[c.iA];
    if(!attSide||!defSide){ c.running=false; _coreRender(); return; }

    c.turn++;

    const adv  = elementBeats(attSide.def?.element, defSide.def?.element);
    const miss = Math.random()<0.10;  // 10% miss chance
    const crit = !miss && Math.random()<0.15;  // 15% crit (no crit on miss)
    const dmg  = miss ? 0 : Math.max(1, Math.round(attSide.stats.atk * (adv?1.4:1.0) * (crit?1.8:1.0)));
    defSide.hp = Math.max(0, defSide.hp - dmg);

    const tag = crit ? ` <b style="color:#fbbf24">💥CRIT!</b>` : adv ? ` <span style="color:#6ee7b7">🔥×1.5</span>` : '';
    c.log.push(miss
        ? `🌀 ${attSide.pet.emoji} พลาด!`
        : `${attSide.pet.emoji}→${defSide.pet.emoji} ${crit?'<b style="color:#fbbf24">💥CRIT</b> ':adv?'<b style="color:#6ee7b7">🔥Adv</b> ':''}<b style="color:#fca5a5">-${dmg}</b>`);

    // ── Tackle + Shake + Damage float animation ──
    _coreAnimate(c.whoseTurn, dmg, adv, crit, miss);

    // ── Death check ──
    if(defSide.hp <= 0) {
        clearInterval(c.timer); c.timer=null;

        const defIsA = c.whoseTurn===1; // attacker is B → defender is A
        const defArr = defIsA ? c.sA : c.sB;
        const defKey = defIsA ? 'iA' : 'iB';
        const nextIdx = c[defKey]+1;
        const hasNext = nextIdx < defArr.length;

        _coreRender();

        // Death animation → relay
        const deadSid = defIsA ? 'a' : 'b';
        _corePlayDeath(deadSid, ()=>{
            if(!__core) return;
            if(!hasNext) {
                c.running = false;
                _coreRender();
                // defIsA=true means sideA was the one who died → sideB wins → player (sideA) LOST
                const weWon = !defIsA;
                const onEnd = weWon ? c.cfg.onWin : c.cfg.onLose;
                if(typeof onEnd==='function') onEnd();
                return;
            }
            // Relay: next combatant enters → rebuild shell เพื่ออัปเดต emoji/ชื่อ/stats
            c[defKey] = nextIdx;
            const newcomer = defIsA ? c.sA[c.iA] : c.sB[c.iB];
            c.log.push(`⬆️ ${newcomer.pet.emoji} ${formatPetName(newcomer.pet)} ลงสนาม!`);
            c.whoseTurn = defIsA ? 0 : 1;
            _coreBuildShell(c); // force rebuild ให้ emoji/ชื่อ/stats ตัวใหม่
            // Enter bounce animation on new combatant
            setTimeout(()=>{ _corePlayEnter(deadSid); }, 80);
            setTimeout(()=>{ if(__core){ const _rLoop=()=>{ if(!__core||!__core.running)return; _coreTick(); if(__core?.running)__core.timer=setTimeout(_rLoop,c.cfg.tickMs); }; __core.timer=setTimeout(_rLoop,c.cfg.tickMs); } }, 520);
        });
        return;
    }

    // Draw check
    if(c.turn >= maxT) {
        clearInterval(c.timer); c.timer=null;
        c.running=false;
        c.log.push(`🏳️ ${maxT} เทิร์น — หมดเวลา!`);
        _coreRender();
        return;
    }

    c.whoseTurn = c.whoseTurn===0 ? 1 : 0;
    _coreRender();
}

// ── Sandbox tick (one-sided, no relay) ──
function _coreSandboxTick() {
    const c = __core; if(!c||!c.running) return;
    const attSide = c.sA[0]; const defSide = c.sB[0];
    c.turn++;
    const adv  = elementBeats(attSide.def?.element, defSide.def?.element);
    const crit = Math.random()<0.20;
    const dmg  = Math.max(1, Math.round(attSide.stats.atk * (adv?1.5:1.0) * (crit?2.0:1.0)));
    defSide.hp = Math.max(0, defSide.hp - dmg);
    c.log.push(`${attSide.pet.emoji}→${defSide.pet.emoji} <b style="color:#fca5a5">-${dmg}</b>${crit?` <b style="color:#fbbf24">💥CRIT!</b>`:''}${adv?` <span style="color:#6ee7b7">🔥×1.5</span>`:''}`);
    c.totalDmg = (c.totalDmg||0)+dmg;
    _coreAnimate(0, dmg, adv, crit);
    if(defSide.hp<=0 || c.turn>=c.cfg.maxTurns) {
        c.running=false;
        c.log.push(`🏁 จบ ${c.turn} เทิร์น! ทำดาเมจรวม ${c.totalDmg||0}`);
        _coreRender();
    } else {
        _coreRender();
    }
}

// ── Animations ──
function _coreAnimate(attSideIdx, dmg, adv, crit, miss) {
    const field = document.getElementById(__core?.cfg?.fieldId || 'core-field');
    const attId = attSideIdx===0 ? 'a' : 'b';
    const defId = attSideIdx===0 ? 'b' : 'a';
    const dir   = attSideIdx===0 ? 40 : -40;

    if(miss){
        // Miss: short lurch only, no damage
        const attElM = document.getElementById('cem-'+attId);
        if(attElM){ attElM.style.transition='transform .12s'; attElM.style.transform=`translateX(${dir*0.5}px) scale(1.05)`; setTimeout(()=>{if(attElM)attElM.style.transform='';},150); }
        if(field){
            const fl=document.createElement('div'); fl.textContent='Miss!';
            fl.style.cssText=`position:absolute;${attSideIdx===0?'right:8%':'left:8%'};top:${10+Math.random()*20}%;font-size:0.9rem;font-weight:900;color:rgba(255,255,255,.35);pointer-events:none;z-index:10;font-style:italic;animation:dmgFloat .8s ease forwards;`;
            field.style.position='relative'; field.appendChild(fl); setTimeout(()=>fl.remove(),820);
        }
        return;
    }
    if(!dmg) return;

    // Attacker: tackle surge + slash VFX
    const attEl = document.getElementById('cem-'+attId);
    if(attEl){
        attEl.style.transition = 'transform .14s ease-out';
        attEl.style.transform  = `translateX(${dir}px) scale(1.2)`;
        setTimeout(()=>{ if(attEl){ attEl.style.transition='transform .18s ease'; attEl.style.transform=''; } }, 180);
    }
    // slash overlay on defender side
    if(field){
        const sl=document.createElement('div');
        sl.className='slash-vfx';
        sl.textContent = crit ? '⚡' : adv ? '🔥' : '💢';
        sl.style.cssText += `top:${20+Math.random()*30}%;${attSideIdx===0?'right:5%':'left:5%'};animation-name:${attSideIdx===0?'slashR':'slashL'};`;
        field.style.position='relative';
        field.appendChild(sl);
        setTimeout(()=>sl.remove(), 380);
    }

    // Defender: shake
    const defEl = document.getElementById('cem-'+defId);
    if(defEl){
        setTimeout(()=>{
            if(!defEl) return;
            defEl.style.animation='none'; void defEl.offsetWidth;
            defEl.style.animation='bShake .26s ease';
            setTimeout(()=>{ if(defEl) defEl.style.animation=''; }, 280);
        }, 160);
    }

    // Damage float
    if(field){
        const fl = document.createElement('div');
        fl.innerHTML = crit ? `💥${dmg}!` : adv ? `🔥${dmg}` : `-${dmg}`;
        fl.style.cssText = `position:absolute;${attSideIdx===0?'right:8%':'left:8%'};
            top:${6+Math.random()*26}%;font-size:${crit?'1.4rem':'1.05rem'};font-weight:900;
            color:${crit?'#fbbf24':adv?'#6ee7b7':'#f87171'};pointer-events:none;z-index:10;
            text-shadow:0 2px 10px rgba(0,0,0,.6);animation:dmgFloat .9s ease forwards;`;
        field.style.position='relative'; field.appendChild(fl);
        setTimeout(()=>fl.remove(), 900);
    }
}

/** เรียกเมื่อ combatant ตาย — ใส่ death animation แล้ว callback */
function _corePlayDeath(sid, onDone) {
    const el = document.getElementById('cem-'+sid);
    if(el){
        el.classList.remove('cem-attacker');
        el.style.animation='none'; void el.offsetWidth;
        el.style.animation='deathSpin .55s ease forwards';
        // skull overlay
        const wrap=el.parentElement;
        if(wrap){
            const skull=document.createElement('div');
            skull.textContent='💀';
            skull.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:2rem;pointer-events:none;z-index:5;animation:popIn .35s ease 0.1s both;';
            wrap.style.position='relative'; wrap.appendChild(skull);
            setTimeout(()=>skull.remove(), 1500);
        }
    }
    setTimeout(onDone, 620);
}

/** เรียกเมื่อ combatant ใหม่เข้าสนาม */
function _corePlayEnter(sid) {
    const el = document.getElementById('cem-'+sid);
    if(el){
        el.style.animation='none'; void el.offsetWidth;
        el.classList.add('cem-enter');
        setTimeout(()=>el.classList.remove('cem-enter'), 520);
    }
}

// ── Render ──
// แยก first-render (build shell ครั้งเดียว) กับ patch (update DOM ตรงๆ ทุก tick)
function _coreBuildShell(c) {
    const curA=c.sA[c.iA]; const curB=c.sB[c.iB];
    const cfgA=RARITY[curA.pet.rarity]; const cfgB=RARITY[curB.pet.rarity];
    const elA=ELEMENTS[curA.def?.element]; const elB=ELEMENTS[curB.def?.element];
    const mkDots=(arr,did)=>arr.length>1
        ?`<div id="${did}" style="display:flex;gap:4px;justify-content:center;margin-bottom:6px"></div>`
        :`<div id="${did}"></div>`;
    const sideShell=(combatant,cfg,elInfo,sid)=>`
        <div style="text-align:center;position:relative" id="cslot-${sid}">
            <div class="cem-attacker-indicator" id="cind-${sid}"></div>
            <div style="position:relative;display:inline-block">
                <div style="font-size:3.2rem;transition:filter .3s,opacity .3s" id="cem-${sid}">${combatant.pet.emoji}</div>
            </div>
            <div style="font-size:0.68rem;font-weight:700;margin:4px 0 2px;transition:color .3s" id="cname-${sid}">
                ${formatPetName(combatant.pet)}${elInfo?` <span style="font-size:.85rem">${elInfo.emoji}</span>`:''}
            </div>
            <div style="font-size:0.54rem;color:${cfg.color};margin-bottom:6px">${cfg.label} · ATK ${combatant.stats.atk}</div>
            <div style="height:8px;background:rgba(255,255,255,.1);border-radius:50px;overflow:hidden;margin-bottom:3px">
                <div style="height:100%;border-radius:50px;transition:width .5s ease,background .3s" id="chp-bar-${sid}"></div>
            </div>
            <div style="font-size:0.58rem;color:rgba(255,255,255,.4)" id="chp-txt-${sid}"></div>
        </div>`;
    const titleExtra=c.cfg.titleExtra?c.cfg.titleExtra(c):`Turn ${c.turn}`;
    const el=document.getElementById(c.cfg.container); if(!el) return;
    el.innerHTML=`
    <div class="battle-arena" style="border-radius:20px" id="${c.cfg.arenaId||'core-wrap'}">
        <div class="battle-header">
            <span class="battle-title">${c.cfg.titleHtml} <span style="font-size:0.7rem;opacity:.5" id="cturn-lbl">${titleExtra}</span></span>
            <button onclick="__coreClose()" style="background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.5);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:0.9rem">✕</button>
        </div>
        ${mkDots(c.sA,'cdots-a')}
        <div style="display:grid;grid-template-columns:1fr 28px 1fr;gap:6px;align-items:start;margin-bottom:10px;position:relative" id="${c.cfg.fieldId||'core-field'}">
            ${sideShell(curA,cfgA,elA,'a')}
            <div style="display:flex;align-items:center;justify-content:center;padding-top:30px;font-size:0.85rem;color:rgba(255,255,255,.15);font-weight:800">VS</div>
            ${sideShell(curB,cfgB,elB,'b')}
        </div>
        ${mkDots(c.sB,'cdots-b')}
        <div style="background:rgba(0,0,0,.25);border-radius:11px;padding:9px 12px;
                    font-size:0.74rem;color:rgba(255,255,255,.7);line-height:1.8;
                    border:1px solid rgba(255,255,255,.06);
                    height:108px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end"
             id="clog-box"></div>
        <div style="min-height:56px;margin-top:8px" id="cstatus-box"></div>
    </div>`;
    _corePatch(c);
}

function _corePatch(c) {
    const curA=c.sA[c.iA]; const curB=c.sB[c.iB]; if(!curA||!curB) return;
    const isOver=!c.running;
    const isAttA=!isOver&&c.whoseTurn===0;
    const hpCol=p=>p>50?'#10b981':p>20?'#f59e0b':'#ef4444';

    // ── side patches ──
    ['a','b'].forEach(sid=>{
        const com=sid==='a'?curA:curB;
        const cfg=RARITY[com.pet.rarity];
        const pct=Math.max(0,com.hp/com.maxHp*100);
        const isDead=com.hp<=0;
        const isAtt=!isOver&&((sid==='a'&&isAttA)||(sid==='b'&&!isAttA));
        const ind=document.getElementById('cind-'+sid);
        if(ind) ind.textContent=isAtt&&!isDead?'⚔️ โจมตี!':'';
        const em=document.getElementById('cem-'+sid);
        if(em){
            // อัปเดต emoji เมื่อ relay เปลี่ยนตัว
            if(em.textContent!==com.pet.emoji) em.textContent=com.pet.emoji;
            em.style.filter=`drop-shadow(0 0 ${isDead?'0px #0000':isAtt?'16px '+cfg.glow:'8px '+cfg.glow+'88'})`;
            em.style.opacity=isDead?'0.15':'1';
            em.style.animation=isAtt&&!isDead?'attackGlow .7s ease infinite':'';
        }
        // อัปเดตชื่อและ HP max เมื่อตัวเปลี่ยน (relay)
        const nm=document.getElementById('cname-'+sid);
        if(nm){
            const elInfo=ELEMENTS[com.def?.element||PETS.find(x=>x.id===com.pet.id)?.element];
            const newName=formatPetName(com.pet)+(elInfo?` <span style="font-size:.85rem">${elInfo.emoji}</span>`:'');
            if(nm.innerHTML!==newName) nm.innerHTML=newName;
        }
        if(nm) nm.style.color=isDead?'rgba(255,255,255,.3)':isAtt?'#fbbf24':'rgba(255,255,255,.85)';
        const bar=document.getElementById('chp-bar-'+sid);
        if(bar){bar.style.width=pct+'%';bar.style.background=hpCol(pct);}
        const txt=document.getElementById('chp-txt-'+sid);
        if(txt) txt.textContent=Math.max(0,com.hp)+' / '+com.maxHp;
    });

    // ── relay dots ──
    const mkDotsInner=(arr,cur)=>arr.length>1
        ?arr.map((s,i)=>`<div style="width:22px;height:22px;border-radius:50%;border:2px solid ${i===cur?'#a78bfa':'rgba(255,255,255,.15)'};font-size:0.8rem;display:flex;align-items:center;justify-content:center;opacity:${i<cur?0.2:1}">${s.pet.emoji}</div>`).join('')
        :'';
    const da=document.getElementById('cdots-a'); if(da) da.innerHTML=mkDotsInner(c.sA,c.iA);
    const db=document.getElementById('cdots-b'); if(db) db.innerHTML=mkDotsInner(c.sB,c.iB);

    // ── turn label ──
    const tl=document.getElementById('cturn-lbl');
    if(tl) tl.textContent=c.cfg.titleExtra?c.cfg.titleExtra(c):`Turn ${c.turn}`;

    // ── log — fixed height 5 lines, ล่าสุดอยู่ล่าง ──
    const logBox=document.getElementById('clog-box');
    if(logBox){
        const lines=c.log.slice(-5);
        while(lines.length<5) lines.unshift('');
        logBox.innerHTML=lines.map((l,i)=>`<div style="opacity:${l?Math.min(1,0.25+i*0.19):0};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1.4em">${l||' '}</div>`).join('');
    }

    // ── status / result ──
    const sb=document.getElementById('cstatus-box');
    if(!sb) return;
    if(isOver){
        const sideAWon=c.sB.every(s=>s.hp<=0)||(c.iB>=c.sB.length);
        if(c.cfg.renderResult){ sb.innerHTML=c.cfg.renderResult(c,sideAWon); }
        else { sb.innerHTML=`<div style="text-align:center;padding:4px 0">
            <div style="font-size:2.5rem">${sideAWon?'🎉':'💀'}</div>
            <div style="font-size:0.9rem;font-weight:800;color:#fff;margin:6px 0">${sideAWon?'ชนะแล้ว!':'แพ้แล้ว...'}</div>
            <button onclick="__coreClose()" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);padding:9px 22px;border-radius:12px;font-family:inherit;cursor:pointer">ปิด</button>
        </div>`; }
    } else {
        sb.innerHTML=`<div style="text-align:center;font-size:0.72rem;color:rgba(255,255,255,.35);padding:6px 0">⚡ ${c.whoseTurn===0?curA.pet.emoji:curB.pet.emoji} กำลังโจมตี...</div>`;
    }
}

function _coreRender() {
    const c=__core; if(!c) return;
    const el=document.getElementById(c.cfg.container); if(!el) return;
    // build shell ครั้งเดียวตอนเริ่ม จากนั้น patch เท่านั้น
    if(!el.querySelector('#clog-box')){
        _coreBuildShell(c);
    } else {
        _corePatch(c);
    }
}

// ════════════════════════════════════════
// ▶ TOWER SYSTEM
// ════════════════════════════════════════
function _towerBossEl(floor){ const r=floor%3; return r===1?'fist':r===2?'scissors':'paper'; }
function _towerBossStats(floor){
    const atk = 3 + floor * 0.45;
    const hp  = 25 + floor * 3.5;
    if(floor % 10 === 0){
        return { atk: Math.round(atk * 1.2), hp: Math.round(hp * 2.5) };
    }
    return { atk: Math.round(atk), hp: Math.round(hp) };
}

let __tower=null;
let __twSelTeam=[];

window.openTower=()=>{
    if(!currentUser){toast('กรุณา Login ก่อน','error');return;}
    if(document.getElementById('tower-modal')) document.getElementById('tower-modal').classList.add('active');
    __twSelTeam=[];
    _renderTowerLobby();
};
window.closeTower=()=>{
    if(__tower?.timer){clearInterval(__tower.timer);clearTimeout(__tower.timer);}
    if(__core?.cfg?.mode==='tower'){clearInterval(__core.timer);clearTimeout(__core.timer);__core=null;}
    __tower=null;
    document.getElementById('tower-modal').classList.remove('active');
};

function _renderTowerLobby(){
    const floor=userData?.towerFloor||1;
    const bStats=_towerBossStats(floor);
    const bEl=_towerBossEl(floor);
    const pets=(userData?.pets||[]).filter(p=>!p.isExpedition);
    const today=new Date().toDateString();
    const canReset=userData?.towerLastReset!==today;
    const isFirstClear=floor>(userData?.towerBest||0);
    const reward=isFirstClear?(500+(floor*10)):(50+(floor*10));

    const slotHtml=__twSelTeam.map((id,i)=>{
        const p=(userData?.pets||[]).find(x=>String(x.instId||x.id)===id);
        return`<div class="tower-slot filled"><span class="slot-num">${i+1}</span>${p?p.emoji:'?'}
            <button onclick="twRemoveSlot(${i})" style="position:absolute;top:-5px;right:-5px;background:#ef4444;border:none;color:#fff;width:16px;height:16px;border-radius:50%;font-size:0.55rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">✕</button>
        </div>`;
    }).join('')+(__twSelTeam.length<3?`<div class="tower-slot empty" style="opacity:.4">+</div>`:'');

        // Sort pets — same logic as home
    if(!window.setTwSort) window.setTwSort=(m)=>{window.__twSort=m;_renderTowerLobby();};
    const __twSort = window.__twSort||'rarity';
    const TW_RARITY_ORDER = {legendary:0,epic:1,rare:2,common:3};
    const sortedTwPets = [...pets].sort((a,b)=>{
        if(__twSort==='rarity'){
            const ra=TW_RARITY_ORDER[a.rarity]??9, rb=TW_RARITY_ORDER[b.rarity]??9;
            if(ra!==rb) return ra-rb;
            return (b.grade||0)-(a.grade||0);
        }
        if(__twSort==='grade') return((b.grade||0)*16+(b.refine||0))-((a.grade||0)*16+(a.refine||0));
        if(__twSort==='daily') return petDailyCoins(b)-petDailyCoins(a);
        return 0;
    });
    const TW_SORT_LABELS={rarity:'⭐',grade:'🧬',daily:'🪙'};
    const twSortBtns=['rarity','grade','daily'].map(m=>{
        const active=__twSort===m;
        return `<button onclick="setTwSort('${m}')" style="background:${active?'rgba(168,85,247,.35)':'rgba(255,255,255,.05)'};border:1px solid ${active?'rgba(168,85,247,.6)':'rgba(255,255,255,.1)'};color:${active?'#d8b4fe':'rgba(255,255,255,.45)'};border-radius:6px;padding:2px 8px;font-size:0.6rem;font-weight:700;cursor:pointer;font-family:inherit">${TW_SORT_LABELS[m]}</button>`;
    }).join('');

    const petCards=sortedTwPets.map(p=>{
        const sel=__twSelTeam.includes(String(p.instId||p.id));
        const cfg=RARITY[p.rarity];
        const stats=calculatePetStats(p);
        const petDef=PETS.find(x=>x.id===p.id);
        const petEl=petDef?.element;
        const petElEmoji=ELEMENTS[petEl]?.emoji||'';
        const petElName=_EL_NAME[petEl]||'';
        const beatsEl=ELEMENTS[petEl]?.beats;
        const beatsEmoji=ELEMENTS[beatsEl]?.emoji||'';
        return`<div class="tower-pick${sel?' sel':''}" onclick="twPickPet('${String(p.instId||p.id)}')">
            <div style="font-size:1.5rem">${p.emoji}</div>
            <div style="font-size:0.5rem;color:rgba(255,255,255,.75);font-weight:700;line-height:1.3">${formatPetName(p)}</div>
            ${petElEmoji?`<div style="font-size:0.75rem;font-weight:800;line-height:1;margin-top:2px" title="${petElName}">${petElEmoji}</div>`:''}
            <div style="font-size:0.42rem;color:rgba(255,255,255,.35);margin-top:1px">⚔️${stats.atk} ❤️${stats.hp}</div>
        </div>`;
    }).join('');

    const canFight=__twSelTeam.length>0;
    document.getElementById('tower-content').innerHTML=`
    <div class="tower-arena" id="tower-wrap">
        <div class="tower-header">
            <div class="tower-title">🗼 หอคอย ชั้น ${floor}</div>
            <button onclick="closeTower()" style="background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.5);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:0.9rem">✕</button>
        </div>
        <button onclick="toggleLb('twlb')" style="width:100%;margin-bottom:10px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:7px;color:rgba(251,191,36,.7);font-family:inherit;font-size:0.72rem;font-weight:700;cursor:pointer">
            🏆 กระดานหอคอย
        </button>
        <div id="twlb" style="display:none;margin-bottom:10px"></div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
            <div style="flex:1;background:rgba(239,68,68,.12);border-radius:10px;padding:8px;text-align:center">
                <div style="font-size:0.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Boss HP</div>
                <div style="font-size:1rem;font-weight:800;color:#f87171">❤️ ${bStats.hp}</div>
            </div>
            <div style="flex:1;background:rgba(239,68,68,.12);border-radius:10px;padding:8px;text-align:center">
                <div style="font-size:0.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">Boss ATK</div>
                <div style="font-size:1rem;font-weight:800;color:#f87171">⚔️ ${bStats.atk}</div>
            </div>
            <div style="flex:1;background:rgba(251,191,36,.08);border-radius:10px;padding:8px;text-align:center">
                <div style="font-size:0.55rem;color:rgba(255,255,255,.4);text-transform:uppercase">รางวัล</div>
                <div style="font-size:1rem;font-weight:800;color:#fbbf24">🪙 ${reward}</div>
            </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:10px 12px;background:rgba(239,68,68,.1);border:1.5px solid rgba(239,68,68,.25);border-radius:12px">
            <div style="font-size:1.8rem;line-height:1;filter:drop-shadow(0 0 8px rgba(239,68,68,.5))">${ELEMENTS[bEl]?.emoji||'?'}</div>
            <div>
                <div style="font-size:0.5rem;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:1px">ประเภทบอส</div>
                <div style="font-size:0.95rem;font-weight:900;color:#fff;letter-spacing:.5px">${_EL_NAME[bEl]}</div>
                <div style="font-size:0.6rem;color:rgba(255,255,255,.4);margin-top:1px">ชนะ <b style="color:#4ade80">${_EL_NAME[ELEMENTS[bEl]?.beats]||'?'}</b> · แพ้ <b style="color:#f87171">${_EL_NAME[Object.keys(ELEMENTS).find(k=>ELEMENTS[k].beats===bEl)]||'?'}</b></div>
            </div>
        </div>
        <div style="font-size:0.65rem;color:rgba(255,255,255,.4);font-weight:700;letter-spacing:.5px;margin-bottom:7px">🧩 จัดทีม (1–3 ตัว) — ลำดับ = ลำดับผลัด</div>
        <div class="tower-slot-row">${slotHtml}</div>

        ${(()=>{
            const bg=canFight?'linear-gradient(135deg,#7c3aed,#6d28d9)':'rgba(255,255,255,.06)';
            const bd=canFight?'rgba(167,139,250,.5)':'rgba(255,255,255,.1)';
            const sh=canFight?'box-shadow:0 4px 20px rgba(124,58,237,.4);':'';
            const inner=canFight
                ?'<span style="font-size:1.4rem">⚔️</span><div style="text-align:left"><div style="color:#fff;font-size:0.95rem;font-weight:800">เริ่มสู้! ชั้น '+floor+'</div><div style="color:rgba(196,181,253,.7);font-size:0.65rem;font-weight:600">'+__twSelTeam.length+' ตัว พร้อมรบ</div></div>'
                :'<span style="opacity:.4">🐾</span><span style="color:rgba(255,255,255,.3);font-size:0.82rem;font-weight:600">เลือกสัตว์เลี้ยงด้านล่าง</span>';
            return '<button onclick="startTowerBattle()" '+(canFight?'':'disabled')+' style="width:100%;margin-bottom:12px;padding:0;border:none;cursor:'+(canFight?'pointer':'not-allowed')+';background:transparent;font-family:inherit"><div style="background:'+bg+';border:2px solid '+bd+';border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;'+sh+'">'+inner+'</div></button>';
        })()}

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:0.6rem;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:.5px">เลือกสัตว์</div>
            <div style="display:flex;gap:4px">${twSortBtns}</div>
        </div>
        <div class="tower-team-grid">${petCards}</div>

        <div style="display:flex;gap:6px;margin-top:8px">
            ${floor>1?`<button onclick="${canReset?'backTower()':'void 0'}"
                style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
                color:${canReset?'rgba(255,255,255,.55)':'rgba(255,255,255,.2)'};padding:9px 4px;border-radius:10px;
                font-family:inherit;font-size:0.72rem;cursor:${canReset?'pointer':'not-allowed'}">
                ⬇️ ย้อน 50 ชั้น${!canReset?' ✗':''}</button>`:''}
            ${floor>1?`<button onclick="${canReset?'resetTower()':'void 0'}"
                style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
                color:${canReset?'rgba(255,255,255,.55)':'rgba(255,255,255,.2)'};padding:9px 4px;border-radius:10px;
                font-family:inherit;font-size:0.72rem;cursor:${canReset?'pointer':'not-allowed'}">
                🔄 เริ่มชั้น 1${!canReset?' ✗':''}</button>`:''}
        </div>
        ${!canReset?`<div style="text-align:center;font-size:0.58rem;color:rgba(255,255,255,.2);margin-top:3px">ใช้สิทธิ์วันนี้ไปแล้ว — รีเซ็ตพรุ่งนี้</div>`:''}

    </div>`;
}
window.twPickPet=(instId)=>{
    const id=String(instId);
    const idx=__twSelTeam.indexOf(id);
    if(idx>=0){ __twSelTeam.splice(idx,1); }
    else if(__twSelTeam.length<3){ __twSelTeam.push(id); }
    else{ toast('เลือกได้สูงสุด 3 ตัว','info'); return; }
    _renderTowerLobby();
};
window.twRemoveSlot=(i)=>{ if(i>=0&&i<__twSelTeam.length) __twSelTeam.splice(i,1); _renderTowerLobby(); };
window.backTower=async()=>{
    const today=new Date().toDateString();
    if(!currentUser||!userData) return;
    if(userData?.towerLastReset===today){toast('ใช้สิทธิ์วันนี้ไปแล้ว (ร่วมกับปุ่มเริ่มใหม่)','info');return;}
    const floor=userData?.towerFloor||1;
    const newFloor=Math.max(1,floor-50);
    if(!await _confirm(`⬇️ ย้อนกลับ 50 ชั้น\nจากชั้น ${floor} → ชั้น ${newFloor}\n(ใช้ได้วันละ 1 ครั้ง ร่วมกับปุ่มเริ่มใหม่)\n\nยืนยัน?`)) return;
    window.__blockSnapshot=true;
    userData={...userData,towerFloor:newFloor,towerLastReset:today};
    await updateDoc(doc(db,'users',currentUser.uid),{towerFloor:newFloor,towerLastReset:today});
    setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);
    __twSelTeam=[]; _renderTowerLobby(); toast(`⬇️ ย้อนกลับชั้น ${newFloor} แล้ว!`,'success');
};
window.resetTower=async()=>{
    const today=new Date().toDateString();
    if(!await _confirm('🔄 เริ่มต้นใหม่จากชั้น 1\nรางวัลชั้นที่เคยผ่านแล้วจะเป็น ×10\n(ใช้ได้วันละ 1 ครั้ง)\n\nยืนยัน?')) return;
    window.__blockSnapshot=true;
    userData={...userData,towerFloor:1,towerLastReset:today};
    await updateDoc(doc(db,'users',currentUser.uid),{towerFloor:1,towerLastReset:today});
    setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);
    __twSelTeam=[]; _renderTowerLobby(); toast('รีเซ็ตชั้น 1 แล้ว!','success');
};

window.startTowerBattle=()=>{
    if(!__twSelTeam.length){toast('เลือกสัตว์ก่อน','error');return;}
    const pets=userData?.pets||[];
    const floor=userData?.towerFloor||1;
    const selectedTeam=__twSelTeam.map(id=>pets.find(p=>String(p.instId||p.id)===id)).filter(Boolean);
    if(!selectedTeam.length){toast('ไม่พบข้อมูลสัตว์','error');return;}
    const bStats=_towerBossStats(floor);
    const bEl=_towerBossEl(floor);

    // Build sides: sideA = player relay array, sideB = boss (single)
    const sideA = selectedTeam.map(p=>({
        pet:p, def:PETS.find(x=>x.id===p.id)||{element:'fist'},
        stats:calculatePetStats(p), hp:calculatePetStats(p).hp, maxHp:calculatePetStats(p).hp,
    }));
    const isBossFloor=(floor%10===0);
    const bossPet={id:'boss',emoji:isBossFloor?'🦠':'👾',name:isBossFloor?`ไวรัสกลายพันธุ์ ชั้น ${floor}`:`ไวรัสทั่วไป ชั้น ${floor}`,rarity:isBossFloor?'epic':'rare',grade:0,instId:'boss'};
    const sideB=[{pet:bossPet,def:{id:'boss',element:bEl},stats:{atk:bStats.atk,hp:bStats.hp},hp:bStats.hp,maxHp:bStats.hp}];

    if(__core?.timer){clearInterval(__core.timer);clearTimeout(__core.timer);}

    const towerBestAtStart=userData?.towerBest||0;

    _startCoreBattle({
        mode:'tower',
        sides:[sideA, sideB],
        firstIdx:0,       // player always goes first in tower
        maxTurns:999,
        tickMs:900,
        container:'tower-content',
        arenaId:'tower-wrap',
        fieldId:'tower-field',
        titleHtml:`👾 หอคอย`,
        titleExtra: (c)=>`ชั้น ${floor} · เทิร์น ${c.turn}`,
        onClose: ()=>closeTower(),
        renderResult:(c, weWon)=>{
            const reward=(floor<=towerBestAtStart)?(50+(floor*10)):(500+(floor*10));
            const _title = weWon?'✅ ผ่านชั้น '+floor+' สำเร็จ!':'❌ พ่ายแพ้ที่ชั้น '+floor;
            const _sub   = weWon
                ?'<div style="font-size:0.82rem;color:#fbbf24;margin-bottom:12px">+'+reward+'🪙</div>'
                :'<div style="font-size:0.76rem;color:rgba(255,255,255,.4);margin-bottom:12px">อยู่ชั้น '+floor+' ต่อ</div>';
            const _nxt   = weWon?'openTower()':'startTowerBattle()';
            const _lbl   = weWon?'⬆ ชั้นต่อไป':'🔄 ลองใหม่';
            return '<div style="text-align:center;padding:6px 0 2px">'
                +'<div style="font-size:3rem;animation:bBounce .5s ease">'+(weWon?'🎉':'💀')+'</div>'
                +'<div style="font-size:1.05rem;font-weight:800;color:#fff;margin:6px 0">'+_title+'</div>'
                +_sub
                +'<div style="display:flex;gap:8px;justify-content:center">'
                +'<button class="btn-tower" style="width:auto;padding:10px 20px" onclick="'+_nxt+'">'+_lbl+'</button>'
                +'<button style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.65);padding:10px 16px;border-radius:12px;font-family:inherit;cursor:pointer" onclick="closeTower()">ปิด</button>'
                +'</div></div>';
        },
        onWin: ()=>_towerOnWin(floor, towerBestAtStart),
        onLose: null,
    });
};

async function _towerOnWin(floor, bestAtStart){
    const isFirst=floor>bestAtStart;
    const reward=isFirst?(500+(floor*10)):(50+(floor*10));
    const newFloor=floor+1;
    const newBest=Math.max(bestAtStart,floor);
    const newCoins=(userData?.coins||0)+reward;
    window.__blockSnapshot=true;
    userData={...userData,towerFloor:newFloor,towerBest:newBest,coins:newCoins};
    renderAll();
    try{
        await updateDoc(doc(db,'users',currentUser.uid),{towerFloor:newFloor,towerBest:newBest,coins:increment(reward)});
        const _bossTag=floor%100===0?'⭐ ร้อยชั้น!':floor%10===0?'🦠 Boss ✅':'';
        if(isFirst&&floor%10===0&&typeof postNews==='function') await postNews('🗼',`${userData.nickname} ผ่านหอคอยชั้น ${floor} ${_bossTag}! (+${reward}🪙)`).catch(()=>{});
        if(isFirst&&floor%10===0&&typeof confetti==='function') confetti({particleCount:floor%100===0?120:60,spread:65,origin:{y:0.5},scalar:0.85});
        loadFbUsers();
    }catch(e){ log.error('tower-save',e); }
    finally{setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);}
}

// ════════════════════════════════════════
// ▶ PVP SYSTEM
// ════════════════════════════════════════
let __pvp=null;
window.closePvp=()=>{
    if(__pvp?.timer){clearInterval(__pvp.timer);clearTimeout(__pvp.timer);}
    if(__core?.cfg?.mode==='pvp'){clearInterval(__core.timer);clearTimeout(__core.timer);__core=null;}
    __pvp=null;
    document.getElementById('pvp-modal').classList.remove('active');
};

window.startPvpChallenge=async(targetStudentId)=>{
    if(!currentUser){toast('กรุณา Login','error');return;}
    const myTeam=getActivePetsArray(userData);
    if(!myTeam.length){toast('ตั้งทีมสัตว์เลี้ยงก่อน!','error');return;}
    const ts=window.__students?.find(x=>x.id===targetStudentId);
    const tLive=window.__fbUsers?.[targetStudentId];
    if(!tLive){toast('ยังโหลดข้อมูลไม่ครบ','error');return;}
    const enemyTeam=getActivePetsArray(tLive);
    if(!enemyTeam.length){toast(`${ts?.nickname||targetStudentId} ยังไม่มีทีมสัตว์เลี้ยง`,'info');return;}
    if(!await _confirm(`⚔️ ท้าทาย ${ts?.nickname||targetStudentId}\n\nทีมเรา: ${myTeam.map(p=>p.emoji).join(' ')}\nทีมเขา: ${enemyTeam.map(p=>p.emoji).join(' ')}\n\nยืนยันเริ่มต่อสู้?`)) return;
    closePM();
    _initPvpBattle(myTeam, enemyTeam, ts?.nickname||targetStudentId, targetStudentId);
    document.getElementById('pvp-modal').classList.add('active');
};

function _initPvpBattle(myTeam, enemyTeam, enemyName, enemyStudentId){
    const buildSide=(team)=>team.map(p=>({
        pet:p, def:PETS.find(x=>x.id===p.id)||{element:'fist'},
        stats:calculatePetStats(p), hp:calculatePetStats(p).hp, maxHp:calculatePetStats(p).hp,
    }));
    const myName=userData?.nickname||'เรา';
    const firstIsMe=Math.random()<0.5;

    if(__core?.timer){clearInterval(__core.timer);clearTimeout(__core.timer);}

    _startCoreBattle({
        mode:'pvp',
        sides:[buildSide(myTeam), buildSide(enemyTeam)],
        firstIdx:firstIsMe?0:1,
        maxTurns:999,
        tickMs:900,
        container:'pvp-content',
        arenaId:'pvp-wrap',
        fieldId:'pvp-field',
        titleHtml:`⚔️ ${myName} vs ${enemyName}`,
        titleExtra:(c)=>`เทิร์น ${c.turn}`,
        onClose:()=>closePvp(),
        renderResult:(c, weWon)=>`
            <div style="text-align:center;padding:6px 0 4px">
                <div style="font-size:3rem">${weWon?'🎉':'💀'}</div>
                <div style="font-size:1.05rem;font-weight:800;color:#fff;margin:8px 0 4px">
                    ${weWon?'🏆 ชนะ!':'💔 แพ้...'}</div>
                <div style="font-size:0.78rem;color:rgba(255,255,255,.45);margin-bottom:14px">
                    ${weWon?'+1 ชัยชนะ PvP':`${enemyName} ได้ +1 ชัยชนะ`}</div>
                <button onclick="closePvp()" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);
                    color:rgba(255,255,255,.7);padding:10px 24px;border-radius:12px;font-family:inherit;cursor:pointer">ปิด</button>
            </div>`,
        onWin:  ()=>_pvpHandleResult(true,  myName, enemyName, enemyStudentId),
        onLose: ()=>_pvpHandleResult(false, myName, enemyName, enemyStudentId),
    });
}

async function _pvpHandleResult(weWon, myName, enemyName, enemyStudentId){
    const newsMsg=weWon
        ?`${myName} ได้ท้าทาย ${enemyName} และได้รับชัยชนะ! 🏆`
        :`${myName} ได้ท้าทาย ${enemyName} แต่พ่ายแพ้กลับมา... 💀`;

    const today=new Date().toDateString();
    const pvpLog=userData?.pvpWinsToday||{};

    if(weWon){
        // ตรวจว่าวันนี้เคยชนะคนนี้ไปแล้วหรือยัง
        const alreadyScored = pvpLog[enemyStudentId]===today;
        if(alreadyScored){
            toast('⚔️ ชนะ! (ไม่ได้แต้มเพิ่ม — ชนะคนนี้ไปแล้ววันนี้)','info');
        } else {
            const newVic=(userData?.pvpVictories||0)+1;
            const newLog={...pvpLog,[enemyStudentId]:today};
            window.__blockSnapshot=true;
            userData={...userData,pvpVictories:newVic,pvpWinsToday:newLog};
            try{ await updateDoc(doc(db,'users',currentUser.uid),{pvpVictories:newVic,pvpWinsToday:newLog}); }
            catch(e){} finally{setTimeout(()=>{window.__blockSnapshot=false;},SNAPSHOT_DELAY);}
            toast('+1 ชัยชนะ PvP! 🏆','success');
        }
    }
    if(typeof postNews==='function') await postNews(weWon?'🏆':'💀',newsMsg).catch(()=>{});
}


// ════════════════════════════════════════
// ▶ CC EXAM EASTER EGG (Step-by-step popup)
// ════════════════════════════════════════
window.openCCExam = () => {
    // ── Easter Egg: CC ย้อนหลัง (5-step joke wizard) ──
    const steps = [
        { q: "กรุณาเลือกปี พ.ศ. ของข้อสอบ CC ย้อนหลังที่ต้องการครับ",
          choices: ["2568 (ปีล่าสุด)", "2567", "2566", "2565"] },
        { q: "ต้องการคัดกรองเฉพาะข้อสอบในหมวดวิชาใดครับ?",
          choices: ["เภสัชบำบัด (Pharmacotherapy)","เทคโนโลยีเภสัชกรรม (Pharmaceutics)","กฎหมายและจรรยาบรรณวิชาชีพ","เภสัชเวทและสมุนไพร (Pharmacognosy)"] },
        { q: "ระบบกำลังดึงข้อมูล... ต้องการให้แสดงผลข้อสอบในรูปแบบใด?",
          choices: ["แนวตั้ง (สำหรับปรินต์ A4)","แนวนอน (สำหรับอ่านบน iPad)","แนวทแยง (สำหรับคนชอบความท้าทายในการเอียงคออ่าน)","ฟอนต์ Angsana New ขนาด 12 (ทดสอบสายตาสั้นก่อนสอบจริง)"] },
        { q: "กรุณาระบุรายละเอียดของชุดข้อสอบที่ต้องการดาวน์โหลด",
          choices: ["เฉพาะโจทย์ข้อสอบเพียวๆ (วัดใจหน้าห้องสอบ)","โจทย์ข้อสอบ + เฉลย ก. ข. ค. ง.","โจทย์ข้อสอบ + เฉลย + คำอธิบายที่อ่านแล้วก็ยังงงเหมือนเดิม","เอาแต่เฉลย ไม่เอาโจทย์ (เน้นท่องจำแบบนกแก้วนกขุนทอง)"] },
        { q: "ขั้นตอนสุดท้าย! เพื่อประสบการณ์การอ่านที่ดีที่สุด ต้องการให้ไฟล์ข้อสอบเป็นโทนสีแบบไหนครับ?",
          choices: ["พื้นขาว ตัวอักษรดำ (คลาสสิก สไตล์กระดาษ A4)","พื้นดำ ตัวอักษรขาว (Dark Mode สำหรับคนชอบอ่านโต้รุ่ง)","พื้นสีเหลืองอ่อน ถนอมสายตา (สไตล์แอป GoodNotes)","พื้นสีเขียวเหนี่ยวทรัพย์ (สายมูเตลู เน้นพลังจิตในการเดาชอยส์)"] }
    ];

    // ใช้ window global แทน element property — ทำงานได้เสมอใน onclick innerHTML
    window.__ccStep = 0;
    window.__ccSteps = steps;
    window.__ccNext = () => {
        window.__ccStep++;
        if(window.__ccStep >= window.__ccSteps.length){
            const m = document.getElementById('cc-modal');
            if(m) m.remove();
            _showCCFinal();
        } else {
            _renderCCStep(window.__ccStep);
        }
    };
    window.__ccClose = () => {
        const m = document.getElementById('cc-modal');
        if(m) m.remove();
        window.__ccStep = null;
    };

    _renderCCStep(0);
};

function _renderCCStep(i) {
    const steps = window.__ccSteps || [];
    const s = steps[i];
    if(!s) return;

    let modal = document.getElementById('cc-modal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'cc-modal';
        document.body.appendChild(modal);
    }
    // สำคัญ: pointer-events บน overlay = none เพื่อให้คลิกผ่านไม่ได้
    // แต่ inner card = auto
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:all;';

    const pct = Math.round(((i+1)/steps.length)*100);
    const choiceHTML = s.choices.map((c,ci) => `
        <button onclick="window.__ccNext()" style="background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 14px;text-align:left;color:rgba(255,255,255,.85);font-family:inherit;font-size:0.8rem;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:10px;width:100%">
            <span style="background:rgba(255,255,255,.1);border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;flex-shrink:0">${ci+1}</span>
            ${c}
        </button>`).join('');

    modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="background:linear-gradient(160deg,#0f172a,#1e293b);border-radius:20px;padding:22px 18px 18px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.1);position:relative">
        <button onclick="window.__ccClose()" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.5);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center">✕</button>
        <div style="font-size:0.58rem;color:rgba(255,255,255,.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">ขั้นตอนที่ ${i+1} / ${steps.length}</div>
        <div style="width:100%;height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:14px">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:2px;transition:width .3s"></div>
        </div>
        <div style="font-size:0.9rem;font-weight:700;color:#fff;margin-bottom:16px;line-height:1.5">${s.q}</div>
        <div style="display:flex;flex-direction:column;gap:8px">${choiceHTML}</div>
    </div>`;
}

function _showCCFinal() {
    // ลบ overlay เก่าก่อน (ถ้ามี)
    document.getElementById('cc-final-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'cc-final-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9001;display:flex;align-items:center;justify-content:center;padding:24px;';
    overlay.innerHTML = `
    <div style="background:linear-gradient(160deg,#1e1b4b,#0f172a);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:28px 24px;max-width:360px;width:100%;text-align:center">
        <div style="font-size:1.1rem;font-weight:800;color:#fff;margin-bottom:12px">หมดครับ...</div>
        <div style="font-size:0.88rem;color:rgba(255,255,255,.5);line-height:1.7;margin-bottom:22px">จริงๆ คือยังไม่ได้ทำครับ<br>แยกย้ายกันไปฝึกงานก่อนนะ</div>
        <button onclick="document.getElementById('cc-final-overlay')?.remove()" style="background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border:none;border-radius:10px;padding:11px 28px;font-family:inherit;font-size:0.88rem;font-weight:700;cursor:pointer">โอเค...</button>
    </div>`;
    document.body.appendChild(overlay);
}

// ════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════
window.__tab='home';
loadTicker();
// Hatch timer refresh — only when eggs actively hatching, never during game
// Hatch timer — setTimeout loop, patch DOM เฉพาะ countdown elements
// ไม่ re-render ทั้งหน้า ประหยัด CPU
function _tickHatch(){
    if(document.hidden){ setTimeout(_tickHatch, 5000); return; }
    const eggs = userData?.eggs||[];
    const now  = Date.now();
    let   hasActive = false;
    eggs.forEach(egg=>{
        if(!egg.startedAt) return;
        const endMs = egg.startedAt + egg.hatchMins*60000;
        const msLeft = endMs - now;
        const el = document.getElementById(`hatch-cd-${egg.eggId}`);
        if(el){
            if(msLeft <= 0){
                el.textContent = '✅ พร้อมฟัก!';
                el.style.color  = '#4ade80';
            } else {
                const m = Math.floor(msLeft/60000);
                const s = Math.floor((msLeft%60000)/1000);
                el.textContent = m>0 ? `${m}น ${s}ว` : `${s}ว`;
                hasActive = true;
            }
        } else if(msLeft > 0){
            hasActive = true; // ไข่กำลังฟักแต่ยังไม่มี element
        }
    });
    // ถ้ายังมีไข่กำลังฟัก loop ต่อ ไม่งั้นหยุด (จะเริ่มใหม่เมื่อมีไข่ใหม่)
    if(hasActive) setTimeout(_tickHatch, 1000);
    else window.__hatchTicking = false;
}
function _startHatchTick(){
    if(window.__hatchTicking) return;
    const hasActive = (userData?.eggs||[]).some(e=>e.startedAt && Date.now()<e.startedAt+e.hatchMins*60000);
    if(!hasActive) return;
    window.__hatchTicking = true;
    _tickHatch();
}
