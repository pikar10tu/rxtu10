// รวม src/data/dollParts.js + src/utils/dollRender.js + src/utils/doll.js เป็นสคริปต์เดียว (ตัดบรรทัด import/export)
// ให้หน้าเดโมบน artifact ใช้โค้ดชุดเดียวกับเว็บจริง
import { readFileSync, writeFileSync } from 'node:fs'
const root = new URL('../../../src/', import.meta.url)
const strip = (p) => readFileSync(new URL(p, root), 'utf8')
  .split('\n').filter(l => !/^import .* from /.test(l)).join('\n')
  .replace(/^export (const|function) /gm, '$1 ')
const js = [strip('data/dollParts.js'), strip('utils/dollRender.js'), strip('utils/doll.js')].join('\n;\n')
const tpl = readFileSync(new URL('./template.html', import.meta.url), 'utf8')
writeFileSync(new URL('./index.html', import.meta.url), tpl.replace('/*__DOLL_CODE__*/', js))
console.log('ok', js.length)
