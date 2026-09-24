// โหลด achievements ของใครก็ได้ 1 query แล้วแปลงเป็นรายการพร้อมโชว์
// ใช้ร่วมกัน: AchievementGrid (ถ้าไม่ได้ส่ง items มา) · ProfileModal (ตู้โชว์ + ฉายา + กริดที่พับไว้ = query เดียว)
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { getAchievement } from '../data/achievements.js'
import { achievementTitle as titleOf } from '../utils/achievements.js'

export async function fetchAchievementItems(uid) {
  if (!uid) return []
  const snap = await getDocs(query(collection(db, 'users', uid, 'achievements'), orderBy('earnedAt', 'desc')))
  useUsageStore().track(snap.size)
  return snap.docs.map(d => {
    const data = d.data()
    const def = getAchievement(data.achId) || { title: data.achId, icon: '🏅', desc: '', flavor: '' }
    return {
      docId: d.id, icon: def.icon, desc: def.desc, flavor: def.flavor || '',
      earnedAt: data.earnedAt || null, label: titleOf(def, data.date || null),
    }
  })
}
