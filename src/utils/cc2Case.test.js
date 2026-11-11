import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { validateCase, parseBlanks, checkBlank, sanitizeHtml, scoreCase, blankPlaceholders, splitExaminerOnly, caseSections } from './cc2Case.js'

test('เคสทุกไฟล์ใน content/cc2/cases ผ่านการตรวจรูปแบบ + id ไม่ซ้ำ', () => {
  const dir = 'content/cc2/cases'
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  assert.ok(files.length > 0)
  const ids = new Set()
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))
    assert.deepEqual(validateCase(c, f), [], f)
    assert.ok(!ids.has(c.id), 'id ซ้ำ ' + c.id); ids.add(c.id)
  }
})

test('รูปที่เคสอ้างถึงมีไฟล์จริง', () => {
  const dir = 'content/cc2/cases'
  for (const f of fs.readdirSync(dir)) {
    for (const m of fs.readFileSync(`${dir}/${f}`, 'utf8').matchAll(/\/cc2\/img\/([\w-]+\.webp)/g))
      assert.ok(fs.existsSync('public/cc2/img/' + m[1]), `${f} → ${m[1]}`)
  }
})

test('parseBlanks + checkBlank', () => {
  const b = parseBlanks('1.1 ภาพ: [BLANK: Liniments, Liniment | 1.25 | ข้อ 1.1 | len: m] และ [BLANK: Mottling | 1 | ข้อ 2]')
  assert.equal(b.length, 2)
  assert.deepEqual(b[0].answers, ['Liniments', 'Liniment'])
  assert.equal(b[0].score, 1.25)
  assert.equal(b[1].label, 'ข้อ 2')
  assert.ok(checkBlank(b[0], ' liniment '))
  assert.ok(!checkBlank(b[0], 'lotion'))
  assert.ok(!checkBlank(b[0], ''))
})

test('sanitizeHtml ตัดสคริปต์/อีเวนต์/รูปนอกระบบ คงตาราง', () => {
  const out = sanitizeHtml('<p onclick="x()" style="color:red">a</p><script>alert(1)</script><img src="https://evil/x.png" onerror="y"><img src="/cc2/img/OS-0001-1.webp"><td colspan="2">x</td><iframe src="z"></iframe>')
  assert.equal(out, '<p style="color:red">a</p><img /><img src="/cc2/img/OS-0001-1.webp" /><td colspan="2">x</td>')
})

test('scoreCase รวมเช็คลิสต์ที่ติ๊ก + ช่องเติมคำที่ถูก', () => {
  const c = { checklist: [{ t: 'a', s: 1 }, { t: 'b', s: 2 }, { t: 'c', s: 0.5 }], scenario: 'x [BLANK: Caking | 1.25 | ข้อ 1] y [BLANK: Mottling | 1.25 | ข้อ 2]' }
  assert.deepEqual(scoreCase(c, {}, {}), { got: 0, tot: 6 })
  assert.deepEqual(scoreCase(c, { 0: true, 2: true }, { 0: ' caking ', 1: 'wrong' }), { got: 2.75, tot: 6 })
  assert.deepEqual(scoreCase(c, { 0: true, 1: true, 2: true }, { 0: 'Caking', 1: 'mottling' }), { got: 6, tot: 6 })
  // ใช้ blanks ที่ build ไว้แล้วก่อน ถ้ามี
  assert.deepEqual(scoreCase({ checklist: [], blanks: [{ i: 0, answers: ['A'], score: 3 }], scenario: '[BLANK: B | 9 | x]' }, {}, { 0: 'a' }), { got: 3, tot: 3 })
  assert.deepEqual(scoreCase({ rest: true, checklist: [] }), { got: 0, tot: 0 })
  assert.deepEqual(scoreCase(null), { got: 0, tot: 0 })
})

test('scoreCase ของทุกเคสที่ build แล้ว: ติ๊กครบ = tot ใน index', () => {
  if (!fs.existsSync('public/cc2/index.json')) return
  const { cases } = JSON.parse(fs.readFileSync('public/cc2/index.json', 'utf8'))
  for (const m of cases) {
    const c = JSON.parse(fs.readFileSync(`public/cc2/cases/${m.id}.json`, 'utf8'))
    const checks = Object.fromEntries(c.checklist.map((_, i) => [i, true]))
    const answers = Object.fromEntries(c.blanks.map(b => [b.i, b.answers[0]]))
    const r = scoreCase(c, checks, answers)
    assert.equal(r.got, r.tot, m.id)
    assert.equal(r.tot, Math.round(m.tot * 100) / 100, m.id)
  }
})

