// ════════════════════════════════════════
//  CALC TOOLS — Pharmacy calculators
//  (extracted from app.js; เรียกผ่าน window.* จาก inline onclick)
// ════════════════════════════════════════
import { VANCO_KE_SLOPE, VANCO_KE_INT, VANCO_VD_POP,
         CG_MALE_FACTOR, CG_FEMALE_FACTOR, CG_DENOMINATOR } from "../config.js";

const CALC_TOOLS = [
    { id:'crcl',  icon:'🫘', name:'CrCl',       desc:'Cockcroft-Gault' },
    { id:'bmi',   icon:'⚖️', name:'BMI / IBW',  desc:'Body indices'    },
    { id:'bsa',   icon:'📐', name:'BSA',         desc:'Mosteller'       },
    { id:'egfr',  icon:'🩸', name:'eGFR',        desc:'CKD-EPI'         },
    { id:'ag',    icon:'⚗️', name:'Anion Gap',   desc:'± albumin corr.' },
    { id:'ca',    icon:'💊', name:'Corrected Ca',desc:'Low albumin adj.' },
    { id:'drip',  icon:'💧', name:'Drip Rate',   desc:'mcg/kg/min→mL/hr'},
    { id:'carbo', icon:'🔬', name:'Carboplatin',      desc:'Calvert AUC dose'   },
    { id:'vanco', icon:'💉', name:'Vancomycin AUC',  desc:'AUC-guided dosing'   },
    { id:'nacorr',icon:'🧂', name:'Sodium Correction',desc:'Hyperglycemia adj.'  },
    { id:'pheny', icon:'⚡', name:'Phenytoin Corr.',  desc:'Albumin/renal adj.'  },
];

window.__calcTool=null;
window.openCalc=()=>{ window.__calcTool=null; document.getElementById('calc-panel').classList.add('active'); _renderCalcBody(); };
window.closeCalc=()=>{ document.getElementById('calc-panel').classList.remove('active'); };

window._renderCalcBody=function _renderCalcBody(){
    const el=document.getElementById('calc-body'); if(!el) return;
    if(!window.__calcTool){ _renderCalcMenu(el); return; }
    _renderCalcForm(el, window.__calcTool);
}

window._renderCalcMenu=function _renderCalcMenu(el){
    el.innerHTML=`
        <div class="calc-grid">
            ${CALC_TOOLS.map(t=>`
                <button class="calc-tool-btn" onclick="window.__calcTool='${t.id}';_renderCalcBody()">
                    <span class="ct-icon">${t.icon}</span>
                    <span class="ct-name">${t.name}</span>
                    <span class="ct-desc">${t.desc}</span>
                </button>`).join('')}
        </div>`;
}

