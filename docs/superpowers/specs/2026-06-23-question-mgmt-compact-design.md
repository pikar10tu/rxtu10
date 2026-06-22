# Spec: หน้าจัดการข้อสอบแบบกระชับ + ภาพรวมคลัง — SP2a

วันที่: 2026-06-23 · สถานะ: **ดีไซน์อนุมัติแล้ว** (เคาะกับเจ้าของโปรเจกต์ในเซสชัน)

## ที่มา & เป้าหมาย
วิชาการบอกว่าหน้าจัดการข้อสอบ (`QuestionsView`) **ไล่ดูยาก** เพราะ list เป็นการ์ดเต็มแนวตั้ง (ทุกข้อโชว์โจทย์+ตัวเลือกครบ+เฉลย) ต้อง scroll ยาว. ทำให้ browse คลังกระชับขึ้น + เห็นภาพรวมคลังเร็ว ๆ.

นี่คือ **sub-project SP2a** ของแผน "Academic/Instructor workflow". **SP2b** = สถิติรายข้อ (%ถูกจาก `questionStats/{qid}` counters + จำนวน report ต่อข้อ → badge บนแถว) จะ design+build แยกทีหลัง (มี backend: rules + QuizView + collection ใหม่). SP2a เป็น **frontend ล้วน ไม่มี backend/cost**.

## ขอบเขต (scope)
**ทำ:** list การ์ดเต็ม → แถวย่อ + กางดู (accordion ทีละข้อ) · ย้ายตัวเลือก/เฉลย/คอมเมนต์/ปุ่มแก้-ลบ เข้าส่วนกาง · header ภาพรวมคลัง (นับจากข้อที่โหลดอยู่) · `utils/questionBankStats.js` pure+เทส
**ไม่ทำ (defer/นอกขอบเขต):** สถิติรายข้อ %ถูก / จำนวน report ต่อข้อ / badge ปัญหา = **SP2b** · ไม่แตะ rules / schema / QuizView / migration · ไม่แตะ logic ค้นหา-กรอง-แบ่งหน้า-batch (reuse ทั้งหมด)

---

## Decisions (เคาะแล้ว)
1. **Accordion ทีละข้อ** — เปิดข้อใหม่ปิดข้อเก่าอัตโนมัติ (1 `expandedId`). กัน comment โหลดหลายข้อพร้อมกัน + อ่านง่าย.
2. **คอมเมนต์ (SP1) ย้ายเข้าส่วนกาง** — เลิกปุ่ม 💬 เดี่ยว; `QuestionComments` render เมื่อแถวถูกกาง (lazy เหมือนเดิม โหลดตอนกาง). `commentOpenId` เดิม → แทนด้วย `expandedId`.
3. **โจทย์บนแถวย่อตัดบรรทัดเดียว** (CSS line-clamp) — กางเห็นเต็ม.
4. **ภาพรวมคลังนับจาก `list` ที่โหลดอยู่แล้ว** — ไม่ยิง read เพิ่ม.

## โครงแถว (UX)
```
แถวย่อ (collapsed):
  ☐  [เผยแพร่]  [Care]  ยาลดความดันกลุ่ม ACEI ตัวใดที่...   ▸
  (checkbox · status badge · domain chip · โจทย์ตัดบรรทัดเดียว · chevron)

กาง (expanded, accordion):
  • ตัวเลือก a–d (เฉลยไฮไลต์เขียว)  ← .qz-choices เดิม
  • คำอธิบาย                        ← .qz-exp เดิม
  • <QuestionComments :questionId>  ← SP1 component, โหลดตอนกาง
  • [แก้ไข] [ลบ]                    ← ปุ่มเดิม ย้ายมาที่นี่

Header ภาพรวม:
  📊 ทั้งหมด 87 ข้อ · เผยแพร่ 72 · ร่าง 15 · Care 40 · Sci 30 · Law 12 · ไม่ระบุ 5
```

---

## งานที่ต้องทำ (ราย task)

