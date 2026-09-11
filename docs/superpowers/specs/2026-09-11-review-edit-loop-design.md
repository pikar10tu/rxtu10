# ตรวจข้อสอบ: ปิดลูป "ตก → แก้ → ตรวจใหม่" (2026-09-11)

## โจทย์

user แจ้ง 3 เรื่อง:
1. อยาก**แก้ไขข้อสอบได้ตั้งแต่ขั้นตอนตรวจ** — ข้อที่ถูกแก้อาจวนกลับเข้าไปให้คนอื่นตรวจ
2. อยาก**เติม/แก้คำอธิบายเฉลยได้ตอนตรวจ**
3. "ข้อที่ไม่ผ่านมันไม่อยู่ในลูป คือมากองที่แอดมิน"

## สิ่งที่พบตอนสำรวจ

### ลูปไม่ได้แค่ขาด — ปุ่มที่มีอยู่ทำให้แย่ลง

กอง 🔴 "ไม่ผ่านตรวจ" ใน `/review` มีปุ่มเดียวคือ **"↩️ ส่งกลับเข้าคิวตรวจ"** (`ReviewView.vue:344` `requeue()`)
ซึ่งเขียนแค่ `REVIEW_RESET` เปล่าๆ:

1. **ส่งกลับโดยไม่มีการแก้** — ข้อเดิมที่ยังผิดอยู่กลับเข้าคิว คนถัดไปกด "ผิด" อีก วนไม่จบ
2. **แล้วยังลบหลักฐานทิ้ง** — `REVIEW_RESET` ตั้ง `reviewedBy: []` แต่ `priorReviews` กรองด้วย
   `(q.reviewedBy||[]).includes(d.id)` (`ReviewView.vue:430`) ⇒ เหตุผลที่คนก่อนเขียนว่าผิดเพราะอะไร
   **หายจากจอคนตรวจรอบถัดไป** ทั้งที่ subdoc `reviews/{uid}` ยังอยู่ครบในฐานข้อมูล

คนที่จะแก้ข้อต้องเดินไป `/questions` แท็บ "เพิ่ม/แก้" ถึงจะเห็นผลตรวจ (`editReviews`) — คนละหน้ากับที่เห็นรายการ

### 🕳️ รูตรวจงานตัวเอง (ต้องอุดพร้อมกันในงานนี้)

`needsReviewBy()` (`questionReview.js:34`) กันตรวจข้อตัวเองด้วย `createdBy === myUid` เท่านั้น
**ไม่รู้จักคนที่ "แก้" ข้อ** ⇒ พอผู้ตรวจแก้ข้อแล้วล้าง `reviewedBy` เป็น `[]`
บรรทัด 40 `reviewedBy.length < 1` จะเป็น `true` ⇒ **ข้อเด้งกลับเข้าคิวของคนที่เพิ่งแก้มันเอง**
แล้วเขากดผ่านเองได้ทันที — ตาที่สองหายไปทั้งที่เกณฑ์ตั้งใจให้มี

### จุดอื่นที่เจอ (user เลือกเข้ารอบนี้ 3 จาก 5)

| เลือก | จุด | หลักฐาน |
|---|---|---|
| ✅ | คุยกันต่อข้อไม่ได้ตอนตรวจ — `QuestionComments.vue` มีอยู่แล้วแต่ฝังที่ `/questions` เท่านั้น | `QuestionsView.vue:389` |
| ✅ | ไม่มีปุ่ม "นำออก" ตอนตรวจ — ข้อที่แก้ไม่คุ้มต้องเดินไปคลัง | `QuestionsView.vue:983` |
| ✅ | กอง "ไม่มีกลุ่มโรค" เด้งไป `/questions` มือเปล่า ไม่ได้พาไปที่ข้อนั้น | `ReviewView.vue:177` |
| ❌ | ไม่มีตัวนับ "ข้อนี้ตกมากี่รอบ" — user สั่งตัดออก (ต้องเพิ่ม field ใหม่) | — |
| ❌ | ไม่มี claim ว่าใครรับข้อไปแก้ — user สั่งตัดออก | — |

