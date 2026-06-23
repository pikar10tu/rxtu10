# Welcome Gift + ตั๋ว payment-first — Design

วันที่: 2026-06-23
สถานะ: อนุมัติแล้ว (รอเขียน implementation plan)

## ที่มา / ปัญหา

เพื่อนทดสอบแล้วรู้สึกว่า **เงินช่วงต้นเกมน้อยเกินไป** (สตาร์ทเตอร์ 2,000 เหรียญ) จึงจะแจก
**ของขวัญต้อนรับ (Welcome Gift)** ให้ผู้ใช้**ทุกคน** — ทั้งคนที่มีบัญชีอยู่แล้วและคนที่สมัครใหม่ในอนาคต:

- เงิน **15,000 เหรียญ**
- ตั๋วกาชา **50 ใบ**

และเปิดให้ใช้ตั๋วแบบ **10 ใบ → 11 pull** ได้ (ไม่ใช่สุ่มทีละใบเท่านั้น) โดยให้ตั๋วเป็น
**payment-first** บนปุ่มสุ่มเดิม (มีตั๋วพอใช้ตั๋วก่อน ไม่พอค่อยจ่ายเหรียญ)

## เป้าหมาย (Goals)

1. ผู้ใช้ทุกคน (เก่า + ใหม่ในอนาคต) ได้รับของขวัญต้อนรับ **เพียงครั้งเดียว** ผ่าน **กล่องจดหมาย**
   (มีจดหมายค้างให้กดรับ) + มี **Welcome box** เด้งต้อนรับ
2. ตั๋วกาชาใช้เป็น payment-first บนปุ่มสุ่มเดิม: ×1 = 1 ตั๋ว, ×10 (ได้ 11 ตัว) = 10 ตั๋ว
3. ไม่เปิดช่องโกงใหม่เกินกว่า trust model เดิมของแอป

## Non-goals (ไม่ทำในรอบนี้)

- ไม่รื้อ economy/สมดุลรายได้ (อยู่คนละ track — ดู economy-battle-master-plan)
- ไม่ทำ UI เลือกจ่ายเอง "ตั๋ว vs เหรียญ" — ตั๋วเป็น priority อัตโนมัติเสมอ (YAGNI)
- ไม่ทำ admin broadcast เฉพาะกิจสำหรับ welcome gift (เส้นทาง self-deliver ครอบคลุมแล้ว)

## ภาพรวมสถาปัตยกรรม

ของขวัญส่งมอบผ่าน **เส้นทางเดียวสำหรับทุกคน**: เมื่อ login ถ้ายังไม่เคยได้ของขวัญ
client จะ **self-deliver จดหมายของขวัญ** เข้ากล่องตัวเอง (mail doc id ตายตัว = `welcome-v1`)
แล้วผู้ใช้กดรับเองในกล่อง (เหมือนจดหมายรางวัลอื่น) → เหรียญ+ตั๋วถูกเติมผ่าน claim transaction

ความปลอดภัยมาจาก **doc id ตายตัว + rules ตรวจแม่แบบเป๊ะ** (ดูส่วน "ความปลอดภัย")
— ไม่ต้องมี backend, ไม่ต้องให้แอดมินกดส่ง

```
login → onSnapshot → runWelcomeGiftIfNeeded()
          ├─ ถ้า welcomeGiftV1 == false:
          │     writeBatch [ setDoc(users/{uid}/mail/welcome-v1, welcomeMail),
          │                  updateDoc(users/{uid}, welcomeGiftV1:true) ]   (atomic)
          └─ Welcome box เด้ง (welcomeGiftV1 && !welcomeBoxSeen) → ปิด → welcomeBoxSeen:true

กดรับในกล่อง → claim transaction:
   coins += 15000, freeGachaTickets += 50, mail.claimed=true   (เติมจริงตอนนี้)
```

## ความปลอดภัย (rules relaxation)

ปัจจุบัน `firestore.rules` ห้าม owner สร้างจดหมายตัวเอง (`allow create: if isAcademic()`)
เพื่อกันเสกจดหมายรางวัลใส่ตัวเอง คลายแบบ **เจาะจง + ปลอดภัย** ด้วย 3 ชั้น:

