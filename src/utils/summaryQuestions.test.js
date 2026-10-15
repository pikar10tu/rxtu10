import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { buildSummaryQuestions, SUMMARY_SUB, summarySourceText, summaryQuestionId } from './summaryQuestions.js'
import { isValidSub, isPleGroupKey } from '../data/plecc.js'
import { computeStatus, needsReviewBy } from './questionReview.js'

const manifest = JSON.parse(readFileSync(new URL('../../content/summaries/manifest.json', import.meta.url), 'utf8'))
const dir = new URL('../data/summaries/', import.meta.url)

test('หัวข้อย่อยทุกเรื่องสะกดตรงทะเบียน plecc', () => {
  for (const [id, sub] of Object.entries(SUMMARY_SUB)) {
    const g = manifest.find(m => m.id === id)?.g
    assert.ok(isPleGroupKey(g), `${id}: group ${g}`)
    assert.ok(isValidSub(g, sub), `${id}: sub "${sub}" ไม่อยู่ในกลุ่ม ${g}`)
  }
})

test('ทุกข้อจากสรุปแปลงได้ ครบ ไม่ถูกตัด และผ่านตรวจแบบไม่มีใครได้เครดิต', async () => {
  let n = 0
  const ids = new Set()
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const doc = (await import(pathToFileURL(new URL(f, dir).pathname.replace(/^\/([A-Z]:)/, '$1')).href)).default
    const meta = manifest.find(m => m.id === doc.id)
    for (const { id, row } of buildSummaryQuestions(doc, meta)) {
      n++
      assert.ok(!ids.has(id), `id ซ้ำ ${id}`); ids.add(id)
      const src = doc.questions[Number(id.split('-').pop()) - 1]
      assert.equal(row.question, (src.case ? `${src.case}\n\n${src.q}` : src.q).trim(), `${id} โจทย์ถูกตัด`)
      assert.equal(row.choices.length, src.o.length)
      assert.ok(row.answer >= 0 && row.answer < row.choices.length, `${id} เฉลยเกินตัวเลือก`)
      assert.ok(row.pleGroup && row.pleSub, `${id} ไม่มีกลุ่มโรค`)
      assert.equal(computeStatus(row), 'passed')
      assert.deepEqual(row.reviewedBy, [])
      assert.equal(row.isPublished, true)
      assert.equal(needsReviewBy(row, 'someone'), false, `${id} หลุดเข้าคิวตรวจ`)
    }
  }
  assert.ok(n > 300, `ได้แค่ ${n} ข้อ`)
})

test('ข้อความที่มา', () => {
  assert.equal(summarySourceText({ source: 'summary', summaryTitle: 'Gout', summaryAuthors: ['ก', 'ข'] }), 'จากสรุป Gout ของ ก, ข')
  assert.equal(summarySourceText({ source: 'import' }), '')
  assert.equal(summaryQuestionId('gout', 0), 'sum-gout-1')
})
