// ════════════════════════════════════════════════════════════
//  Domain (หมวดใหญ่ของข้อสอบ) — 3 ค่าคงที่ แหล่งความจริงเดียว
//  ใช้ใน: questions.domain, quiz filter, examSessions.domainStats, exam history
// ════════════════════════════════════════════════════════════
export const DOMAINS = [
  { key: 'care', label: 'Care' },
  { key: 'sci',  label: 'Sci'  },
  { key: 'law',  label: 'Law'  },
]
export const DOMAIN_KEYS = DOMAINS.map(d => d.key)
export const isDomainKey = (k) => DOMAIN_KEYS.includes(k)
export const domainLabel = (k) => DOMAINS.find(d => d.key === k)?.label || null
