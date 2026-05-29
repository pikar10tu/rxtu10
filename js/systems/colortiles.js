// ════════════════════
//  COLOR TILES — mini-game (extracted from app.js)
//  reads shared state via window.*, writes Firestore directly
// ════════════════════
import { db } from "../config.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ════════════════════════════════════════
// ▶ COLOR TILES GAME
// ════════════════════════════════════════

const CT_LANES   = 3;
const CT_ROWS    = 6;       // visible rows
const CT_COLORS  = ['0','1','2']; // 0=Red 1=Green 2=Blue
const CT_COIN_PER_SCORE = 5;
const CT_TIME_START = 5.0;  // วินาทีเริ่มต้น
const CT_TIME_MIN   = 1.0;  // ขั้นต่ำ
const CT_TIME_STEP  = 0.1;  // ลดทุก 5 คะแนน

let __ct = {
    running: false,
    score: 0,
    rows: [],       // Array[ROWS] ของ lane index ที่มี tile (0/1/2)
    timeLeft: CT_TIME_START,
    maxTime:  CT_TIME_START,
    tick: null,     // setInterval handle
};

// ── Helper: สุ่ม 1 แถว ──
function _ctNewRow(){ return Math.floor(Math.random()*CT_LANES); }

// ── Init rows array ──
function _ctInitRows(){
    __ct.rows = [];
    for(let i=0;i<CT_ROWS;i++) __ct.rows.push(_ctNewRow());
}

// ── Render entire field ──
function _ctRender(){
    const field = document.getElementById('ct-field');
    if(!field) return;
    const bottomTile = __ct.rows[0]; // row index 0 = bottom row

    // Build per-lane columns
    // lane 0,1,2 — each shows CT_ROWS cells stacked bottom-to-top via flex-col-reverse
    let lanes = ['','',''];
    for(let row=0; row<CT_ROWS; row++){
        const lane = __ct.rows[row];
        for(let l=0;l<CT_LANES;l++){
            const isBottom = (row===0);
            const hasTile  = (lane===l);
            let cls = 'ct-tile ';
            if(hasTile){
                cls += `filled-${l}`;
                if(isBottom) cls += ` active-${l}`;
            } else {
                cls += 'empty';
            }
            lanes[l] += `<div class="${cls}"></div>`;
        }
    }

    field.innerHTML = lanes.map((rows,l)=>
        `<div class="ct-lane ct-lane-${l}" id="ct-lane-${l}">${rows}</div>`
    ).join('');
}

// ── Update time bar ──
function _ctUpdateBar(){
    const bar = document.getElementById('ct-bar');
    if(!bar) return;
    const pct = Math.max(0, __ct.timeLeft / __ct.maxTime * 100);
    bar.style.width = pct+'%';
    // Color transitions: green > yellow > red
    bar.style.background = pct>50
        ? `linear-gradient(90deg,#22c55e,#4ade80)`
        : pct>25
            ? `linear-gradient(90deg,#f59e0b,#fbbf24)`
            : `linear-gradient(90deg,#ef4444,#f87171)`;
}

// ── Update score display ──
function _ctUpdateScore(){
    const el = document.getElementById('ct-score-live');
    if(el) el.textContent = __ct.score;
}

// ── Start game ──
window.ctStart = ()=>{
    if(!window.currentUser){ toast('กรุณา Login ก่อน','error'); return; }
    __ct.running  = true;
    __ct.score    = 0;
    __ct.timeLeft = CT_TIME_START;
    __ct.maxTime  = CT_TIME_START;
    _ctInitRows();

    // Render game UI
    document.getElementById('ct-modal-body').innerHTML = _ctGameHTML();
    _ctRender();
    _ctUpdateBar();
    _ctUpdateScore();

    // Interval: tick every 100ms
    clearInterval(__ct.tick);
    __ct.tick = setInterval(()=>{
        if(!__ct.running){ clearInterval(__ct.tick); return; }
        __ct.timeLeft = Math.max(0, __ct.timeLeft - 0.1);
        _ctUpdateBar();
        if(__ct.timeLeft <= 0) _ctGameOver(false);
    }, 100);
};