### Task 1 — `src/utils/questionBankStats.js` (pure + เทส)
- `bankStats(list)` → `{ total, published, draft, byDomain }`
  - `total` = `list.length`
  - `published` = นับ `q.isPublished === true` · `draft` = `total - published`
  - `byDomain` = นับตาม `q.domain` โดยวนจาก `DOMAIN_KEYS` (`src/data/domains.js`) เสมอ + bucket `none` สำหรับข้อที่ `q.domain` ว่าง/ไม่อยู่ใน keys (ทน domain เพิ่มใหม่ ไม่ต้องแก้ logic — แพทเทิร์นเดียวกับ `examStats.js`)
  - ทน `list` ไม่ใช่ array → คืนค่า 0 ทั้งหมด
- `questionBankStats.test.js`: total/published/draft, byDomain รวม none, ทน non-array, ทน domain แปลก ๆ ลง none — รัน `node --test`

### Task 2 — `src/views/QuestionsView.vue`: แถวย่อ + กาง (accordion) + ย้ายคอมเมนต์
แก้ block `<ul class="qz-list">` (บรรทัด ~206–228 ปัจจุบัน):
- แทน `commentOpenId` ด้วย `expandedId` (ref): เปลี่ยน `const commentOpenId = ref(null)` → `const expandedId = ref(null)` และ helper `toggleExpand(id)` = `expandedId.value = expandedId.value === id ? null : id`
- โครงแถวใหม่:
  ```html
  <li v-for="q in visible" :key="q.id" class="qz-item" :class="{ sel: selected.has(q.id), open: expandedId === q.id }">
    <div class="qz-row" @click="toggleExpand(q.id)">
      <input class="qz-check-item" type="checkbox" :checked="selected.has(q.id)" @click.stop @change="toggleSelect(q.id)" />
      <span class="qz-badge" :class="q.isPublished ? 'pub' : 'draft'">{{ q.isPublished ? 'เผยแพร่' : 'ร่าง' }}</span>
      <span v-if="q.domain" class="qz-cat">{{ q.domain }}</span>
      <span class="qz-row-q">{{ q.question }}</span>
      <span class="qz-chev" :class="{ open: expandedId === q.id }">▸</span>
    </div>
    <div v-if="expandedId === q.id" class="qz-detail">
      <span v-if="q.category" class="qz-cat qz-cat-sm">{{ q.category }}</span>
      <ul class="qz-choices">
        <li v-for="(c, i) in q.choices" :key="i" :class="{ correct: i === q.answer }">
          <span class="qz-c-letter">{{ LETTERS[i] }}</span>{{ c }}
        </li>
      </ul>
      <div v-if="q.explanation" class="qz-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
      <QuestionComments :questionId="q.id" />
      <div class="qz-detail-actions">
        <button class="qz-mini" @click="edit(q)">แก้ไข</button>
        <button class="qz-mini qz-danger" @click="remove(q)">ลบ</button>
      </div>
    </div>
  </li>
  ```
- **`@click.stop` บน checkbox** (กันคลิก checkbox ไป trigger expand) · `edit/remove` อยู่ใน `.qz-detail` (ไม่ต้อง stop เพราะไม่อยู่บน `.qz-row`)
- `QuestionComments` render ใน `.qz-detail` (มี `v-if="expandedId === q.id"` ครอบ) → mount=โหลด lazy ตอนกาง (พฤติกรรมเดิม)
- ลบปุ่ม 💬 เดี่ยว + `.qz-item-actions`/`.qz-item-top` block เดิมออก (แทนด้วย `.qz-row`)
- CSS ใหม่ (scoped): `.qz-row` (flex, cursor pointer, gap, align center), `.qz-row-q` (flex:1, `line-clamp` 1 บรรทัด: `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`), `.qz-chev` (transition transform; `.open { transform: rotate(90deg) }`), `.qz-detail` (padding-top + border-top dashed), `.qz-detail-actions` (flex gap). คง `.qz-choices/.qz-exp/.qz-badge/.qz-cat` เดิม