1. **Mail doc id ตายตัว `welcome-v1`** — มีได้ไม่เกิน 1 ฉบับ/คน เพราะถ้ามีแล้ว การเขียนซ้ำ
   เป็น `update` (ซึ่งอนุญาตแค่ `read`/`claimed`) สร้างใหม่ไม่ได้
2. **rules ตรวจแม่แบบเป๊ะตอน create** — owner สร้างได้เฉพาะเมื่อ:
   - `mailId == 'welcome-v1'`
   - `from == 'welcome'`
   - `reward` มี key เฉพาะ `coins`,`tickets` และ `coins == 15000`, `tickets == 50`
   - `claimed == false`
   → เสกจดหมายรางวัลอื่น (ปลอม report reward / เหรียญตามใจ) ไม่ได้
3. **`claimed` เป็น monotonic** — guard ใน rules update ให้เปลี่ยนได้ทางเดียว `false → true`
   (กดรับซ้ำโดยรีเซ็ต claimed ไม่ได้) — ครอบจดหมายรางวัลทุกฉบับ ไม่ใช่แค่ welcome

**เหตุผลที่ยอมรับได้:** rules แอปนี้เป็น "trust-based + light guards" และ**ปัจจุบันก็อนุญาต
ให้ owner แก้ `coins` (range 0–50M) และ `freeGachaTickets` (ไม่มี guard) ของตัวเองตรง ๆ อยู่แล้ว**
→ การปล่อยให้สร้าง welcome mail แม่แบบเป๊ะ ไม่เปิดช่องใหม่เกินที่เปิดอยู่ แต่ปิดทางเสกจดหมาย
รางวัล*อื่น*ไว้ครบ

⚠️ แก้ `firestore.rules` แล้ว **ต้อง `firebase deploy --only firestore:rules`** (Pages/Actions ไม่ deploy rules)

## รายละเอียดเป็นส่วน

### ส่วนที่ 1 — Schema & ค่าคงที่ (`src/data/userSchema.js`)

- `USER_DEFAULTS` เพิ่ม:
  - `welcomeGiftV1: false` — flag กัน client ส่งจดหมายซ้ำ (dedup key)
  - `welcomeBoxSeen: false` — flag กัน Welcome box เด้งซ้ำ
- ค่าคงที่ใหม่ (export):
  - `WELCOME_GIFT_COINS = 15000`
  - `WELCOME_GIFT_TICKETS = 50`
- `newUserDoc`: **ไม่เปลี่ยน** — คง `STARTER_COINS = 2000`, ไม่ฝังของขวัญ
  (คนใหม่ได้จดหมายตอน login รอบแรกเหมือนคนเก่า → ยอดหลังกดรับ = 2,000 + 15,000 = 17,000)
- `normalizeUserData`: flag ใหม่เป็น primitive bool → ครอบด้วย `{...USER_DEFAULTS, ...data}` อยู่แล้ว
  ไม่ต้องเพิ่ม logic

### ส่วนที่ 2 — กล่องจดหมายรองรับตั๋ว

**`src/utils/mailbox.js`** (pure, มี `.test.js`):
- `rewardTickets(mail)` → `mail.reward.tickets` ถ้าเป็น number > 0 ไม่งั้น 0
- `canClaim(mail)` → true เมื่อ ยังไม่ claimed **และ** (`rewardCoins>0` หรือ `rewardTickets>0` หรือมี achievement)
- `needsAttention` ใช้ `canClaim` เดิม → ได้ตั๋วฟรี
- `buildBroadcastMail({...,tickets})` → ถ้า `tickets>0` ใส่ `reward.tickets`; `hasReward` นับตั๋วด้วย
- `buildWelcomeGiftMail(createdAt)` ใหม่ → payload แม่แบบเป๊ะ:
  ```js
  {
    type: 'reward',
    title: 'ของขวัญต้อนรับ',          // title render เป็น text ห้าม emoji (tofu)
    body: 'ยินดีต้อนรับสู่ RxTU10! รับของขวัญต้อนรับ 15,000 เหรียญ + ตั๋วกาชา 50 ใบ',
    reward: { coins: WELCOME_GIFT_COINS, tickets: WELCOME_GIFT_TICKETS },
    from: 'welcome',
    createdAt, read: false, claimed: false,
  }
  ```

