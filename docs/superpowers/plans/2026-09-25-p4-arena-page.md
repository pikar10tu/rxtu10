# P4 หน้าสนามประลอง: สนามของฉัน + ร้านสนาม + ภาพสนามบนการ์ดคู่ต่อสู้ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ผู้เล่นเปลี่ยน/ซื้อสนามได้จากหน้าสนามประลอง และเห็นสนามของคู่ต่อสู้ก่อนบุก — ทำก่อน P3 เพราะคนที่ได้สนามแชมป์วันที่ 1 ต.ค. ต้องใส่ได้

**Architecture:** `ArenaSheet.vue` (BottomSheet 2 แท็บ ของฉัน/ร้านสนาม) ใช้ตรรกะ `utils/arenas.js` จาก P2 · เขียนผ่าน `auth.patchUser` แล้ว `syncRosterRow()` แบบเดียวกับ CosmeticShop · ภาพย่อใช้ `ArenaFloor mode="thumb"`

สเปก §4 · ต่อจาก `2026-09-25-p2-arena-core.md`

## Global Constraints
- sheet ใช้ `BottomSheet` (Teleport + z400 ตาม CLAUDE.md ข้อ 6/12) · ConfirmModal เดิม
- หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9) · ธีมใช้ตัวแปร style.css · ฟอนต์ ≥ .7rem
- ป้ายระดับสี: RARE ฟ้า `#2563eb` · EPIC ม่วง `#7c3aed` · LEGENDARY ทอง · CHAMPION แดง `#b91c1c` · FREE เทา

### Task 9: ArenaSheet + แถวสนามของฉัน
**Files:** Create `src/components/battle/ArenaSheet.vue` · Modify `src/components/battle/ArenaStatus.vue` (แถว "สนามของฉัน" + emit `arena`), `src/views/ArenaView.vue`
- แท็บของฉัน: การ์ด 2 คอลัมน์ (ภาพย่อ + ป้ายระดับ + ชื่อ + "✓ ใส่อยู่"/"กดเพื่อใส่") · แชมป์บอก "ที่ n · ก.ย. 69"
- แท็บร้านสนาม: `shopList(u, Date.now())` · ปุ่มราคา · เหรียญไม่พอ = ปุ่มเทาพร้อมเหตุผลบนปุ่ม (ห้ามซ่อนเหตุผลไว้ใน toast — memory pet upgrade gate) · ลิมิเต็ดบอก "ขายถึง d MMM"
- ซื้อ: confirm → `patchUser({coins, totalSpent, arenas: afterBuyArena}, {coins: increment(-p), totalSpent: increment(p), arenas})` → sfx coin → toast → `syncRosterRow()`
- ใส่: `patchUser({arenas: afterWearArena}, same)` → `syncRosterRow()`

### Task 10: ภาพสนามบนการ์ดคู่ต่อสู้
**Files:** Modify `src/views/ArenaView.vue`
- แถบซ้ายกว้าง 72px ของ `.ar-opp` = `ArenaFloor mode="thumb"` ของ `members.rosterRows[opp.uid]?.ar` (บอท = สนามฟรี) + ชื่อสนามตัวเล็กล่าง
- build · เปิด dev ตรวจด้วยตา (ถ้าเข้าระบบได้)