### Task 3 — `src/views/QuestionsView.vue`: header ภาพรวมคลัง
- import `bankStats` จาก `../utils/questionBankStats.js` · computed `const bank = computed(() => bankStats(list.value))`
- ชื่อ domain ใช้ label จาก `DOMAINS` (QuestionsView import `DOMAINS` อยู่แล้ว): `DOMAINS[key]?.label || key`
- วาง header เหนือ `.qz-filters` (บรรทัด ~161) **ใน `<template v-else>`** (เห็นเฉพาะ isQuestionEditor หลังโหลด) — แสดงเมื่อ `list.length`:
  ```html
  <div v-if="list.length" class="qz-overview">
    <Emoji char="📊" /> ทั้งหมด <b>{{ bank.total }}</b> ข้อ · เผยแพร่ <b>{{ bank.published }}</b> · ร่าง <b>{{ bank.draft }}</b>
    <span class="qz-ov-dom">
      <template v-for="k in DOMAIN_KEYS" :key="k">
        <span v-if="bank.byDomain[k]"> · {{ DOMAINS[k]?.label || k }} {{ bank.byDomain[k] }}</span>
      </template>
      <span v-if="bank.byDomain.none"> · ไม่ระบุ {{ bank.byDomain.none }}</span>
    </span>
  </div>
  ```
- import `DOMAIN_KEYS` เพิ่มจาก `../data/domains.js` (ถ้ายังไม่ได้ import — ตรวจ; ปัจจุบัน import แค่ `DOMAINS`)
- CSS `.qz-overview` (กล่องเล็ก font ~.72rem, สีจาง, padding, border-radius, margin-bottom) + `.qz-ov-dom` (สีจางกว่า)

---

## Acceptance criteria
- [ ] list แสดงเป็นแถวย่อ: checkbox · สถานะ · domain · โจทย์บรรทัดเดียว · chevron — ไม่โชว์ตัวเลือก/เฉลยจนกว่าจะกาง
- [ ] กดแถว → กางเห็นตัวเลือก(เฉลยไฮไลต์)/คำอธิบาย/คอมเมนต์/ปุ่มแก้-ลบ · กดข้ออื่น → ข้อเดิมปิด (accordion)
- [ ] คลิก checkbox เลือกได้โดย**ไม่**กางแถว (batch publish/ลบ เดิมทำงานปกติ)
- [ ] คอมเมนต์ (SP1) โหลดเฉพาะตอนกางแถว · ปิดแถว = หยุดโหลด/unmount · ไม่มีปุ่ม 💬 เดี่ยวแล้ว
- [ ] header ภาพรวม: ทั้งหมด/เผยแพร่/ร่าง/แยก domain ถูกต้องตาม list ที่โหลด
- [ ] ค้นหา/กรอง status-domain-cat/แบ่งหน้า 50/batch publish-unpublish-delete = ทำงานเหมือนเดิมทุกอย่าง
- [ ] `node --test src/utils/questionBankStats.test.js` เขียว + `npm run build` ผ่าน
- [ ] นักศึกษา/อาจารย์(instructor): instructor ยังเข้าหน้านี้ได้ (isQuestionEditor เดิม) เห็นแถวย่อ+กาง+คอมเมนต์ · report panel ยังซ่อนจาก instructor (isAcademic เดิม)

## หมายเหตุ / กับดัก
- **ไม่แตะ** rules/schema/QuizView/migration — frontend ล้วน, push master = auto-deploy พอ (ไม่ต้อง deploy rules)
- `@click.stop` บน checkbox สำคัญ (ไม่งั้นเลือกข้อแล้วแถวกางทุกที)
- QuestionComments ต้องอยู่ใต้ `v-if="expandedId === q.id"` (ไม่ใช่ render เสมอ) — กัน N getDocs ตอนเปิดหน้า
- โจทย์ยาวมากบนแถวย่อ: line-clamp บรรทัดเดียว + ellipsis (กางเห็นเต็ม)
- header ใช้ `list` (ทั้งคลังที่โหลด) ไม่ใช่ `filtered`/`visible` — ภาพรวมคือทั้งคลัง ไม่ใช่หน้าที่กรอง
- เป็นการแก้ไฟล์ QuestionsView (ปัจจุบัน ~765 บรรทัด + SP1) — ถ้าส่วน list/แถวโตเกินไป พิจารณาแยก `QuestionRow.vue` ได้ แต่ **ไม่บังคับใน SP2a** (YAGNI — การเปลี่ยนอยู่ในขอบเขต template list)

## ความเชื่อมโยง
- ต่อจาก SP1 (instructor + comments) — คอมเมนต์ย้ายเข้าส่วนกางของ SP2a
- SP2b (สถิติรายข้อ) จะเกาะแถวย่อนี้: เพิ่ม badge %ถูก + จำนวน report บน `.qz-row`