**`src/stores/mailbox.js`** — `claim()` transaction:
- อ่าน `rewardTickets(data)`; ถ้า > 0 เพิ่ม `userPatch.freeGachaTickets = increment(t)`
- คืนค่าให้รวมตั๋ว (เช่น `{ coins, tickets }`) — ปรับ caller (`MailboxCard.onClaim`) ตาม
  - หมายเหตุ: signature เดิมคืน `coins:number`/`false` — เปลี่ยนเป็น object ต้องแก้ caller ทุกที่
    (มีที่เดียว: `MailboxCard.vue`)

**`src/components/home/MailboxCard.vue`**:
- `hasReward(m)` = `rewardCoins(m) > 0 || rewardTickets(m) > 0`
- ปุ่มรับ: แสดงเหรียญ+ตั๋ว เช่น `รับ 15,000🪙 +50🎟️` (ใช้ `<Emoji>` ตามที่การ์ดใช้อยู่)
- `onClaim`: toast บอกทั้งเหรียญและตั๋วที่ได้

**`src/utils/mailbox.test.js`** — เพิ่มเทส: `rewardTickets`, `canClaim` (ตั๋วอย่างเดียว),
`buildBroadcastMail` กับ tickets, `buildWelcomeGiftMail` (รูปร่างถูก, claimable)

### ส่วนที่ 3 — Self-deliver ตอน login + rules

**`src/stores/auth.js`**:
- เพิ่ม `runWelcomeGiftIfNeeded()` (โครงเลียน `runPetMigrationIfNeeded`):
  - guard ด้วย module-scope var `_welcomeGifting`
  - ถ้า `u.welcomeGiftV1 === true` หรือไม่มี `u` → return
  - `writeBatch(db)`:
    - `batch.set(doc(db,'users',uid,'mail','welcome-v1'), buildWelcomeGiftMail(serverTimestamp()))`
    - `batch.update(doc(db,'users',uid), { welcomeGiftV1: true })`
    - `await batch.commit()`
  - หมายเหตุ: ไม่ผ่าน `patchUser` (ไม่ต้อง optimistic UI สำหรับ flag) — batch ทำ 2 docs atomic
    onSnapshot จะอัปเดต `welcomeGiftV1:true` เอง รอบถัดไปจึงไม่ยิงซ้ำ
- เรียก `runWelcomeGiftIfNeeded()` ใน onSnapshot handler ข้าง `runPetMigrationIfNeeded()`

**`firestore.rules`** — แก้ `match /mail/{mailId}`:
- `create`:
  ```
  allow create: if isAcademic()
    || (request.auth != null && request.auth.uid == userId
        && mailId == 'welcome-v1'
        && request.resource.data.get('from','') == 'welcome'
        && request.resource.data.get('claimed', true) == false
        && request.resource.data.reward.keys().hasOnly(['coins','tickets'])
        && request.resource.data.reward.get('coins', 0) == 15000
        && request.resource.data.reward.get('tickets', 0) == 50
       );
  ```
- `update` (เพิ่ม claimed monotonic):
  ```
  allow update: if request.auth != null && request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read','claimed'])
    && (resource.data.get('claimed', false) == false
        || request.resource.data.get('claimed', false) == true);
  ```
  (เงื่อนไขที่เพิ่ม = ถ้าเคย claimed แล้ว ห้ามตั้งกลับเป็น false)
- ⚠️ deploy rules

### ส่วนที่ 4 — Welcome box + ตั๋ว payment-first

**Welcome box** — component ใหม่ `src/components/WelcomeBox.vue` (หรือใน App.vue):
- mount แบบ global เมื่อ login & onboarded
- แสดงเมื่อ `auth.userData?.welcomeGiftV1 && !auth.userData?.welcomeBoxSeen`
- เนื้อหา: "🎉 ยินดีต้อนรับสู่ RxTU10!" + โชว์ของขวัญ (15,000 เหรียญ + 50 ตั๋วกาชา) +
  ข้อความชี้ "เปิดกล่องจดหมายเพื่อกดรับ" + ปุ่มปิด
- ปิด → `patchUser({welcomeBoxSeen:true},{welcomeBoxSeen:true})`
- ขับด้วย flag user-doc ล้วน → ไม่ต้องโหลด mailbox (รักษา cost ตามจุดเฝ้าระวังสถาปัตยกรรม)