window._renderCalcForm=function _renderCalcForm(el, id){
    const t=CALC_TOOLS.find(x=>x.id===id);
    const backBtn=`<button onclick="__calcTool=null;_renderCalcBody()" style="background:none;border:none;color:rgba(255,255,255,.5);font-family:inherit;font-size:0.8rem;cursor:pointer;padding:0;margin-bottom:12px;display:flex;align-items:center;gap:4px">‹ กลับ</button>`;
    const title=`<div style="font-size:1rem;font-weight:800;margin-bottom:12px">${t.icon} ${t.name} <span style="font-size:0.62rem;color:rgba(255,255,255,.35);font-weight:400">${t.desc}</span></div>`;

    const forms = {
        crcl: `
            <div class="calc-inp-row">
                <div class="calc-radio-row" id="crcl-sex-row">
                    <button class="calc-radio sel" id="crcl-sex-m" onclick="document.getElementById('crcl-sex-m').classList.add('sel');document.getElementById('crcl-sex-f').classList.remove('sel')">♂ ชาย</button>
                    <button class="calc-radio" id="crcl-sex-f" onclick="document.getElementById('crcl-sex-f').classList.add('sel');document.getElementById('crcl-sex-m').classList.remove('sel')">♀ หญิง</button>
                </div>
                <div><div class="calc-inp-label">อายุ (ปี)</div><input class="calc-inp" id="c-age" type="number" placeholder="เช่น 65" min="1" max="120"></div>
                <div><div class="calc-inp-label">น้ำหนัก (kg)</div><input class="calc-inp" id="c-wt" type="number" placeholder="เช่น 60" min="1"></div>
                <div><div class="calc-inp-label">SCr (mg/dL)</div><input class="calc-inp" id="c-scr" type="number" placeholder="เช่น 1.2" step="0.01" min="0.1"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcCrCl()">คำนวณ CrCl</button>
            <div class="calc-result" id="calc-result"></div>`,

        bmi: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">น้ำหนัก (kg)</div><input class="calc-inp" id="b-wt" type="number" placeholder="เช่น 65" min="1"></div>
                <div><div class="calc-inp-label">ส่วนสูง (cm)</div><input class="calc-inp" id="b-ht" type="number" placeholder="เช่น 165" min="50"></div>
                <div class="calc-radio-row">
                    <button class="calc-radio sel" id="bmi-sex-m" onclick="document.getElementById('bmi-sex-m').classList.add('sel');document.getElementById('bmi-sex-f').classList.remove('sel')">♂ ชาย</button>
                    <button class="calc-radio" id="bmi-sex-f" onclick="document.getElementById('bmi-sex-f').classList.add('sel');document.getElementById('bmi-sex-m').classList.remove('sel')">♀ หญิง</button>
                </div>
            </div>
            <button class="btn-gold full" onclick="window._calcBMI()">คำนวณ BMI / IBW / ABW</button>
            <div class="calc-result" id="calc-result"></div>`,

        bsa: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">น้ำหนัก (kg)</div><input class="calc-inp" id="s-wt" type="number" placeholder="เช่น 65" min="1"></div>
                <div><div class="calc-inp-label">ส่วนสูง (cm)</div><input class="calc-inp" id="s-ht" type="number" placeholder="เช่น 165" min="50"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcBSA()">คำนวณ BSA</button>
            <div class="calc-result" id="calc-result"></div>`,

        egfr: `
            <div class="calc-inp-row">
                <div class="calc-radio-row">
                    <button class="calc-radio sel" id="eg-sex-m" onclick="document.getElementById('eg-sex-m').classList.add('sel');document.getElementById('eg-sex-f').classList.remove('sel')">♂ ชาย</button>
                    <button class="calc-radio" id="eg-sex-f" onclick="document.getElementById('eg-sex-f').classList.add('sel');document.getElementById('eg-sex-m').classList.remove('sel')">♀ หญิง</button>
                </div>
                <div><div class="calc-inp-label">อายุ (ปี)</div><input class="calc-inp" id="eg-age" type="number" placeholder="เช่น 55" min="18"></div>
                <div><div class="calc-inp-label">SCr (mg/dL)</div><input class="calc-inp" id="eg-scr" type="number" placeholder="เช่น 1.0" step="0.01" min="0.1"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcEGFR()">คำนวณ eGFR (CKD-EPI)</button>
            <div class="calc-result" id="calc-result"></div>`,

        ag: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Na (mEq/L)</div><input class="calc-inp" id="ag-na" type="number" placeholder="เช่น 140" min="100"></div>
                <div><div class="calc-inp-label">Cl (mEq/L)</div><input class="calc-inp" id="ag-cl" type="number" placeholder="เช่น 102" min="50"></div>
                <div><div class="calc-inp-label">HCO₃ (mEq/L)</div><input class="calc-inp" id="ag-hco3" type="number" placeholder="เช่น 24" min="1"></div>
                <div><div class="calc-inp-label">Albumin (g/dL) <span style="color:rgba(255,255,255,.3)">optional</span></div><input class="calc-inp" id="ag-alb" type="number" placeholder="เช่น 4.0 (ปกติ)" step="0.1" min="0"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcAG()">คำนวณ Anion Gap</button>
            <div class="calc-result" id="calc-result"></div>`,

        ca: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Total Ca (mg/dL)</div><input class="calc-inp" id="ca-ca" type="number" placeholder="เช่น 7.8" step="0.1" min="1"></div>
                <div><div class="calc-inp-label">Albumin (g/dL)</div><input class="calc-inp" id="ca-alb" type="number" placeholder="เช่น 2.5" step="0.1" min="0"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcCa()">คำนวณ Corrected Ca</button>
            <div class="calc-result" id="calc-result"></div>`,

        drip: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Dose (mcg/kg/min)</div><input class="calc-inp" id="dr-dose" type="number" placeholder="เช่น 5" step="0.1" min="0"></div>
                <div><div class="calc-inp-label">น้ำหนัก (kg)</div><input class="calc-inp" id="dr-wt" type="number" placeholder="เช่น 60" min="1"></div>
                <div><div class="calc-inp-label">ความเข้มข้น (mcg/mL)</div><input class="calc-inp" id="dr-conc" type="number" placeholder="เช่น 1600" min="1"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcDrip()">คำนวณ Drip Rate</button>
            <div class="calc-result" id="calc-result"></div>`,

        carbo: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Target AUC</div>
                    <div class="calc-radio-row" style="margin-top:4px">
                        <button class="calc-radio" onclick="this.parentElement.querySelectorAll('.calc-radio').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')" data-auc="4">AUC 4</button>
                        <button class="calc-radio sel" onclick="this.parentElement.querySelectorAll('.calc-radio').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')" data-auc="5">AUC 5</button>
                        <button class="calc-radio" onclick="this.parentElement.querySelectorAll('.calc-radio').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')" data-auc="6">AUC 6</button>
                        <button class="calc-radio" onclick="this.parentElement.querySelectorAll('.calc-radio').forEach(b=>b.classList.remove('sel'));this.classList.add('sel')" data-auc="7">AUC 7</button>
                    </div>
                </div>
                <div><div class="calc-inp-label">GFR / CrCl (mL/min)</div><input class="calc-inp" id="cb-gfr" type="number" placeholder="เช่น 80" min="1"></div>
            </div>
            <button class="btn-gold full" onclick="window._calcCarbo()">คำนวณ Carboplatin dose</button>
            <div class="calc-result" id="calc-result"></div>`,

        vanco: `
            <div style="font-size:0.68rem;color:rgba(255,255,255,.4);background:rgba(255,255,255,.04);border-radius:8px;padding:8px 10px;margin-bottom:10px;line-height:1.6">
                ป้อน trough 2 ค่า (steady-state) เพื่อประมาณ AUC₂₄<br>
                <span style="color:rgba(255,255,255,.25)">ใช้ one-compartment first-order approximation</span>
            </div>
            <div class="calc-inp-row">
                <div class="calc-radio-row">
                    <button class="calc-radio sel" id="vn-sex-m" onclick="document.getElementById('vn-sex-m').classList.add('sel');document.getElementById('vn-sex-f').classList.remove('sel')">♂ ชาย</button>
                    <button class="calc-radio" id="vn-sex-f" onclick="document.getElementById('vn-sex-f').classList.add('sel');document.getElementById('vn-sex-m').classList.remove('sel')">♀ หญิง</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    <div><div class="calc-inp-label">อายุ (ปี)</div><input class="calc-inp" id="vn-age" type="number" placeholder="เช่น 50" min="1"></div>
                    <div><div class="calc-inp-label">น้ำหนัก (kg)</div><input class="calc-inp" id="vn-wt" type="number" placeholder="เช่น 60" min="1"></div>
                </div>
                <div><div class="calc-inp-label">SCr (mg/dL)</div><input class="calc-inp" id="vn-scr" type="number" placeholder="เช่น 0.9" step="0.01" min="0.1"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    <div><div class="calc-inp-label">Dose (mg)</div><input class="calc-inp" id="vn-dose" type="number" placeholder="เช่น 1000" min="1"></div>
                    <div><div class="calc-inp-label">Interval (hr)</div><input class="calc-inp" id="vn-tau" type="number" placeholder="เช่น 12" min="6"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                    <div><div class="calc-inp-label">Trough 1 (mg/L)</div><input class="calc-inp" id="vn-c1" type="number" placeholder="เช่น 8" step="0.1" min="0.1"></div>
                    <div><div class="calc-inp-label">Trough 2 (mg/L)</div><input class="calc-inp" id="vn-c2" type="number" placeholder="เช่น 10" step="0.1" min="0.1"></div>
                </div>
            </div>
            <button class="btn-gold full" onclick="window._calcVanco()">คำนวณ Vancomycin AUC₂₄</button>
            <div class="calc-result" id="calc-result"></div>`,

        nacorr: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Measured Na (mEq/L)</div><input class="calc-inp" id="na-na" type="number" placeholder="เช่น 128" min="100" max="180"></div>
                <div><div class="calc-inp-label">Glucose (mg/dL)</div><input class="calc-inp" id="na-glu" type="number" placeholder="เช่น 450" min="100"></div>
            </div>
            <div style="font-size:0.62rem;color:rgba(255,255,255,.3);margin-bottom:8px">คำนวณทั้ง Katz (classic) และ Hillier (updated) formula</div>
            <button class="btn-gold full" onclick="window._calcNaCorr()">คำนวณ Corrected Na</button>
            <div class="calc-result" id="calc-result"></div>`,

        pheny: `
            <div class="calc-inp-row">
                <div><div class="calc-inp-label">Measured Phenytoin (mcg/mL)</div><input class="calc-inp" id="ph-level" type="number" placeholder="เช่น 8" step="0.1" min="0"></div>
                <div><div class="calc-inp-label">Albumin (g/dL)</div><input class="calc-inp" id="ph-alb" type="number" placeholder="เช่น 2.8" step="0.1" min="0"></div>
                <div style="font-size:0.62rem;color:rgba(255,255,255,.35);margin:2px 0 4px">ถ้ามี renal impairment (CrCl &lt; 20 mL/min) เลือก:</div>
                <div class="calc-radio-row">
                    <button class="calc-radio sel" id="ph-renal-n" onclick="document.getElementById('ph-renal-n').classList.add('sel');document.getElementById('ph-renal-y').classList.remove('sel')">CrCl ≥ 20</button>
                    <button class="calc-radio" id="ph-renal-y" onclick="document.getElementById('ph-renal-y').classList.add('sel');document.getElementById('ph-renal-n').classList.remove('sel')">CrCl &lt; 20 / Dialysis</button>
                </div>
            </div>
            <button class="btn-gold full" onclick="window._calcPheny()">คำนวณ Adjusted Phenytoin</button>
            <div class="calc-result" id="calc-result"></div>`,
    };

    el.innerHTML = backBtn + title + (forms[id]||'<div style="color:rgba(255,255,255,.4);padding:20px;text-align:center">ยังไม่รองรับ</div>');
}

// ── Calculation functions ──────────────────────────────────────────
window._showCalcResult=function _showCalcResult(val, unit, sub=''){
    const el=document.getElementById('calc-result');
    if(!el) return;
    el.className='calc-result show';
    el.innerHTML=`<div class="calc-result-val">${val} <span style="font-size:1rem;font-weight:600;color:rgba(255,255,255,.6)">${unit}</span></div>${sub?`<div class="calc-result-sub">${sub}</div>`:''}`;
}

window._calcCrCl=()=>{
    const male=document.getElementById('crcl-sex-m')?.classList.contains('sel');
    const age=parseFloat(document.getElementById('c-age')?.value);
    const wt =parseFloat(document.getElementById('c-wt')?.value);
    const scr=parseFloat(document.getElementById('c-scr')?.value);
    if([age,wt,scr].some(isNaN)||age<=0||wt<=0||scr<=0){toast('กรอกข้อมูลให้ครบ','error');return;}
    const sex=male?CG_MALE_FACTOR:CG_FEMALE_FACTOR;
    const crcl=((140-age)*wt*sex)/(CG_DENOMINATOR*scr);
    const stage=crcl>=90?'G1 (ปกติ)':crcl>=60?'G2 (ลดน้อย)':crcl>=30?'G3 (ปานกลาง)':crcl>=15?'G4 (รุนแรง)':'G5 (ไตวาย)';
    _showCalcResult(crcl.toFixed(1),'mL/min',`CKD Stage: <b>${stage}</b>`);
};

window._calcBMI=()=>{
    const male=document.getElementById('bmi-sex-m')?.classList.contains('sel');
    const wt=parseFloat(document.getElementById('b-wt')?.value);
    const ht=parseFloat(document.getElementById('b-ht')?.value);
    if([wt,ht].some(isNaN)||wt<=0||ht<=0){toast('กรอกข้อมูลให้ครบ','error');return;}
    const htM=ht/100;
    const bmi=wt/(htM*htM);
    const ibw=male?(50+2.3*(ht/2.54-60)):(45.5+2.3*(ht/2.54-60));
    const abw=ibw+0.4*(wt-ibw);
    const bmiCat=bmi<18.5?'น้ำหนักน้อย':bmi<23?'ปกติ':bmi<25?'ท้วม':bmi<30?'อ้วนระดับ 1':'อ้วนระดับ 2+';
    const ibwShow=Math.max(0,ibw).toFixed(1);
    const abwShow=wt>ibw?abw.toFixed(1):'-';
    _showCalcResult(bmi.toFixed(1),'kg/m²',
        `${bmiCat} · IBW: <b>${ibwShow} kg</b> · ABW: <b>${abwShow} kg</b>`);
};

window._calcBSA=()=>{
    const wt=parseFloat(document.getElementById('s-wt')?.value);
    const ht=parseFloat(document.getElementById('s-ht')?.value);
    if([wt,ht].some(isNaN)||wt<=0||ht<=0){toast('กรอกข้อมูลให้ครบ','error');return;}
    const bsa=Math.sqrt((ht*wt)/3600);
    _showCalcResult(bsa.toFixed(2),'m²','Mosteller formula');
};

window._calcEGFR=()=>{
    const male=document.getElementById('eg-sex-m')?.classList.contains('sel');
    const age=parseFloat(document.getElementById('eg-age')?.value);
    const scr=parseFloat(document.getElementById('eg-scr')?.value);
    if([age,scr].some(isNaN)||age<=0||scr<=0){toast('กรอกข้อมูลให้ครบ','error');return;}
    // CKD-EPI 2021 (race-free)
    const k=male?0.9:0.7; const a=male?-0.302:-0.241;
    const ratio=scr/k;
    const egfr=142*Math.pow(Math.min(ratio,1),a)*Math.pow(Math.max(ratio,1),-1.200)*Math.pow(0.9938,age)*(male?1:1.012);
    const stage=egfr>=90?'G1':egfr>=60?'G2':egfr>=45?'G3a':egfr>=30?'G3b':egfr>=15?'G4':'G5';
    _showCalcResult(Math.round(egfr),'mL/min/1.73m²',`CKD Stage: <b>${stage}</b>`);
};

window._calcAG=()=>{
    const na  =parseFloat(document.getElementById('ag-na')?.value);
    const cl  =parseFloat(document.getElementById('ag-cl')?.value);
    const hco3=parseFloat(document.getElementById('ag-hco3')?.value);
    const alb =parseFloat(document.getElementById('ag-alb')?.value)||4.0;
    if([na,cl,hco3].some(isNaN)){toast('กรอกข้อมูลให้ครบ','error');return;}
    const ag=na-cl-hco3;
    const corrAG=ag+2.5*(4.0-alb);
    const interp=corrAG>12?'⚠️ AG เพิ่มขึ้น (HAGMA)':'✅ AG ปกติ (non-HAGMA)';
    _showCalcResult(ag.toFixed(0),'mEq/L',
        `Corrected AG (albumin): <b>${corrAG.toFixed(1)}</b> · ${interp}`);
};

window._calcCa=()=>{
    const ca =parseFloat(document.getElementById('ca-ca')?.value);
    const alb=parseFloat(document.getElementById('ca-alb')?.value);
    if([ca,alb].some(isNaN)||ca<=0||alb<0){toast('กรอกข้อมูลให้ครบ','error');return;}
    const corrCa=ca+0.8*(4.0-alb);
    const interp=corrCa<8.5?'⬇️ Hypocalcemia':corrCa>10.5?'⬆️ Hypercalcemia':'✅ ปกติ';
    _showCalcResult(corrCa.toFixed(1),'mg/dL',interp);
};

window._calcDrip=()=>{
    const dose=parseFloat(document.getElementById('dr-dose')?.value);
    const wt  =parseFloat(document.getElementById('dr-wt')?.value);
    const conc=parseFloat(document.getElementById('dr-conc')?.value);
    if([dose,wt,conc].some(isNaN)||dose<=0||wt<=0||conc<=0){toast('กรอกข้อมูลให้ครบ','error');return;}
    const rate=(dose*wt*60)/conc;
    _showCalcResult(rate.toFixed(1),'mL/hr',
        `${dose} mcg/kg/min × ${wt} kg ÷ ${conc} mcg/mL × 60`);
};

window._calcCarbo=()=>{
    const gfr=parseFloat(document.getElementById('cb-gfr')?.value);
    const aucBtn=document.querySelector('[data-auc].sel');
    const auc=aucBtn?parseFloat(aucBtn.dataset.auc):5;
    if(isNaN(gfr)||gfr<=0){toast('กรอก GFR/CrCl ก่อน','error');return;}
    const dose=auc*(gfr+25);
    _showCalcResult(Math.round(dose),'mg',
        `Calvert: AUC ${auc} × (GFR ${gfr} + 25) = ${Math.round(dose)} mg`);
};

// ── Vancomycin AUC-guided (one-compartment, 2 trough method) ──────
window._calcVanco=()=>{
    const male=document.getElementById('vn-sex-m')?.classList.contains('sel');
    const age =parseFloat(document.getElementById('vn-age')?.value);
    const wt  =parseFloat(document.getElementById('vn-wt')?.value);
    const scr =parseFloat(document.getElementById('vn-scr')?.value);
    const dose=parseFloat(document.getElementById('vn-dose')?.value);
    const tau =parseFloat(document.getElementById('vn-tau')?.value);
    const c1  =parseFloat(document.getElementById('vn-c1')?.value);
    const c2  =parseFloat(document.getElementById('vn-c2')?.value);
    if([age,wt,scr,dose,tau,c1,c2].some(isNaN)){toast('กรอกข้อมูลให้ครบ','error');return;}
    if(c2<=c1){toast('Trough 2 ต้องมากกว่า Trough 1 (หรือใกล้เคียง steady-state)','error');return;}
    // CrCl สำหรับประมาณ Vd และ ke
    const sexF=male?CG_MALE_FACTOR:CG_FEMALE_FACTOR;
    const crcl=Math.max(10,((140-age)*wt*sexF)/(CG_DENOMINATOR*scr));
    // Population-based ke (Matzke 1984): ke = 0.00083×CrCl + 0.0044
    const ke=VANCO_KE_SLOPE*crcl+VANCO_KE_INT;
    // Vd population ≈ 0.7 L/kg
    const vd=VANCO_VD_POP*wt;
    // AUC₂₄ = (Dose/tau × 1/ke) × (1 - e^(-ke×tau)) ≈ Dose×24/tau / (ke×Vd) × correction
    // Simplified trapezoidal using 2 troughs (pre-dose values at steady state)
    // AUC_tau ≈ Dose/(ke × Vd) × eff_factor; use empirical 2-level
    const halfLife=Math.log(2)/ke;
    // Peak estimate (1-compartment bolus approx, infuse over 1hr)
    const peak=c2/(Math.exp(-ke*(tau-1))); // back-extrapolate trough to 1hr post-infusion
    const auc24=(dose/vd)*(1/(ke))*(24/tau);
    const auc_est=((peak+c2)/2)*tau*(24/tau); // linear-log trapezoidal simplified
    const interp=auc_est>=400&&auc_est<=600?'✅ อยู่ใน target (400-600)':auc_est<400?'⬇️ ต่ำกว่า target — พิจารณาเพิ่ม dose':'⬆️ เกิน target — พิจารณาลด dose หรือขยาย interval';
    _showCalcResult(Math.round(auc_est),'mg·h/L',
        `Target AUC/MIC: 400–600 · ke: ${ke.toFixed(4)} h⁻¹ · t½: ${halfLife.toFixed(1)} h<br>${interp}`);
};

// ── Sodium Correction for Hyperglycemia ──────────────────────────
window._calcNaCorr=()=>{
    const na =parseFloat(document.getElementById('na-na')?.value);
    const glu=parseFloat(document.getElementById('na-glu')?.value);
    if([na,glu].some(isNaN)||glu<=100){toast('กรอกข้อมูลให้ครบ (Glucose > 100)','error');return;}
    // Katz (1973): +1.6 mEq/L ต่อ glucose เพิ่ม 100 mg/dL
    const katz=na+1.6*((glu-100)/100);
    // Hillier (1999): +2.4 mEq/L ต่อ glucose เพิ่ม 100 mg/dL
    const hillier=na+2.4*((glu-100)/100);
    const interpK=katz<135?'⬇️ Hyponatremia':katz>145?'⬆️ Hypernatremia':'✅ ปกติ';
    const interpH=hillier<135?'⬇️ Hyponatremia':hillier>145?'⬆️ Hypernatremia':'✅ ปกติ';
    _showCalcResult(hillier.toFixed(1),'mEq/L',
        `<b>Hillier (updated):</b> ${hillier.toFixed(1)} mEq/L — ${interpH}<br>`+
        `<b>Katz (classic):</b> ${katz.toFixed(1)} mEq/L — ${interpK}<br>`+
        `<span style="font-size:0.75em;color:rgba(255,255,255,.4)">Hillier แนะนำในภาวะ glucose สูงมาก</span>`);
};

// ── Phenytoin Correction (Winter-Tozer) ──────────────────────────
window._calcPheny=()=>{
    const level=parseFloat(document.getElementById('ph-level')?.value);
    const alb  =parseFloat(document.getElementById('ph-alb')?.value);
    const renal=document.getElementById('ph-renal-y')?.classList.contains('sel');
    if([level,alb].some(isNaN)||level<0||alb<0){toast('กรอกข้อมูลให้ครบ','error');return;}
    // Winter-Tozer formula
    // Normal renal: Adj = Measured / (0.9×albumin/4.4 + 0.1)
    // CrCl<20/dialysis: Adj = Measured / (0.9×albumin/4.4 × 0.44 + 0.1) — factor 0.44
    let adj;
    if(renal){
        adj = level / ((0.9*alb/4.4)*0.44 + 0.1);
    } else {
        adj = level / (0.9*(alb/4.4) + 0.1);
    }
    const interp=adj<10?'⬇️ Sub-therapeutic (<10)':adj>20?'⬆️ Toxic range (>20)':'✅ Therapeutic (10–20)';
    _showCalcResult(adj.toFixed(1),'mcg/mL',
        `${renal?'CrCl<20/Dialysis formula':'Normal renal formula'}<br>${interp}`);
};
