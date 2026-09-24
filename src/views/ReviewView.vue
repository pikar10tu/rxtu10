<template>
  <div class="tab-content">
    <div class="rv-head">
      <div class="rv-title"><Emoji char="🔍" /> ตรวจข้อสอบ</div>
      <RouterLink to="/questions" class="rv-back">คลังข้อสอบ ›</RouterLink>
    </div>

    <div v-if="!authStore.isQuestionEditor" class="rv-denied">
      เฉพาะแอดมินหรือทีมวิชาการเท่านั้น
    </div>

    <template v-else>
      <!-- ── แถบสรุปคิว ── -->
      <div class="rv-summary">
        <div v-if="progress.total" class="rv-sum-line">
          <Emoji char="📋" /> ผ่านแล้ว <b>{{ progress.passed }}</b> ·
          รอตรวจ <b>{{ progress.pending }}</b><span v-if="progress.conflict"> · ขัดแย้ง <b>{{ progress.conflict }}</b></span><span v-if="progress.failed"> · ไม่ผ่าน <b>{{ progress.failed }}</b></span>
        </div>
        <div v-else class="rv-sum-line">ยังไม่มีตัวเลขสรุป — รอแอดมินกด "🔄 ซิงก์ระบบตรวจ" ในหน้า Admin ครั้งแรกก่อน</div>
        <div v-if="progress.total" class="rv-bar"><div class="rv-bar-fill" :style="{ width: progress.pct + '%' }"></div></div>
        <div class="rv-sum-mine">คิวรอบนี้ของคุณ: <b>{{ myQueueCount }}</b> ข้อ</div>
      </div>

      <div v-if="loading" class="rv-empty">กำลังโหลดคลังข้อสอบ…</div>

      <!-- ── การ์ดข้อปัจจุบัน ── -->
      <section v-else-if="current" class="rv-card">
        <div class="rv-card-tags">
          <span v-if="current.domain" class="rv-cat">{{ domainLabel(current.domain) || current.domain }}</span>
          <span v-for="c in getCategories(current)" :key="c" class="rv-cat rv-cat-sub">{{ c }}</span>
          <span v-if="!current.isPublished" class="rv-draft">ร่าง</span>
          <span v-if="currentStatus === 'conflict'" class="rv-conflict-badge">⚠️ ขัดแย้ง — คุณคือผู้ตัดสิน</span>
        </div>

        <template v-if="!editing">
          <div class="rv-q">{{ current.question }}</div>
          <ul class="rv-choices">
            <li v-for="(c, i) in current.choices" :key="i" :class="{ correct: i === current.answer }">
              <span class="rv-c-letter">{{ LETTERS[i] }}</span><span class="rv-c-text">{{ c }}</span>
              <span v-if="i === current.answer" class="rv-c-mark">✓ เฉลย</span>
            </li>
          </ul>
          <div v-if="current.explanation" class="rv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>
          <div v-else class="rv-exp rv-exp-none"><Emoji char="💡" /> ข้อนี้ยังไม่มีคำอธิบายเฉลย — เติมได้ที่ปุ่ม "📝 แก้คำอธิบายเฉลย"</div>
        </template>

        <div v-else class="rv-editbox">
          <QuestionEditor v-model="editDraft" compact />
          <template v-if="editRequeues">
            <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
            <textarea v-model="fixReason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"></textarea>
          </template>
          <div class="rv-edit-hint" :class="editRequeues ? 'requeue' : 'stay'">
            <template v-if="editRequeues">✅ บันทึกแล้ว = ตรวจผ่านทันที (นับเป็นข้อที่คุณตรวจแล้ว)</template>
            <template v-else-if="editTouched">✅ บันทึกแล้วตรวจต่อได้เลย ผลตรวจเดิมยังอยู่</template>
            <template v-else>ยังไม่ได้แก้อะไร</template>
          </div>
          <div class="rv-actions">
            <button class="rv-btn rv-gray" :disabled="savingEdit" @click="closeEdit">ยกเลิก</button>
            <button class="rv-btn rv-primary" :disabled="!canSaveEdit || savingEdit" @click="saveEdit">
              {{ savingEdit ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}
            </button>
          </div>
        </div>

        <!-- ข้อที่เคยถูกแก้ — โชว์ว่ารอบก่อนตกเพราะอะไร ให้คนตรวจรอบนี้ยืนยันว่าแก้ตรงจุดไหม -->
        <div v-if="!editing && current.lastFixAt" class="rv-fixed">
          <div class="rv-fixed-head">
            <Emoji char="🛠️" /> แก้โดย <b>{{ current.lastFixByName || 'ไม่ระบุ' }}</b>
            <span v-if="fmtFixTime(current.lastFixAt)" class="rv-fixed-when">· {{ fmtFixTime(current.lastFixAt) }}</span>
          </div>
          <template v-if="priorFixedReviews.length">
            <div class="rv-fixed-sub">รอบก่อนแก้ ตกเพราะ ({{ priorFixedReviews.length }})</div>
            <div v-for="p in priorFixedReviews" :key="p.id" class="rv-prior">
              <div class="rv-prior-top">
                <span class="rv-prior-verdict" :class="p.verdict">{{ VERDICT_LABEL[p.verdict] || p.verdict }}</span>
                <b>{{ p.reviewerName || 'ไม่ระบุ' }}</b>
              </div>
              <div class="rv-prior-reason">{{ p.reason }}</div>
              <div v-if="p.ref" class="rv-prior-ref">เรฟ: {{ p.ref }}</div>
            </div>
          </template>
          <div v-else class="rv-fixed-sub">ไม่มีเหตุผลของรอบก่อนเก็บไว้ — ข้อนี้ถูกแก้ตั้งแต่ยังไม่มีใครตรวจ</div>
        </div>

        <!-- รีวิวเดิม 2 ฉบับ (โชว์เฉพาะข้อ conflict ให้คนที่ 3 ตัดสิน — ข้ออื่นซ่อนกันอคติ) -->
        <div v-if="currentStatus === 'conflict' && priorReviews.length" class="rv-priors">
          <div class="rv-priors-head">ผลตรวจก่อนหน้า ({{ priorReviews.length }})</div>
          <div v-for="p in priorReviews" :key="p.id" class="rv-prior">
            <div class="rv-prior-top">
              <span class="rv-prior-verdict" :class="p.verdict">{{ VERDICT_LABEL[p.verdict] || p.verdict }}</span>
              <b>{{ p.reviewerName || 'ไม่ระบุ' }}</b>
            </div>
            <div class="rv-prior-reason">{{ p.reason }}</div>
            <div v-if="p.ref" class="rv-prior-ref">เรฟ: {{ p.ref }}</div>
          </div>
        </div>

        <!-- 💬 คุยกันต่อข้อ — ⚠️ QuestionComments โหลดเองตอน mount (onMounted) ไม่มี watch
             จึงต้อง v-if ให้ mount เมื่อกางเท่านั้น (ไม่งั้นทุกข้อยิง read ทันที)
             และต้องมี :key ไม่งั้นเลื่อนข้อแล้วยังเห็นคอมเมนต์ข้อเก่า -->
        <details v-if="!editing" class="rv-comments" :open="commentsOpen">
          <summary class="rv-comments-sum" @click.prevent="commentsOpen = !commentsOpen">
            <Emoji char="💬" /> คุยกันเรื่องข้อนี้
            <span class="rv-comments-hint">{{ commentsOpen ? 'ปิด' : 'เปิดดู' }}</span>
          </summary>
          <QuestionComments v-if="commentsOpen" :key="current.id" :questionId="current.id" />
        </details>

        <!-- ── กลุ่มโรค + ช่องเสริมที่พับไว้ + ปุ่มตัดสิน ── -->
        <div v-if="!editing" class="rv-form">
          <div v-if="ple.group" class="rv-group-row">
            กลุ่มโรค: <b>{{ groupLabel(ple.group) }}</b><template v-if="ple.sub"> · {{ ple.sub }}</template>
            <span v-if="ple.inferred" class="rv-group-guess">เดาให้</span>
            <button class="rv-mini rv-group-change" type="button" @click="groupOpen = !groupOpen">เปลี่ยน</button>
          </div>
          <div v-else class="rv-group-warn">ต้องเลือกกลุ่มโรคก่อนส่ง — ระบบเดาจากหมวดเดิมไม่ได้</div>
          <TopicSelect v-if="groupOpen || !ple.group" v-model="ple" />

          <button class="rv-mini rv-extras-toggle" type="button" @click="extrasOpen = !extrasOpen">
            {{ extrasOpen ? '− ซ่อน' : '＋ เพิ่ม' }} เหตุผล / เรฟ / หมายเหตุถึงนักศึกษา
          </button>
          <div v-if="extrasOpen" class="rv-extras">
            <label class="rv-label">เหตุผล (ไม่บังคับ)</label>
            <textarea v-model="reason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="อธิบายว่าทำไมตัดสินแบบนี้…"></textarea>

            <label class="rv-label">เรฟอ้างอิง (ไม่บังคับ)</label>
            <input v-model="refText" :maxlength="LIMITS.reviewRef" class="rv-input" placeholder="ลิงก์ / ชื่อหนังสือ / แนวทาง…" />

            <label class="rv-label">
              หมายเหตุผู้ตรวจ (นักศึกษาเห็นท้ายเฉลย — ไม่บังคับ)
              <span v-if="hadNote" class="rv-note-hint">มีหมายเหตุจากผู้ตรวจคนก่อน — ต่อเติมหรือขัดเกลาได้</span>
            </label>
            <textarea v-model="note" :maxlength="LIMITS.reviewNote" class="rv-input" rows="3" placeholder="ข้อควรระวัง / จุดที่คนมักเข้าใจผิด…"></textarea>

            <button class="rv-mini rv-open-edit" type="button" @click="openEdit">📝 แก้คำอธิบายเฉลย</button>
          </div>

          <JudgeActions
            :key="current.id"
            mode="review"
            :question="current"
            :busy="submitting || savingEdit || retiring"
            :canPass="canSubmit"
            blockedHint="เลือกกลุ่มโรคก่อนถึงจะส่งผลได้"
            @pass="submit"
            @fix="onJudgeFix"
            @retire="onJudgeRetire"
            @skip="skip"
          />
        </div>
      </section>

      <div v-else-if="myQueueCount" class="rv-empty">
        <Emoji char="⏭️" /> ข้ามไว้ {{ myQueueCount }} ข้อ — ยังไม่ได้ตรวจ
        <button class="rv-btn rv-gray rv-unskip" @click="unskipAll">ดูข้อที่ข้ามอีกรอบ</button>
      </div>
      <div v-else class="rv-empty rv-done">
        <Emoji char="🎉" /> ตรวจครบคิวรอบนี้แล้ว — กดโหลดรอบใหม่เพื่อสุ่มข้อชุดถัดไป
        <button class="rv-btn rv-gray rv-unskip" :disabled="loading" @click="load">โหลดรอบใหม่</button>
      </div>


      <!-- ── 🚩 ข้อที่ถูกรีพอร์ท (questionReports) — ย้ายมาจาก QuestionsView 15 ก.ย. 2026 ── -->
      <section v-if="reportsLoading || reportGroups.length" class="rv-triage rv-reports">
        <div class="rv-triage-head"><Emoji char="🚩" /> ข้อที่ถูกรีพอร์ท<span v-if="reportGroups.length"> ({{ reportGroups.length }})</span></div>
        <div v-if="reportsLoading" class="rv-empty">กำลังโหลด…</div>
        <ul v-else class="rv-bucket-list">
          <li v-for="g in reportGroups" :key="g.questionId" class="rv-bucket-item">
            <div class="rv-bucket-q">{{ truncate60(reportQuestionText(g)) }}</div>
            <ul class="rv-report-reasons">
              <li v-for="r in g.reports" :key="r.id"><b>{{ r.reason }}</b><span v-if="r.note"> — {{ r.note }}</span></li>
            </ul>
            <div class="rv-bucket-acts">
              <button class="rv-mini" @click="openReportedFix(g)">{{ fixId === g.questionId ? 'ปิด' : '✏️ แก้ข้อนี้' }}</button>
              <button class="rv-mini" :disabled="resolvingReportId === g.questionId" @click="resolveReportGroup(g, 'valid')">✓ ผิดจริง (ให้รางวัล)</button>
              <button class="rv-mini rv-danger" :disabled="resolvingReportId === g.questionId" @click="resolveReportGroup(g, 'invalid')">✕ ไม่ผิด</button>
            </div>
            <div v-if="fixId === g.questionId && fixDraft" class="rv-fix">
              <QuestionEditor v-model="fixDraft" compact />
              <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
              <textarea v-model="triageFixReason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"></textarea>
              <p class="rv-fix-note">✅ บันทึกแล้ว = ตรวจผ่านทันที + ปิดรีพอร์ทให้อัตโนมัติ (ได้รางวัลผู้แจ้ง)</p>
              <button
                class="rv-btn rv-primary rv-fix-save"
                :disabled="!draftValid(fixDraft) || !triageFixReason.trim() || fixSaving"
                @click="saveFix(fixSourceQuestion)"
              >{{ fixSaving ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- ── 🗂️ ข้อที่รอดำเนินการ — โหลด on-demand ห้ามยิงตอนเปิดหน้า (ดู loadTriage) ── -->
      <section class="rv-triage">
        <div class="rv-triage-head"><Emoji char="🗂️" /> ข้อที่รอดำเนินการ</div>

        <div v-if="!triageLoaded" class="rv-triage-intro">
          <p class="rv-triage-p">
            ข้อที่ต้องมีคนเข้าไปจัดการ — ไม่ผ่านตรวจ · ขัดแย้ง · ยังไม่มีกลุ่มโรค
            <span v-if="metaHint">· ตอนนี้มี <b>{{ metaHint }}</b></span>
          </p>
          <button class="rv-btn rv-gray" :disabled="triageLoading" @click="loadTriage">
            {{ triageLoading ? 'กำลังโหลด…' : 'ดูรายการ' }}
          </button>
          <p class="rv-triage-note">อ่านคลังข้อสอบทั้งหมด 1 ครั้ง — จึงไม่โหลดให้อัตโนมัติ</p>
        </div>

        <template v-else>
          <div v-if="!triage.total" class="rv-triage-clear">
            <Emoji char="🎉" /> ไม่มีข้อที่รอดำเนินการ — คลังสะอาด
          </div>
          <template v-else>
            <div class="rv-triage-sum">
              มีข้อที่ต้องจัดการ <b>{{ triage.total }}</b> ข้อ<span v-if="triage.urgent">
                · <b class="rv-triage-urgent">{{ triage.urgent }}</b> ข้อในนั้น<b>เผยแพร่อยู่</b> นักศึกษาเห็นตอนนี้เลย</span>
            </div>

            <details v-for="k in BUCKET_KEYS" :key="k" class="rv-bucket" :open="openBucket === k">
              <summary class="rv-bucket-sum" @click.prevent="openBucket = openBucket === k ? null : k">
                <span>{{ BUCKET_META[k].icon }} {{ BUCKET_META[k].label }}</span>
                <span class="rv-bucket-n" :class="{ zero: !buckets[k].length }">{{ buckets[k].length }}</span>
              </summary>
              <div class="rv-bucket-body">
                <p class="rv-bucket-hint">{{ BUCKET_META[k].hint }}</p>

                <!-- 🏷️ เครื่องมือจำแนกหมวดเป็นชุด (bulk) — ใช้ path เดียวกับ saveNogroup ทุกประการ แค่วนลูปแทนกดทีละข้อ -->
                <details v-if="k === 'nogroup' && buckets[k].length" class="rv-bulk">
                  <summary class="rv-bulk-sum">🧰 จำแนกหมวดเป็นชุด (bulk)</summary>
                  <div class="rv-bulk-body">
                    <p class="rv-bucket-hint">1) คัดลอกออกไปให้ AI/คนอ่านโจทย์แล้วเลือกกลุ่ม → 2) วาง JSON ผลลัพธ์กลับมาแล้วกด "นำเข้า"</p>
                    <label class="rv-label">ส่งออกข้อที่ไม่มีกลุ่มโรค ({{ buckets[k].length }} ข้อ)</label>
                    <textarea class="rv-input rv-bulk-text" readonly rows="4" :value="bulkExportText"></textarea>
                    <button class="rv-mini" @click="copyBulkExport">📋 คัดลอก JSON</button>

                    <label class="rv-label" style="margin-top:12px">นำเข้าผลจำแนกหมวด — รูปแบบ [{"id","pleGroup","pleSub"}, ...]</label>
                    <textarea v-model="bulkImportText" class="rv-input rv-bulk-text" rows="4" placeholder='[{"id":"...","pleGroup":"cvs","pleSub":"..."}]'></textarea>
                    <button class="rv-btn rv-primary" :disabled="bulkApplying || !bulkImportText.trim()" @click="applyBulkClassify">
                      {{ bulkApplying ? 'กำลังนำเข้า…' : 'นำเข้า' }}
                    </button>
                    <p v-if="bulkResult" class="rv-bucket-hint">
                      สำเร็จ {{ bulkResult.ok }} ข้อ<span v-if="bulkResult.fail"> · พลาด {{ bulkResult.fail }} ข้อ: {{ bulkResult.failIds.join(', ') }}</span>
                    </p>
                  </div>
                </details>

                <div v-if="!buckets[k].length" class="rv-empty rv-bucket-empty">ไม่มีข้อในกองนี้ <Emoji char="🎉" /></div>
                <ul v-else class="rv-bucket-list">
                  <li v-for="q in buckets[k].slice(0, bucketShown[k] || BUCKET_PAGE)" :key="q.id" class="rv-bucket-item">
                    <div class="rv-bucket-q">
                      <span v-if="q.isPublished" class="rv-bucket-live">เผยแพร่</span>
                      <span v-else class="rv-bucket-draft">ร่าง</span>
                      {{ truncate60(q.question) }}
                    </div>
                    <div class="rv-bucket-acts">
                      <button v-if="k === 'failed'" class="rv-mini" @click="openFix(q)">
                        {{ fixId === q.id ? 'ปิด' : '✏️ แก้ข้อนี้' }}
                      </button>
                      <button
                        v-if="k === 'failed'" class="rv-mini"
                        :disabled="requeuingId === q.id" @click="requeue(q)"
                      >{{ requeuingId === q.id ? 'กำลังส่ง…' : '↩️ ส่งกลับเข้าคิวตรวจ' }}</button>
                      <button v-if="k === 'conflict'" class="rv-mini" @click="jumpTo(q)">ตรวจข้อนี้เลย</button>
                      <button v-if="k === 'nogroup'" class="rv-mini" @click="openNogroup(q)">
                        {{ nogroupId === q.id ? 'ปิด' : '🏷️ เลือกกลุ่มโรค' }}
                      </button>
                    </div>
                    <!-- ฟอร์มแก้ในแถว (ไม่ใช่ modal จึงไม่มี overlay/Teleport ให้พลาด) -->
                    <div v-if="k === 'failed' && fixId === q.id && fixDraft" class="rv-fix">
                      <QuestionEditor v-model="fixDraft" compact />
                      <label class="rv-label">แก้อะไร/ทำไม (บังคับ)</label>
                      <textarea v-model="triageFixReason" :maxlength="LIMITS.reviewReason" class="rv-input" rows="3" placeholder="สรุปสั้นๆ ว่าแก้ตรงไหน เพราะอะไร…"></textarea>
                      <p class="rv-fix-note">
                        ✅ บันทึกแล้ว = ตรวจผ่านทันที (นับเป็นข้อที่คุณตรวจแล้ว)
                      </p>
                      <button
                        class="rv-btn rv-primary rv-fix-save"
                        :disabled="!draftValid(fixDraft) || !triageFixReason.trim() || fixSaving"
                        @click="saveFix(q)"
                      >{{ fixSaving ? 'กำลังบันทึก…' : 'บันทึกการแก้' }}</button>
                    </div>
                    <div v-if="k === 'nogroup' && nogroupId === q.id" class="rv-nogroup">
                      <TopicSelect v-model="nogroupPle" />
                      <button
                        class="rv-btn rv-primary rv-nogroup-save"
                        :disabled="!isPleGroupKey(nogroupPle.group) || nogroupSaving"
                        @click="saveNogroup(q)"
                      >{{ nogroupSaving ? 'กำลังบันทึก…' : 'บันทึกกลุ่มโรค' }}</button>
                    </div>
                  </li>
                </ul>
                <button
                  v-if="buckets[k].length > (bucketShown[k] || BUCKET_PAGE)"
                  class="rv-mini rv-bucket-more" @click="bucketShown[k] = (bucketShown[k] || BUCKET_PAGE) + BUCKET_PAGE"
                >ดูเพิ่ม (เหลืออีก {{ buckets[k].length - (bucketShown[k] || BUCKET_PAGE) }})</button>
              </div>
            </details>
            <button class="rv-mini rv-triage-reload" :disabled="triageLoading" @click="loadTriage">↻ โหลดรายการใหม่</button>
          </template>
        </template>
      </section>

      <!-- ── leaderboard ── -->
      <section class="rv-board">
        <div class="rv-board-head"><Emoji char="🏅" /> ใครตรวจไปกี่ข้อ</div>
        <div v-if="!leaderboard.length" class="rv-empty rv-board-empty">ยังไม่มีใครตรวจ</div>
        <ol v-else class="rv-board-list">
          <li v-for="row in leaderboard" :key="row.uid" class="rv-board-row" :class="{ me: row.uid === myUid }">
            <span class="rv-board-name">{{ row.name }}<span v-if="row.uid === myUid" class="rv-you"> (คุณ)</span></span>
            <span class="rv-board-count">{{ row.count }} ข้อ</span>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { collection, getDocs, getDoc, doc, updateDoc, deleteField, serverTimestamp, query, where, orderBy, startAt, limit } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { domainLabel } from '../data/domains.js'
import { computeStatus, nextReviewQueue, needsReviewBy, buildLeaderboard, VERDICT_LABEL, pickRandom, REVIEW_RESET, reviewFixResult, verdictContentChanged, sideContentChanged } from '../utils/questionReview.js'
import { triageBuckets, triageSummary, BUCKET_KEYS, BUCKET_META } from '../utils/questionTriage.js'
import { getCategories } from '../utils/questionCategories.js'
import { pleFields, plePatch } from '../utils/pleMapping.js'
import { isPleGroupKey } from '../data/plecc.js'
import { quizSample } from '../utils/quizSample.js'
import TopicSelect from '../components/questions/TopicSelect.vue'
import QuestionEditor from '../components/questions/QuestionEditor.vue'
import QuestionComments from '../components/questions/QuestionComments.vue'
import JudgeActions from '../components/review/JudgeActions.vue'
import { draftFrom, draftPayload, draftValid } from '../utils/questionDraft.js'
import { useConfirm } from '../composables/useConfirm.js'
import { groupReports } from '../utils/questionReport.js'
import { REPORT_REWARD } from '../data/index.js'
import { useReviewWrites } from '../composables/useReviewWrites.js'

const authStore = useAuthStore()
const usage = useUsageStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { reviewerName, writeVote, writeFix, writeRetireWithCredit, resolveReports } = useReviewWrites()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
// เหลือผลตรวจเดียว "ถูกต้อง" — เจอปัญหาให้กด "มีจุดผิด" ใน JudgeActions แก้เนื้อหาแล้วนับว่าผ่านตรวจในตาเดียว (ดู onJudgeFix)
// ไม่มี "ตีว่าผิดไม่แก้" อีกแล้ว (user สั่ง 14 ก.ย. 2026) — เจอปัญหาที่แก้เองไม่ได้ ใช้ "ข้ามข้อนี้" + คอมเมนต์แทน
const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const skippedIds = ref(new Set())
const reason = ref('')
const refText = ref('')
const priorReviews = ref([])
// ผลตรวจของ "รอบก่อนแก้" — subdoc ที่ uid หลุดจาก reviewedBy ไปตอน REVIEW_RESET
// ⚠️ Firestore ไม่ได้ลบ subdoc พวกนี้ทิ้งเลย ข้อมูลอยู่ครบมาตลอด แค่ไม่เคยมีใครเอามาโชว์
//    ⇒ เห็นได้โดยไม่ต้องเก็บฟิลด์เพิ่มสักตัว (0 write เพิ่ม · +1–2 read เฉพาะข้อที่เคยถูกแก้)
const priorFixedReviews = ref([])
const ple = ref({ group: null, sub: null })   // กลุ่มโรค/โรคย่อยของข้อปัจจุบัน (prefill ด้วยค่าที่เดาให้ คนตรวจยืนยัน)
const note = ref('')          // หมายเหตุผู้ตรวจ (นักศึกษาเห็นท้ายเฉลย) — ต่อเติมจากของเดิมได้
const hadNote = ref(false)    // ข้อนี้มีหมายเหตุจากคนก่อนไหม (ใช้โชว์ป้ายเตือนไม่ให้ลบทิ้ง)
const groupOpen = ref(false)  // กางตัวเลือกกลุ่มโรค (มีกลุ่มอยู่แล้วแต่กด "เปลี่ยน") — ไม่มีกลุ่ม = กางเลยเสมอ ไม่ต้องพึ่งตัวนี้
const extrasOpen = ref(false) // กางช่องเหตุผล/เรฟ/หมายเหตุ — ค่าเริ่มต้นตั้งจาก reviewNote เดิม (ดู watch(currentId))


const myUid = computed(() => authStore.currentUser?.uid || null)

const CONFLICT_LIMIT = 200  // ข้อขัดแย้ง (ของเก่าสมัยเกณฑ์ 2 คน) — ดึงมาให้ครบ ปกติมีไม่เยอะ
const PENDING_WINDOW = 40   // ข้อที่ยังไม่มีใครตรวจ — สุ่มหน้าต่างเล็กพอ ต้นทุนคงที่

const currentId = ref(null)
// คิวข้อที่ต้องให้ฉันตรวจ ลบข้อที่กด "ข้าม" ในเซสชันนี้
const queue = computed(() =>
  nextReviewQueue(list.value, myUid.value).filter(q => !skippedIds.value.has(q.id)))
// ข้อปัจจุบัน = ข้อที่สุ่มไว้ (ตรึงไว้จนกว่าจะส่ง/ข้าม — ห้ามผูกกับ queue[0] ไม่งั้นข้อจะเด้งเอง)
const current = computed(() => queue.value.find(q => q.id === currentId.value) || null)

// สุ่มข้อถัดไปแบบเท่ากันหมด (เกณฑ์ 1 คน/ข้อ = ไม่มีข้อ "ค้างครึ่งทาง" ให้ต้องเร่งอีกแล้ว)
function pickNext() {
  const q = pickRandom(queue.value)
  currentId.value = q ? q.id : null
}
const currentStatus = computed(() => current.value ? computeStatus(current.value) : null)

// ── ฟอร์มแก้ข้อในหน้าตรวจ ──
//  คนตรวจเจอข้อผิดแล้วแก้ได้เลย ไม่ต้องเดินไปคลัง — นี่คือชิ้นส่วนที่ทำให้ลูป "ตก→แก้→ตรวจใหม่" ครบ
//  แก้ชั้นตัดสิน (โจทย์/ตัวเลือก/เฉลย) → ข้อวนเข้าคิวให้คนอื่นตรวจ คนแก้ตรวจเองไม่ได้ (lastFixBy)
//  แก้ชั้นประกอบ (คำอธิบาย/หมายเหตุ) → อยู่ข้อเดิม ส่งผลตรวจต่อได้เลย
const editing = ref(false)
const editDraft = ref(null)
const savingEdit = ref(false)
const commentsOpen = ref(false)   // กล่องคอมเมนต์ — mount เมื่อกางเท่านั้น (ดูหมายเหตุที่ template)
const retiring = ref(false)
// "แก้อะไร/ทำไม" — บังคับกรอกเฉพาะตอนแก้ชั้นตัดสิน (editRequeues) เพราะการบันทึกครั้งนั้นคือการตรวจ
// ที่จบในตาเดียว (ดู saveEdit) ต้องมีเหตุผลให้คนตรวจรอบถัดไปเห็นเหมือนกับ reason ของฟอร์มตรวจหลัก
const fixReason = ref('')

const editPayload = computed(() => (editing.value && editDraft.value) ? draftPayload(editDraft.value) : null)
// 🔑 ฐานเปรียบเทียบต้อง normalize ด้วยสูตรเดียวกับฝั่งที่จะเขียน (draftFrom → draftPayload)
//    เทียบกับ doc ดิบตรงๆ ไม่ได้: ข้อเก่าที่มีช่องว่างหัวท้าย / ตัวเลือกว่างคาไว้ / โจทย์ยาวเกิน
//    LIMITS จะ "ต่าง" ตั้งแต่เปิดฟอร์มโดยยังไม่มีใครพิมพ์ ⇒ ป้ายส้มขึ้นหลอก แล้วกดบันทึก
//    ก็โยนงานตรวจให้ทั้งทีมฟรีๆ
const editBase = computed(() => current.value ? draftPayload(draftFrom(current.value)) : null)
// แก้แบบนี้แล้วข้อจะนับว่าผ่านตรวจทันทีไหม (แทนที่จะ "วนเข้าคิว" แบบเดิม) — ใช้ทั้งตัดสินเส้นทางเขียน
// และขึ้นป้ายเตือนก่อนกด (ชื่อตัวแปรคงไว้ตามเดิมเพื่อลด diff แต่ความหมายเปลี่ยนจาก "จะวนคิว" เป็น "จะนับว่าผ่านตรวจ")
const editRequeues = computed(() => !!editPayload.value && verdictContentChanged(editBase.value, editPayload.value))
const editTouched = computed(() =>
  !!editPayload.value && (editRequeues.value || sideContentChanged(editBase.value, editPayload.value)))
const canSaveEdit = computed(() => !!editPayload.value && draftValid(editDraft.value) && editTouched.value
  && (!editRequeues.value || !!fixReason.value.trim()))

function openEdit() {
  if (!current.value) return
  editDraft.value = draftFrom(current.value)
  editing.value = true
  fixReason.value = ''
  // ปิดกล่องคอมเมนต์ก่อนกางฟอร์ม — <details v-if="!editing"> unmount ทั้งก้อน ถ้าปล่อยค้างเปิดไว้
  // พอกดยกเลิก QuestionComments จะ mount ใหม่แล้วยิงอ่านคอมเมนต์ซ้ำฟรีอีกรอบ
  commentsOpen.value = false
}
function closeEdit() { editing.value = false; editDraft.value = null; fixReason.value = '' }

async function saveEdit() {
  if (!canSaveEdit.value || savingEdit.value || !current.value || !myUid.value) return
  const q = current.value
  const uid = myUid.value
  const fixerName = reviewerName()
  const payload = editPayload.value
  const isFix = editRequeues.value
  if (!(await confirm(isFix
    ? 'บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ'
    : 'บันทึกคำอธิบาย / หมายเหตุ?\nผลตรวจเดิมยังอยู่ ตรวจต่อได้เลย'))) return
  savingEdit.value = true
  try {
    if (isFix) {
      const { oldStatus, bumped } = await writeFix(q, payload, fixReason.value)
      // เครดิต local เฉพาะตอน reviewMeta bump ฝั่งเซิร์ฟเวอร์สำเร็จจริง (ดูคอมเมนต์ bumped ใน useReviewWrites.js)
      if (bumped) {
        meta.value = {
          counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
          names: { ...(meta.value.names || {}), [uid]: fixerName },
          progress: bumpedProgress(oldStatus, 'passed'),
        }
      }
      patchTriageRow(q.id, {
        ...payload, ...reviewFixResult(uid), retired: false,
        lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
      })
      fixReason.value = ''
      closeEdit()
      toast('แก้และตรวจผ่านแล้ว ขอบคุณ!', 'success')
      pickNext()
    } else {
      await updateDoc(doc(db, 'questions', q.id), {
        explanation: payload.explanation,
        reviewNote: payload.reviewNote,
        updatedAt: serverTimestamp(),
      })
      usage.track(0, 1)
      // 🔑 ต้อง patch local ด้วย — submit() เทียบ baseNote จาก q.reviewNote ที่โหลดมาตอนเปิดข้อ
      //    ถ้าไม่ patch หมายเหตุที่เพิ่งบันทึกจะโดนค่าเก่าเขียนทับตอนกดส่งผลตรวจ
      patchTriageRow(q.id, { explanation: payload.explanation, reviewNote: payload.reviewNote })
      note.value = payload.reviewNote || ''
      hadNote.value = !!payload.reviewNote
      closeEdit()
      toast('บันทึกแล้ว — ตรวจต่อได้เลย', 'success')
    }
  } catch (e) { console.error('[review edit]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { savingEdit.value = false }
}

// ── ปุ่มตัดสินจาก JudgeActions (การ์ดปกติ, mode="review") ──
// onJudgeFix: กด "มีจุดผิด" → "✏️ แก้ข้อนี้" แล้วบันทึก — แก้ชั้นตัดสินแล้วนับว่าผ่านตรวจในตาเดียว
// เหมือนสาขา isFix ของ saveEdit() ทุกประการ ต่างแค่ผสมกลุ่มโรคจากแถวกลุ่มโรคบนการ์ด (ple.value) เข้าไปด้วย
// เพราะ QuestionEditor compact ซ่อน TopicSelect ของตัวเอง — payload จาก JudgeActions จึงไม่มีหมวดใหม่ติดมา
async function onJudgeFix({ payload, reason: fixReasonText }) {
  if (savingEdit.value || !current.value || !myUid.value) return
  if (!(await confirm('บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ'))) return
  const q = current.value
  const uid = myUid.value
  const fixerName = reviewerName()
  const finalPayload = { ...payload, ...(plePatch(ple.value.group, ple.value.sub) || {}) }
  savingEdit.value = true
  try {
    const { oldStatus, bumped } = await writeFix(q, finalPayload, fixReasonText)
    // เครดิต local เฉพาะตอน reviewMeta bump ฝั่งเซิร์ฟเวอร์สำเร็จจริง (ดูคอมเมนต์ bumped ใน useReviewWrites.js)
    if (bumped) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: fixerName },
        progress: bumpedProgress(oldStatus, 'passed'),
      }
    }
    patchTriageRow(q.id, {
      ...finalPayload, ...reviewFixResult(uid), retired: false,
      lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
    })
    toast('แก้และตรวจผ่านแล้ว ขอบคุณ!', 'success')
    pickNext()
  } catch (e) { console.error('[review judge fix]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { savingEdit.value = false }
}

// onJudgeRetire: แทนที่ retireCurrent() เดิม — ต่างจากของเดิมตรงใช้ writeRetireWithCredit (Task 2)
// ที่ให้เครดิตคนกดด้วย (ของเดิมแค่ updateDoc เฉยๆ ไม่เครดิตเลย) · คงพฤติกรรม patchTriageRow + pickNext ไว้เหมือนเดิม
async function onJudgeRetire({ reason: retireReasonText }) {
  if (retiring.value || !current.value) return
  const q = current.value
  if (!(await confirm(`นำข้อนี้ออกจากการใช้งาน?\n\n"${truncate60(q.question)}"\n\nข้อจะถอนเผยแพร่และไม่เข้าคิวตรวจอีก (ไม่ได้ลบทิ้ง — กู้คืนได้ที่คลังข้อสอบ)`))) return
  retiring.value = true
  try {
    const { oldStatus, credited, bumped } = await writeRetireWithCredit(q, retireReasonText)
    patchTriageRow(q.id, { retired: true, isPublished: false })   // needsReviewBy กรอง retired → หลุดคิวเอง
    if (credited && bumped) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [myUid.value]: ((meta.value.counts || {})[myUid.value] || 0) + 1 },
        names: { ...(meta.value.names || {}), [myUid.value]: reviewerName() },
        progress: bumpedProgress(oldStatus, 'retired'),
      }
    }
    toast('นำข้อนี้ออกแล้ว', 'success')
    pickNext()
  } catch (e) { console.error('[review judge retire]', e); toast('นำออกไม่สำเร็จ', 'error') }
  finally { retiring.value = false }
}

