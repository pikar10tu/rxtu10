// 📰 ตลาดสมุนไพรรายวัน — ข่าว + ราคาวันนี้ (คำนวณในเครื่องจาก seed วันที่ ดู data/farmMarket.js)
// + โพสต์ข่าวลงกระดานรุ่นวันละครั้ง: คนแรกของวันเขียน news/farm-YYYY-MM-DD (rules รับ create ครั้งเดียว · คนถัดไปโดนปฏิเสธเงียบๆ)
import { ref, computed } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { getCrop } from '../data/crops.js'
import { marketOf, marketDayNo, boostPct, boosted, newsMsg, newsDocId } from '../data/farmMarket.js'

const nameOf = (id) => getCrop(id)?.name || id
const day = ref(marketDayNo())
// ข้ามเที่ยงคืนระหว่างเปิดหน้าค้าง → เดินวันใหม่เอง (ตัวจับเวลาเดียวทั้งแอป)
let ticking = false
function tick() {
  if (ticking || typeof window === 'undefined') return
  ticking = true
  setInterval(() => { const d = marketDayNo(); if (d !== day.value) day.value = d }, 30_000)
}

const market = computed(() => marketOf(day.value, nameOf))

export function useFarmMarket() {
  tick()
  return {
    market,
    nameOf,
    /** % ราคาขึ้นวันนี้ของพืช (0 = ปกติ) */
    pctOf: (cropId) => boostPct(cropId, market.value),
    /** ราคาขายจริงวันนี้ (ใส่ราคาฐาน — ใช้ได้ทั้งพืชปกติและพืชทอง) */
    priceOf: (cropId, base) => boosted(base, boostPct(cropId, market.value)),
  }
}

/** โพสต์ข่าวของวันลงกระดานรุ่น — ลองครั้งเดียวต่อเครื่องต่อวัน · พลาดก็เงียบ (มีคนโพสต์ไปแล้ว = ปกติ) */
export async function postFarmNewsOnce() {
  const id = newsDocId()
  const flag = 'farmNews:' + id
  try { if (localStorage.getItem(flag)) return } catch { /* storage ปิด = ลองต่อ */ }
  try { localStorage.setItem(flag, '1') } catch { /* ไม่เป็นไร */ }
  try {
    await setDoc(doc(db, 'news', id), { msg: newsMsg(market.value, nameOf), icon: '📰', type: 'farm', ts: serverTimestamp() })
  } catch { /* permission-denied = มีโพสต์ของวันนี้แล้ว */ }
}