// ── Press lane button ──
window.ctPress = (lane)=>{
    if(!__ct.running) return;
    const correct = __ct.rows[0];
    const laneEl  = document.getElementById(`ct-lane-${lane}`);

    if(lane === correct){
        // HIT ✓
        if(laneEl){ laneEl.classList.add('flash-hit'); setTimeout(()=>laneEl?.classList.remove('flash-hit'),180); }

        __ct.rows.shift();               // ลบแถวล่างสุด
        __ct.rows.push(_ctNewRow());     // เพิ่มแถวใหม่บนสุด
        __ct.score++;
        _ctUpdateScore();

        // ปรับเวลาสูงสุด (ลดทุก 5 คะแนน)
        const reductions = Math.floor(__ct.score / 5);
        __ct.maxTime = Math.max(CT_TIME_MIN, CT_TIME_START - reductions * CT_TIME_STEP);

        // รีเซ็ตเวลาให้เต็ม maxTime ใหม่
        __ct.timeLeft = __ct.maxTime;

        _ctRender();
        _ctUpdateBar();

        // Combo confetti every 20
        if(__ct.score % 20 === 0){
            confetti({particleCount:20,spread:45,origin:{y:0.7},scalar:0.8,
                colors:['#22c55e','#ef4444','#3b82f6']});
        }
    } else {
        // MISS ✗
        if(laneEl){ laneEl.classList.add('flash-miss'); }
        _ctGameOver(true);
    }
};

// ── Game Over ──
async function _ctGameOver(isMiss){
    __ct.running = false;
    clearInterval(__ct.tick);

    const score   = __ct.score;
    const coins   = score * CT_COIN_PER_SCORE;
    const isHigh  = score > (window.userData?.ctHigh||0);
    const reason  = isMiss ? '❌ กดพลาด!' : '⏰ หมดเวลา!';

    // Show overlay on field
    const field = document.getElementById('ct-field');
    if(field){
        const ov = document.createElement('div');
        ov.className = 'ct-overlay';
        ov.innerHTML = `<div class="ct-overlay-box">
            <div style="font-size:2rem;margin-bottom:6px">${isMiss?'💥':'⏱️'}</div>
            <div style="font-weight:800;font-size:1.1rem;color:#fff;margin-bottom:4px">${reason}</div>
            <div style="font-size:0.8rem;color:rgba(255,255,255,.5)">กำลังบันทึก...</div>
        </div>`;
        field.style.position='relative';
        field.appendChild(ov);
    }

    // Disable buttons
    [0,1,2].forEach(l=>{
        const btn=document.getElementById(`ct-btn-${l}`);
        if(btn) btn.disabled=true;
    });

    // Save to Firestore
    if(window.currentUser && window.userData){
        try{
            const updates = { coins: (window.userData.coins||0)+coins };
            if(isHigh) updates.ctHigh = score;
            await updateDoc(doc(db,'users',window.currentUser.uid), updates);
            if(isHigh && window.userData?.studentId && window.__fbUsers?.[window.userData.studentId])
                window.__fbUsers[window.userData.studentId].ctHigh = score;
            if(score>30){
                const ctName=window.userData?.nickname||window.userData?.name||'ผู้เล่น';
                await window.postNews("🟩",`${ctName} ทำคะแนน ${score} ในเกม Color Tiles`).catch(()=>{});
            }
        } catch(e){ log.warn('ct-save',e); }
    }

    // Render result screen
    setTimeout(()=>{
        document.getElementById('ct-modal-body').innerHTML = _ctResultHTML(score, coins, isHigh, reason);
    }, 600);
}

// ── Build game HTML ──
function _ctGameHTML(){
    const ctHigh = window.userData?.ctHigh||0;
    return `
    <div style="padding:4px 0 6px">
        <!-- Score row -->
        <div class="ct-score-row">
            <div style="font-size:0.72rem;color:rgba(255,255,255,.4)">คะแนน</div>
            <div style="font-size:1.6rem;font-weight:800;color:#4ade80" id="ct-score-live">0</div>
            <div style="text-align:right">
                <div style="font-size:0.6rem;color:rgba(255,255,255,.35)">High Score</div>
                <div style="font-size:0.88rem;font-weight:800;color:#fbbf24">🏆 ${ctHigh}</div>
            </div>
        </div>

        <!-- Time bar -->
        <div class="ct-time-bar-wrap">
            <div class="ct-time-bar" id="ct-bar" style="width:100%"></div>
        </div>

        <!-- Play field -->
        <div class="ct-field" id="ct-field">
            <!-- lanes injected by _ctRender -->
        </div>

        <!-- Controls -->
        <div class="ct-controls">
            <button class="ct-btn ct-btn-0" id="ct-btn-0" onpointerdown="ctPress(0)">
                <span style="font-size:1.2rem">🔴</span>
                <span>ซ้าย</span>
            </button>
            <button class="ct-btn ct-btn-1" id="ct-btn-1" onpointerdown="ctPress(1)">
                <span style="font-size:1.2rem">🟢</span>
                <span>กลาง</span>
            </button>
            <button class="ct-btn ct-btn-2" id="ct-btn-2" onpointerdown="ctPress(2)">
                <span style="font-size:1.2rem">🔵</span>
                <span>ขวา</span>
            </button>
        </div>

        <!-- Leaderboard toggle -->
        <button onclick="toggleLb('ctlb')" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:7px;color:rgba(255,255,255,.5);font-family:inherit;font-size:0.72rem;cursor:pointer;margin-top:2px">
            🏆 กระดาน Color Tiles
        </button>
        <div id="ctlb" style="display:none;margin-top:6px"></div>
    </div>`;
}