// ความคืบหน้าทั้งคลัง — มาจากตัวนับใน reviewMeta (ไม่เปลือง read)
// conflict เป็นเลขสดจากคิวที่โหลดมาจริงได้ก็จริง แต่ใช้ค่าจาก meta ให้เป็นชุดเดียวกันทั้งแถบ
// ตัวนับ 'half' เป็นซากของเกณฑ์ 2 คน — บวกรวมเข้า "รอตรวจ" ไว้กันยอดรวมหายดื้อๆ ก่อนแอดมิน
// กด "🔄 คำนวณ meta ใหม่" · หลังกดแล้ว half เป็น 0 เอง บรรทัดนี้กลายเป็น no-op
const progress = computed(() => {
  const p = meta.value.progress || {}
  const num = k => Math.max(0, p[k] || 0)
  const passed = num('passed'), failed = num('failed')
  const conflict = num('conflict'), pending = num('pending') + num('half')
  const total = passed + failed + conflict + pending
  return { passed, failed, conflict, pending, total, pct: total ? Math.round((passed / total) * 100) : 0 }
})
// จำนวนข้อที่ต้องให้ฉันตรวจ "ในคิวรอบนี้" (เท่าที่โหลดมา ไม่ใช่ทั้งคลัง)
const myQueueCount = computed(() => nextReviewQueue(list.value, myUid.value).length)

