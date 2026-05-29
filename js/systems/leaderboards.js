// ════════════════════
//  LEADERBOARDS — shared score boards (quiz / drug / tower / colortiles)
//  extracted from app.js; reads window.__fbUsers/__guestUsers/__students/userData/sanitize
// ════════════════════

function _lbUsers(){
    return[...Object.values(window.__fbUsers||{}),...(window.__guestUsers||[])];
}
function _renderLbRows(board,scoreKey,accentColor){
    const myId=window.userData?.studentId;
    if(!board.length)return`<div style="padding:10px;text-align:center;color:rgba(255,255,255,.3);font-size:0.76rem">ยังไม่มีข้อมูล</div>`;
    const icons=['🥇','🥈','🥉'];
    return board.map((u,i)=>{
        const isMe=myId&&u.studentId===myId;
        const _lb_slot0=(u.activePets||[])[0]||u.activePet||null;
        const pet=_lb_slot0
            ?(u.pets||[]).find(p=>p.instId&&String(p.instId)===String(_lb_slot0))
             ||(u.pets||[]).find(p=>p.id===_lb_slot0):null;
        const ph=u.customPhoto||u.googlePhoto||`https://ui-avatars.com/api/?name=${encodeURIComponent((u.nickname||'?')[0])}&background=334155&color=fff&size=64`;
        const fb=`https://ui-avatars.com/api/?name=${encodeURIComponent((u.nickname||'?')[0])}&background=334155&color=fff&size=64`;
        const rc=i===0?'gold':i===1?'silver':i===2?'bronze':'';
        return`<div class="lb-row${isMe?' lb-me':''}">
            <div class="lb-rank ${rc}">${i<3?icons[i]:i+1}</div>
            <img loading="lazy" src="${ph}" class="lb-photo" onerror="this.onerror=null;this.src='${fb}'">
            <div class="lb-name">${u.nickname||'?'}${pet?` ${pet.emoji}`:''}</div>
            <div class="lb-score" style="color:${accentColor}">${u[scoreKey]}</div>
        </div>`;
    }).join('');
}

// ── Global Top 1 score helpers ──
function _globalTop1(scoreKey){ const all=_lbUsers(); if(!all.length)return 0; return Math.max(...all.map(u=>u[scoreKey]||0)); }
function _qTop1(){ return _globalTop1('quizHigh'); }
function _dqTop1(){ return _globalTop1('drugHigh'); }
function _ctTop1(){ return _globalTop1('ctHigh'); }
function buildQuizLb(){
    const board=[..._lbUsers()].filter(u=>u.quizHigh>0).sort((a,b)=>b.quizHigh-a.quizHigh).slice(0,7);
    return _renderLbRows(board,'quizHigh','#6ee7b7');
}
function buildDrugLb(){
    const board=[..._lbUsers()].filter(u=>u.drugHigh>0).sort((a,b)=>b.drugHigh-a.drugHigh).slice(0,7);
    return _renderLbRows(board,'drugHigh','#a5b4fc');
}
function buildCtLb(){
    const board=[..._lbUsers()].filter(u=>(u.ctHigh||0)>0).sort((a,b)=>(b.ctHigh||0)-(a.ctHigh||0)).slice(0,7);
    return _renderLbRows(board,'ctHigh','#4ade80');
}

window.toggleLb=(id)=>{const el=document.getElementById(id);if(!el)return;const show=el.style.display==='none';el.style.display=show?'block':'none';if(show){el.innerHTML=id==='qlb'?buildQuizLb():id==='dqlb'?buildDrugLb():id==='twlb'?buildTowerLb():buildCtLb();}}

function buildTowerLb(){
    const all=window.__students||[];
    const rows=all.map(s=>{
        const live=window.__fbUsers?.[s.id];
        const best=live?.towerBest||0;
        return {nick:s.nickname,best,track:s.track,emoji:(()=>{const slot0=(live?.activePets||[])[0]||live?.activePet||null;if(!slot0)return '';const ep=(live?.pets||[]).find(p=>p.instId&&String(p.instId)===String(slot0)||(p.id===slot0));return ep?ep.emoji:'';})()};
    }).filter(r=>r.best>0).sort((a,b)=>b.best-a.best).slice(0,10);
    if(!rows.length) return `<div style="text-align:center;padding:16px;color:rgba(255,255,255,.3);font-size:0.8rem">ยังไม่มีข้อมูลชั้นสูงสุด</div>`;
    const medals=['🥇','🥈','🥉'];
    return `<div style="background:rgba(0,0,0,.2);border-radius:12px;overflow:hidden">
        ${rows.map((r,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;${i<rows.length-1?'border-bottom:1px solid rgba(255,255,255,.06)':''}${i===0?';background:rgba(251,191,36,.08)':''}">
            <div style="width:22px;text-align:center;font-size:${i<3?'1rem':'0.76rem'};font-weight:800;color:${i===0?'#fbbf24':i===1?'#e2e8f0':i===2?'#f87171':'rgba(255,255,255,.3)'}">${i<3?medals[i]:i+1}</div>
            <div style="font-size:1rem">${r.emoji||'🐾'}</div>
            <div style="flex:1;min-width:0">
                <div style="font-size:0.78rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${window.sanitize(r.nick)}</div>
                <div style="font-size:0.58rem;color:${r.track==='sci'?'var(--sci)':'var(--care)'}">${r.track.toUpperCase()}</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:0.9rem;font-weight:800;color:#a78bfa">ชั้น ${r.best}</div>
            </div>
        </div>`).join('')}
    </div>`;
}

// ── expose for app.js + other modules (inline onclick / cross-module) ──
window._qTop1=_qTop1; window._dqTop1=_dqTop1; window._ctTop1=_ctTop1;
window.buildQuizLb=buildQuizLb; window.buildDrugLb=buildDrugLb;
window.buildCtLb=buildCtLb; window.buildTowerLb=buildTowerLb;