// ── Result screen ──
function _ctResultHTML(score, coins, isHigh, reason){
    return `
    <div style="text-align:center;padding:16px 4px">
        <div style="font-size:3rem;margin-bottom:8px">${isHigh?'🏆':'🎮'}</div>
        <div style="font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:4px">${reason}</div>
        ${isHigh?'<div style="font-size:0.82rem;color:#fbbf24;font-weight:700;margin-bottom:12px">🎉 สถิติใหม่!</div>':''}
        <div style="background:rgba(255,255,255,.06);border-radius:16px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="text-align:center">
                <div style="font-size:0.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">คะแนน</div>
                <div style="font-size:2rem;font-weight:800;color:#4ade80">${score}</div>
            </div>
            <div style="text-align:center">
                <div style="font-size:0.65rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">รางวัล</div>
                <div style="font-size:2rem;font-weight:800;color:#fbbf24">+${coins}🪙</div>
            </div>
        </div>
        <button onclick="ctStart()" style="width:100%;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:14px;padding:14px;color:#fff;font-family:inherit;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(34,197,94,.4);margin-bottom:10px">
            🟩 เล่นอีกครั้ง
        </button>
        <div style="margin-top:4px">
            <button onclick="toggleLb('ctlb')" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:7px;color:rgba(255,255,255,.5);font-family:inherit;font-size:0.72rem;cursor:pointer">
                🏆 กระดาน Color Tiles
            </button>
            <div id="ctlb" style="display:none;margin-top:6px"></div>
        </div>
    </div>`;
}

// ── Start Screen ──
function buildColorTilesBody(){
    const ctHigh = window.userData?.ctHigh||0;
    return `
    <div style="padding:4px 0">
        <div class="game-start">
            <span class="game-start-icon">🟩</span>
            <div class="game-start-hi">High Score: ${ctHigh} คะแนน</div>
            <div class="game-start-desc">
                กดปุ่มสี <b style="color:#ef4444">🔴</b> <b style="color:#22c55e">🟢</b> <b style="color:#3b82f6">🔵</b> ให้ตรงกับแผ่นที่อยู่แถวล่างสุด<br>
                <span style="font-size:0.74rem;color:rgba(255,255,255,.35)">1 คะแนน = ${CT_COIN_PER_SCORE}🪙 • เวลาจะสั้นลงเรื่อยๆ</span>
            </div>
            <button class="btn-play" onclick="ctStart()" style="background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 4px 16px rgba(34,197,94,.4)">▶ เริ่มเกม</button>
        </div>
        <button onclick="toggleLb('ctlb')" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:7px;color:rgba(255,255,255,.5);font-family:inherit;font-size:0.72rem;cursor:pointer;margin-top:4px">
            🏆 กระดาน Color Tiles
        </button>
        <div id="ctlb" style="display:none;margin-top:6px"></div>
    </div>`;
}

// ── Modal Open / Close ──
window.openColorTilesModal = ()=>{
    if(!window.currentUser){ toast('กรุณา Login ก่อน','error'); return; }
    // Reset any running game
    __ct.running = false;
    clearInterval(__ct.tick);
    // Update hi badge
    const hiBadge = document.getElementById('ct-hi-badge');
    if(hiBadge) hiBadge.innerHTML = `🏆 <b>${window._ctTop1()}</b>`;
    // Render start screen
    document.getElementById('ct-modal-body').innerHTML = buildColorTilesBody();
    document.getElementById('ct-modal').classList.add('active');
};

window.closeColorTilesModal = ()=>{
    __ct.running = false;
    clearInterval(__ct.tick);
    document.getElementById('ct-modal').classList.remove('active');
};