// กลุ่มโรคบังคับ — picker prefill ค่าที่เดาให้อยู่แล้ว ปกติจึงเป็น 0 คลิก
// แต่ข้อที่เดาไม่ออกต้องให้คนตรวจเลือก ไม่งั้นมันจะค้างไม่มีหมวดไปตลอด
// ผลตรวจเหลือทางเดียวคือ "ถูกต้อง" (JudgeActions ส่ง pass ทันทีเมื่อกด) จึงไม่ต้องเช็ค verdict อีกต่อไป
const canSubmit = computed(() => isPleGroupKey(ple.value.group))

// ตัดโจทย์ให้สั้นไว้โชว์ในแถบ "เพิ่งส่ง" — เติม … เฉพาะตอนตัดจริง กันจุดไข่ปลาโผล่ต่อท้ายข้อความสั้น
function truncate60(text) {
  const t = text || ''
  return t.length > 60 ? t.slice(0, 60) + '…' : t
}

// Firestore Timestamp | Date | number → "11 ก.ย." (รับ Date ด้วยเพราะ patch local ใช้ new Date())
function fmtFixTime(t) {
  if (!t) return ''
  const ms = t instanceof Date ? t.getTime()
    : typeof t.toMillis === 'function' ? t.toMillis()
    : t.seconds ? t.seconds * 1000
    : typeof t === 'number' ? t : null
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}