test('blankPlaceholders ซ่อนเฉลยในมาร์กเกอร์ แสดงแค่ป้าย', () => {
  const out = blankPlaceholders('<p>1.1 ภาพ: [BLANK: Liniments, Liniment | 1.25 | ข้อ 1.1 | len: m]</p><p>[BLANK: X<b> | 1 | ]</p>')
  assert.ok(!/Liniment/.test(out))
  assert.equal(out, '<p>1.1 ภาพ: <span class="cc2-blank">▢ ข้อ 1.1</span></p><p><span class="cc2-blank">▢ ช่อง 1</span></p>')
})

test('splitExaminerOnly ดึงบทผู้ป่วยจำลอง/ข้อมูลสำหรับผู้ประเมินออก', () => {
  const html = '<p>บทบาทผู้ป่วยจำลอง: ชายหนุ่ม แจ้งว่า &quot;เจ็บคอ&quot;</p><ul><li>ข้อมูลผู้ป่วย: ชาย 25 ปี</li><li>ข้อมูลสำหรับผู้ประเมิน: ตรวจคอพบหนอง</li></ul><ul><li>ข้อมูลสำหรับผู้ประเมิน: ลับ</li></ul>'
  const r = splitExaminerOnly(html)
  assert.equal(r.html, '<ul><li>ข้อมูลผู้ป่วย: ชาย 25 ปี</li></ul>')
  assert.ok(/บทบาทผู้ป่วยจำลอง/.test(r.examinerHtml) && /ตรวจคอพบหนอง/.test(r.examinerHtml) && /ลับ/.test(r.examinerHtml))
  assert.ok(!/ชาย 25 ปี/.test(r.examinerHtml))
})

test('caseSections แยกชิ้นข้อมูลที่ผู้ประเมินส่ง + gate', () => {
  const c = {
    gated: ['patient', 'equipment'],
    patientHtml: '<p>(ส่งโดยผู้ประเมิน: ข้อมูล 1 -&nbsp;&nbsp;ประวัติผู้ป่วย)</p><p>บทบาทผู้ป่วยจำลอง: หญิง</p><ul><li>อายุ 26 ปี</li></ul><p>(ส่งโดยผู้ประเมิน: ข้อมูล 2 -&nbsp;&nbsp;บัตรแพ้ยา) </p><p><img src="cc2/img/OS-0164-1.webp" /></p>',
    equipmentHtml: '<p>รายการยา</p>',
  }
  const s = caseSections(c)
  assert.equal(s.patient.length, 2)
  assert.deepEqual(s.patient.map(p => [p.key, p.label, p.gated]), [['patient:1', 'ข้อมูล 1 · ประวัติผู้ป่วย', true], ['patient:2', 'ข้อมูล 2 · บัตรแพ้ยา', true]])
  assert.equal(s.patient[0].html, '<ul><li>อายุ 26 ปี</li></ul>')
  assert.ok(/บทบาทผู้ป่วยจำลอง/.test(s.patient[0].examinerHtml))
  assert.ok(/OS-0164-1/.test(s.patient[1].html))
  assert.equal(s.equipment.key, 'equipment'); assert.equal(s.equipment.gated, true)
  assert.deepEqual(s.gateKeys, ['patient:1', 'patient:2', 'equipment'])
  // ไม่ gate + ไม่มีมาร์กเกอร์ → ชิ้นเดียว key 'patient'
  const p = caseSections({ gated: [], patientHtml: '<p>นางสมศรี</p>', equipmentHtml: '' })
  assert.deepEqual(p.patient.map(x => [x.key, x.gated, x.html]), [['patient', false, '<p>นางสมศรี</p>']])
  assert.equal(p.equipment, null); assert.deepEqual(p.gateKeys, [])
  assert.deepEqual(caseSections({}).patient, [])
})

test('ทุกเคส gated ที่ build แล้ว: ผู้สอบไม่เห็นบทผู้ป่วยจำลองในส่วนที่ส่งให้', () => {
  if (!fs.existsSync('public/cc2/index.json')) return
  const { cases } = JSON.parse(fs.readFileSync('public/cc2/index.json', 'utf8'))
  let gatedN = 0
  for (const m of cases) {
    const c = JSON.parse(fs.readFileSync(`public/cc2/cases/${m.id}.json`, 'utf8'))
    const s = caseSections(c)
    if (c.gated?.length) { gatedN++; assert.ok(s.gateKeys.length > 0, m.id) }
    for (const p of s.patient) {
      assert.ok(!/บทบาทผู้ป่วยจำลอง|ข้อมูลสำหรับผู้ประเมิน|ส่งโดยผู้ประเมิน/.test(p.html), `${m.id} ${p.key} หลุดข้อความผู้ประเมิน`)
    }
  }
  assert.ok(gatedN >= 20)
})
