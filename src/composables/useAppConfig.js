import { ref } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config.js'

// ════════════════════════════════════════════════════════════
//  Launch gate via Firestore — `config/app { maintenance: bool }`
//
//  Why: the gate used to be hardcoded in App.vue, so opening/closing the
//  app to the whole class required a redeploy. Reading it from Firestore
//  (live via onSnapshot) lets an admin flip it instantly from the Admin tab.
//
//  Default LOCKED (maintenance = true) until the config loads / if the doc
//  is missing — safe failure mode (only admin/academic get in by accident).
//  The doc is PUBLIC-read (just a boolean) so the listener also works before
//  login and survives a desktop popup login without a page reload.
// ════════════════════════════════════════════════════════════

const maintenance  = ref(true)
const configLoaded = ref(false)
let _started = false

export function initAppConfig() {
  if (_started) return
  _started = true
  onSnapshot(
    doc(db, 'config', 'app'),
    (snap) => {
      const d = snap.data()
      // missing doc → stay locked (safe default)
      maintenance.value = d ? d.maintenance !== false : true
      configLoaded.value = true
    },
    (e) => { console.error('[appConfig]', e); configLoaded.value = true },
  )
}

export function useAppConfig() {
  return { maintenance, configLoaded }
}