// ── 🗂️ ข้อที่รอดำเนินการ ──
//  ⚠️ ต้องอ่านทั้ง collection ถึงจะรู้ว่าข้อไหนมีปัญหา ซึ่งขัดกับหลักของหน้านี้
//     (คิว 2 ก้อน = ต้นทุน read คงที่) → โหลดเฉพาะตอนผู้ใช้กด "ดูรายการ" เท่านั้น
//     ห้ามย้ายไปเรียกใน onMounted เด็ดขาด
const BUCKET_PAGE = 10
const triageRows = ref([])
const triageLoaded = ref(false)
const triageLoading = ref(false)
const openBucket = ref(null)
const bucketShown = ref({})
const requeuingId = ref(null)

// แก้กลุ่มโรคในแถวของกอง "ไม่มีกลุ่มโรค" — เดิมเป็นลิงก์ไป /questions มือเปล่า ต้องไปไล่หาข้อเอง
// ทีละแถว ไม่ทำ bulk เพราะกองนี้ต้องอ่านโจทย์ก่อนถึงจะเลือกกลุ่มได้
const nogroupId = ref(null)
const nogroupPle = ref({ group: null, sub: null })
const nogroupSaving = ref(false)

function openNogroup(q) {
  nogroupId.value = nogroupId.value === q.id ? null : q.id
  nogroupPle.value = pleFields(q)
}

