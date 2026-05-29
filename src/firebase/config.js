import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: "AIzaSyAlmHZZ3JixrQlH7PyMa_QqQuDPEN4RJBE",
    authDomain: "rxtu10dashboard.firebaseapp.com",
    projectId: "rxtu10dashboard",
    storageBucket: "rxtu10dashboard.firebasestorage.app",
    messagingSenderId: "485847555600",
    appId: "1:485847555600:web:1ee57ea6044c687b10b495",
    // RTDB URL — add when you enable Realtime Database in Firebase Console
    // databaseURL: "https://rxtu10dashboard-default-rtdb.firebaseio.com",
}

export const app      = initializeApp(firebaseConfig)
export const auth     = getAuth(app)
export const db       = getFirestore(app)
export const provider = new GoogleAuthProvider()
// export const rtdb  = getDatabase(app)  // enable in Phase 3

// ── ADMIN ──
export const ADMIN_EMAIL = 'prawich.aum@dome.tu.ac.th'

// ── SYSTEM CONSTANTS ──
export const SNAPSHOT_DELAY   = 1500
export const PLE_CC_DATE      = '2026-12-11T00:00:00+07:00'
export const INSTANT_COST     = 25
export const MEGA_COST        = 25

// ── PHARMACOKINETIC CONSTANTS ──
export const VANCO_KE_SLOPE   = 0.00083
export const VANCO_KE_INT     = 0.0044
export const VANCO_VD_POP     = 0.7
export const CG_MALE_FACTOR   = 1.0
export const CG_FEMALE_FACTOR = 0.85
export const CG_DENOMINATOR   = 72

// ── DEV LOGGER ──
export const IS_DEV = import.meta.env.DEV
export const log = {
    error: (ctx, err) => { if (IS_DEV) console.error(`[${ctx}]`, err) },
    warn:  (ctx, msg) => { if (IS_DEV) console.warn(`[${ctx}]`, msg)  },
    info:  (ctx, msg) => { if (IS_DEV) console.info(`[${ctx}]`, msg)  },
}