## ขอบเขต

ปิดลูปแก้↔ตรวจในหน้า `/review` + ดึงฟอร์มข้อสอบออกเป็น component ใช้ร่วม

**ไม่แตะ**: เกณฑ์ 1 คนตรวจ/ข้อ · โครง `conflict` ของเก่า · leaderboard · โครงสร้างคิว 2 ก้อน (ต้นทุน read คงที่)

**ไม่ต้อง deploy firestore.rules** — ทั้งสองเส้นทางเขียนผ่านประตูที่มีอยู่แล้ว (พิสูจน์ในหัวข้อ "เส้นทางเขียน")

---

## กฎกลาง: เนื้อหาข้อสอบมี 2 ชั้น

> **ชั้นตัดสินถูก/ผิด** (`question` · `choices` · `answer`) เปลี่ยนแล้ว **ผลตรวจเดิมใช้ไม่ได้** → ล้าง วนคิวใหม่
>
> **ชั้นประกอบ** (`explanation` · `reviewNote` · `pleGroup/pleSub` · `domain` · `examSets` · `isPublished`) เปลี่ยนแล้ว **ผลตรวจเดิมยังใช้ได้** → ไม่วนคิว

ตอนนี้ `reviewContentChanged()` (`questionReview.js:45`) เอา `explanation` ไปรวมกับชั้นบน จึงต้องแตกเป็นสองฟังก์ชัน

### ผลข้างเคียงที่ตั้งใจ (user เคาะแล้ว)

`reviewContentChanged` ถูกใช้ที่ `QuestionsView.vue:929` ด้วย ⇒ พฤติกรรมหน้าคลังเปลี่ยนตามไปด้วย:

- **เดิม** แก้คำอธิบายในคลัง → ล้างผลตรวจ → ข้อที่ผ่านแล้ววนกลับเข้าคิว
- **ใหม่** แก้คำอธิบายในคลัง → ไม่ล้าง ข้อยังผ่านอยู่

แลกมาด้วย: คำอธิบายที่เขียนผิดจะไม่มีใครตรวจซ้ำ — **user ตัดสินใจรับความเสี่ยงนี้** (ทีมวิชาการคือคนกลุ่มเดียวกับที่ลบข้อสอบได้อยู่แล้ว โมเดล trust-based เดียวกับทั้งไฟล์ rules)

---

## โครงไฟล์

```
📦 ใหม่  src/utils/questionDraft.js       ตรรกะล้วน — draftFrom(q) · draftPayload(d) · draftValid(d)
📦 ใหม่  src/utils/questionDraft.test.js
📦 ใหม่  src/components/questions/QuestionEditor.vue   ฟอร์มล้วน ไม่แตะ Firestore
✏️ แก้   src/utils/questionReview.js      verdictContentChanged · sideContentChanged · needsReviewBy รู้จัก lastFixBy
✏️ แก้   src/utils/questionReview.test.js
✏️ แก้   src/views/QuestionsView.vue       เรียก QuestionEditor แทน template เดิม (~60 บรรทัดหาย)
✏️ แก้   src/views/ReviewView.vue          ฟอร์มแก้ในที่ + ประวัติรอบก่อน + คอมเมนต์ + นำออก + แก้หมวดในกอง
```

### `utils/questionDraft.js` — payload มีที่เดียว

| ฟังก์ชัน | หน้าที่ |
|---|---|
| `draftFrom(question)` | doc → draft object (ส่ง `null` = ข้อใหม่ ได้ค่าเริ่มต้นครบ) |
| `draftPayload(draft)` | draft → payload พร้อมเขียน Firestore · `cleanText` ทุกช่อง · ตัดตัวเลือกว่างท้าย · clamp `answer` · คำนวณ `qhash` |
| `draftValid(draft)` | โจทย์ไม่ว่าง + ตัวเลือกไม่ว่าง ≥ 2 + `answer` ชี้ตัวเลือกที่มีจริง |