// ── 🧰 จำแนกหมวดเป็นชุด (bulk) — เคลียร์กอง nogroup ทีเดียวแทนกดทีละข้อ (15 ก.ย. 2026) ──
//  ใช้ plePatch()+updateDoc path เดียวกับ saveNogroup ทุกประการ ต่างแค่วนลูปหลายข้อ
const bulkExportText = computed(() => JSON.stringify(
  (buckets.value.nogroup || []).map(q => ({ id: q.id, question: q.question, choices: q.choices })),
  null, 2,
))
const bulkImportText = ref('')
const bulkApplying = ref(false)
const bulkResult = ref(null)   // { ok, fail, failIds }

async function copyBulkExport() {
  try { await navigator.clipboard.writeText(bulkExportText.value); toast('คัดลอกแล้ว', 'success') }
  catch (e) { toast('คัดลอกไม่สำเร็จ — เลือกข้อความในกล่องแล้ว copy เองได้', 'error') }
}

async function applyBulkClassify() {
  if (bulkApplying.value) return
  let items
  try { items = JSON.parse(bulkImportText.value) } catch (e) { toast('รูปแบบ JSON ไม่ถูกต้อง', 'error'); return }
  if (!Array.isArray(items) || !items.length) { toast('ไม่มีรายการให้นำเข้า', 'error'); return }
  if (!(await confirm(`จะจำแนกหมวด ${items.length} ข้อ — ยืนยัน?`))) return
  bulkApplying.value = true
  let ok = 0
  const failIds = []
  const CHUNK = 20   // ยิงพร้อมกันเป็นชุด กันยิงรัวเกินไปทีเดียว 310+ ข้อ
  for (let i = 0; i < items.length; i += CHUNK) {
    const slice = items.slice(i, i + CHUNK)
    await Promise.all(slice.map(async (it) => {
      const patch = it?.id ? plePatch(it.pleGroup, it.pleSub) : null
      if (!patch) { failIds.push(it?.id || '?'); return }
      try {
        await updateDoc(doc(db, 'questions', it.id), { ...patch, updatedAt: serverTimestamp() })
        usage.track(0, 1)
        patchTriageRow(it.id, patch)   // แถวหลุดกอง nogroup ทันที ไม่ต้องรอโหลดใหม่
        ok++
      } catch (e) { console.error('[bulk classify]', it.id, e); failIds.push(it.id) }
    }))
  }
  bulkApplying.value = false
  bulkResult.value = { ok, fail: failIds.length, failIds }
  toast(`จำแนกสำเร็จ ${ok} ข้อ${failIds.length ? ` · พลาด ${failIds.length} ข้อ` : ''}`, failIds.length ? 'error' : 'success')
  if (ok) bulkImportText.value = ''
}

async function saveNogroup(q) {
  const patch = plePatch(nogroupPle.value.group, nogroupPle.value.sub)
  if (!patch || nogroupSaving.value) return
  nogroupSaving.value = true
  try {
    // rules ผ่านทาง reviewUntouched() — ไม่แตะผลตรวจเลย
    // categories มาจาก plePatch เสมอ ห้ามเขียนมือ (CLAUDE.md ข้อ 14)
    await updateDoc(doc(db, 'questions', q.id), { ...patch, updatedAt: serverTimestamp() })
    usage.track(0, 1)
    patchTriageRow(q.id, patch)   // bucketsOf() อ่าน pleFields → แถวหลุดกองทันที
    // ปิดเฉพาะแผงของแถวนี้ — กันเคสระหว่างรอ updateDoc คนเปิดแถวอื่นไปแล้ว (race ข้ามแถว)
    if (nogroupId.value === q.id) nogroupId.value = null
    toast('บันทึกกลุ่มโรคแล้ว', 'success')
  } catch (e) { console.error('[nogroup save]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { nogroupSaving.value = false }
}

// ── ✏️ แก้ข้อในแถวของกอง "ไม่ผ่านตรวจ" — ชิ้นส่วนที่ทำให้ลูปปิดจริง ──
//  ข้อ failed ไม่เคยเข้าคิวตรวจ (load() ดึงแค่ pending + conflict ซึ่งเป็นโครงที่ต้องคงไว้
//  เพื่อให้ต้นทุน read คงที่) ⇒ ปุ่ม "แก้ข้อนี้" บนการ์ดข้อปัจจุบันเอื้อมไม่ถึงมันเลย
//  ทางเดียวที่เหลือคือ "ส่งกลับเข้าคิว" เปล่าๆ = ข้อที่ยังผิดวนกลับไปให้คนถัดไปกดตกอีก ไม่จบ
//  จึงกางฟอร์มแก้ในแถวเลย (แพทเทิร์นเดียวกับกอง "ไม่มีกลุ่มโรค") แล้วบันทึกด้วยเส้นทาง
//  เดียวกับสาขา isFix ของ saveEdit() เป๊ะ — บันทึกแล้ว = ผ่านทันที (reviewFixResult) ไม่ใช่ REVIEW_RESET
//  ต้องบังคับกรอกเหตุผลก่อน (triageFixReason) และเขียน reviews/{uid} ก่อน updateDoc เสมอ
//  (isReviewFix() เช็ค existsAfter ซึ่งมองเห็นแค่ผลของคำขอเดียวกัน — ดูคอมเมนต์ใน saveFix() ด้านล่าง)
const fixId = ref(null)
const fixDraft = ref(null)
const fixSaving = ref(false)
const triageFixReason = ref('')   // "แก้อะไร/ทำไม" บังคับกรอกก่อนบันทึก — คนละช่องกับฟอร์มการ์ดข้อปัจจุบัน

function openFix(q) {
  if (fixId.value === q.id) { fixId.value = null; fixDraft.value = null; triageFixReason.value = ''; return }
  fixId.value = q.id
  fixDraft.value = draftFrom(q)
  triageFixReason.value = ''
}

async function saveFix(q) {
  if (fixSaving.value || fixId.value !== q.id || !fixDraft.value) return
  if (!draftValid(fixDraft.value) || !triageFixReason.value.trim() || !myUid.value) return
  const uid = myUid.value
  const fixerName = reviewerName()
  const payload = draftPayload(fixDraft.value)
  if (!(await confirm('บันทึกการแก้?\nนับว่าคุณตรวจข้อนี้ผ่านแล้ว ไม่ต้องรอคนอื่นตรวจซ้ำ'))) return
  fixSaving.value = true
  try {
    const { oldStatus, bumped } = await writeFix(q, payload, triageFixReason.value)
    if (bumped) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: fixerName },
        progress: bumpedProgress(oldStatus, 'passed'),
      }
    }
    patchTriageRow(q.id, {
      ...payload, ...reviewFixResult(uid), retired: false,
      lastFixBy: uid, lastFixByName: fixerName, lastFixAt: new Date(),   // local ใช้ Date จริง
    })   // computeStatus กลับเป็น passed → แถวหลุดกอง 🔴 ทันที ไม่ต้องรอโหลดใหม่
    if (fixId.value === q.id) { fixId.value = null; fixDraft.value = null; triageFixReason.value = '' }
    toast('แก้และตรวจผ่านแล้ว ขอบคุณ!', 'success')
    // แก้เนื้อหาแล้ว = รีพอร์ทที่ค้างของข้อนี้ (ถ้ามี) ถือว่าจริง ปิดพร้อมให้รางวัลผู้แจ้งไปเลย
    const reportedGroup = reportGroups.value.find(g => g.questionId === q.id)
    if (reportedGroup) resolveReportGroup(reportedGroup, 'valid')
  } catch (e) { console.error('[triage fix]', e); toast('บันทึกไม่สำเร็จ', 'error') }
  finally { fixSaving.value = false }
}

