import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_PLOTS, PLOT_UNLOCK_COST, plotUnlockCost, nextPlotInfo } from './farmPlots.js'

test('MAX_PLOTS = 12 เท่าเพดานเลเวลบ้านสูงสุด', () => {
  assert.equal(MAX_PLOTS, 12)
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
  assert.equal(plotUnlockCost(13), null)
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

test('nextPlotInfo: ปลดครบ 12 → maxed (nextPlot/cost = null)', () => {
  const info = nextPlotInfo({ plotsUnlocked: 12, ceiling: 12, coins: 999999 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'maxed')
  assert.equal(info.nextPlot, null)
  assert.equal(info.cost, null)
})
