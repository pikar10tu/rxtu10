// dailyQuest — pure: เควสต์รายวัน (reset แบบ write-time, ไม่ต้อง cron)
export const QUEST_GOALS = { quiz: 5, study: 5, gacha: 1 }
export const BUFF_MS = 24 * 60 * 60 * 1000

const fresh = (today) => ({ date: today, quiz: 0, study: 0, gacha: 0, claimed: false })

// คืน object ใหม่: ถ้าข้ามวัน รีเซ็ตก่อน แล้ว +n ที่ field
export function bumpDailyQuest(dq, field, today, n = 1) {
  const base = (dq && dq.date === today)
    ? { date: dq.date, quiz: dq.quiz || 0, study: dq.study || 0, gacha: dq.gacha || 0, claimed: !!dq.claimed }
    : fresh(today)
  base[field] = (base[field] || 0) + n
  return base
}

export function questComplete(dq, today) {
  return !!dq && dq.date === today
    && (dq.quiz || 0) >= QUEST_GOALS.quiz
    && (dq.study || 0) >= QUEST_GOALS.study
    && (dq.gacha || 0) >= QUEST_GOALS.gacha
}

export function questClaimable(dq, today) {
  return questComplete(dq, today) && !dq.claimed
}

// true = วันนี้ยังไม่กดรับรางวัลเควส (ใช้ขับจุดแดงบนปุ่ม header)
export function questNotClaimed(dq, today) {
  return !(dq && dq.date === today && dq.claimed)
}

export function questIncomeMult(userData, now) {
  const until = userData?.incomeBuffUntil
  return (until && now < until) ? 1.5 : 1
}