const buckets = computed(() => triageBuckets(triageRows.value))
const triage = computed(() => triageSummary(triageRows.value))

// เลขคร่าวๆ ก่อนกดโหลด — มาจาก reviewMeta ที่หน้านี้อ่านอยู่แล้ว (ฟรี ไม่มี read เพิ่ม)
// ไม่รวมกอง "ไม่มีกลุ่มโรค" เพราะ meta ไม่ได้นับไว้ จึงเขียนว่า "อย่างน้อย"
const metaHint = computed(() => {
  const parts = []
  if (progress.value.failed) parts.push(`ไม่ผ่านตรวจ ${progress.value.failed}`)
  if (progress.value.conflict) parts.push(`ขัดแย้ง ${progress.value.conflict}`)
  return parts.length ? parts.join(' · ') : ''
})

async function loadTriage() {
  if (triageLoading.value) return
  triageLoading.value = true
  try {
    const snap = await getDocs(collection(db, 'questions'))
    usage.track(snap.size)
    triageRows.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    triageLoaded.value = true
    bucketShown.value = {}
  } catch (e) { console.error('[triage load]', e); toast('โหลดรายการไม่สำเร็จ', 'error') }
  finally { triageLoading.value = false }
}

// ล้างร่องรอย "ใครแก้รอบก่อน" — ส่งกลับเข้าคิวเฉยๆ ไม่ได้แปลว่าเนื้อหารอบนี้มาจากคนเดิม
// ถ้าไม่ล้าง needsReviewBy จะกันคนที่เคยแก้ข้อนี้ออกจากคิวไปตลอดกาลแบบสะสม
// (ทีมวิชาการใช้งานจริงราว 13 คน กันทีละคนไปเรื่อยๆ คือคิวแห้งจริง)
// ⚠️ deleteField() เป็น sentinel ของ Firestore ห้ามยัดลง local state — ฝั่งจอใช้ null
const CLEAR_FIX_SERVER = { lastFixBy: deleteField(), lastFixByName: deleteField(), lastFixAt: deleteField() }
const CLEAR_FIX_LOCAL = { lastFixBy: null, lastFixByName: null, lastFixAt: null }

// ส่งข้อที่แก้แล้วกลับเข้าคิวตรวจ — rules อนุญาต canEditQuestions() ผ่าน isReviewReset()
async function requeue(q) {
  if (requeuingId.value) return
  if (!(await confirm(`ส่ง "${truncate60(q.question)}" กลับเข้าคิวตรวจใหม่?`))) return
  requeuingId.value = q.id
  try {
    await updateDoc(doc(db, 'questions', q.id), {
      ...REVIEW_RESET, reviewVerdicts: deleteField(), ...CLEAR_FIX_SERVER,
    })
    usage.track(0, 1)
    patchTriageRow(q.id, { ...REVIEW_RESET, ...CLEAR_FIX_LOCAL })
    toast('ส่งกลับเข้าคิวตรวจแล้ว', 'success')
  } catch (e) { console.error('[requeue]', e); toast('ส่งกลับไม่สำเร็จ', 'error') }
  finally { requeuingId.value = null }
}

// อัปเดตแถวใน 2 ที่ที่ถือข้อเดียวกันอยู่ — รายการรอดำเนินการ + คิวตรวจที่โหลดไว้
function patchTriageRow(id, patch) {
  const ti = triageRows.value.findIndex(x => x.id === id)
  if (ti >= 0) triageRows.value[ti] = { ...triageRows.value[ti], ...patch }
  const li = list.value.findIndex(x => x.id === id)
  if (li >= 0) list.value[li] = { ...list.value[li], ...patch }
}

// กระโดดไปตรวจข้อขัดแย้งที่เลือก — ทำได้เฉพาะข้อที่อยู่ในคิวรอบนี้และเรายังไม่เคยตรวจ
function jumpTo(q) {
  if (!queue.value.some(x => x.id === q.id)) {
    toast(needsReviewBy(q, myUid.value) ? 'ข้อนี้ไม่ได้อยู่ในคิวรอบนี้ — กดโหลดรอบใหม่ก่อน' : 'คุณตรวจข้อนี้ไปแล้ว', 'info')
    return
  }
  currentId.value = q.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// leaderboard จาก reviewMeta doc (ตัวนับ + ชื่อ snapshot ตอน submit) — 1 read
// ไม่ต้องอ่านทั้งคลัง/users collection และไม่พึ่ง members store (บางคนไม่มี studentId)
const meta = ref({ counts: {}, names: {} })
const leaderboard = computed(() => buildLeaderboard(meta.value.counts || {}, meta.value.names || {}))

onMounted(() => {
  if (!authStore.isQuestionEditor) return
  load()
  loadOpenReports()
})

// ── 🚩 ข้อที่ถูกรีพอร์ท (questionReports) — ย้ายมาจาก QuestionsView ให้อยู่ลูปเดียวกับการตรวจ ──
const openReports = ref([])
const reportsLoading = ref(false)
const resolvingReportId = ref(null)
const reportGroups = computed(() => groupReports(openReports.value))

async function loadOpenReports() {
  reportsLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'questionReports'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
      limit(200),
    ))
    usage.track(snap.size)
    openReports.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { console.error('[reports load]', e) }
  finally { reportsLoading.value = false }
}

function reportQuestionText(g) {
  return list.value.find(x => x.id === g.questionId)?.question || g.snapshot?.question || '(ไม่พบโจทย์)'
}

// เปิดฟอร์มแก้ของกอง "ถูกรีพอร์ท" — ใช้เส้นทางเดียวกับ openFix/saveFix ทุกประการ (แก้ = ผ่านตรวจทันที)
// ต่างจากกอง failed แค่ต้องไปดึงตัวข้อสดมาก่อน เพราะข้อที่ถูกรีพอร์ทอาจไม่ได้อยู่ใน list/triageRows ที่โหลดไว้
// เก็บตัวข้อสดไว้ใน fixSourceQuestion เพื่อส่งให้ saveFix() ตอนกดบันทึก (ต้องมี reviewStatus จริงให้ computeStatus ใช้)
const fixSourceQuestion = ref(null)
async function openReportedFix(g) {
  if (fixId.value === g.questionId) { fixId.value = null; fixDraft.value = null; triageFixReason.value = ''; fixSourceQuestion.value = null; return }
  try {
    const snap = await getDoc(doc(db, 'questions', g.questionId))
    usage.track(1)
    if (!snap.exists()) { toast('ข้อนี้ถูกลบไปแล้ว — แก้ไขไม่ได้', 'error'); return }
    const q = { id: snap.id, ...snap.data() }
    fixSourceQuestion.value = q
    openFix(q)
  } catch (e) { console.error('[reported fix open]', e); toast('โหลดข้อไม่สำเร็จ', 'error') }
}

// ปิดรีพอร์ท — valid มัดรางวัลเมล์ให้ผู้แจ้งทันที (เหมือนของเดิมใน QuestionsView), invalid ไม่มีรางวัล
async function resolveReportGroup(g, verdict) {
  if (resolvingReportId.value) return
  resolvingReportId.value = g.questionId
  try {
    await resolveReports(g, verdict)
    openReports.value = openReports.value.filter(r => r.questionId !== g.questionId)
    toast(verdict === 'valid'
      ? `ส่งรางวัล ${REPORT_REWARD} เหรียญให้ผู้แจ้ง ${g.reports.length} คนแล้ว`
      : 'ปิดรายการแล้ว (ไม่ผิด)', 'success')
  } catch (e) { console.error('[resolve report]', e); toast('ปิดรายการไม่สำเร็จ', 'error') }
  finally { resolvingReportId.value = null }
}

// โหลดคิว 2 ก้อนแยกกัน — ต้นทุน read คงที่ไม่โตตามขนาดคลัง
//  ก้อน A: ข้อขัดแย้ง → ดึงมาให้ครบ (นี่คือข้อที่ค้างจริง รอคนที่ 3 ตัดสิน)
//  ก้อน B: ข้อที่ยังไม่มีใครตรวจ → สุ่มหน้าต่างด้วย field rand (pattern เดียวกับ QuizView)
//  ข้อเก่าก่อนระบบตรวจไม่มี field reviewStatus จะไม่ติด query —
//  แอดมินต้องกด "🔄 ซิงก์ระบบตรวจ" ในหน้า Admin หนึ่งครั้งก่อนเริ่มใช้
//  ⚠️ ไม่ถามหา 'half' แล้ว: เกณฑ์ 1 คน/ข้อ ทำให้ข้อ 1 เสียงจบไปแล้ว (passed/failed)
//  doc ที่ยังเก็บค่า 'half' ค้างอยู่จึงไม่ต้องดึงมาให้เปลือง read — ปุ่มซิงก์จะเขียนทับให้เอง
async function load() {
  loading.value = true
  try {
    const col = collection(db, 'questions')
    const R = Math.random()
    const [conflictSnap, firstSnap, metaSnap] = await Promise.all([
      getDocs(query(col, where('reviewStatus', '==', 'conflict'), limit(CONFLICT_LIMIT))),
      getDocs(query(col, where('reviewStatus', '==', 'pending'), orderBy('rand'), startAt(R), limit(PENDING_WINDOW))),
      getDoc(doc(db, 'reviewMeta', 'main')),
    ])
    let reads = conflictSnap.size + firstSnap.size + 1
    // สุ่มไปชนปลายลิสต์ → วนอ่านต้นลิสต์เติมให้เต็มหน้าต่าง
    let wrap = []
    if (firstSnap.size < PENDING_WINDOW) {
      const wrapSnap = await getDocs(query(col, where('reviewStatus', '==', 'pending'), orderBy('rand'), limit(PENDING_WINDOW)))
      wrap = wrapSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      reads += wrapSnap.size
    }
    usage.track(reads)
    const pending = quizSample(firstSnap.docs.map(d => ({ id: d.id, ...d.data() })), wrap, PENDING_WINDOW)
    list.value = [...conflictSnap.docs.map(d => ({ id: d.id, ...d.data() })), ...pending]
    if (metaSnap.exists()) meta.value = metaSnap.data()
    pickNext()
  } catch (e) { console.error('[review load]', e); toast('โหลดข้อสอบไม่สำเร็จ', 'error') }
  finally { loading.value = false }
}