ย้ายตรรกะที่ตอนนี้กระจายอยู่ใน `QuestionsView.save()` (บรรทัด 905–924) กับ `valid` computed มารวมที่นี่
ทั้ง `/questions` และ `/review` เรียกตัวเดียวกัน = payload หน้าตาเหมือนกันเป๊ะ ไม่มีทางเพี้ยนคนละหน้า

### `components/questions/QuestionEditor.vue` — ฟอร์มล้วน

- props: `modelValue` (draft) · `compact` (boolean)
- emits: `update:modelValue`
- **ไม่ import firebase เลย** — ใครเรียกใช้เป็นคนเขียนเอง
- `compact: true` (หน้าตรวจ) โชว์แค่ **โจทย์ · ตัวเลือก · เฉลย · คำอธิบาย · หมายเหตุผู้ตรวจ**
  ซ่อนช่องกลุ่มโรค (ฟอร์มตรวจมี `TopicSelect` ของตัวเองอยู่แล้ว จะซ้อนกันสองอัน) ซ่อนชุดข้อสอบย้อนหลัง / domain / เผยแพร่
- `compact: false` (หน้าคลัง) โชว์ครบเหมือนเดิมทุกช่อง

### `utils/questionReview.js`

```js
// ชั้นตัดสินถูก/ผิด — เปลี่ยนแล้วผลตรวจเดิมใช้ไม่ได้
export function verdictContentChanged(before, after)   // question, choices, answer

// ชั้นประกอบ — เปลี่ยนแล้วผลตรวจเดิมยังใช้ได้
export function sideContentChanged(before, after)      // explanation, reviewNote
```

`sideContentChanged` มีไว้ตอบคำถามเดียว: **"กดบันทึกได้หรือยัง"** — ปุ่มบันทึกในหน้าตรวจเปิดเมื่อ
`verdictContentChanged || sideContentChanged` เป็นจริง ไม่งั้น `:disabled` (กดบันทึกทั้งที่ไม่ได้แก้อะไร = เสีย write ฟรี)

`reviewContentChanged` เดิมถูกแทนที่ด้วย `verdictContentChanged` ทั้ง 2 จุดที่เรียก — **ลบชื่อเก่าทิ้ง ไม่เหลือ alias**

`needsReviewBy()` เพิ่มบรรทัดเดียวอุดรูตรวจงานตัวเอง:

```js
if (question.lastFixBy === myUid) return false   // คนแก้ข้อไม่ใช่คนตรวจข้อ (เหตุผลเดียวกับ createdBy)
```

ไม่มีข้อยกเว้น `source === 'import'` แบบ `createdBy` เพราะ `lastFixBy` คือคนที่ลงมือแก้เนื้อหาจริงเสมอ

---

## หน้าตรวจ: ฟอร์มแก้ในที่

ปุ่ม **"✏️ แก้ข้อนี้"** ในการ์ดข้อ → การ์ดกลายเป็นฟอร์มที่เดิม (ไม่เด้ง modal — คนตรวจต้องเห็นโจทย์ขณะแก้)
ระหว่างเปิดฟอร์ม **ซ่อนปุ่ม verdict ทั้งแถบ** กันส่งผลตรวจของเวอร์ชันที่ยังไม่บันทึก

### ป้ายบอกผลล่วงหน้า (เปลี่ยนสดตามสิ่งที่พิมพ์)

| เงื่อนไข | ป้าย |
|---|---|
| `verdictContentChanged` = true | 🔄 **บันทึกแล้วข้อนี้ไปเข้าคิวให้คนอื่นตรวจ — คุณจะไม่ได้ตรวจข้อนี้** |
| เฉพาะชั้นประกอบเปลี่ยน | ✅ **บันทึกแล้วตรวจต่อได้เลย** |
| ยังไม่แก้อะไร | ปุ่มบันทึกเป็น `:disabled` |

เหตุผลต้องมองเห็น**ก่อน**กด ไม่ใช่ toast หลังกด (บทเรียน `rxtu10_pet_upgrade_gate` — `:disabled` ทำให้ toast อธิบายในตัว handler กลายเป็นโค้ดตาย)

