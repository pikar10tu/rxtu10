import { describe, it, expect } from 'vitest'
import { matchupOf } from './matchup.js'

describe('matchupOf', () => {
  const foes = [{ element: 'scissors' }, { element: 'scissors' }, { element: 'paper' }]
  it('นับชนะทาง/แพ้ทางตามสาย', () => {
    expect(matchupOf('fist', foes)).toEqual({ win: 2, lose: 1 })
    expect(matchupOf('paper', foes)).toEqual({ win: 0, lose: 2 })
    expect(matchupOf('scissors', foes)).toEqual({ win: 1, lose: 0 })
  })
  it('ไม่มีศัตรู/ข้อมูลไม่ครบ = 0', () => {
    expect(matchupOf('fist', [])).toEqual({ win: 0, lose: 0 })
    expect(matchupOf('fist', null)).toEqual({ win: 0, lose: 0 })
    expect(matchupOf(undefined, foes)).toEqual({ win: 0, lose: 0 })
  })
})