// เปลี่ยน "ข้อ" → ล้างฟอร์ม + โหลดรีวิวเดิมถ้าเป็นข้อ conflict (ให้คนที่ 3 เห็น)
// ⚠️ ผูกกับ currentId ไม่ใช่ current — current เป็น computed ที่ .find() ในอาเรย์ list
//    พอแก้แถวใน list (เช่นบันทึกคำอธิบาย) มันคืน object ใบใหม่ทั้งที่ยังเป็นข้อเดิม
//    ⇒ ถ้า watch ตัว current จะล้าง verdict/เหตุผลที่คนตรวจกรอกค้างไว้ แล้วยิงอ่าน subcollection ซ้ำฟรี
watch(currentId, async (id) => {
  closeEdit()
  commentsOpen.value = false
  reason.value = ''; refText.value = ''; priorReviews.value = []
  const q = current.value
  ple.value = pleFields(q)
  note.value = q?.reviewNote || ''
  hadNote.value = !!q?.reviewNote
  extrasOpen.value = !!q?.reviewNote   // มีหมายเหตุเดิมอยู่แล้ว — กางให้เห็นเลยไม่ต้องเดาว่ามันซ่อนอยู่
  groupOpen.value = false
  if (!q) return
  priorFixedReviews.value = []
  // โหลดผลตรวจเดิมเมื่อ (ก) ข้อ conflict รอคนที่ 3 ตัดสิน หรือ (ข) ข้อเคยถูกแก้ — คนตรวจรอบนี้
  // ต้องรู้ว่ารอบก่อนตกเพราะอะไร ไม่งั้นตรวจไม่ได้ว่า "เขาแก้ตรงจุดหรือเปล่า"
  // ข้อปกติยังไม่เห็นผลตรวจคนอื่น (กันอคติ) — เจตนาเดิมคงไว้
  if (computeStatus(q) === 'conflict' || q.lastFixAt) {
    try {
      const snap = await getDocs(collection(db, 'questions', q.id, 'reviews'))
      if (currentId.value !== id) return   // เลื่อนข้อไปแล้วระหว่างรอเน็ต — ทิ้งผลชุดนี้
      usage.track(snap.size)
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const nowVoters = new Set(q.reviewedBy || [])
      priorReviews.value = rows.filter(r => nowVoters.has(r.id))        // เสียงของรอบปัจจุบัน
      priorFixedReviews.value = rows.filter(r => !nowVoters.has(r.id))  // เสียงก่อนข้อถูกแก้
    } catch (e) { console.error('[review priors]', e) }
  }
}, { immediate: true })

function skip() {
  if (!current.value) return
  const next = new Set(skippedIds.value)
  next.add(current.value.id)
  skippedIds.value = next   // Set ใหม่ → computed queue เลื่อนไปข้อถัดไป
  pickNext()
}
function unskipAll() { skippedIds.value = new Set(); pickNext() }

// ขยับตัวนับ progress ในเครื่อง 1 ข้อ จากสถานะเดิมไปสถานะใหม่ — ใช้ใน submit()
// ไม่เปลี่ยน from ถ้า from === to (คืน clone เฉยๆ) — caller เป็นคนตัดสินใจว่าจะเรียกเมื่อไหร่
function bumpedProgress(from, to) {
  const p = { ...(meta.value.progress || {}) }
  if (from !== to) {
    p[from] = Math.max(0, (p[from] || 0) - 1)
    p[to] = (p[to] || 0) + 1
  }
  return p
}

// รับ event payload จาก JudgeActions (@pass="submit") — ตัวคอมโพเนนต์ส่ง { note } มาด้วย
// แต่หน้านี้ยังใช้ note.value เดิมจากช่องเสริมที่พับไว้เป็นแหล่งความจริง (event payload ของ mode="review"
// เป็น note:'' เปล่าๆ เสมอ เพราะ JudgeActions ส่ง pass ทันทีไม่ถามซ้ำ) — ไม่รับพารามิเตอร์จึงไม่ชนกัน
async function submit() {
  if (!canSubmit.value || submitting.value || !current.value || !myUid.value) return
  if (!(await confirm('ส่งผลว่า "ถูกต้อง"?'))) return
  submitting.value = true
  const q = current.value
  const uid = myUid.value
  const myName = reviewerName()   // snapshot ชื่อจริง
  try {
    const {
      already, wasResolved, oldStatus: oldStatusLocal, newStatus, newPass, newFail,
      committedCats, committedPle, committedNote,
    } = await writeVote(q, {
      verdict: 'correct', reason: reason.value, ref: refText.value, ple: ple.value, note: note.value,
    })
    // หมวดที่ติดมากับข้ออาจไม่เคยขึ้นทะเบียนกลาง (มาจาก bulk import / category เดี่ยวของข้อเก่า)
    // อัปเดต local ให้คิว/leaderboard เลื่อนทันที (ไม่ reload) — ใช้ค่าที่ "เขียนจริง" เป๊ะ ไม่คำนวณซ้ำจากฟอร์ม
    const idx = list.value.findIndex(x => x.id === q.id)
    if (idx >= 0) {
      const patch = already ? {} : {
        reviewPass: newPass, reviewFail: newFail, reviewStatus: newStatus,
        categories: committedCats,
        pleGroup: committedPle?.group ?? null,
        pleSub: committedPle?.sub ?? null,
        reviewNote: committedNote,
      }
      list.value[idx] = { ...q, reviewedBy: [...(q.reviewedBy || []), uid], ...patch }
    }
    if (!already) {
      meta.value = {
        counts: { ...(meta.value.counts || {}), [uid]: ((meta.value.counts || {})[uid] || 0) + 1 },
        names: { ...(meta.value.names || {}), [uid]: myName },
        progress: bumpedProgress(oldStatusLocal, newStatus),
      }
    }
    if (already) {
      toast('คุณตรวจข้อนี้ไปแล้ว', 'info')
    } else if (wasResolved) {
      toast('มีคนตรวจข้อนี้ตัดกันพอดี — นับเสียงคุณเข้าไปด้วยแล้ว', 'success')
    } else {
      toast('ส่งผลตรวจแล้ว ขอบคุณ!', 'success')
    }
    pickNext()
  } catch (e) {
    if (e.message === '__stale') {
      toast('ข้อนี้เพิ่งถูกแก้เนื้อหา — โหลดคิวใหม่ให้แล้ว', 'error')
      load()
    } else { console.error('[review submit]', e); toast('ส่งไม่สำเร็จ', 'error') }
  } finally { submitting.value = false }
}

</script>

