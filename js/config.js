// ════════════════════════════════════════
// FIREBASE CONFIG & INIT
// ════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlmHZZ3JixrQlH7PyMa_QqQuDPEN4RJBE",
    authDomain: "rxtu10dashboard.firebaseapp.com",
    projectId: "rxtu10dashboard",
    storageBucket: "rxtu10dashboard.firebasestorage.app",
    messagingSenderId: "485847555600",
    appId: "1:485847555600:web:1ee57ea6044c687b10b495"
};

export const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
// long-polling auto-detect: กัน WebChannel ถูกบล็อก/รบกวนบนเครือข่ายมหาวิทยาลัย/proxy
// (อาการเดิม: RPC 'Listen' 400 ซ้ำๆ + "client is offline")
export const db       = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
export const provider = new GoogleAuthProvider();

// ── ADMIN ──
export const ADMIN_EMAIL = 'prawich.aum@dome.tu.ac.th';

// ── SYSTEM CONSTANTS ──
export const SNAPSHOT_DELAY = 1500;
export const PLE_CC_DATE    = '2026-12-11T00:00:00+07:00';
export const INSTANT_COST   = 25;
export const MEGA_COST      = 25;

// ── PHARMACOKINETIC CONSTANTS ──
export const VANCO_KE_SLOPE  = 0.00083;
export const VANCO_KE_INT    = 0.0044;
export const VANCO_VD_POP    = 0.7;
export const CG_MALE_FACTOR  = 1.0;
export const CG_FEMALE_FACTOR = 0.85;
export const CG_DENOMINATOR  = 72;

// ── DEV LOGGER ──
export const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
export const log = {
    error: (ctx, err) => { if (IS_DEV) console.error(`[${ctx}]`, err); },
    warn:  (ctx, msg) => { if (IS_DEV) console.warn(`[${ctx}]`, msg);  },
    info:  (ctx, msg) => { if (IS_DEV) console.info(`[${ctx}]`, msg);  },
};
