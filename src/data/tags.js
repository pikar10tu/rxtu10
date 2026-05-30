// ════════════════════════════════════════════════════════════
//  แท็ก (Tags) — admin-assignable badges, some grant perks
// ════════════════════════════════════════════════════════════
//  Stored on the user doc as `tags: ['founder', 'supporter', ...]`.
//  Only an admin can change tags (enforced in Firestore rules).
//  `incomeBonusPct` adds to the daily-income multiplier.
// ════════════════════════════════════════════════════════════

export const TAGS = {
  founder:   { id: 'founder',   label: 'ผู้บุกเบิก',     emoji: '🏅', color: '#f59e0b' },
  supporter: { id: 'supporter', label: 'ซัพพอร์ตเตอร์', emoji: '💖', color: '#ec4899', incomeBonusPct: 20 },
  helper:    { id: 'helper',    label: 'ทีมงาน',         emoji: '🛠️', color: '#3b82f6' },
  og:        { id: 'og',        label: 'รุ่นแรก',         emoji: '⭐', color: '#8b5cf6' },
}

export const TAG_LIST = Object.values(TAGS)
export const getTag = (id) => TAGS[id] || null

/** Total daily-income bonus % granted by a user's tags (e.g. supporter → 20). */
export function incomeBonusFromTags(tags) {
  return (tags || []).reduce((sum, id) => sum + (TAGS[id]?.incomeBonusPct || 0), 0)
}

/** Merge the legacy `founder` boolean into the tags list (back-compat). */
export function effectiveTags(userLike) {
  const t = [...(userLike?.tags || [])]
  if (userLike?.founder && !t.includes('founder')) t.unshift('founder')
  return t
}