<style scoped>
.rv-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.rv-title { font-family: var(--font-display); font-weight: 400; font-size: 1.5rem; color: var(--ink); line-height: 1.1; }
.rv-back { font-size: .72rem; font-weight: 700; color: #4f46e5; text-decoration: none; }
.rv-denied, .rv-empty { text-align: center; color: rgba(0,0,0,.4); padding: 26px 0; font-size: .85rem; }
.rv-done { color: #15803d; font-weight: 700; }

.rv-summary { font-size: .76rem; color: var(--ink); background: var(--primary-light, #eef2ff); border-radius: 10px; padding: 9px 12px; margin-bottom: 12px; line-height: 1.5; }
.rv-summary b { font-weight: 800; }
.rv-sum-line { line-height: 1.5; }
.rv-bar { height: 7px; border-radius: 999px; background: rgba(0,0,0,.09); overflow: hidden; margin: 8px 0 6px; }
.rv-bar-fill { height: 100%; background: #22c55e; border-radius: 999px; transition: width .3s; }
.rv-sum-mine { font-size: .7rem; color: rgba(0,0,0,.5); }

.rv-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; margin-bottom: 16px; }
.rv-card-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 9px; }
.rv-cat { font-size: .7rem; color: #4f46e5; font-weight: 700; }
.rv-cat-sub { color: rgba(0,0,0,.45); }
.rv-draft { font-size: .7rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.07); color: rgba(0,0,0,.5); }
/* ── 🗂️ ข้อที่รอดำเนินการ ── */
.rv-triage { border: 2px solid var(--ink); border-radius: 14px; padding: 12px; margin-top: 14px; background: #fff; }
.rv-triage-head { font-size: .88rem; font-weight: 800; margin-bottom: 9px; }
.rv-triage-p { margin: 0 0 9px; font-size: .78rem; line-height: 1.55; color: #334155; }
.rv-triage-note { margin: 7px 0 0; font-size: .72rem; color: rgba(0,0,0,.45); }
.rv-triage-clear { text-align: center; padding: 16px 10px; font-size: .84rem; font-weight: 700; color: #15803d; }
.rv-triage-sum { font-size: .78rem; line-height: 1.5; color: #334155; background: #f8fafc; border-radius: 10px; padding: 8px 11px; margin-bottom: 10px; }
.rv-triage-urgent { color: #b91c1c; }
.rv-triage-reload { margin-top: 10px; }

.rv-bucket { border: 1px solid #e2e8f0; border-radius: 11px; margin-bottom: 7px; overflow: hidden; }
.rv-bucket-sum { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; list-style: none; padding: 9px 11px; font-size: .81rem; font-weight: 800; background: #f8fafc; }
.rv-bucket-sum::-webkit-details-marker { display: none; }
.rv-bucket-n { flex-shrink: 0; min-width: 24px; text-align: center; background: #fef2f2; color: #b91c1c; border-radius: 999px; padding: 2px 9px; font-size: .75rem; font-weight: 800; }
.rv-bucket-n.zero { background: rgba(34,197,94,.15); color: #15803d; }
.rv-bucket-body { padding: 10px 11px 12px; }
.rv-bucket-hint { margin: 0 0 9px; font-size: .74rem; line-height: 1.5; color: rgba(0,0,0,.55); }
.rv-bucket-empty { padding: 10px 0; }
.rv-bulk { border: 1px dashed rgba(0,0,0,.18); border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
.rv-bulk-sum { cursor: pointer; list-style: none; padding: 8px 10px; font-size: .78rem; font-weight: 800; background: rgba(79,70,229,.06); }
.rv-bulk-sum::-webkit-details-marker { display: none; }
.rv-bulk-body { padding: 10px; }
.rv-bulk-text { font-family: monospace; font-size: .72rem; }
.rv-bucket-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.rv-bucket-item { border-top: 1px solid #f1f5f9; padding-top: 9px; }
.rv-bucket-item:first-child { border-top: none; padding-top: 0; }
.rv-bucket-q { font-size: .77rem; line-height: 1.5; color: #1e293b; margin-bottom: 6px; }
.rv-bucket-live { display: inline-block; background: rgba(34,197,94,.15); color: #15803d; border-radius: 999px; padding: 1px 8px; font-size: .7rem; font-weight: 800; margin-right: 5px; }
.rv-bucket-draft { display: inline-block; background: rgba(0,0,0,.08); color: rgba(0,0,0,.55); border-radius: 999px; padding: 1px 8px; font-size: .7rem; font-weight: 800; margin-right: 5px; }
.rv-bucket-acts { display: flex; flex-wrap: wrap; gap: 6px; }
.rv-mini.rv-danger { background: rgba(239,68,68,.12); color: #dc2626; }
.rv-report-reasons { list-style: none; margin: 0 0 9px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.rv-report-reasons li { font-size: .74rem; color: rgba(0,0,0,.7); line-height: 1.4; }
.rv-nogroup { margin-top: 9px; border-top: 1px dashed rgba(0,0,0,.12); padding-top: 9px; }
.rv-nogroup-save { margin-top: 9px; width: 100%; }
.rv-fix { margin-top: 9px; border-top: 1px dashed rgba(0,0,0,.12); padding-top: 9px; }
.rv-fix-note { margin: 10px 0 0; border-radius: 10px; padding: 9px 11px; background: rgba(245,158,11,.13); color: #92400e; font-size: .74rem; font-weight: 700; line-height: 1.5; }
.rv-fix-save { margin-top: 9px; width: 100%; }
.rv-bucket-more { margin-top: 10px; }

.rv-conflict-badge { font-size: .7rem; font-weight: 800; padding: 2px 9px; border-radius: 999px; background: #fff7ed; color: #c2410c; }
.rv-q { font-size: .92rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 11px; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-choices { list-style: none; margin: 0 0 4px; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.rv-choices li { font-size: .8rem; color: rgba(0,0,0,.65); display: flex; gap: 8px; align-items: baseline; padding: 7px 10px; border-radius: 9px; background: #f8fafc; }
.rv-choices li.correct { background: rgba(34,197,94,.12); color: #15803d; font-weight: 700; }
.rv-c-letter { font-weight: 800; flex-shrink: 0; }
.rv-c-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.rv-c-mark { flex-shrink: 0; font-size: .7rem; font-weight: 800; color: #15803d; }
.rv-exp { margin-top: 9px; font-size: .74rem; color: #b45309; background: #fffbeb; border-radius: 8px; padding: 8px 10px; line-height: 1.45; }
.rv-exp-none { color: #94a3b8; font-style: italic; }
.rv-comments { margin-top: 12px; border-top: 2px dashed rgba(0,0,0,.1); padding-top: 10px; }
.rv-comments-sum { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 7px; font-size: .78rem; font-weight: 800; color: var(--ink); }
.rv-comments-sum::-webkit-details-marker { display: none; }
.rv-comments-hint { margin-left: auto; font-size: .72rem; font-weight: 700; color: #64748b; }
.rv-editbox { margin-top: 4px; }
.rv-edit-hint { margin-top: 12px; border-radius: 10px; padding: 9px 11px; font-size: .74rem; font-weight: 700; line-height: 1.5; }
.rv-edit-hint.requeue { background: rgba(245,158,11,.13); color: #92400e; }
.rv-edit-hint.stay { background: rgba(34,197,94,.13); color: #166534; }

.rv-fixed { margin-top: 12px; border: 2px dashed rgba(245,158,11,.5); border-radius: 12px; padding: 10px 12px; background: rgba(245,158,11,.07); }
.rv-fixed-head { font-size: .76rem; font-weight: 800; color: #92400e; }
.rv-fixed-when { font-weight: 700; color: #b45309; }
.rv-fixed-sub { margin-top: 7px; font-size: .72rem; font-weight: 700; color: #b45309; }

.rv-priors { margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 11px; }
.rv-priors-head { font-size: .7rem; font-weight: 800; color: #c2410c; margin-bottom: 7px; }
.rv-prior { background: #fffdf7; border: 1px solid rgba(0,0,0,.08); border-radius: 10px; padding: 9px 11px; margin-bottom: 7px; }
.rv-prior-top { display: flex; align-items: center; gap: 8px; font-size: .78rem; margin-bottom: 4px; }
.rv-prior-verdict { font-size: .7rem; font-weight: 800; padding: 1px 7px; border-radius: 999px; }
.rv-prior-verdict.correct { background: rgba(34,197,94,.15); color: #15803d; }
.rv-prior-verdict.fix { background: rgba(245,158,11,.16); color: #b45309; }
.rv-prior-verdict.wrong { background: rgba(239,68,68,.12); color: #dc2626; }
.rv-prior-verdict.fixed { background: rgba(34,197,94,.15); color: #15803d; }
.rv-prior-reason { font-size: .76rem; color: rgba(0,0,0,.7); line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.rv-prior-ref { font-size: .7rem; color: rgba(0,0,0,.45); margin-top: 3px; overflow-wrap: anywhere; }

.rv-form { margin-top: 13px; border-top: 1px dashed var(--border); padding-top: 12px; }
.rv-group-row { font-size: .78rem; color: #334155; line-height: 1.6; margin-bottom: 10px; }
.rv-group-row b { color: var(--ink); }
.rv-group-guess { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 999px; padding: 1px 8px; font-size: .7rem; font-weight: 800; margin-left: 6px; }
.rv-group-change { margin-left: 6px; }
.rv-group-warn { font-size: .76rem; font-weight: 700; color: #92400e; background: rgba(245,158,11,.13); border-radius: 10px; padding: 9px 11px; margin-bottom: 10px; line-height: 1.5; }
.rv-extras-toggle { margin-bottom: 4px; }
.rv-extras { margin-top: 11px; border-top: 1px dashed var(--border); padding-top: 11px; }
.rv-open-edit { margin-top: 4px; }
.rv-label { display: block; font-size: .7rem; font-weight: 700; color: #64748b; margin: 9px 0 5px; }
.rv-note-hint { display: block; font-weight: 700; color: #b45309; font-size: .7rem; margin-top: 2px; }
.rv-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; resize: vertical; }
.rv-input:focus { outline: none; box-shadow: var(--pop); }
.rv-actions { display: flex; gap: 8px; margin-top: 13px; }
.rv-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 11px; font-family: inherit; font-size: .85rem; font-weight: 800; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.rv-primary { background: var(--primary); color: #fff; box-shadow: var(--pop); }
.rv-primary:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.rv-primary:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.rv-gray { background: #fff; color: var(--ink); flex: 0 0 110px; }
.rv-unskip { flex: none; display: block; margin: 12px auto 0; padding: 9px 18px; font-size: .78rem; }

.rv-mini { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 5px 11px; font-family: inherit; font-size: .72rem; font-weight: 800; background: #fff; color: var(--ink); cursor: pointer; }

.rv-board { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 14px; }
.rv-board-head { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.rv-board-empty { padding: 14px 0; }
.rv-board-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; counter-reset: rank; }
.rv-board-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 10px; border-radius: 9px; font-size: .82rem; }
.rv-board-row::before { counter-increment: rank; content: counter(rank); flex-shrink: 0; width: 20px; font-weight: 800; color: rgba(0,0,0,.35); font-size: .72rem; }
.rv-board-row.me { background: var(--primary-light, #eef2ff); }
.rv-board-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.rv-you { color: #4f46e5; font-weight: 800; }
.rv-board-count { flex-shrink: 0; font-weight: 800; color: var(--ink); font-size: .78rem; }

/* ต่อยอด .rv-mini เดิม (นิยามหลักอยู่ด้านบน) ให้ใช้กับปุ่ม disabled และลิงก์ในรายการรอดำเนินการ */
.rv-mini:disabled { background: #f1f5f9; color: rgba(0,0,0,.4); cursor: default; }
a.rv-mini { display: inline-block; text-decoration: none; }
</style>
