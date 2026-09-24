// ════════════════════════════════════════════════════════════
//  useReviewWrites — รวมเส้นเขียน Firestore ของหน้าตรวจข้อสอบ (ReviewView)
//  ย้ายมาจาก ReviewView.vue แบบคำต่อคำ 24 ก.ย. 2026 (Task 2 ของ report-case-flow)
//  ⚠️ นี่คือ refactor ไม่เปลี่ยนพฤติกรรม — โค้ดข้างในตรงกับของเดิมทุกจุด (รวมคอมเมนต์กติกา rules)
//     ที่ต่างจากเดิมมีแค่ resolveReports ที่เปลี่ยนจาก writeBatch เป็น runTransaction
//     (อ่านสถานะ report ทุกฉบับก่อนเขียน กันจ่ายรางวัลซ้ำถ้ามีคนปิดไปพร้อมกัน)
//
//  Error contract: writeVote/writeFix/writeRetireWithCredit/resolveReports throw ตรงๆ
//  เมื่อ Firestore ล้ม (caller เดิมมี try/catch + toast อยู่แล้ว) — มีข้อยกเว้นเดียวคือ
//  bumpMeta() ที่กลืน error เอง (คืน false) เพราะพลาดตรงนั้นต้องไม่ทำให้การแก้/นำออกล้มทั้งก้อน
// ════════════════════════════════════════════════════════════
import { collection, doc, setDoc, updateDoc, runTransaction, arrayUnion, increment, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { computeStatus, reviewFixResult } from '../utils/questionReview.js'
import { getCategories } from '../utils/questionCategories.js'
import { plePatch } from '../utils/pleMapping.js'
import { resolvePayload } from '../utils/questionReport.js'
import { buildReportRewardMail, buildReportResultMail } from '../utils/mailbox.js'
import { REPORT_REWARD } from '../data/index.js'

export function useReviewWrites() {
  const authStore = useAuthStore()
  const usage = useUsageStore()

  function reviewerName() {
    const u = authStore.userData || {}
    return cleanText(u.realName || u.nickname || u.name || 'ไม่ระบุ', LIMITS.reviewerName)
  }

  // bump ตัวนับ leaderboard + ความคืบหน้าคลัง — ใช้ร่วมโดย writeFix/writeRetireWithCredit
  // พลาดตรงนี้ต้องไม่ทำให้การแก้/นำออกล้ม (เดิมเป็น try/catch แยกในแต่ละจุดที่ ReviewView)
  async function bumpMeta(uid, name, from, to) {
    try {
      await setDoc(doc(db, 'reviewMeta', 'main'), {
        counts: { [uid]: increment(1) }, names: { [uid]: name },
        ...(from !== to && from && to ? { progress: { [from]: increment(-1), [to]: increment(1) } } : {}),
      }, { merge: true })
      return true
    } catch (e) { console.error('[reviewMeta bump]', e); return false }
  }

  // ส่งผลตรวจ (การ์ดข้อปัจจุบัน) — ตัว runTransaction เดิมจาก submit()
  //  ple = { group, sub } หรือ null (null = ไม่แตะหมวด) · note = ข้อความดิบ หรือ undefined (ไม่แตะหมายเหตุ)
  async function writeVote(q, { verdict, reason, ref, ple, note }) {
    const uid = authStore.currentUser?.uid
    const name = reviewerName()
    const isPass = verdict === 'correct'
    let newPass = 0, newFail = 0, newStatus = 'pending', already = false
    let wasResolved = false      // ข้อปิดไปแล้วตอนเราส่ง = มีคนตรวจชนเราพอดี (เสียงเรายังนับ)
    let oldStatus = 'pending'
    let committedCats = null, committedNote = null, committedPle = null   // ค่าที่ "เขียนจริง" ไปยัง Firestore รอบที่ commit สำเร็จ — ใช้ sync local ให้ตรงเป๊ะ
    // transaction: อ่านค่าสดก่อนคำนวณ → reviewStatus บน doc เชื่อถือได้แม้ 2 คนส่งพร้อมกัน
    // (จำเป็น เพราะ load() query จาก reviewStatus ตรงๆ — ถ้าค่าเพี้ยนข้อจะหลุดคิวถาวร)
    await runTransaction(db, async (tx) => {
      already = false
      oldStatus = 'pending'   // reset ทุกรอบที่ callback รัน กันค่าเก่าจากรอบก่อนหน้าค้าง (ทรานแซกชันรีทรายได้)
      const qRef = doc(db, 'questions', q.id)
      const snap = await tx.get(qRef)
      if (!snap.exists()) { already = true; return }   // ข้อถูกลบระหว่างตรวจ
      const cur = snap.data()
      // ข้อถูกแก้เนื้อหาไประหว่างเราดูอยู่ (qhash เปลี่ยน) — verdict เราตัดสินจากเวอร์ชันเก่า ห้ามนับ
      if ((cur.qhash || null) !== (q.qhash || null)) throw new Error('__stale')
      if ((cur.reviewedBy || []).includes(uid)) { already = true; return }   // เคยส่งไปแล้ว (เช่น จากอีกเครื่อง)
      const old = computeStatus(cur)
      oldStatus = old
      newPass = (cur.reviewPass || 0) + (isPass ? 1 : 0)
      newFail = (cur.reviewFail || 0) + (isPass ? 0 : 1)
      newStatus = computeStatus({ reviewPass: newPass, reviewFail: newFail })
      // ข้อปิดไปแล้วก่อนเราส่ง — เกิดได้จากตรวจชนกันพอดี (เกณฑ์ 1 คน/ข้อ = เสียงแรกปิดข้อทันที)
      // หรือมีคนตัดสิน conflict ไปก่อนเรา · เสียงเรายังถูกนับ แค่ไม่ใช่คนตัดสิน
      wasResolved = old === 'passed' || old === 'failed'
      // 1) รายละเอียดเต็มใน subcollection (doc id = uid → กันตรวจซ้ำ)
      tx.set(doc(db, 'questions', q.id, 'reviews', uid), {
        reviewerUid: uid,
        reviewerName: name,
        verdict,
        reason: cleanText(reason, LIMITS.reviewReason),
        ref: cleanText(ref, LIMITS.reviewRef),
        ts: serverTimestamp(),
      })
      // 2) aggregate บนข้อ — ห้ามใส่ field นอก reviewSubmitKeys (rules ใช้ hasOnly จะปฏิเสธทั้งก้อน)
      const qPatch = {
        reviewedBy: arrayUnion(uid),
        reviewPass: newPass,
        reviewFail: newFail,
        reviewStatus: newStatus,
        reviewVerdicts: deleteField(),   // ล้าง map โครงเก่า (ถ้ามี)
      }
      // หมวดใหม่: เขียน pleGroup/pleSub/categories เป็นชุดเดียว (plePatch คุมให้สอดคล้องกันเสมอ)
      // เขียนก็ต่อเมื่อค่าต่างจากบน doc จริง — ไม่งั้นเปลือง write ทุกครั้งที่มีคนตรวจ
      // ple === null = ไม่แตะหมวด → ข้ามบล็อกนี้ทั้งก้อน
      let newCats = getCategories(cur)
      if (ple) {
        const plePatchOut = plePatch(ple.group, ple.sub)
        newCats = plePatchOut ? plePatchOut.categories : getCategories(cur)
        if (plePatchOut && (
              cur.pleGroup !== plePatchOut.pleGroup
              || (cur.pleSub || null) !== plePatchOut.pleSub
              || JSON.stringify(getCategories(cur)) !== JSON.stringify(newCats))) {
          Object.assign(qPatch, plePatchOut)
        }
      }
      // note === undefined = ไม่แตะหมายเหตุ → ข้ามบล็อกนี้ทั้งก้อน
      const baseNote = cleanText(q.reviewNote || '', LIMITS.reviewNote)   // ค่าที่เราโหลดมาเห็นตอนเปิดข้อ
      if (note !== undefined) {
        const newNote = cleanText(note, LIMITS.reviewNote)
        if (newNote !== baseNote) {
          // ล้างช่องทิ้ง = ลบโน้ตจริง แต่ถ้ามีคนเพิ่งเขียนโน้ตใหม่หลังเราโหลด (cur ต่างจาก baseline ที่เราเห็น) อย่าลบของเขา
          if (newNote || baseNote === (cur.reviewNote || '')) qPatch.reviewNote = newNote || null
        }
      }
      // เก็บค่าที่ "เขียนจริง" ไว้ sync local ทีหลัง — ถ้า key ไหนไม่ได้แตะ ให้ยึดค่าปัจจุบันบน doc (cur) แทน กันจอเพี้ยนจากเซิร์ฟเวอร์
      committedCats = 'categories' in qPatch ? newCats : getCategories(cur)
      committedPle = 'pleGroup' in qPatch
        ? { group: qPatch.pleGroup, sub: qPatch.pleSub }
        : { group: cur.pleGroup ?? null, sub: cur.pleSub ?? null }
      committedNote = 'reviewNote' in qPatch ? qPatch.reviewNote : (cur.reviewNote || null)
      tx.update(qRef, qPatch)
      // 3) ตัวนับ leaderboard + ชื่อ snapshot + ความคืบหน้าคลัง (collection แยก นักศึกษาอ่านไม่ได้)
      const metaPatch = { counts: { [uid]: increment(1) }, names: { [uid]: name } }
      // สถานะไม่เปลี่ยน (เช่น passed 2-0 + เสียงที่ 3) = ไม่ต้องขยับแถบ — และห้ามส่ง progress: {} เข้าไป
      // เพราะ tx.set(merge) เจอ empty map จะดันเข้า field mask ทำให้ progress ทั้งก้อนถูกล้างทิ้ง (ไม่ใช่ "เว้นไว้เฉยๆ")
      // (ต้องไม่ใส่ increment ซ้ำ key เดียวกันในก้อนเดียว ไม่งั้นตัวหลังทับตัวแรก = ตัวเลขเพี้ยน — เคสนี้ oldStatus !== newStatus เสมอเมื่อเข้าเงื่อนไข)
      if (old !== newStatus) {
        metaPatch.progress = { [old]: increment(-1), [newStatus]: increment(1) }
      }
      tx.set(doc(db, 'reviewMeta', 'main'), metaPatch, { merge: true })
    })
    usage.track(1, already ? 0 : 3)
    return { already, wasResolved, oldStatus, newStatus, newPass, newFail, committedCats, committedPle, committedNote }
  }

  // แก้ชั้นตัดสิน (โจทย์/ตัวเลือก/เฉลย) แล้วนับว่าผ่านตรวจในตาเดียว — สาขา isFix ของ saveEdit()/saveFix() เดิม
  //  payload จาก draftPayload() · ไม่รวม patch local/toast (ผู้เรียกทำเอง)
  async function writeFix(q, payload, reason) {
    const uid = authStore.currentUser?.uid
    const name = reviewerName()
    const oldStatus = computeStatus(q)
    const fixReasonText = cleanText(reason, LIMITS.reviewReason)
    // ⚠️ ลำดับห้ามสลับ: isReviewFix() เช็ค existsAfter(reviews/{uid}) ซึ่งมองเห็นแค่ผลของคำขอ
    // เดียวกัน — 2 คำขอนี้ไม่ได้อยู่ใน transaction เดียวกัน (แพทเทิร์นเดียวกับ isReviewAmend())
    // ต้องเขียน subdoc ให้ "มีอยู่จริง" ก่อน แล้วค่อยเขียนคำถามที่เช็ค existsAfter ทีหลัง
    // หลักฐานว่าใครแก้/ทำไม — เก็บที่เดียวกับผลตรวจปกติ (reviews/{uid}) ให้กล่อง
    // "รอบก่อนแก้ ตกเพราะ" ของรอบถัดไปเห็นได้เหมือนผลตรวจทั่วไป
    await setDoc(doc(db, 'questions', q.id, 'reviews', uid), {
      reviewerUid: uid, reviewerName: name, verdict: 'fixed',
      reason: fixReasonText, ref: '', ts: serverTimestamp(),
    })
    // rules ผ่านทาง isReviewFix() — เขียนเนื้อหา + ตั้งผลตรวจเป็น passed พร้อมกันในตาเดียว
    await updateDoc(doc(db, 'questions', q.id), {
      ...payload,
      ...reviewFixResult(uid),
      reviewVerdicts: deleteField(),
      retired: deleteField(),   // แก้เนื้อหา = ตั้งใจนำกลับมาใช้
      lastFixBy: uid, lastFixByName: name, lastFixAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    usage.track(0, 2)
    // เครดิต leaderboard เสมอไม่ว่าสถานะเดิมจะเป็นอะไร (นี่คือใจความหลักของงานนี้)
    // progress ขยับเฉพาะตอนสถานะเปลี่ยนจริง (bumpMeta กันคีย์ซ้ำ 'passed' ชนกันเองถ้า oldStatus เป็น 'passed' อยู่แล้ว)
    if (await bumpMeta(uid, name, oldStatus, 'passed')) usage.track(0, 1)
    return { oldStatus }
  }

  // นำออก = ปลดระวางข้อที่ผิดจนแก้ไม่คุ้ม — ถอนเผยแพร่ + ไม่เข้าคิวตรวจอีก (ไม่ลบ ไม่แตะผลตรวจเดิม)
  async function writeRetireWithCredit(q, reason) {
    const uid = authStore.currentUser?.uid
    const name = reviewerName()
    const oldStatus = computeStatus(q)
    await updateDoc(doc(db, 'questions', q.id), {
      retired: true, isPublished: false,
      retiredBy: uid, retiredByName: name,
      retireReason: cleanText(reason, LIMITS.reviewReason),
      retiredAt: serverTimestamp(), updatedAt: serverTimestamp(),
    })
    usage.track(0, 1)
    // เครดิตเฉพาะคนที่ไม่ได้อยู่ใน reviewedBy — ตรงกับ tallyReviewCounts (ไม่งั้นซิงก์แล้วเลขหด)
    const credited = !(q.reviewedBy || []).includes(uid)
    if (credited && await bumpMeta(uid, name, oldStatus, 'retired')) usage.track(0, 1)
    return { oldStatus, credited }
  }

  // ปิดรีพอร์ท — valid มัดรางวัลเมล์ให้ผู้แจ้งทันที, invalid ส่งจดหมายแจ้งผลเฉยๆ (ไม่มีรางวัล)
  //  transaction: อ่านสถานะรีพอร์ททุกฉบับก่อนเขียน (กติกา transaction) — ฉบับที่ไม่ open แล้วข้าม
  //  กันจ่ายรางวัลซ้ำถ้ามีคนปิดไปพร้อมกัน (เดิมเป็น writeBatch เขียนตรงไม่เช็คสถานะก่อน)
  async function resolveReports(group, verdict, note = '') {
    const cleanNote = cleanText(note, LIMITS.reviewReason)
    let closed = 0, skipped = 0
    await runTransaction(db, async (tx) => {
      closed = 0; skipped = 0   // transaction รีทรายได้
      const refs = group.reports.map(r => doc(db, 'questionReports', r.id))
      const snaps = []
      for (const ref of refs) snaps.push(await tx.get(ref))   // อ่านทั้งหมดก่อนเขียน (กติกา transaction)
      snaps.forEach((s, i) => {
        const r = group.reports[i]
        if (!s.exists() || s.data().status !== 'open') { skipped++; return }   // มีคนปิดไปแล้ว → ไม่จ่ายซ้ำ
        const mailRef = doc(collection(db, 'users', r.reportedBy, 'mail'))
        if (verdict === 'valid') {
          tx.set(mailRef, buildReportRewardMail(r, REPORT_REWARD, serverTimestamp()))
          tx.update(refs[i], { ...resolvePayload('valid', REPORT_REWARD), rewardDelivered: true, resolvedAt: serverTimestamp() })
        } else {
          tx.set(mailRef, buildReportResultMail(r, cleanNote, serverTimestamp()))
          tx.update(refs[i], { ...resolvePayload('invalid', REPORT_REWARD), resolvedAt: serverTimestamp() })
        }
        closed++
      })
    })
    usage.track(group.reports.length, closed * 2)
    return { closed, skipped }
  }

  return { reviewerName, writeVote, writeFix, writeRetireWithCredit, resolveReports }
}
