// คิดผลสอบจำลอง — ทุกฐานคิดเป็น % ของคะแนนเต็มฐานนั้นก่อน แล้วรวมเป็น % เฉลี่ย (ทุกฐานน้ำหนักเท่ากัน)
// ตรงกับไฟล์ของทีม: Carbopol เต็ม 11 ถูกแปลงเป็นเต็ม 10 ก่อนรวม 140
export function stationPct(score, max) {
  return max > 0 && Number.isFinite(score) ? Math.max(0, Math.min(1, score / max)) : 0
}

export function overallPct(stations, scores) {
  if (!stations?.length) return 0
  const sum = stations.reduce((a, s, i) => a + stationPct(scores?.[i], s.max), 0)
  return sum / stations.length
}

export function classPct(stations) {
  return overallPct(stations, stations.map(s => s.mean))
}

/** ฐานที่ควรฝึก = ต่ำกว่าค่าเฉลี่ยรุ่นมากที่สุด (เป็น %) · ต่ำกว่าเกณฑ์มาก่อน */
export function weakestStation(stations, scores, passPct) {
  let best = -1, key = Infinity
  stations.forEach((s, i) => {
    const p = stationPct(scores?.[i], s.max)
    const k = (p >= passPct ? 1 : 0) * 10 + (p - stationPct(s.mean, s.max))
    if (k < key) { key = k; best = i }
  })
  return best
}
