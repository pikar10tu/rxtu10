import { computed } from 'vue'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { residencePlots, getTier } from '../data/residence.js'
import {
  getCrop, cropsForSeedTier, effectiveGrowMs, fertilizerCost,
} from '../data/crops.js'

/**
 * Farming logic bound to the logged-in user.
 *   farm = { plots: [ null | {seedId, plantedAt, watered, fertilized} ], inventory: {cropId:qty} }
 * Plot count is derived from residence level. Plot actions write the whole
 * plots array (Firestore can't patch an array index) + coins via increment.
 */
export function useFarm() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const level     = computed(() => auth.userData?.residence?.level || 1)
  const plotCount = computed(() => residencePlots(level.value))
  const maxTier   = computed(() => getTier(level.value).maxSeedTier)

  const inventory = computed(() => auth.userData?.farm?.inventory || {})

  // normalized plots array of length plotCount (null = empty)
  const plots = computed(() => {
    const raw = auth.userData?.farm?.plots || []
    return Array.from({ length: plotCount.value }, (_, i) => raw[i] || null)
  })

  const seedChoices = computed(() => cropsForSeedTier(maxTier.value))

  // ── plot status (pass a live `now` ms for reactivity) ──
  function status(plot, now) {
    if (!plot) return { empty: true }
    const crop = getCrop(plot.seedId)
    const total = effectiveGrowMs(plot)
    const elapsed = now - (plot.plantedAt || now)
    const ready = elapsed >= total
    const progress = Math.max(0, Math.min(1, total ? elapsed / total : 1))
    const remainingMs = Math.max(0, total - elapsed)
    return { empty: false, crop, ready, progress, remainingMs }
  }

  // ── persistence helper: optimistic + Firestore ──
  async function commit(newPlots, { coinDelta = 0, inventory: newInv } = {}) {
    if (!auth.currentUser) return
    const farm = { ...(auth.userData?.farm || {}), plots: newPlots }
    if (newInv) farm.inventory = newInv
    auth.blockSnapshot()
    auth.setUserDataOptimistic({
      farm,
      ...(coinDelta ? { coins: (auth.userData?.coins || 0) + coinDelta } : {}),
    })
    const patch = { 'farm.plots': newPlots }
    if (newInv) patch['farm.inventory'] = newInv
    if (coinDelta) patch.coins = increment(coinDelta)
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), patch)
    } catch (e) {
      console.error('[farm commit]', e)
      toast('บันทึกฟาร์มไม่สำเร็จ', 'error')
    }
  }

  function clonePlots() { return plots.value.map(p => (p ? { ...p } : null)) }

  async function plant(i, seedId) {
    const crop = getCrop(seedId)
    if (!crop) return
    if (plots.value[i]) { toast('แปลงนี้มีพืชอยู่แล้ว', 'info'); return }
    if ((auth.userData?.coins || 0) < crop.seedCost) {
      toast(`เหรียญไม่พอ! เมล็ด ${crop.name} ราคา ${crop.seedCost}🪙`, 'error'); return
    }
    const next = clonePlots()
    next[i] = { seedId, plantedAt: Date.now(), watered: false, fertilized: false }
    await commit(next, { coinDelta: -crop.seedCost })
    toast(`ปลูก ${crop.emoji} ${crop.name} แล้ว`, 'success')
  }

  async function water(i) {
    const p = plots.value[i]
    if (!p || p.watered) return
    const next = clonePlots()
    next[i] = { ...next[i], watered: true }
    await commit(next)
    toast('รดน้ำแล้ว 💧 (โตเร็วขึ้น)', 'success')
  }

  async function fertilize(i) {
    const p = plots.value[i]
    if (!p || p.fertilized) return
    const cost = fertilizerCost(p.seedId)
    if ((auth.userData?.coins || 0) < cost) { toast(`เหรียญไม่พอ! ปุ๋ย ${cost}🪙`, 'error'); return }
    const next = clonePlots()
    next[i] = { ...next[i], fertilized: true }
    await commit(next, { coinDelta: -cost })
    toast(`ใส่ปุ๋ยแล้ว 🌟 (−${cost}🪙)`, 'success')
  }

  async function harvest(i) {
    const p = plots.value[i]
    if (!p) return
    const st = status(p, Date.now())
    if (!st.ready) { toast('ยังโตไม่เต็มที่', 'info'); return }
    const next = clonePlots()
    next[i] = null
    const inv = { ...inventory.value }
    inv[p.seedId] = (inv[p.seedId] || 0) + 1
    await commit(next, { inventory: inv })
    toast(`เก็บเกี่ยว ${st.crop.emoji} ${st.crop.name}!`, 'success')
  }

  async function sell(cropId, qty = null) {
    const have = inventory.value[cropId] || 0
    const n = qty == null ? have : Math.min(qty, have)
    if (n <= 0) return
    const crop = getCrop(cropId)
    const gain = crop.sellPrice * n
    const inv = { ...inventory.value }
    inv[cropId] = have - n
    if (inv[cropId] <= 0) delete inv[cropId]
    await commit(clonePlots(), { coinDelta: gain, inventory: inv })
    toast(`ขาย ${crop.emoji} ×${n} = +${gain.toLocaleString()}🪙`, 'success')
  }

  async function sellAll() {
    const inv = inventory.value
    let gain = 0
    for (const [id, qty] of Object.entries(inv)) {
      const c = getCrop(id); if (c) gain += c.sellPrice * qty
    }
    if (gain <= 0) { toast('ไม่มีผลผลิตให้ขาย', 'info'); return }
    await commit(clonePlots(), { coinDelta: gain, inventory: {} })
    toast(`ขายทั้งหมด +${gain.toLocaleString()}🪙`, 'success')
  }

  return {
    level, plotCount, plots, inventory, seedChoices, maxTier,
    status, fertilizerCost,
    plant, water, fertilize, harvest, sell, sellAll,
  }
}
