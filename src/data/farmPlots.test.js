import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_PLOTS, PLOT_UNLOCK_COST, plotUnlockCost, nextPlotInfo } from './farmPlots.js'

test('MAX_PLOTS = 20 เท่าเพดานเลเวลบ้านสูงสุด', async () => {
  assert.equal(MAX_PLOTS, 20)
  const { residencePlots, MAX_RESIDENCE_LEVEL } = await import('./residence.js')
  assert.equal(residencePlots(MAX_RESIDENCE_LEVEL), MAX_PLOTS)
  assert.equal(PLOT_UNLOCK_COST.length, MAX_PLOTS + 1, 'ทุกแปลงต้องมีราคา')
})

test('แปลงที่ 1 ฟรี, ราคาแพงขึ้นเรื่อยๆ (strictly increasing)', () => {
  assert.equal(plotUnlockCost(1), 0)
  let prev = plotUnlockCost(2)
  for (let n = 3; n <= MAX_PLOTS; n++) {
    const c = plotUnlockCost(n)
    assert.ok(c > prev, `แปลง ${n} (${c}) ต้องแพงกว่าแปลง ${n - 1} (${prev})`)
    prev = c
  }
})

test('แปลงช่วงต้นราคาถูกตามดีไซน์ (2=100, 3=300)', () => {
  assert.equal(plotUnlockCost(2), 100)
  assert.equal(plotUnlockCost(3), 300)
  assert.equal(plotUnlockCost(12), 700000)
})

test('plotUnlockCost นอกช่วง → null', () => {
  assert.equal(plotUnlockCost(0), null)
  assert.equal(plotUnlockCost(21), null)
  assert.equal(plotUnlockCost(20), 1200000)
  assert.equal(plotUnlockCost(-1), null)
})

test('nextPlotInfo: ปลดได้เมื่อยังไม่ชนเพดาน & เงินพอ', () => {
  const info = nextPlotInfo({ plotsUnlocked: 1, ceiling: 4, coins: 500 })
  assert.equal(info.canUnlock, true)
  assert.equal(info.reason, 'ok')
  assert.equal(info.nextPlot, 2)
  assert.equal(info.cost, 100)
})

test('nextPlotInfo: เงินไม่พอ → notEnoughCoins (canUnlock=false แต่ยังบอก cost)', () => {
  const info = nextPlotInfo({ plotsUnlocked: 1, ceiling: 4, coins: 50 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'notEnoughCoins')
  assert.equal(info.nextPlot, 2)
  assert.equal(info.cost, 100)
})

test('nextPlotInfo: ชนเพดานเลเวลบ้าน → atCeiling', () => {
  const info = nextPlotInfo({ plotsUnlocked: 4, ceiling: 4, coins: 999999 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'atCeiling')
})

test('nextPlotInfo: ปลดครบ 15 แต่บ้านยังไม่ถึง 16 → atCeiling (ไม่ใช่ maxed แล้ว)', () => {
  assert.equal(nextPlotInfo({ plotsUnlocked: 15, ceiling: 15, coins: 9e9 }).reason, 'atCeiling')
  assert.equal(nextPlotInfo({ plotsUnlocked: 15, ceiling: 16, coins: 9e9 }).cost, 900000)
})

test('nextPlotInfo: ปลดครบ 20 → maxed (nextPlot/cost = null)', () => {
  const info = nextPlotInfo({ plotsUnlocked: 20, ceiling: 20, coins: 999999 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'maxed')
  assert.equal(info.nextPlot, null)
  assert.equal(info.cost, null)
})