### เส้นทางเขียน 2 เส้น

ตารางนี้เป็นของ **หน้าตรวจเท่านั้น** — หน้าคลัง (`QuestionsView.save()`) ยังเขียน payload เต็มก้อนเหมือนเดิมทุกครั้ง
เปลี่ยนแค่จุดเดียวคือ "จะพ่วง `REVIEW_RESET` ไปด้วยไหม" ซึ่งตอนนี้ถาม `verdictContentChanged` แทน `reviewContentChanged`

| | **A · แก้ชั้นตัดสิน** | **B · แก้เฉพาะชั้นประกอบ** |
|---|---|---|
| เขียน | `draftPayload()` + `REVIEW_RESET` + `reviewVerdicts: deleteField()` + `retired: deleteField()` + `lastFixBy`/`lastFixByName`/`lastFixAt` + `updatedAt` | `explanation` · `reviewNote` · `updatedAt` เท่านั้น |
| rules ผ่าน | `isReviewReset()` — ไม่มี `hasOnly` จึงเขียนเนื้อหาไปพร้อมกันได้ | `reviewUntouched()` — ไม่แตะ `reviewKeys()` |
| หลังบันทึก | ข้อหลุดคิวเอง (`needsReviewBy` เห็น `lastFixBy`) → `pickNext()` | อยู่ข้อเดิม กดส่งผลตรวจต่อได้ |
| `reviewMeta.progress` | ขยับ `bumpedProgress(oldStatus, 'pending')` | ไม่แตะ |

**⚠️ เส้น B ต้อง patch local ด้วย** — `submit()` มี 2 จุดที่เทียบกับค่าที่โหลดมาตอนเปิดข้อ:

- stale guard เทียบ `qhash` (`ReviewView.vue:482`) — เส้น B ไม่แตะ `question` ⇒ `qhash` เท่าเดิม ผ่าน
- `baseNote = cleanText(q.reviewNote)` (`ReviewView.vue:520`) — ถ้าไม่ patch `list.value[idx]`
  **หมายเหตุที่เพิ่งบันทึกจะโดนค่าเก่าเขียนทับตอนกดส่งผลตรวจ**

ใช้ `patchTriageRow(id, patch)` ที่มีอยู่แล้ว (`ReviewView.vue:357`) — มันอัปเดตทั้ง `triageRows` และ `list` ให้ในคราวเดียว

**เส้น A ไม่ติด stale guard** เพราะมันเลื่อนข้อไปแล้วก่อนที่จะมีโอกาสกดส่ง

### ล้างฟอร์มตอนเปลี่ยนข้อ

`watch(current)` (`ReviewView.vue:419`) ต้องปิดฟอร์มแก้ที่ค้างเปิดด้วย — แพทเทิร์นเดียวกับที่ `submit()` ปิด `amending` (บรรทัด 568) กันเผลอบันทึกเนื้อหาข้อเก่าทับข้อใหม่

---

## ประวัติรอบก่อน

`watch(current)` โหลด subcollection `reviews` เมื่อข้อเป็น `conflict` **หรือมี `lastFixAt`**
แล้วแบ่งผลเป็น 2 กลุ่มแทนการกรองทิ้ง:

| กลุ่ม | เงื่อนไข | หัวข้อบนจอ |
|---|---|---|
| รอบนี้ | `uid ∈ reviewedBy` | ผลตรวจก่อนหน้า (n) |
| ก่อนแก้ | `uid ∉ reviewedBy` | 🛠️ รอบก่อนแก้ (n) |

เหนือกล่องเขียน **"🛠️ แก้โดย {lastFixByName} · {lastFixAt}"**

ต้นทุน: +1–2 read เฉพาะข้อที่เคยถูกแก้ (ข้อปกติเท่าเดิม) — ยอมรับได้ในหน้าที่คุมต้นทุน read เพราะอ่านเฉพาะข้อปัจจุบันตอนเปิดข้อ ไม่ได้อ่านทั้งคิว

