// ════════════════════════════════════════════════════════════
//  User document schema — single source of truth for defaults,
//  new-account seeding, and read-time normalization + migrations.
//
//  Why: fields used to be defaulted ad-hoc with `userData?.x || default`
//  scattered across the app, and migrations lived inline in the snapshot
//  handler. Centralising here means a view never crashes on a missing
//  field, and one-time migrations have a single home.
// ════════════════════════════════════════════════════════════

// NEUTRAL defaults for an existing account that happens to be missing a
// field. NOTE: coins defaults to 0 here (safe) — the 2000 welcome bonus is
// applied only when SEEDING a brand-new account (see newUserDoc).
export const USER_DEFAULTS = {
  customPhoto: null,
  coins: 0,
  pets: [],
  eggs: [],
  activePet: null,
  activePets: [null, null, null],
  pvpVictories: 0,
  studentId: null,
  nickname: null,
  realName: null,
  track: null,
  quizHigh: 0,
  drugHigh: 0,
  ctHigh: 0,
  towerFloor: 1,
  towerBest: 0,
  towerLastReset: null,
  lastDaily: null,
  contact: { phone: '', ig: '', line: '' },
  likes: 0,
  likedBy: {},
  totalSpent: 0,
  pityClaimedRounds: 0,
  // ── v2 fields ──
  role: 'student',                            // 'student' | 'academic' | 'admin'
  tags: [],                                   // admin-assigned badges
  residence: { level: 1, upgradedAt: null },  // ที่อยู่อาศัย (prestige/coin sink)
  farm: { plots: [], plotCount: 4, inventory: {}, lastTick: null },
  petsVault: [],                              // overflow pets (no income / not battle-eligible)
  study: { cards: {} },                       // SRS flashcard progress
}

export const STARTER_COINS = 2000

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

/** Build the Firestore doc for a brand-new account (welcome bonus + identity). */
export function newUserDoc(user, createdAt) {
  return {
    ...USER_DEFAULTS,
    coins: STARTER_COINS,
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    googlePhoto: user.photoURL,
    createdAt,
  }
}

/**
 * Normalize a raw Firestore user doc into a complete, safe-to-render object:
 * fills every known default, repairs wrong types, deep-defaults nested
 * objects, and runs one-time migrations. Returns null for null/undefined.
 */
export function normalizeUserData(data) {
  if (!data) return null
  const d = { ...USER_DEFAULTS, ...data }

  // migration: legacy single `activePet` → `activePets` slot 0 (once)
  if (data.activePet && !(data.activePets || []).some(Boolean)) {
    d.activePets = [data.activePet, null, null]
  }

  // arrays must be arrays
  d.pets       = Array.isArray(d.pets) ? d.pets : []
  d.eggs       = Array.isArray(d.eggs) ? d.eggs : []
  d.tags       = Array.isArray(d.tags) ? d.tags : []
  d.petsVault  = Array.isArray(d.petsVault) ? d.petsVault : []
  d.activePets = Array.isArray(d.activePets) ? d.activePets : [null, null, null]

  // deep-default nested objects so a missing sub-field can't crash a view
  d.contact   = { ...USER_DEFAULTS.contact,   ...(isObj(data.contact)   ? data.contact   : {}) }
  d.residence = { ...USER_DEFAULTS.residence, ...(isObj(data.residence) ? data.residence : {}) }
  d.farm      = { ...USER_DEFAULTS.farm,      ...(isObj(data.farm)      ? data.farm      : {}) }
  d.study     = { ...USER_DEFAULTS.study,     ...(isObj(data.study)     ? data.study     : {}) }
  d.likedBy   = isObj(data.likedBy) ? data.likedBy : {}

  return d
}