**ตั๋ว payment-first** — `src/utils/gacha.js`:
- helper pure ใหม่ `resolvePullPayment(n, tickets)`:
  - `n === 1` → `rolls = 1`, ตั๋วที่ต้องใช้ = 1
  - `n !== 1` (10-pull) → `rolls = TEN_PULL_N` (11), ตั๋วที่ต้องใช้ = 10
  - ถ้า `tickets >= ticketsNeeded` → `{ rolls, pay:'ticket', amount: ticketsNeeded }`
  - ไม่งั้น → `{ rolls, pay:'coin', amount: (n===1 ? PULL_COST : TEN_PULL_COST) }`
- เพิ่มเทสใน `gacha.test.js`

**`src/views/ShopView.vue`** — `pull(n)`:
- ลบ path ปุ่มตั๋วฟรีแยก (`useFreeTicket`) + ปุ่ม `.ticket-btn` ใน template
- ใช้ `resolvePullPayment(n, tickets.value)` กำหนด rolls + วิธีจ่าย
- เช็ก affordability ตาม `pay`:
  - `pay==='coin'` & `coins < amount` → toast เหรียญไม่พอ
  - `pay==='ticket'` → ใช้ตั๋วได้เลย (resolve การันตีว่ามีพอ)
- เขียน user doc:
  - `pay==='ticket'`: `freeGachaTickets -= amount` (optimistic) / `increment(-amount)` (server),
    **ไม่แตะ coins/totalSpent**
  - `pay==='coin'`: เหมือนเดิม (`coins -= amount`, `totalSpent += amount`)
  - ทั้งสองแบบ: `pets`, `gachaPity`, `gachaGuaranteed`, bump `dailyQuest.gacha` เหมือนเดิม
- ป้ายปุ่ม ×1 / ×10 เปลี่ยนตาม `resolvePullPayment`:
  - มีตั๋วพอ → โชว์ราคาตั๋ว เช่น `สุ่ม ×10 · 🎟️10`
  - ไม่พอ → โชว์ราคาเหรียญ เช่น `สุ่ม ×10 · 🪙10,000`
- แสดงจำนวนตั๋วที่มี (`🎟️ ×{tickets}`) ใกล้ปุ่ม

## Data model / migration

- ฟิลด์ใหม่บน `users/{uid}`: `welcomeGiftV1` (bool), `welcomeBoxSeen` (bool)
- mail ใหม่: `users/{uid}/mail/welcome-v1` (สร้างโดย client ตอน login)
- ไม่มี migration เขียนข้อมูลย้อนหลัง — คนเก่า flag = absent → normalize เป็น false → ได้จดหมายตอน login

## ผลกระทบ cost (Firestore)

- ของขวัญ: +2 writes/คน ครั้งเดียว (mail + flag) ตอน login รอบแรก หลัง deploy
- claim: 1 transaction/คน ครั้งเดียว
- Welcome box: 0 read เพิ่ม (อ่านจาก userData ที่มีอยู่)
- รวมแล้วเล็กน้อย ครั้งเดียวต่อคน

## Testing

- pure: `mailbox.test.js` (tickets/canClaim/buildWelcomeGiftMail), `gacha.test.js` (resolvePullPayment)
  รันด้วย `node --test src/utils/<x>.test.js`
- manual: `npm run dev` →
  1. บัญชีใหม่/ที่ flag ยังไม่ติด → login เห็นจดหมาย welcome + Welcome box เด้ง → กดรับ → +15,000 +50 ตั๋ว
  2. login ซ้ำ → ไม่เด้ง/ไม่ได้จดหมายซ้ำ
  3. ShopView: มีตั๋ว ≥10 → ปุ่ม ×10 จ่ายด้วยตั๋ว; ตั๋ว < 10 → จ่ายเหรียญ; ×1 จ่าย 1 ตั๋วเมื่อมีตั๋ว
- `npm run build` ผ่าน
- ทดสอบ rules: บัญชีนักศึกษาเสกจดหมาย id อื่น/แม่แบบไม่ตรง → ถูกปฏิเสธ

## ลำดับ build (คร่าว ๆ)

1. Schema + ค่าคงที่ (ส่วน 1)
2. mailbox utils + claim ตั๋ว + MailboxCard + เทส (ส่วน 2)
3. firestore.rules + self-deliver auth.js (ส่วน 3) → **deploy rules**
4. Welcome box (ส่วน 4a)
5. gacha resolvePullPayment + เทส + ShopView payment-first (ส่วน 4b)
6. `npm run build` + manual + push master + deploy rules