ข้อที่ผ่านตรวจแบบไม่เคยถูกแก้ยัง**ไม่เห็น**ผลตรวจคนอื่น — เจตนาเดิม (กันอคติ) คงไว้

---

## อีก 3 อย่างที่ user เลือก

### 💬 คอมเมนต์ต่อข้อในหน้าตรวจ

ใส่ `<QuestionComments :questionId="current.id" />` ในการ์ด แต่มี 2 ข้อบังคับ:

- **ห่อ `<details>` + `v-if="commentsOpen"`** — `QuestionComments.vue:92` เป็น `onMounted(load)`
  ถ้าใส่ตรงๆ ทุกข้อที่เปิดจะยิง read ทันที ผิดหลักต้นทุนคงที่ของหน้านี้
- **ต้องมี `:key="current.id"`** — มันโหลดครั้งเดียวตอน mount ไม่มี watch
  ถ้าไม่ใส่ key เลื่อนข้อแล้วจะยังเห็นคอมเมนต์ของข้อเก่า

`commentsOpen` รีเซ็ตเป็น `false` ทุกครั้งที่เปลี่ยนข้อ

### 🗑️ ปุ่มนำออก

ปุ่มในการ์ด → `confirm()` → `{ retired: true, isPublished: false, updatedAt }`

- rules ผ่าน `reviewUntouched()`
- `needsReviewBy` กรอง `retired` อยู่แล้ว (บรรทัด 36) ข้อหลุดคิวเอง → `pickNext()`
- **ไม่แตะ `reviewMeta`** — ตรงกับที่ `QuestionsView.retire()` ทำอยู่ (drift ปล่อย self-heal ตอนแอดมินกด "🔄 ซิงก์ระบบตรวจ")

### 🏷️ เลือกกลุ่มโรคในกอง nogroup

แทนที่ `RouterLink to="/questions"` ด้วยปุ่มกาง `TopicSelect` ในแถวนั้นเลย + ปุ่มบันทึก
เขียน `plePatch(group, sub)` ตรงๆ (rules ผ่าน `reviewUntouched()`) แล้ว `patchTriageRow()` ให้แถวหลุดกองทันที
ทีละแถว ไม่ทำ bulk — กองนี้เป็นงานที่ต้องดูโจทย์ทีละข้ออยู่แล้ว

---

## เทส

ทั้งหมดเป็น pure function เทสได้โดยไม่ต้องแตะ Firestore

**`questionDraft.test.js` (ใหม่)**

- `draftPayload` ตัดตัวเลือกว่างท้ายทิ้ง แล้ว **clamp `answer` เป็น 0** เมื่อ `answer` ชี้ตัวเลือกที่ถูกตัด
- `draftPayload` `cleanText` ทุกช่อง · `explanation`/`reviewNote` ว่าง → `null` ไม่ใช่ `''`
- `draftValid` ปฏิเสธตัวเลือกไม่ถึง 2 · ปฏิเสธโจทย์ว่าง
- `draftFrom(null)` คืนค่าเริ่มต้นครบทุก key ที่ `draftPayload` ต้องใช้

**`questionReview.test.js` (เพิ่ม)**

- `verdictContentChanged` — แก้ `explanation` ได้ `false` · แก้ `answer` ได้ `true` · แก้ `choices` ได้ `true`
- `sideContentChanged` — แก้ `explanation` ได้ `true` · แก้ `question` ได้ `false`
- `needsReviewBy` — `lastFixBy === myUid` ได้ `false` **แม้ `reviewedBy` จะว่าง** ← เทสที่กันรูตรวจงานตัวเอง
- `needsReviewBy` — `lastFixBy` เป็นคนอื่น + `reviewedBy` ว่าง ยังได้ `true` (ข้อยังต้องมีคนตรวจ)

## หลัง deploy

**ไม่ต้องกดปุ่มแอดมิน ไม่ต้อง deploy rules** — ข้อเก่าไม่มีฟิลด์ `lastFixBy` ซึ่ง `undefined === myUid` เป็น `false` อยู่แล้ว พฤติกรรมเดิมทุกประการ
