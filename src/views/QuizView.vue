<template>
  <div class="tab-content">
    <div class="qv-head">
      <BackButton aria-label="ย้อนกลับ" @click="$router.back()" />
      <span class="qv-head-title"><Emoji char="📝" /> ทำข้อสอบ</span>
      <HelpButton topic="quiz" style="margin-left:auto" />
    </div>

    <div v-if="!authStore.isLoggedIn" class="qv-empty">เข้าสู่ระบบเพื่อทำข้อสอบ</div>

    <!-- ── 📋 จำลองสอบจริง: หน้าตั้งค่า (28 พ.ย. 2026 แทนการ์ด Zen ในหน้าเรียน) ── -->
    <template v-else-if="mode === 'home' && examMode">
      <div class="qv-card qv-xs-setup">
        <div class="qv-xs-title"><Emoji char="📋" /> จำลองสอบจริง</div>
        <p class="qv-xs-p">หน้าจอแบบแอป ExamPod ที่ใช้สอบ PLE-CC1 · ไม่เฉลยระหว่างทำ ข้ามข้อและมาร์ค ★ ย้อนกลับมาได้ · จับเวลาเท่าสอบจริง</p>
        <div v-if="examResume" class="qv-xs-resume">
          <b>มีการสอบค้างอยู่ {{ examResume.qs.length }} ข้อ</b>
          <span>ตอบแล้ว {{ examResume.ans.filter(a => a !== null).length }} ข้อ · {{ examResumeLeft }}</span>
          <div class="qv-dock-row">
            <button class="qv-ghost" @click="discardExam">ล้างทิ้ง</button>
            <button class="qv-start" style="margin-top:0" @click="resumeExam">ทำต่อ</button>
          </div>
        </div>
        <template v-else>
          <div class="qv-label">จำนวนข้อ</div>
          <div class="qv-seg">
            <button v-for="n in EXAM_SIM_LENS" :key="n" :class="{ on: examLen === n }" @click="examLen = n">{{ n }}</button>
          </div>
          <div class="qv-xs-meta">
            <span><Emoji char="⏱️" /> {{ examTimeText(examLen) }}</span>
            <span>ผู้ป่วย ~{{ Math.round(examLen * .5) }} · ผลิตภัณฑ์ ~{{ Math.round(examLen * .4) }} · สังคมและกฎหมาย {{ Math.round(examLen * .1) }}</span>
          </div>
          <ul class="qv-xs-notes">
            <li>เวลาคิดจากสอบจริง 120 ข้อใน 3 ชั่วโมง = 1.5 นาทีต่อข้อ</li>
            <li>สัดส่วนตามประกาศศูนย์สอบฯ ผู้ป่วย 50 : ผลิตภัณฑ์ 40 : สังคมและบริหาร (รวมกฎหมาย) 10 สุ่มขยับได้ข้อสองข้อ</li>
            <li>สอบจริงอาจเป็นสถานการณ์ละ 4–6 ข้อต่อเนื่องกัน แต่ข้อสอบในเว็บเก็บแยกเป็นข้อเดี่ยวมาตั้งแต่ต้น จึงยังจัดเป็นชุดสถานการณ์ให้ไม่ได้</li>
            <li>คำตอบเก็บไว้ในเครื่องนี้ · กด ✕ แล้วเลือก "พักไว้ทำต่อ" ได้ (เวลาหยุดรอ) · เผลอปิดแอปก็กลับมาทำต่อได้แต่เวลาเดินต่อ · ส่งแล้วล้าง</li>
          </ul>
          <div class="qv-dock"><button class="qv-start" :disabled="starting" @click="startExam">{{ starting ? 'กำลังจัดชุดข้อสอบ…' : `เริ่มสอบ ${examLen} ข้อ` }}</button></div>
        </template>
      </div>
    </template>

    <!-- ── HOME ── -->
    <template v-else-if="mode === 'home'">
      <div v-if="loading" class="qv-empty">กำลังโหลดข้อสอบ…</div>
      <div v-else-if="!publishedTotal" class="qv-empty">ยังไม่มีข้อสอบที่เผยแพร่ — รอทีมวิชาการเพิ่มก่อนนะ <Emoji char="📚" /></div>
      <template v-else>
        <!-- การ์ดหัว: จำนวนข้อ + ทางลัดทบทวนข้อที่เคยผิด (โชว์เมื่อมีข้อถึงกำหนด) -->
        <div class="qv-hero">
          <div><span class="qv-hero-num">{{ activeCount.toLocaleString() }}</span><small>ข้อพร้อมให้ทำ</small></div>
          <button v-if="dueCount" class="qv-hero-due" :disabled="starting" @click="startRedo">
            <b>{{ dueCount }} ข้อ</b>เคยผิด รอทบทวน →
          </button>
        </div>

        <!-- ① ทำจากไหน (24 พ.ย. จัดหน้าใหม่ — ชุดย้อนหลังเยอะขึ้นมาก เลือกหลายชุดได้) -->
        <div class="qv-card">
          <div class="qv-label"><span class="qv-step">1</span> ทำจากไหน</div>
          <div class="qv-seg qv-seg2" role="group" aria-label="แหล่งข้อสอบ">
            <button :class="{ on: !examSet }" :aria-pressed="!examSet" @click="examSets = []"><Emoji char="🎲" /> สุ่มทั้งคลัง</button>
            <button v-if="examSetChips.length" :class="{ on: examSet }" :aria-pressed="examSet" @click="openSetSheet"><Emoji char="📜" /> เลือกชุดย้อนหลัง</button>
          </div>
          <div v-if="examSet" class="qv-picked">
            <span v-for="n in examSets" :key="n" class="qv-pickchip">{{ shortSetName(n) }}<button :aria-label="'เอา ' + n + ' ออก'" @click="removeSet(n)">✕</button></span>
            <button class="qv-setmini" @click="openSetSheet">＋ แก้ชุด</button>
          </div>
        </div>

        <!-- 🔖 ข้อที่บันทึกไว้ — โชว์เมื่อมีอย่างน้อย 1 ข้อ (หน้าแรกไม่รกสำหรับคนยังไม่ใช้) -->
        <div v-if="savedTotal" class="qv-card qv-setbtn qv-saved">
          <span class="qv-setbtn-l"><Emoji char="🔖" /> ข้อที่บันทึกไว้ <small class="qv-saved-n">{{ savedTotal }} ข้อ</small></span>
          <span class="qv-saved-acts">
            <button class="qv-saved-btn" @click="router.push('/saved')"><Emoji char="📖" /> อ่าน</button>
            <button class="qv-saved-btn main" :disabled="starting" @click="startSaved">ทำชุดนี้ ›</button>
          </span>
        </div>

        <!-- ② เรื่อง — กลุ่มโรคเลื่อนแนวนอน ไม่ดันหน้ายาว -->
        <div v-if="domainChips.length" class="qv-card">
          <div class="qv-label"><span class="qv-step">2</span> เรื่อง <small class="qv-opt">ไม่เลือกก็ได้</small></div>
          <div class="qv-chips">
            <button class="qv-chip" :class="{ on: dom === '__all' }" @click="pickDomain('__all')">ทุกหมวด</button>
            <button v-for="d in domainChips" :key="d.key" class="qv-chip" :class="{ on: dom === d.key }" @click="pickDomain(d.key)">{{ d.label }}</button>
          </div>
          <div v-if="groupChips.length" class="qv-scroller">
            <button class="qv-chip qv-chip-sm" :class="{ on: !group }" @click="group = null">ทั้งหมวด</button>
            <button v-for="g in groupChips" :key="g.key" class="qv-chip qv-chip-sm" :class="{ on: group === g.key }" @click="group = g.key">{{ g.label }} <small>{{ g.count }}</small></button>
          </div>
        </div>

        <BottomSheet :open="setSheet" icon="📜" title="ข้อสอบย้อนหลัง" @update:open="setSheet = $event">
          <!-- เลือกได้หลายชุด · แบ่งกลุ่ม · การ์ด 2 คอลัมน์ ลดการเลื่อน -->
          <section v-for="sec in setSections" :key="sec.key" class="qv-setsec">
            <div class="qv-sethead">
              <b>{{ sec.label }}</b>
              <button class="qv-setmini" @click="toggleSection(sec)">{{ sec.items.every(s => draftSets.includes(s.name)) ? 'เอาออกทั้งกลุ่ม' : 'เลือกทั้งกลุ่ม' }}</button>
            </div>
            <div class="qv-setgrid">
              <button
                v-for="s in sec.items" :key="s.name"
                class="qv-settile" :class="{ on: draftSets.includes(s.name) }"
                role="checkbox" :aria-checked="draftSets.includes(s.name)" :title="s.name"
                @click="toggleDraft(s.name)"
              >
                <span class="qv-setcheck" aria-hidden="true">✓</span>
                <span class="qv-settile-name">{{ shortSetName(s.name) }}</span>
                <span class="qv-settile-meta">{{ s.count }} ข้อ<template v-if="s.year && !shortSetName(s.name).includes(String(s.year))"> · {{ s.year }}</template></span>
              </button>
            </div>
          </section>
          <div class="qv-setdock">
            <button v-if="draftSets.length" class="qv-setclear" @click="draftSets = []">ล้าง</button>
            <button class="qv-start" @click="applySets">
              {{ draftSets.length ? `ใช้ ${draftSets.length} ชุด · ${draftTotal.toLocaleString()} ข้อ` : 'ไม่เลือกชุด (สุ่มทั้งคลัง)' }}
            </button>
          </div>
        </BottomSheet>

        <!-- ③ จำนวนข้อ -->
        <div class="qv-card">
        <div class="qv-label"><span class="qv-step">3</span> จำนวนข้อ</div>
        <div class="qv-seg" role="group" aria-label="จำนวนข้อ">
          <button v-for="n in lenChoices" :key="n" :class="{ on: len === n }" :aria-pressed="len === n" @click="len = n">{{ n }}</button>
          <button :class="{ on: len === 'zen' }" :aria-pressed="len === 'zen'" aria-label="Zen ทำเรื่อยๆ ไม่จำกัด" @click="len = 'zen'">♾️</button>
        </div>
        <div v-if="len === 'zen'" class="qv-hint">♾️ Zen — สุ่มจากที่เลือกไว้ไปเรื่อยๆ ไม่จำกัด จนกว่าจะกดออก</div>
        <div v-if="shortBy" class="qv-hint">
          ที่เลือกไว้มี {{ poolAvail }} ข้อ เลยได้ {{ poolAvail }} ข้อ — อยากได้ครบ {{ len }} ลองเลือกเพิ่มชุด หรือขยายหมวดดูนะ
        </div>
        <label class="qv-switch">
          <input v-model="approvedOnly" type="checkbox" role="switch">
          <span class="qv-switch-ui" aria-hidden="true"></span>
          <span>เฉพาะข้อที่ผ่านตรวจแล้ว <small>({{ approvedCount }} จาก {{ activeCount }})</small></span>
        </label>
        <div v-if="approvedOnly && approvedCount > 0 && approvedCount < 5" class="qv-hint">
          มีข้อผ่านตรวจในหมวดนี้ไม่เยอะ ({{ approvedCount }} ข้อ) — ทำได้ตามปกติ แค่แจ้งให้รู้ไว้ก่อน
        </div>
        </div>

        <button class="qv-history-btn" @click="openHistory"><Emoji char="📊" /> ประวัติของฉัน</button>
        <div class="qv-hint">ทำข้อสอบได้เหรียญ +{{ QUIZ_COIN }}/ข้อที่ถูก<span v-if="FEST" class="x2-pill">×2 ถึง 31 ธ.ค.</span> · ทำมากได้มาก ไม่จำกัดต่อวัน</div>

        <!-- ปุ่มหลักติดขอบล่าง (sticky ใน #main-content) — ไม่ต้องเลื่อนหา -->
        <div class="qv-dock">
          <button class="qv-start" :disabled="starting || (approvedOnly ? !approvedCount : !activeCount)" @click="start">
            {{ starting ? 'กำลังสุ่มข้อ…' : (len === 'zen' ? 'เริ่ม Zen ♾️ →' : `เริ่มทำ ${quizCount} ข้อ →`) }}
          </button>
        </div>
      </template>
    </template>

    <!-- ── QUIZ ── -->
    <ExamSim v-else-if="mode === 'quiz' && variant === 'exam' && examSession" :session="examSession" :uid="authStore.currentUser?.uid || ''" @submit="onExamSubmit" @exit="onExamExit" @pause="onExamPause" />
    <template v-else-if="mode === 'quiz'">
      <div class="qv-bar-row">
        <button class="qv-quit" aria-label="ออกจากการทำข้อสอบ" @click="quit">✕</button>
        <div v-if="variant === 'zen'" class="qv-zen-tag"><Emoji char="♾️" /> Zen</div>
        <div v-else class="qv-bar"><div class="qv-fill" :style="{ width: progress + '%' }"></div></div>
        <span class="qv-pill qv-streak" :class="{ off: !streak }" :aria-label="`ถูกติดกัน ${streak} ข้อ`"><Emoji char="🔥" /> {{ streak }}</span>
      </div>
      <!-- แถวป้าย: ข้อที่ · หมวด · สถานะตรวจ · คะแนน -->
      <div class="qv-meta">
        <span class="qv-tag">{{ variant === 'zen' ? `ข้อที่ ${idx + 1}` : `ข้อ ${idx + 1}/${quiz.length}` }}</span>
        <span v-if="redoTag" class="qv-tag qv-tag-redo" :class="{ done: redoTag.done }"><Emoji :char="redoTag.done ? '✨' : '🔁'" /> {{ redoTag.text }}</span>
        <span v-if="variant === 'saved'" class="qv-tag qv-tag-saved"><Emoji char="🔖" /> ที่บันทึกไว้</span>
        <span v-if="current.domain" class="qv-tag">{{ domainLabel(current.domain) }}</span>
        <span v-for="n in setTags(current)" :key="n" class="qv-tag qv-tag-set"><Emoji char="📚" /> {{ n }}</span>
        <ReviewStatusBadge :question="current" />
        <span class="qv-pill qv-score">ถูก {{ correct }}/{{ answered }}</span>
      </div>
      <div class="qv-q">{{ current.question }}</div>
      <QuestionImages :question="current" />
      <!-- ก่อนตอบ = ป้ายเฉยๆ · หลังตอบ = ลิงก์เปิดแท็บใหม่ (ความคืบหน้าควิซอยู่ในหน้านี้เท่านั้น ออกจากหน้า = หาย) -->
      <component
        :is="picked !== null ? 'a' : 'span'" v-if="current.source === 'summary'" class="qv-src"
        v-bind="picked !== null ? { href: router.resolve(`/study/summary/${current.summaryId}`).href, target: '_blank', rel: 'noopener' } : {}"
      >
        <Emoji char="📚" /> {{ summarySourceText(current) }}<span v-if="picked !== null"> · เปิดอ่านในแท็บใหม่ ↗</span>
      </component>
      <div class="qv-choices">
        <button
          v-for="(c, i) in current.choices" :key="i"
          class="qv-choice" :class="choiceClass(i)"
          data-sfx="none" :disabled="picked !== null" @click="pick(i)"
        >
          <span class="qv-letter">{{ LETTERS[i] }}</span><span class="qv-ctext">{{ c }}</span>
        </button>
      </div>

      <div v-if="picked !== null" class="qv-feedback">
        <div :class="picked === current.answer ? 'qv-fb ok' : 'qv-fb no'" role="status">
          <b>{{ picked === current.answer ? '✓ ถูกต้อง!' : '✗ ยังไม่ถูก' }}</b>
          {{ picked === current.answer ? `ได้ +${QUIZ_COIN} เหรียญ` : `เฉลยคือข้อ ${LETTERS[current.answer]} · ข้อนี้อยู่ในกองข้อที่เคยผิด ถูกติดกัน ${GRADUATE_REPS} ครั้งถึงจะหาย` }}
        </div>
        <div v-if="current.explanation" class="qv-exp"><Emoji char="💡" /> {{ current.explanation }}</div>
        <div v-if="current.keyBy === 'converter'" class="qv-note"><Emoji char="ℹ️" /> สรุปต้นฉบับไม่มีเฉลยข้อนี้ เฉลยเรียบเรียงโดยผู้แปลงสรุป — ถ้าเห็นว่าผิดกดแจ้งได้เลย</div>
        <AiReviewNote :q="current" />
        <div v-if="current.reviewNote" class="qv-note"><Emoji char="📝" /> หมายเหตุจากผู้ตรวจ: {{ current.reviewNote }}</div>
        <!-- 🚩 แจ้งข้อผิด -->
        <div v-if="quickRemoved.has(current.id)" class="qv-note"><Emoji char="🗑️" /> ลบข้อนี้แล้ว · ไม่โผล่ให้เพื่อนอีก (กู้คืนได้ที่คลังข้อสอบ)</div>
        <button v-else-if="authStore.isQuestionEditor" class="qv-report-btn qv-edit-btn" @click="quickEditOpen = true">
          <Emoji char="✏️" /> {{ quickEdited.has(current.id) ? 'แก้แล้ว · แก้อีก' : 'แก้ข้อนี้ (วิชาการ)' }}
        </button>
        <div class="qv-report">
          <!-- แถวปุ่มหลังตอบ: 🔖 บันทึก · 💬 ความเห็นเพื่อน · 🚩 แจ้งข้อผิด -->
          <div class="qv-acts">
            <button class="qv-report-btn qv-save-btn" :class="{ on: savedNow }" :aria-pressed="savedNow" :disabled="saving" @click="toggleSave">
              <Emoji char="🔖" /> {{ savedNow ? 'บันทึกแล้ว' : 'บันทึก' }}
            </button>
            <button class="qv-report-btn qv-talk-btn" @click="commentsOpen = true">
              <Emoji char="💬" /> ความเห็น <span class="qv-cnt" :class="{ zero: !commentN }">{{ commentN }}</span>
            </button>
            <button v-if="reportedIds.has(current.id)" class="qv-report-btn done" disabled><Emoji char="🚩" /> แจ้งแล้ว ✓</button>
            <button v-else class="qv-report-btn" :aria-expanded="reportOpen" @click="reportOpen = !reportOpen"><Emoji char="🚩" /> แจ้งข้อผิด</button>
          </div>
          <div v-if="reportOpen && !reportedIds.has(current.id)" class="qv-report-panel">
            <div class="qv-report-chips">
              <button
                v-for="r in REPORT_REASONS" :key="r"
                class="qv-report-chip" :class="{ on: reportReason === r }"
                :aria-pressed="reportReason === r"
                @click="reportReason = r"
              >{{ r }}</button>
            </div>
            <textarea v-model="reportNote" :maxlength="LIMITS.report" class="qv-report-note" rows="2" aria-label="รายละเอียดเพิ่มเติมเกี่ยวกับข้อผิด" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)…"></textarea>
            <div class="qv-report-hint">ทีมวิชาการตรวจแล้วผิดจริง ได้ {{ REPORT_REWARD }} เหรียญทางจดหมาย · มีเพื่อนแจ้ง {{ REPORT_HOLD_AT }} คน ข้อนี้จะถูกพักไว้ก่อน</div>
            <div class="qv-report-actions">
              <button class="qv-report-cancel" @click="resetReport">ยกเลิก</button>
              <button class="qv-report-send" :disabled="!reportReason || reportSending" @click="sendReport">{{ reportSending ? 'กำลังส่ง…' : 'ส่ง' }}</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="qv-idle">เลือกคำตอบเพื่อดูเฉลย</p>

      <div v-if="picked !== null" class="qv-dock">
        <button class="qv-start" @click="next">{{ variant === 'examReview' ? '← กลับหน้าผลสอบ' : idx + 1 < quiz.length || variant === 'zen' ? 'ข้อถัดไป →' : 'ดูผลคะแนน' }}</button>
      </div>
      <QuestionComments v-if="current" v-model:open="commentsOpen" :qid="current.id" />
    </template>

    <!-- ── RESULT ── -->
    <template v-else-if="mode === 'result'">
      <div class="qv-result">
        <div class="qv-result-title"><Emoji :char="resultEmoji" /> ทำข้อสอบจบแล้ว!</div>
        <div class="qv-ring" role="img" :aria-label="`ถูก ${correct} จาก ${sessionTotal} ข้อ ${pct} เปอร์เซ็นต์`">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(43,53,80,.08)" stroke-width="12" />
            <circle class="qv-ring-arc" cx="60" cy="60" r="50" fill="none" stroke-width="12" stroke-linecap="round"
                    stroke-dasharray="314.16" :stroke-dashoffset="314.16 * (1 - pct / 100)" />
          </svg>
          <div class="qv-ring-c"><b>{{ correct }}/{{ sessionTotal }}</b><small>{{ pct }}%</small></div>
        </div>
        <div v-if="prevPct !== null" class="qv-result-cmp" :class="{ up: pct > prevPct, down: pct < prevPct }">
          {{ pct > prevPct ? `ดีกว่ารอบก่อน +${pct - prevPct}%` : pct < prevPct ? `ต่ำกว่ารอบก่อน ${pct - prevPct}%` : 'เท่ากับรอบก่อน' }}
        </div>
        <div class="qv-stats">
          <div class="qv-stat coin"><b>{{ coinsEarned ? `+${coinsEarned.toLocaleString()}` : '0' }}</b><small>เหรียญ</small></div>
          <div v-if="evNow" class="qv-stat coin"><b>{{ evEarned ? `+${evEarned}` : '0' }}</b><small>{{ evNow.pt }} {{ evNow.ptName }}</small></div>
          <div class="qv-stat"><b><Emoji char="🔥" /> {{ bestStreak }}</b><small>ถูกติดกันสูงสุด</small></div>
          <div class="qv-stat"><b>{{ examAns.length ? answered - correct : sessionTotal - correct }}</b><small>เข้าคิวทบทวน</small></div>
        </div>
        <div v-if="roundDomains.length > 1" class="qv-card qv-rdom">
          <div class="qv-label">รายหมวดรอบนี้</div>
          <div v-for="d in roundDomains" :key="d.key" class="qv-dom-row">
            <span class="qv-dom-name">{{ d.label }}</span>
            <span class="qv-dom-bar"><span class="qv-dom-fill" :style="{ width: d.pct + '%' }"></span></span>
            <span class="qv-dom-val">{{ d.c }}/{{ d.t }}</span>
          </div>
        </div>
        <!-- 📋 จำลองสอบ: กระดาษเฉลย (28 พ.ย. user: จัดเป็นสัดส่วน · แจ้งข้อผิด/บันทึกรายข้อ · เซฟ PDF) -->
        <section v-if="examReviewList.length" class="qv-sheet">
          <div class="qv-sheet-head">
            <b>เฉลยรายข้อ</b>
            <button class="qv-sheet-pdf" @click="printExamSheet"><Emoji char="📄" /> เซฟเป็น PDF</button>
          </div>
          <div class="qv-seg qv-sheet-filter">
            <button v-for="f in SHEET_FILTERS" :key="f.k" :class="{ on: sheetFilter === f.k }" @click="sheetFilter = f.k">{{ f.label }} {{ sheetCount(f.k) }}</button>
          </div>
          <article v-for="r in sheetRows" :key="r.k" class="qv-sq" :class="r.state">
            <header class="qv-sq-top">
              <span class="qv-sq-no">ข้อ {{ r.k + 1 }}</span>
              <span class="qv-sq-tag">{{ r.state === 'ok' ? 'ถูก' : r.state === 'bad' ? 'ผิด' : 'ไม่ได้ตอบ' }}</span>
              <span v-if="r.star" class="qv-sq-star">★ มาร์คไว้</span>
              <span v-if="r.q.domain" class="qv-sq-dom">{{ domainLabel(r.q.domain) }}</span>
            </header>
            <div class="qv-sq-q">{{ r.q.question }}</div>
            <QuestionImages :question="r.q" />
            <ol class="qv-sq-ch">
              <li v-for="(c, j) in r.q.choices" :key="j" :class="{ right: j === r.q.answer, mine: j === r.ans && j !== r.q.answer }">
                <span class="qv-sq-lt">{{ LETTERS[j] }}</span>
                <span class="qv-sq-ct">{{ c }}</span>
                <span v-if="j === r.q.answer" class="qv-sq-mk">เฉลย</span>
                <span v-else-if="j === r.ans" class="qv-sq-mk">คุณตอบ</span>
              </li>
            </ol>
            <div v-if="r.q.explanation" class="qv-sq-exp"><Emoji char="💡" /> {{ r.q.explanation }}</div>
            <div class="qv-acts qv-sq-acts">
              <button class="qv-report-btn qv-save-btn" :class="{ on: isSaved(savedMap, r.q.id) }" :aria-pressed="isSaved(savedMap, r.q.id)" :disabled="saving" @click="sheetSave(r.k)">
                <Emoji char="🔖" /> {{ isSaved(savedMap, r.q.id) ? 'บันทึกแล้ว' : 'บันทึก' }}
              </button>
              <button class="qv-report-btn qv-talk-btn" @click="sheetComments(r.k)"><Emoji char="💬" /> ความเห็น</button>
              <button v-if="reportedIds.has(r.q.id)" class="qv-report-btn done" disabled><Emoji char="🚩" /> แจ้งแล้ว ✓</button>
              <button v-else class="qv-report-btn" :aria-expanded="sheetReportK === r.k" @click="sheetReport(r.k)"><Emoji char="🚩" /> แจ้งข้อ {{ r.k + 1 }} ผิด</button>
            </div>
            <div v-if="sheetReportK === r.k && !reportedIds.has(r.q.id)" class="qv-report-panel">
              <div class="qv-report-chips">
                <button v-for="x in REPORT_REASONS" :key="x" class="qv-report-chip" :class="{ on: reportReason === x }" :aria-pressed="reportReason === x" @click="reportReason = x">{{ x }}</button>
              </div>
              <textarea v-model="reportNote" :maxlength="LIMITS.report" class="qv-report-note" rows="2" :aria-label="`รายละเอียดเพิ่มเติมเกี่ยวกับข้อ ${r.k + 1}`" placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)…"></textarea>
              <div class="qv-report-actions">
                <button class="qv-report-cancel" @click="sheetReportK = -1; resetReport()">ยกเลิก</button>
                <button class="qv-report-send" :disabled="!reportReason || reportSending" @click="sheetSendReport(r.k)">{{ reportSending ? 'กำลังส่ง…' : 'ส่ง' }}</button>
              </div>
            </div>
          </article>
          <p v-if="!sheetRows.length" class="qv-empty">ไม่มีข้อในหมวดนี้</p>
        </section>
        <div class="qv-dock qv-dock-row">
          <button v-if="(examAns.length ? answered - correct : sessionTotal - correct) > 0" class="qv-ghost" :disabled="starting" @click="startRedo">ทบทวนข้อผิด</button>
          <button class="qv-start" @click="backToHome">ทำชุดใหม่</button>
        </div>
        <QuestionComments v-if="examReviewList.length && current" v-model:open="commentsOpen" :qid="current.id" />
      </div>
    </template>

    <!-- ── HISTORY ── -->
    <template v-else-if="mode === 'history'">
      <div class="qv-head">
        <BackButton aria-label="ย้อนกลับ" @click="mode = 'home'" />
        <span class="qv-head-title"><Emoji char="📊" /> ประวัติของฉัน</span>
      </div>

      <div v-if="historyLoading" class="qv-empty">กำลังโหลด…</div>
      <div v-else-if="!stats.count" class="qv-empty">ยังไม่เคยทำข้อสอบ — ลองทำชุดแรกดูสิ! <Emoji char="📚" /></div>
      <template v-else>
        <div class="qv-hist-latest">
          ล่าสุด <b>{{ stats.latest.correct }}/{{ stats.latest.total }}</b> ({{ stats.latest.pct }}%)
        </div>

        <div class="qv-label">พัฒนาการ ({{ stats.count }} ครั้งล่าสุด)</div>
        <div class="qv-trend">
          <div v-for="(p, i) in stats.trend" :key="i" class="qv-trend-bar" :style="{ height: Math.max(4, p) + '%' }" :title="p + '%'"></div>
        </div>

        <div class="qv-label">สถิติรายหมวด</div>
        <div class="qv-dom-stats">
          <div v-for="d in DOMAINS" :key="d.key" class="qv-dom-row">
            <span class="qv-dom-name">{{ d.label }}</span>
            <span class="qv-dom-bar"><span class="qv-dom-fill" :style="{ width: stats.byDomain[d.key].pct + '%' }"></span></span>
            <span class="qv-dom-val">{{ stats.byDomain[d.key].c }}/{{ stats.byDomain[d.key].t }}</span>
          </div>
        </div>
      </template>
    </template>
    <QuickEditModal v-model="quickEditOpen" :question-id="current?.id || null" @saved="quickEdited.add($event.id)" @removed="quickRemoved.add($event.id)" />
  </div>
</template>

<script setup>
import { dayKey } from '../utils/dailyChallenge.js'
import BackButton from '../components/shared/BackButton.vue'
import QuestionImages from '../components/shared/QuestionImages.vue'
import Emoji from '../components/shared/Emoji.vue'
import AiReviewNote from '../components/shared/AiReviewNote.vue'
import QuickEditModal from '../components/questions/QuickEditModal.vue'
import ReviewStatusBadge from '../components/shared/ReviewStatusBadge.vue'
import { summarySourceText } from '../utils/summaryQuestions.js'
import { useRouter } from 'vue-router'
import BottomSheet from '../components/shared/BottomSheet.vue'
import QuestionComments from '../components/quiz/QuestionComments.vue'
import { useQComments, loadQComments, qCommentCount } from '../composables/useQComments.js'
import HelpButton from '../components/help/HelpButton.vue'
import ExamSim from '../components/quiz/ExamSim.vue'
import { questionImages } from '../utils/questionImages.js'
import { EXAM_SIM_LENS, SEC_PER_Q, SAP_GROUP, examQuotas, loadExamState, clearExamState, slimQuestion, gradeExam } from '../utils/examSim.js'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLeaveGuard } from '../composables/useLeaveGuard.js'
import { activeEvent, quizPts, grantPatch } from '../utils/event.js'
import { collection, getDocs, getDoc, query, where, orderBy, limit, doc, addDoc, setDoc, increment, serverTimestamp, writeBatch, deleteField, runTransaction } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { bumpGlobalStat, bumpQuizToday } from '../composables/useGlobalStats.js'
import { quizDayMilestone } from '../utils/newsFeed.js'
import { useUsageStore } from '../stores/usage.js'
import { useToast } from '../composables/useToast.js'
import { shuffle, shuffleChoices } from '../utils/quizShuffle.js'
import { useQuestionFeed } from '../composables/useQuestionFeed.js'
import { cleanText, LIMITS } from '../utils/text.js'
import { reportDocId, buildSnapshot } from '../utils/questionReport.js'
import { DOMAINS, DOMAIN_KEYS, domainLabel } from '../data/domains.js'
import { groupsOfDomain, groupByKey } from '../data/plecc.js'
import { useExamSets } from '../composables/useExamSets.js'
import { examSetLabel } from '../utils/examSets.js'
import { aggregateExamStats } from '../utils/examStats.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { tallyAnswers } from '../utils/questionStats.js'
import { QUIZ_COIN_PER_CORRECT, REPORT_HOLD_AT, REPORT_REWARD } from '../data/index.js'
import { examFestMulti } from '../utils/examFest.js'
const FEST = examFestMulti() > 1
const QUIZ_COIN = QUIZ_COIN_PER_CORRECT * examFestMulti()   // 📚 เทศกาลสอบ ×2 ถึงสิ้น ธ.ค.
import { applyQuizResults, buildQcardsPatch, dueQuestionIds, GRADUATE_REPS } from '../utils/srsQuestions.js'
import { buildSavedToggle, buildSavedRemove, savedIds, savedCount, isSaved, SAVED_MAX, SAVED_BATCH } from '../utils/savedQuestions.js'
import { tallyGroups, buildGsPatch } from '../utils/practiceStats.js'
import { sfx } from '../utils/sfx.js'
import { isOwlHour } from '../utils/gags.js'
import { grantSecret } from '../composables/useAchievements.js'
const router = useRouter()   // ลิงก์ที่มาของข้อจากสรุป → แท็บใหม่

const authStore = useAuthStore()
const { syncRosterRow } = useRosterSync()
const usage = useUsageStore()
const { toast } = useToast()
const route = useRoute()
const { fetchQuestions: feedQuestions, fetchSetPool } = useQuestionFeed()

const LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']
const LEN_CHOICES = [10, 20, 60, 120]   // 24 พ.ย. เพื่อนขอ 60/120 (ตัด 5/15 ให้ปุ่มยังพอดี 4 ช่อง)
const DEFAULT_LEN = 10

// ── home: อ่านแค่ config/questionsMeta (1 read) แทนการโหลดข้อทั้งคลัง ──
const publishedTotal = ref(0)
const metaDomains = ref({})
const metaApprovedTotal = ref(0)
const metaApprovedDomains = ref({})
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const snap = await getDoc(doc(db, 'config', 'questionsMeta'))
    usage.track(1)
    const m = snap.exists() ? snap.data() : { publishedTotal: 0, categories: [], domains: {} }
    publishedTotal.value = m.publishedTotal || 0
    metaDomains.value = m.domains || {}
    metaApprovedTotal.value = m.approvedTotal || 0
    metaApprovedDomains.value = m.approvedDomains || {}
    metaExamSets.value = m.examSets || []
    metaGroups.value = m.groups || {}
    metaApprovedGroups.value = m.approvedGroups || {}
  } catch (e) {
    console.error('[quiz meta]', e)
    toast('โหลดข้อมูลข้อสอบไม่สำเร็จ', 'error')
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  if (!authStore.isLoggedIn) return
  load()
  loadExamSets()
  // /quiz?group=cvs จากแท็บผลฝึกหน้าฉัน → เลือกหมวด+กลุ่มให้เลย
  const qg = typeof route.query.group === 'string' ? groupByKey(route.query.group) : null
  if (qg) { dom.value = qg.domain; group.value = qg.key }
  if (route.query.mode === 'zen') len.value = 'zen'   // 24 พ.ย. ไม่เริ่มทันที — ให้เลือกชุด/หมวดก่อน
  else if (route.query.mode === 'redo') whenUserDataReady(startRedo)
  else if (route.query.mode === 'saved') whenUserDataReady(startSaved)
  else if (route.query.view === 'history') openHistory()
})

// userData มาทาง onSnapshot — ตอน mount อาจยังเป็น null
function whenUserDataReady(fn) {
  if (authStore.userData) { fn(); return }
  const stop = watch(() => authStore.userData, (v) => { if (v) { stop(); fn() } })
}

const dom = ref('__all')
// ชุดที่เลือก — หลายชุดได้ (24 พ.ย.) · examSet = มีเลือกอยู่ไหม (เก็บชื่อเดิมไว้ ให้ที่อื่นในไฟล์อ่านเหมือนเดิม)
const examSets = ref([])
const examSet = computed(() => examSets.value.length > 0)
const metaExamSets = ref([])
const setSheet = ref(false)
const examSetName = computed(() => {
  if (examSets.value.length > 1) return `${examSets.value.length} ชุด`
  const c = examSetChips.value.find(x => x.name === examSets.value[0])
  return c ? (c.year ? `${c.name} · ${c.year}` : c.name) : ''
})
// แผ่นเลือกชุด: ติ๊กเป็นร่างก่อน กดยืนยันค่อยโหลด (ไม่ยิง query ทุกครั้งที่แตะ)
const draftSets = ref([])
const draftTotal = computed(() => examSetChips.value.filter(s => draftSets.value.includes(s.name)).reduce((t, s) => t + s.count, 0))
function openSetSheet() { draftSets.value = [...examSets.value]; setSheet.value = true }
function toggleDraft(name) {
  draftSets.value = draftSets.value.includes(name) ? draftSets.value.filter(n => n !== name) : [...draftSets.value, name]
}
function applySets() { examSets.value = [...draftSets.value]; setSheet.value = false }
function removeSet(name) { examSets.value = examSets.value.filter(n => n !== name) }
function toggleSection(sec) {
  const names = sec.items.map(s => s.name)
  const allIn = names.every(n => draftSets.value.includes(n))
  draftSets.value = allIn ? draftSets.value.filter(n => !names.includes(n)) : [...new Set([...draftSets.value, ...names])]
}
// แบ่งกลุ่มชุดตามชื่อ (ไม่มีฟิลด์กลุ่มใน config) — ชุดใหม่ที่ไม่เข้าแพทเทิร์นไปอยู่ "อื่นๆ จากสถาบัน"
const SET_SECTIONS = [
  { key: 'ple', label: '🏛️ PLE-CC1 ของจริง', test: n => /^PLE-CC1/i.test(n) },
  { key: 'old', label: '📦 ข้อสอบเก่า / ตัวอย่างสภาฯ', test: n => /ข้อสอบเก่า|ตัวอย่าง/.test(n) },
  { key: 'uni', label: '🎓 จากมหาวิทยาลัย / แยกบท', test: () => true },
]
const setSections = computed(() => {
  const out = SET_SECTIONS.map(x => ({ ...x, items: [] }))
  for (const c of examSetChips.value) out.find(x => x.test(c.name)).items.push(c)
  return out.filter(x => x.items.length)
})
// ชื่อสั้นบนการ์ด: ตัดคำนำหน้าที่หัวกลุ่มบอกแล้ว
function shortSetName(n) { return n.replace(/^PLE-CC1\s*/i, '').replace(/^ตัวอย่างข้อสอบสภาฯ\s*/, 'สภาฯ ') || n }
const { sets: examSetConfig, loadExamSets } = useExamSets()  // ปีของแต่ละชุด (config/examSets)

// ชิปชุด: เฉพาะชุดที่มีข้อ published (count>0) + ผสมปีจาก config · เรียงปีใหม่→เก่า แล้วชื่อ
const examSetChips = computed(() => {
  const yearOf = Object.fromEntries(examSetConfig.value.map(s => [s.name, s.year]))
  return (metaExamSets.value || [])
    .filter(s => s.count > 0)
    .map(s => ({ name: s.name, count: s.count, approvedCount: s.approvedCount || 0, year: yearOf[s.name] ?? null }))
    .sort((a, b) => (b.year || 0) - (a.year || 0) || a.name.localeCompare(b.name, 'th'))
})
// จำนวนข้อที่ทำได้ตามตัวเลือกปัจจุบัน (ชุดที่เลือก หรือ หมวด หรือ ทั้งคลัง)
// ชุดที่เลือก โหลดทั้งก้อนไว้ในเครื่อง → กรองหมวด/กลุ่มโรคซ้อนได้ (เพื่อนขอ 20 พ.ย.)
const setPool = ref(null)          // null = ยังไม่โหลด/ไม่เลือกชุด
const setPoolLoading = ref(false)
// โหลดทีละชุดแล้วจำไว้ · รวมหลายชุด = ตัดข้อซ้ำ (ข้อเดียวอยู่หลายชุดได้)
const poolCache = new Map()
async function loadSetsPool(names) {
  const lists = await Promise.all(names.map(async n => {
    if (!poolCache.has(n)) poolCache.set(n, await fetchSetPool(n))
    return poolCache.get(n)
  }))
  const seen = new Map()
  for (const list of lists) for (const q of list) if (!seen.has(q.id)) seen.set(q.id, q)
  return [...seen.values()]
}
watch(examSets, async (names) => {
  setPool.value = null
  if (!names.length) return
  setPoolLoading.value = true
  try {
    const pool = await loadSetsPool(names)
    if (examSets.value === names) setPool.value = pool
  } catch (e) { console.error('[set pool]', e); toast('โหลดชุดข้อสอบไม่สำเร็จ', 'error') }
  finally { setPoolLoading.value = false }
})
const poolFiltered = (approved) => (setPool.value || []).filter(q =>
  (!approved || q.reviewStatus === 'passed') &&
  (group.value ? q.pleGroup === group.value : dom.value === '__all' || q.domain === dom.value))
const countBy = (field) => (setPool.value || []).reduce((m, q) => { if (q[field]) m[q[field]] = (m[q[field]] || 0) + 1; return m }, {})

const activeCount = computed(() => {
  if (examSet.value) return setPool.value ? poolFiltered(false).length : 0
  if (group.value) return metaGroups.value[group.value] || 0
  if (dom.value !== '__all') return metaDomains.value[dom.value] || 0
  return publishedTotal.value
})
// เหมือน activeCount แต่นับเฉพาะข้อที่ผ่านตรวจแล้ว (reviewStatus==='passed')
const approvedOnly = ref(false)
const approvedCount = computed(() => {
  if (examSet.value) return setPool.value ? poolFiltered(true).length : 0
  if (group.value) return metaApprovedGroups.value[group.value] || 0
  if (dom.value !== '__all') return metaApprovedDomains.value[dom.value] || 0
  return metaApprovedTotal.value
})

// เลือกหมวด → ล้างชุด (mutually exclusive)
// ชื่อชุดข้อสอบของข้อนี้ (user สั่ง 2 ต.ค.) — ต่อปีจาก config ถ้ามี
function setTags(q) {
  if (!Array.isArray(q?.examSets) || !q.examSets.length) return []
  const yearOf = Object.fromEntries(examSetConfig.value.map(s => [s.name, s.year]))
  return q.examSets.map(n => examSetLabel({ name: n, year: yearOf[n] }))
}
// หมวด × ชุด กรองซ้อนกันได้แล้ว (20 พ.ย.) — เปลี่ยนชุดล้างแค่หมวดที่ชุดใหม่ไม่มี (เช็คใน watch ข้างล่าง)
function pickDomain(key) { dom.value = key; group.value = null }
// โหลดชุดเสร็จแล้วหมวด/กลุ่มที่เลือกอยู่ไม่มีในชุด → ปล่อยเป็นทั้งหมด
watch(setPool, (p) => {
  if (!p) return
  if (dom.value !== '__all' && !p.some(q => q.domain === dom.value)) { dom.value = '__all'; group.value = null }
  else if (group.value && !p.some(q => q.pleGroup === group.value)) group.value = null
})

// chips เฉพาะ domain ที่มีข้ออย่างน้อย 1 ข้อ (เลือกชุดอยู่ = นับในชุด)
const domainCounts = computed(() => examSet.value && setPool.value ? countBy('domain') : metaDomains.value)
const domainChips = computed(() => DOMAINS.filter(d => (domainCounts.value[d.key] || 0) > 0))

// กลุ่มโรค (pleGroup) ของหมวดที่เลือก — นับจาก meta.groups (แอดมินกด 🔄 meta) · ไม่มีข้อ = ไม่โชว์
const group = ref(null)
const metaGroups = ref({})
const metaApprovedGroups = ref({})
const groupChips = computed(() => {
  if (dom.value === '__all') return []
  const counts = examSet.value && setPool.value ? countBy('pleGroup') : metaGroups.value
  return groupsOfDomain(dom.value)
    .map(g => ({ key: g.key, label: g.th, count: counts[g.key] || 0 }))
    .filter(g => g.count > 0)
})

const len = ref(DEFAULT_LEN)
const lenChoices = computed(() => LEN_CHOICES)
// มีให้ทำจริงเท่าไร (ตามชุด/หมวด/ผ่านตรวจ) — ขอเกินก็ได้เท่าที่มี
const poolAvail = computed(() => approvedOnly.value ? approvedCount.value : activeCount.value)
const shortBy = computed(() => len.value !== 'zen' && !setPoolLoading.value && poolAvail.value > 0 && poolAvail.value < len.value)
const quizCount = computed(() => shortBy.value ? poolAvail.value : len.value)

// ── session state ──
const mode = ref('home')          // home | quiz | result | history
const quiz = ref([])
const idx = ref(0)
const picked = ref(null)
const correct = ref(0)
// ถูกติดกัน — นับในหน่วยความจำเท่านั้น ปิดแอปแล้วหาย (ตั้งใจ ไม่แตะ schema)
const streak = ref(0)
const bestStreak = ref(0)
const answered = ref(0)
const coinsEarned = ref(0)
const evEarned = ref(0)   // 🎃 แต้มอีเวนต์รอบนี้
const evNow = activeEvent()
const answers = ref([])

const ZEN_BATCH = 15
const variant = ref('normal')   // 'normal' | 'zen' | 'redo' | 'saved' | 'exam' | 'examReview' (ดูเฉลยหลังส่ง)
const sessionTotal = computed(() => variant.value === 'zen' ? answered.value : quiz.value.length)

// ── ประวัติของฉัน (Phase 1 — private, ไม่มี leaderboard) ──
const history = ref([])
const historyLoading = ref(false)
const stats = computed(() => aggregateExamStats(history.value))

async function loadHistory() {
  if (!authStore.currentUser) return
  historyLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'examSessions'),
      where('userId', '==', authStore.currentUser.uid),
      orderBy('ts', 'desc'), limit(30),
    ))
    usage.track(snap.size)
    history.value = snap.docs.map(d => d.data())
  } catch (e) {
    console.error('[exam history]', e); toast('โหลดประวัติไม่สำเร็จ', 'error')
  } finally { historyLoading.value = false }
}
function openHistory() { mode.value = 'history'; loadHistory() }

// ── แจ้งข้อสอบผิด (Phase 5) ──
const REPORT_REASONS = ['เฉลยผิด', 'โจทย์/ตัวเลือกพิมพ์ผิด', 'โจทย์ไม่ชัด', 'ข้อมูลล้าสมัย', 'ผิดหมวด', 'อื่นๆ']
const reportOpen = ref(false)
const reportReason = ref('')
const reportNote = ref('')
const reportSending = ref(false)
const reportedIds = ref(new Set())
// ทีมวิชาการแก้ข้อได้จากตรงนี้เลย (QuickEditModal) — จำข้อที่แก้ในเซสชันไว้บอกบนปุ่ม
const quickEditOpen = ref(false)
const quickRemoved = reactive(new Set())   // ลบ (นำออก) จากหน้านี้ในเซสชัน
const quickEdited = reactive(new Set())   // กันสแปมในเซสชันเดียว (ข้ามเซสชัน deterministic id ทับเอง)

function resetReport() { reportOpen.value = false; reportReason.value = ''; reportNote.value = '' }

async function sendReport() {
  const q = current.value
  if (reportSending.value || !reportReason.value || !q || !authStore.currentUser) return
  reportSending.value = true
  try {
    // transaction: รีพอร์ท + ตัวนับบนข้อในตาเดียว (rules isReportBump เช็คว่ารีพอร์ทนี้ "ใหม่" จริง)
    //  เพื่อนแจ้งครบ REPORT_HOLD_AT คน → ถอนเผยแพร่ชั่วคราว (reportHold) รอทีมวิชาการตรวจ (user สั่ง 27 ก.ย. 2026)
    //  แจ้งซ้ำข้อเดิม = ทับรีพอร์ทเดิม ไม่นับเพิ่ม
    const rRef = doc(db, 'questionReports', reportDocId(q.id, authStore.currentUser.uid))
    const qRef = doc(db, 'questions', q.id)
    let held = false, judged = false
    await runTransaction(db, async (tx) => {
      held = false; judged = false
      const rSnap = await tx.get(rRef)
      const qSnap = await tx.get(qRef)
      // ใบเดิมตัดสินแล้ว → ห้ามแจ้งทับ (เดิมทับเป็น open + rewardDelivered:false = รับรางวัลซ้ำได้)
      if (rSnap.exists() && rSnap.data().status !== 'open') { judged = true; return }
      tx.set(rRef, {
        questionId: q.id,
        reason: reportReason.value,
        note: cleanText(reportNote.value, LIMITS.report),
        reportedBy: authStore.currentUser.uid,
        reportedByName: authStore.userData?.nickname || authStore.userData?.name || null,
        status: 'open',
        verdict: null,
        rewardAmount: 0,
        rewardDelivered: false,
        questionSnapshot: buildSnapshot(q),
        createdAt: serverTimestamp(),
        resolvedAt: null,
      }, { merge: true })
      if (rSnap.exists() || !qSnap.exists() || qSnap.data().isPublished !== true) return
      const n = (qSnap.data().reportCount || 0) + 1
      held = n >= REPORT_HOLD_AT
      tx.update(qRef, { reportCount: n, ...(held ? { reportHold: true, isPublished: false } : {}) })
    })
    usage.track(2, 2)
    reportedIds.value.add(q.id)
    resetReport()
    if (judged) { toast('คุณเคยแจ้งข้อนี้และทีมวิชาการตรวจไปแล้ว แจ้งซ้ำไม่ได้', 'info'); return }
    toast(held ? 'ขอบคุณที่ช่วยแจ้ง! มีเพื่อนแจ้งข้อนี้ครบแล้ว เลยพักข้อนี้ไว้ก่อนระหว่างทีมวิชาการตรวจ' : 'ขอบคุณที่ช่วยแจ้ง! ทีมวิชาการจะตรวจสอบให้', 'success')
  } catch (e) {
    console.error('[question report]', e); toast('ส่งรายงานไม่สำเร็จ', 'error')
  } finally { reportSending.value = false }
}

const current = computed(() => quiz.value[idx.value] || null)
const progress = computed(() => quiz.value.length ? Math.round((idx.value / quiz.value.length) * 100) : 0)
const pct = computed(() => sessionTotal.value ? Math.round((correct.value / sessionTotal.value) * 100) : 0)
const resultEmoji = computed(() => pct.value >= 80 ? '🏆' : pct.value >= 50 ? '😊' : '📚')

// 🔁 ป้ายความคืบหน้าข้อที่เคยผิด (21 พ.ย.) — ถูกติดกัน GRADUATE_REPS ครั้งออกจากกอง
// กองเขียนตอนจบรอบ ระหว่างเล่นจึงอ่านค่าก่อนเริ่มรอบ แล้วโชว์ผลของคำตอบนี้ทันทีหลังตอบ
const redoTag = computed(() => {
  const q = current.value
  const card = q && authStore.userData?.study?.qcards?.[q.id]
  if (!card) return variant.value === 'redo' ? { text: 'ทบทวน' } : null
  const r = Math.min(card.r || 0, GRADUATE_REPS - 1)
  if (picked.value === null) return { text: `ข้อที่เคยผิด · ถูกแล้ว ${r}/${GRADUATE_REPS}` }
  if (picked.value !== q.answer) return { text: `ตอบผิด · นับใหม่ 0/${GRADUATE_REPS}` }
  return r + 1 >= GRADUATE_REPS
    ? { text: `ครบ ${GRADUATE_REPS}/${GRADUATE_REPS} ออกจากกองแล้ว`, done: true }
    : { text: `ถูกแล้ว ${r + 1}/${GRADUATE_REPS}` }
})
// ข้อที่เคยผิดถึงกำหนดทบทวน (นับจาก qcards ใน user doc ที่มีอยู่แล้ว — 0 read)
const dueCount = computed(() => dueQuestionIds(authStore.userData?.study?.qcards, Date.now(), 999).length)

// ผลรายหมวดของรอบนี้ (จาก answers ในเครื่อง)
const roundDomains = computed(() => {
  const m = new Map()
  for (const a of answers.value) {
    const k = a.domain || 'other'
    const r = m.get(k) || { key: k, label: a.domain ? domainLabel(a.domain) : 'อื่นๆ', c: 0, t: 0 }
    r.t++; if (a.correct) r.c++
    m.set(k, r)
  }
  return [...m.values()].map(r => ({ ...r, pct: Math.round((r.c / r.t) * 100) })).sort((a, b) => b.t - a.t)
})

// เทียบกับรอบก่อน — จำ % รอบล่าสุดไว้ในเครื่อง (localStorage) ไม่ต้องอ่านประวัติจาก Firestore
const PREV_KEY = 'rxtu.quizLastPct'
const prevPct = ref(null)
watch(mode, (m) => {
  if (m !== 'result' || !sessionTotal.value) return
  try {
    const raw = localStorage.getItem(PREV_KEY)
    prevPct.value = raw === null ? null : Number(raw)
    localStorage.setItem(PREV_KEY, String(pct.value))
  } catch { prevPct.value = null }
})

const starting = ref(false)

// ── SRS ข้อที่เคยผิด (study.qcards) — spec 2026-08-20-quiz-srs-wiring ──
const REDO_BATCH = 20
const missingQIds = ref([])   // id ในกองที่หาย/ถูกถอนเผยแพร่ → ลบทิ้งตอน finish()

// ── 💬 ความเห็นเพื่อน — โหลดพร้อมชุด (รวม Zen ที่เติมข้อทีหลัง) · โชว์หลังตอบเท่านั้น ──
const { byQ } = useQComments()
const commentsOpen = ref(false)
const commentN = computed(() => (byQ.value, qCommentCount(current.value?.id)))
watch(() => quiz.value.map(q => q.id).join(','), ids => { if (ids) loadQComments(ids.split(',')) })
watch(() => current.value?.id, () => { commentsOpen.value = false })

// ── 🔖 ข้อที่บันทึกไว้ (study.saved) — utils/savedQuestions.js ──
const savedMap = computed(() => authStore.userData?.study?.saved || {})
const savedTotal = computed(() => savedCount(savedMap.value))
const savedNow = computed(() => isSaved(savedMap.value, current.value?.id))
const saving = ref(false)
async function toggleSave() {
  const qid = current.value?.id
  if (!qid || saving.value || !authStore.currentUser) return
  const r = buildSavedToggle({ study: authStore.userData?.study, qid, deleteSentinel: deleteField() })
  if (r.full) { toast(`บันทึกได้สูงสุด ${SAVED_MAX} ข้อ — เอาข้อเก่าออกก่อนนะ`, 'info'); return }
  if (!r.ok) return
  const nowSaved = r.saved   // หยิบก่อน patchUser (กับดัก #9)
  saving.value = true
  try {
    const ok = await authStore.patchUser({ study: r.optimisticStudy }, r.server)
    if (ok) toast(nowSaved ? 'บันทึกไว้ใน "ข้อที่บันทึกไว้" แล้ว' : 'เอาออกจากที่บันทึกแล้ว', 'success')
    else toast('บันทึกไม่สำเร็จ ลองใหม่อีกที', 'error')
  } finally { saving.value = false }
}
async function startSaved() {
  if (starting.value) return
  starting.value = true
  variant.value = 'saved'
  missingQIds.value = []
  try {
    const ids = savedIds(savedMap.value, SAVED_BATCH)
    if (!ids.length) { toast('ยังไม่มีข้อที่บันทึกไว้ — กด 🔖 ที่หน้าเฉลยได้เลย', 'info'); return }
    const rows = await fetchQuestionsByIds(ids)
    const usable = rows.filter(q => q.isPublished && Array.isArray(q.choices) && q.choices.length >= 2)
    const okIds = new Set(usable.map(q => q.id))
    const gone = ids.filter(id => !okIds.has(id))   // หาย/ถอนเผยแพร่ → เอาออกจากที่บันทึก
    if (gone.length) {
      const { optimisticStudy, server } = buildSavedRemove({ study: authStore.userData?.study, ids: gone, deleteSentinel: deleteField() })
      authStore.patchUser({ study: optimisticStudy }, server)
    }
    if (!usable.length) { toast('ข้อที่บันทึกไว้ถูกนำออกจากคลังแล้ว', 'info'); return }
    quiz.value = shuffle(usable).map(shuffleChoices)
    idx.value = 0; resetRound()
    mode.value = 'quiz'
  } catch (e) {
    console.error('[saved start]', e); toast('เริ่มทำข้อที่บันทึกไว้ไม่สำเร็จ', 'error')
  } finally { starting.value = false }
}

// ดึงข้อสุ่ม n ข้อ — ตรรกะการสุ่มอยู่ใน useQuestionFeed (ใช้ร่วมกับ Time Attack)
const fetchQuestions = async (n) => {
  if (examSet.value) {
    if (!setPool.value) setPool.value = await loadSetsPool(examSets.value)
    return shuffle(poolFiltered(approvedOnly.value)).slice(0, n)
  }
  return feedQuestions(n, { domain: dom.value, group: group.value, examSet: null, approvedOnly: approvedOnly.value })
}

async function start() {
  if (len.value === 'zen') return startZen()
  if (starting.value) return
  starting.value = true
  variant.value = 'normal'
  try {
    const picks = await fetchQuestions(len.value)
    quiz.value = shuffle(picks).map(shuffleChoices)
    idx.value = 0; resetRound()
    if (quiz.value.length) mode.value = 'quiz'
    else toast('ยังไม่มีข้อสอบในหมวดนี้', 'error')
  } catch (e) {
    console.error('[quiz start]', e); toast('เริ่มข้อสอบไม่สำเร็จ', 'error')
  } finally { starting.value = false }
}
// Zen — ทำต่อเนื่องไม่จำกัด จนกดออก · ใช้ชุด/หมวด/ผ่านตรวจที่เลือกไว้ (24 พ.ย. เพื่อนขอเลือกชุดได้)
async function startZen() {
  if (starting.value) return
  starting.value = true
  variant.value = 'zen'
  try {
    const picks = await fetchQuestions(ZEN_BATCH)
    quiz.value = shuffle(picks).map(shuffleChoices)
    idx.value = 0; resetRound()
    if (quiz.value.length) mode.value = 'quiz'
    else { toast('ยังไม่มีข้อสอบให้ทำ', 'error'); mode.value = 'home' }
  } catch (e) {
    console.error('[zen start]', e); toast('เริ่ม Zen ไม่สำเร็จ', 'error'); mode.value = 'home'
  } finally { starting.value = false }
}
// โหลดข้อเพิ่มต่อท้ายเมื่อใกล้หมด batch
async function loadMoreZen() {
  try {
    let more = await fetchQuestions(ZEN_BATCH)
    // เลือกชุดไว้ = สุ่มจากคลังในเครื่อง → เลี่ยงข้อที่ทำไปแล้วในรอบนี้ก่อน ครบทุกข้อแล้วค่อยวนซ้ำ
    if (examSet.value && setPool.value) {
      const done = new Set(quiz.value.map(q => q.id))
      const fresh = shuffle(poolFiltered(approvedOnly.value).filter(q => !done.has(q.id))).slice(0, ZEN_BATCH)
      if (fresh.length) more = fresh
    }
    if (more.length) quiz.value = [...quiz.value, ...shuffle(more).map(shuffleChoices)]
  } catch (e) { console.error('[zen more]', e) }
}
// ── โหมด redo: ทบทวนข้อที่เคยตอบผิด ──
// โหลดโจทย์ตาม id ทีละ doc (ขนานกัน) — ห้ามกลับไปใช้ query `documentId() in [...]`
// เพราะ rules ให้นักศึกษาอ่านเฉพาะ isPublished → ถ้ามีข้อที่ถูกถอนเผยแพร่ปนอยู่แค่ข้อเดียว
// query ทั้งก้อนโดน permission-denied = "เริ่มทบทวนไม่สำเร็จ" (เกิดจริง 8 พ.ย. 2026 · 33 คน)
// อ่านทีละ doc แล้วข้อที่อ่านไม่ได้ = หาย → startRedo ล้างออกจากกองให้เอง
async function fetchQuestionsByIds(ids) {
  const snaps = await Promise.all(ids.map(id =>
    getDoc(doc(db, 'questions', id)).catch(e => {
      if (e?.code === 'permission-denied') return null
      throw e
    })))
  usage.track(snaps.length)
  return snaps.filter(s => s?.exists()).map(s => ({ id: s.id, ...s.data() }))
}

// ล้างข้อที่หายจากคลังออกจากกอง (ใช้ตอนไม่มีรอบให้ทำ จึงไม่มี patch อื่นให้เกาะ)
async function flushMissingQIds() {
  if (!missingQIds.value.length || !authStore.currentUser) return
  const { set, remove } = applyQuizResults({
    qcards: authStore.userData?.study?.qcards, answers: [],
    variant: 'redo', now: Date.now(), missingIds: missingQIds.value,
  })
  if (!remove.length) { missingQIds.value = []; return }
  const { optimisticStudy, server } = buildQcardsPatch({
    study: authStore.userData?.study, set, remove, deleteSentinel: deleteField(),
  })
  const ok = await authStore.patchUser({ study: optimisticStudy }, server)
  if (ok) missingQIds.value = []
}

async function startRedo() {
  if (starting.value) return
  starting.value = true
  variant.value = 'redo'
  missingQIds.value = []
  try {
    const ids = dueQuestionIds(authStore.userData?.study?.qcards, Date.now(), REDO_BATCH)
    if (!ids.length) {
      toast('ยังไม่มีข้อที่ต้องทบทวน — ตอบผิดเมื่อไหร่จะเก็บมาที่นี่', 'info')
      mode.value = 'home'
      return
    }
    const rows = await fetchQuestionsByIds(ids)
    const usable = rows.filter(q => q.isPublished && Array.isArray(q.choices) && q.choices.length >= 2)
    const okIds = new Set(usable.map(q => q.id))
    missingQIds.value = ids.filter(id => !okIds.has(id))   // หาย/ถูกถอนเผยแพร่ → ลบตอน finish()
    if (!usable.length) {
      await flushMissingQIds()
      toast('ข้อที่ค้างถูกนำออกจากคลังแล้ว — ล้างกองให้เรียบร้อย', 'info')
      mode.value = 'home'
      return
    }
    quiz.value = shuffle(usable).map(shuffleChoices)
    idx.value = 0; resetRound()
    mode.value = 'quiz'
  } catch (e) {
    console.error('[redo start]', e); toast('เริ่มทบทวนไม่สำเร็จ', 'error'); mode.value = 'home'
  } finally { starting.value = false }
}

// รีเซ็ต state รอบใหม่
function resetRound() {
  picked.value = null; correct.value = 0; answered.value = 0; coinsEarned.value = 0; evEarned.value = 0
  streak.value = 0; bestStreak.value = 0
  answers.value = []
}

// achievement ลับ ความไวเป็นของปีศาจ: ตอบถูกภายใน 2 วิหลังโจทย์ขึ้น 5 ข้อติด (นับในเครื่อง ไม่เขียนอะไรจนกว่าจะปลด)
let shownAt = 0, fastRun = 0
watch(() => current.value?.id, () => { shownAt = performance.now() }, { immediate: true })

function pick(i) {
  if (picked.value !== null) return
  const fast = performance.now() - shownAt <= 2000
  picked.value = i
  answered.value++
  const isCorrect = i === current.value.answer
  sfx(isCorrect ? 'correct' : 'wrong')
  if (isCorrect) {
    correct.value++
    streak.value++
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
  } else streak.value = 0
  fastRun = isCorrect && fast ? fastRun + 1 : 0
  if (fastRun === 5) grantSecret('gag_demon')
  answers.value.push({ id: current.value.id, domain: current.value.domain || null, pleGroup: current.value.pleGroup || null, correct: isCorrect })
}
function choiceClass(i) {
  if (picked.value === null) return ''
  if (i === current.value.answer) return 'correct'
  if (i === picked.value) return 'wrong'
  return 'dim'
}
async function next() {
  resetReport()
  if (variant.value === 'examReview') { mode.value = 'result'; return }
  if (variant.value === 'zen') {
    if (idx.value + 1 >= quiz.value.length - 2) await loadMoreZen()   // ใกล้หมด → เติม
    if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
    else finish()   // คลังหมดจริง → จบนุ่มนวล
    return
  }
  if (idx.value + 1 < quiz.value.length) { idx.value++; picked.value = null }
  else finish()
}
function quit() {
  if (variant.value === 'examReview') { mode.value = 'result'; return }
  if (answered.value > 0) finish()
  else mode.value = 'home'
}
function backToHome() { variant.value = 'normal'; mode.value = 'home'; examAns.value = []; if (examMode.value) examResume.value = loadExamState(lsStore, authStore.currentUser?.uid) }

// กันมือโดน toolbar/ปุ่มกลับกลางชุด — ออกแล้วบันทึกผลเท่าที่ทำให้
useLeaveGuard(
  () => mode.value === 'quiz' && answered.value > 0 && variant.value !== 'examReview',
  'ออกจากข้อสอบตอนนี้?\nระบบจะบันทึกผลเท่าที่ทำไว้ให้',
  { onLeave: () => finish() },
)

// ══ 📋 จำลองสอบจริง (28 พ.ย. 2026) ══
const examMode = computed(() => route.query.mode === 'exam')
const examLen = ref(20)
const examSession = ref(null)
const examAns = ref([])     // คำตอบตอนส่ง (null = ไม่ตอบ) — ใช้หน้าเฉลยรายข้อ
const examStars = ref([])
const examResume = ref(null)
const lsStore = typeof window !== 'undefined' ? window.localStorage : null
const examTimeText = (n) => { const m = Math.round(n * SEC_PER_Q / 60); return m >= 60 ? `${Math.floor(m / 60)} ชม.${m % 60 ? ` ${m % 60} นาที` : ''}` : `${m} นาที` }
const examResumeLeft = computed(() => {
  const s = examResume.value; if (!s) return ''
  const ms = s.paused ? (s.remainMs || 0) : s.deadline - Date.now()
  const left = Math.max(0, Math.round(ms / 60000))
  return left > 0 ? `${s.paused ? 'พักไว้ · ' : ''}เหลือเวลาประมาณ ${left} นาที` : 'หมดเวลาแล้ว กดทำต่อเพื่อส่ง'
})
watch(examMode, (on) => { if (on) examResume.value = loadExamState(lsStore, authStore.currentUser?.uid) }, { immediate: true })
watch(() => authStore.currentUser?.uid, () => { if (examMode.value) examResume.value = loadExamState(lsStore, authStore.currentUser?.uid) })

// ดึงตามสัดส่วน: ผู้ป่วย (domain care) · ผลิตภัณฑ์ (domain sci ยกเว้นสังคม) · สังคม (กลุ่ม sci_social) · กฎหมาย (domain law)
// ส่วนไหนในคลังมีไม่พอ → เติมจากส่วนอื่นให้ครบ n
async function startExam() {
  if (starting.value) return
  starting.value = true
  try {
    const n = examLen.value
    const quota = examQuotas(n)
    const [care, sciRaw, sap, law] = await Promise.all([
      feedQuestions(quota.care + 4, { domain: 'care' }),
      feedQuestions(quota.sci + Math.ceil(quota.sci * 0.3) + 4, { domain: 'sci' }),
      quota.sap ? feedQuestions(quota.sap + 2, { group: SAP_GROUP }) : [],
      feedQuestions(quota.law + 2, { domain: 'law' }),
    ])
    const sci = sciRaw.filter(q => q.pleGroup !== SAP_GROUP)
    const usable = (q) => q.isPublished && Array.isArray(q.choices) && q.choices.length >= 2 && typeof q.answer === 'number'
    const seen = new Set()
    const take = (arr, k) => {
      const out = []
      for (const q of shuffle(arr)) { if (out.length >= k) break; if (!usable(q) || seen.has(q.id)) continue; seen.add(q.id); out.push(q) }
      return out
    }
    let chosen = [...take(care, quota.care), ...take(sci, quota.sci), ...take(sap, quota.sap), ...take(law, quota.law)]
    if (chosen.length < n) chosen = [...chosen, ...take([...care, ...sci, ...sap, ...law], n - chosen.length)]
    if (chosen.length < n) chosen = [...chosen, ...take(await feedQuestions(n * 2, {}), n - chosen.length)]
    if (chosen.length < 5) { toast('ข้อสอบในคลังยังไม่พอจัดชุด ลองใหม่อีกครั้ง', 'error'); return }
    const qs = shuffle(chosen).map(shuffleChoices).map(slimQuestion)
    examSession.value = { qs, ans: Array(qs.length).fill(null), star: Array(qs.length).fill(false), i: 0, deadline: Date.now() + qs.length * SEC_PER_Q * 1000 }
    quiz.value = qs; idx.value = 0; resetRound(); examAns.value = []
    variant.value = 'exam'; mode.value = 'quiz'
  } catch (e) {
    console.error('[exam sim]', e); toast('จัดชุดข้อสอบไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
  } finally { starting.value = false }
}
function resumeExam() {
  let s = examResume.value; if (!s) return
  if (s.paused) s = { ...s, paused: false, remainMs: undefined, deadline: Date.now() + (s.remainMs || 0) }   // พักไว้ → นับเวลาต่อจากที่เหลือ
  examSession.value = s; quiz.value = s.qs; idx.value = 0; resetRound(); examAns.value = []
  variant.value = 'exam'; mode.value = 'quiz'; examResume.value = null
}
function discardExam() { clearExamState(lsStore, authStore.currentUser?.uid); examResume.value = null }
function onExamSubmit({ ans, star }) {
  const qs = examSession.value?.qs || quiz.value
  const g = gradeExam(qs, ans)
  examAns.value = ans; examStars.value = star
  answers.value = g.answers; correct.value = g.correct; answered.value = g.answered
  examSession.value = null
  finish()
}
function onExamPause() { examSession.value = null; variant.value = 'normal'; mode.value = 'home'; quiz.value = []; examResume.value = loadExamState(lsStore, authStore.currentUser?.uid); toast('พักการสอบไว้แล้ว กลับมากดทำต่อได้', 'success') }
function onExamExit() { examSession.value = null; variant.value = 'normal'; mode.value = 'home'; examResume.value = null; quiz.value = [] }
const examReviewList = computed(() => (examAns.value.length && quiz.value.length === examAns.value.length)
  ? quiz.value.map((q, k) => ({ k, text: q.question, star: !!examStars.value[k],
      state: examAns.value[k] === null ? 'skip' : examAns.value[k] === q.answer ? 'ok' : 'bad' }))
  : [])
// ── 📋 กระดาษเฉลย: กรอง · บันทึก/ความเห็น/แจ้งผิดรายข้อ (ยืมฟังก์ชันเดิมโดยชี้ idx ไปข้อนั้นก่อน) ──
const SHEET_FILTERS = [{ k: 'all', label: 'ทั้งหมด' }, { k: 'bad', label: 'ผิด' }, { k: 'skip', label: 'ไม่ได้ตอบ' }, { k: 'star', label: '★' }]
const sheetFilter = ref('all')
const sheetReportK = ref(-1)
const sheetAll = computed(() => examReviewList.value.map(r => ({ ...r, q: quiz.value[r.k], ans: examAns.value[r.k] })))
const sheetMatch = (r, f) => f === 'all' || (f === 'star' ? r.star : r.state === f)
const sheetRows = computed(() => sheetAll.value.filter(r => sheetMatch(r, sheetFilter.value)))
const sheetCount = (f) => sheetAll.value.filter(r => sheetMatch(r, f)).length
function sheetSave(k) { idx.value = k; toggleSave() }
function sheetComments(k) { idx.value = k; commentsOpen.value = true }
function sheetReport(k) {
  if (sheetReportK.value === k) { sheetReportK.value = -1; resetReport(); return }
  resetReport(); sheetReportK.value = k
}
async function sheetSendReport(k) {
  idx.value = k
  await sendReport()
  if (reportedIds.value.has(quiz.value[k]?.id)) sheetReportK.value = -1
}

// 📄 เซฟ PDF: เปิดหน้าต่างใหม่ที่มีแต่กระดาษเฉลย แล้วเรียกพิมพ์ (เลือก "บันทึกเป็น PDF") — ไม่ติดเลย์เอาต์แอป/แถบเมนู
function printExamSheet() {
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const base = location.origin + (import.meta.env.BASE_URL || '/')
  const imgSrc = (p) => new URL((import.meta.env.BASE_URL || './') + String(p).replace(/^\//, ''), location.href).href
  const d = new Date()
  const items = sheetAll.value.map(r => {
    const q = r.q
    const imgs = questionImages(q).map(p => `<img src="${esc(imgSrc(p))}" alt="">`).join('')
    const ch = q.choices.map((c, j) => {
      const cls = j === q.answer ? 'right' : j === r.ans ? 'mine' : ''
      const mk = j === q.answer ? ' <b>(เฉลย)</b>' : j === r.ans ? ' <b>(คุณตอบ)</b>' : ''
      return `<li class="${cls}">${LETTERS[j]}. ${esc(c)}${mk}</li>`
    }).join('')
    const st = r.state === 'ok' ? 'ถูก' : r.state === 'bad' ? 'ผิด' : 'ไม่ได้ตอบ'
    return `<section><h3>ข้อ ${r.k + 1} <span class="${r.state}">${st}</span>${r.star ? ' ★' : ''}</h3>
      <p class="q">${esc(q.question)}</p>${imgs}<ul>${ch}</ul>${q.explanation ? `<p class="exp">${esc(q.explanation)}</p>` : ''}</section>`
  }).join('')
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>เฉลยจำลองสอบ ${d.toLocaleDateString('th-TH')}</title>
<style>body{font-family:'Sarabun','Noto Sans Thai',system-ui,sans-serif;color:#1f2430;margin:24px;font-size:13px;line-height:1.6}
h1{font-size:18px;margin:0 0 4px}.sum{color:#555;margin:0 0 16px}section{border-top:1px solid #ddd;padding:10px 0;break-inside:avoid}
h3{font-size:14px;margin:0 0 4px}h3 span{font-size:12px;padding:1px 8px;border-radius:9px;margin-left:6px}.ok{background:#dcfce7;color:#166534}.bad{background:#fee2e2;color:#b91c1c}.skip{background:#eee;color:#555}
.q{white-space:pre-line;margin:0 0 6px}ul{list-style:none;padding:0;margin:0 0 6px}li{padding:2px 6px;border-radius:4px}li.right{background:#dcfce7}li.mine{background:#fee2e2}
.exp{white-space:pre-line;background:#f6f7f9;padding:6px 8px;border-radius:6px;margin:0}img{max-width:60%;max-height:260px;display:block;margin:4px 0}
@page{margin:14mm}</style></head><body>
<h1>เฉลยจำลองสอบจริง · RxTU10</h1><p class="sum">${d.toLocaleString('th-TH')} · ได้ ${correct.value}/${quiz.value.length} (${pct.value}%) · ตอบ ${answered.value} ข้อ</p>
${items}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`
  const w = window.open('', '_blank')
  if (!w) { toast('เบราว์เซอร์บล็อกหน้าต่างใหม่ ลองอนุญาต pop-up แล้วกดอีกครั้ง', 'error'); return }
  w.document.open(); w.document.write(html); w.document.close()
}
function openExamReview(k) {
  resetReport()
  variant.value = 'examReview'; idx.value = k
  picked.value = examAns.value[k] === null ? -1 : examAns.value[k]
  mode.value = 'quiz'
  window.scrollTo?.(0, 0)
}

async function finish() {
  mode.value = 'result'

  // เหรียญข้อสอบ — ไม่มีเพดานรายวันแล้ว ทำมากได้มาก (rate ต่อข้อที่ถูก)
  const today = new Date().toISOString().slice(0, 10)
  const grant = correct.value * QUIZ_COIN
  coinsEarned.value = grant
  // แต้มอีเวนต์ — ได้จากข้อสอบเท่านั้น เฉพาะข้อที่ตอบถูก 2 ลูก (user 26 ต.ค. 2026)
  const ev = activeEvent()
  evEarned.value = quizPts(ev, answered.value, correct.value)
  const evp = grantPatch(authStore.userData, ev, evEarned.value, increment)

  if (!authStore.currentUser) return

  // 1) record the attempt (examSessions — owner-only)
  try {
    usage.track(0, 1)
    // สรุปถูก/ทั้งหมดต่อ domain จาก answers (วนจาก DOMAIN_KEYS + bucket none สำหรับข้อไม่มี domain)
    const domainStats = Object.fromEntries(DOMAIN_KEYS.map(k => [k, { c: 0, t: 0 }]))
    domainStats.none = { c: 0, t: 0 }
    for (const a of answers.value) {
      const bucket = (a.domain && domainStats[a.domain]) ? a.domain : 'none'
      domainStats[bucket].t++
      if (a.correct) domainStats[bucket].c++
    }
    await addDoc(collection(db, 'examSessions'), {
      userId: authStore.currentUser.uid,
      nickname: authStore.userData?.nickname || null,
      total: sessionTotal.value,
      correct: correct.value,
      pct: pct.value,
      domain: dom.value === '__all' ? null : dom.value,
      examSet: examSets.value.join(', ') || null,
      category: null,
      domainStats,
      ts: serverTimestamp(),
    })
  } catch (e) { console.error('[exam save]', e) }

  // 1.5) สถิติรายข้อ — increment questionStats/{qid} ต่อข้อที่ตอบ (SP2b, non-fatal)
  try {
    const tally = tallyAnswers(answers.value)
    const qids = Object.keys(tally)
    if (qids.length) {
      const batch = writeBatch(db)
      for (const qid of qids) {
        batch.set(doc(db, 'questionStats', qid),
          { a: increment(tally[qid].a), c: increment(tally[qid].c) }, { merge: true })
      }
      await batch.commit()
      usage.track(0, qids.length)
    }
  } catch (e) { console.error('[questionStats]', e) }

  // 2) update the user doc: coins + best score + daily cap + กองข้อที่เคยผิด
  const newHigh = Math.max(authStore.userData?.quizHigh || 0, correct.value)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'quiz', today, answered.value)

  // กองข้อที่เคยผิด (21 พ.ย.): ผิด = เข้ากอง/นับใหม่ ทวนได้ทันที · ถูกติดกัน 3 ครั้ง = ออกจากกอง (ทุกโหมด ไม่เลื่อนวัน)
  // เติมลง patch ก้อนนี้เลย = ไม่มีการเขียน Firestore เพิ่ม
  const { set: qcSet, remove: qcRemove } = applyQuizResults({
    qcards: authStore.userData?.study?.qcards,
    answers: answers.value,
    variant: variant.value,
    now: Date.now(),
    missingIds: missingQIds.value,
  })
  const { optimisticStudy, server: qcServer } = buildQcardsPatch({
    study: authStore.userData?.study,
    set: qcSet, remove: qcRemove, deleteSentinel: deleteField(),
  })
  // สถิติรายกลุ่มโรค (radar หน้าฉัน) — study.gs ไปกับ patch ก้อนเดียวกัน
  const { server: gsServer, optimisticGs } = buildGsPatch({
    gs: authStore.userData?.study?.gs, tally: tallyGroups(answers.value), increment,
  })
  const touchedQcards = Object.keys(qcServer).length > 0
  const touchedGs = Object.keys(gsServer).length > 0
  const studyLocal = touchedQcards ? optimisticStudy : { ...(authStore.userData?.study || {}) }
  if (touchedGs) studyLocal.gs = optimisticGs
  // achievement ไร้ที่ติ: ถูกหมดทั้งชุดที่ทำจริง ≥10 ข้อ (ออกกลางคันก็นับเฉพาะที่ตอบ)
  const perfect = answered.value >= 10 && correct.value === answered.value
  if (answered.value >= 5 && isOwlHour()) grantSecret('gag_owl')   // achievement ลับ นกฮูกราตรี

  // 📝 ข้อที่ทำวันนี้ (หลอด "เป้าวันนี้" หน้าแรก · 20 พ.ย. 2026) — ข้ามวัน = เริ่มนับใหม่
  const qtDay = dayKey()
  const qtPrev = authStore.userData?.qToday
  const qToday = { d: qtDay, n: (qtPrev?.d === qtDay ? (qtPrev.n || 0) : 0) + answered.value }
  const ok = await authStore.patchUser(
    {
      coins: (authStore.userData?.coins || 0) + grant,
      qToday,
      quizHigh: newHigh,
      quizDoneTotal: (authStore.userData?.quizDoneTotal || 0) + answered.value,
      dailyQuest: dq,
      ...(touchedQcards || touchedGs ? { study: studyLocal } : {}),
      ...(perfect ? { quizPerfectTotal: (authStore.userData?.quizPerfectTotal || 0) + 1 } : {}),
      ...(evp ? evp.local : {}),
    },
    {
      ...(grant ? { coins: increment(grant) } : {}),
      ...(qtPrev?.d === qtDay ? { 'qToday.n': increment(answered.value) } : { qToday }),
      quizHigh: newHigh,
      quizDoneTotal: increment(answered.value),
      dailyQuest: dq,
      ...(perfect ? { quizPerfectTotal: increment(1) } : {}),
      ...(evp ? evp.server : {}),
      ...gsServer,
      ...qcServer,   // dot-notation เท่านั้น — ห้ามส่ง study ทั้งก้อน ไม่งั้นทับ study.cards
    },
  )
  if (ok) {
    missingQIds.value = []
    bumpGlobalStat('quizTotal', answered.value)
  } else {
    toast('บันทึกผลไม่สำเร็จ — ลองใหม่อีกครั้ง', 'error')
  }
  if (grant) toast(`ได้ ${grant}🪙${ok && evEarned.value ? ` + ${evEarned.value}${ev.pt}` : ''} จากการทำข้อสอบ`, 'success')
  else if (ok && evEarned.value) toast(`ได้ ${evEarned.value}${ev.pt} จากการทำข้อสอบ`, 'success')

  // ข่าวกระดาน: ยิงครั้งเดียวต่อรอบ ที่ขั้นสูงสุดที่ถึง (10/20/30)
  // เลนนี้เป็น write เพิ่มจริง (ควิซไม่เคย sync roster) จึงคุมให้ถี่ต่ำด้วยเกณฑ์ 10 ข้อติด
  const tier = bestStreak.value >= 30 ? 30 : bestStreak.value >= 20 ? 20 : bestStreak.value >= 10 ? 10 : 0
  if (ok && tier) syncRosterRow({ event: { k: 'qz', v: tier, t: Date.now() } })
  // ข่าวรวมรุ่น: ข้อสอบวันนี้ครบหลักร้อย — คนที่ส่งแล้วข้ามหลักเป็นเจ้าของข่าว (await ทีหลัง ไม่ขวางจอผล)
  if (ok) bumpQuizToday(answered.value).then(r => {
    const m = r && quizDayMilestone(r.before, r.after)
    if (m) syncRosterRow({ event: { k: 'qd', v: m, t: Date.now() } })
  })
}
</script>

<style scoped>
.qv-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.qv-head-title { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--ink); }
.qv-back { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer; box-shadow: var(--pop); }
.qv-back:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-empty { text-align: center; color: rgba(0,0,0,.45); padding: 40px 16px; font-size: .85rem; line-height: 1.6; }

/* การ์ดหัว + การ์ดกลุ่มตัวเลือก */
.qv-hero { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #fff; border-radius: 20px; box-shadow: var(--pop); padding: 14px 16px; margin-bottom: 12px; }
.qv-hero-num { display: block; font-family: var(--font-display); font-size: 1.9rem; line-height: 1; }
.qv-hero small { font-size: .72rem; opacity: .92; }
.qv-hero-due { margin-left: auto; text-align: right; font: inherit; font-size: .72rem; line-height: 1.35; color: #fff; background: rgba(255,255,255,.22); border: 0; border-radius: 12px; padding: 7px 10px; cursor: pointer; }
.qv-hero-due b { display: block; font-size: 1rem; }
.qv-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 20px; box-shadow: var(--pop); padding: 4px 14px 14px; margin-bottom: 12px; }
.qv-seg { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 3px; background: var(--primary-light); border-radius: 12px; padding: 3px; }
.qv-seg button { font: inherit; font-size: .8rem; font-weight: 700; border: 0; background: transparent; color: var(--muted); border-radius: 9px; padding: 7px 0; cursor: pointer; }
.qv-seg button.on { background: var(--surface); color: var(--primary); box-shadow: 0 1px 3px rgba(43,53,80,.14); }
/* ปุ่มหลักติดขอบล่างของพื้นที่เลื่อน */
.qv-dock { position: sticky; bottom: 0; z-index: 2; margin: 14px -2px 0; padding: 12px 2px 4px; background: linear-gradient(0deg, rgba(247,249,253,.97) 72%, rgba(247,249,253,0)); }
.qv-dock .qv-start { margin-top: 0; }
.qv-dock-row { display: flex; gap: 8px; }
.qv-dock-row .qv-start { flex: 1.3; }
.qv-ghost { flex: 1; font: inherit; font-size: .88rem; font-weight: 700; color: var(--primary); background: var(--surface); border: var(--bw) solid var(--line); border-radius: 14px; padding: 12px; cursor: pointer; }
.qv-idle { text-align: center; font-size: .74rem; color: var(--muted); margin-top: 14px; }
.qv-redo-tag { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-weight: 800;
  color: #92400e; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 999px; padding: 4px 12px; margin-bottom: 10px; }
.qv-label { font-size: .7rem; font-weight: 700; color: #64748b; margin: 12px 0 6px; }
.qv-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.qv-chip { border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 7px 14px; font-family: inherit; font-size: .76rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qv-setbtn { padding: 14px; display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 8px; font-family: inherit; cursor: pointer; text-align: left; }
.qv-saved { cursor: default; }
.qv-saved-n { font-weight: 600; color: var(--muted); font-size: .72rem; }
.qv-saved-acts { display: flex; gap: 6px; flex-shrink: 0; }
.qv-saved-btn { font: inherit; font-size: .76rem; font-weight: 700; border: var(--bw) solid var(--line); background: none; border-radius: 999px; padding: 6px 12px; color: var(--primary); cursor: pointer; }
.qv-saved-btn.main { background: var(--primary); border-color: var(--primary); color: #fff; }
.qv-setbtn.on { border-color: var(--primary); }
.qv-setbtn-l { font-weight: 800; font-size: .82rem; color: var(--ink); }
.qv-setbtn-r { font-size: .76rem; font-weight: 700; color: var(--primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
.qv-setlist { display: flex; flex-direction: column; gap: 6px; padding-bottom: 8px; }
.qv-setrow { display: flex; justify-content: space-between; gap: 10px; align-items: center; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 11px 12px; font-family: inherit; font-size: .8rem; color: var(--ink); cursor: pointer; text-align: left; }
.qv-setrow b { white-space: nowrap; font-size: .74rem; color: var(--muted); }
.qv-setrow.on { border-color: var(--primary); background: var(--primary-light); }
.qv-setrow.clear { color: var(--muted); font-weight: 700; }
.qv-sethead { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: .74rem; color: var(--muted); margin-bottom: 8px; }
.qv-setmini { font: inherit; font-size: .74rem; font-weight: 700; color: var(--primary); background: var(--primary-light); border: 0; border-radius: 999px; padding: 4px 10px; cursor: pointer; }
.qv-setname { flex: 1; min-width: 0; }
.qv-setcheck { flex-shrink: 0; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 999px; border: var(--bw) solid var(--line); color: transparent; font-size: .74rem; font-weight: 800; transition: background .15s, color .15s, border-color .15s; }
.qv-setrow.on .qv-setcheck { background: var(--primary); border-color: var(--primary); color: #fff; }
.qv-setdock { position: sticky; z-index: 1; margin: 12px 0 -22px; bottom: -22px; padding: 10px 0 22px; background: #fff; box-shadow: 0 -8px 12px -8px rgba(0,0,0,.08); }
.qv-setdock { display: flex; gap: 8px; }
.qv-setdock .qv-start { flex: 1; margin-top: 0; }
.qv-setclear { font: inherit; font-weight: 700; font-size: .8rem; color: var(--muted); background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; padding: 0 16px; cursor: pointer; }
.qv-step { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 999px; background: var(--primary); color: #fff; font-size: .7rem; margin-right: 4px; }
.qv-opt { font-weight: 600; color: var(--muted); margin-left: 4px; }
.qv-seg2 { grid-template-columns: 1fr 1fr; }
.qv-seg2 button { display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
.qv-picked { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }
.qv-pickchip { display: inline-flex; align-items: center; gap: 2px; background: var(--primary-light); color: var(--primary); border-radius: 999px; padding: 4px 4px 4px 10px; font-size: .74rem; font-weight: 700; }
.qv-pickchip button { border: 0; background: transparent; color: inherit; font-size: .7rem; width: 22px; height: 22px; border-radius: 999px; cursor: pointer; }
.qv-scroller { display: flex; gap: 6px; overflow-x: auto; margin-top: 10px; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.qv-scroller::-webkit-scrollbar { display: none; }
.qv-scroller .qv-chip { flex-shrink: 0; white-space: nowrap; }
.qv-setsec + .qv-setsec { margin-top: 14px; }
.qv-sethead b { color: var(--ink); font-size: .8rem; }
.qv-setgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.qv-settile { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; min-width: 0; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 9px 32px 9px 10px; font-family: inherit; color: var(--ink); cursor: pointer; transition: border-color .15s, background .15s; }
.qv-settile.on { border-color: var(--primary); background: var(--primary-light); }
.qv-settile .qv-setcheck { position: absolute; top: 8px; right: 8px; }
.qv-settile.on .qv-setcheck { background: var(--primary); border-color: var(--primary); color: #fff; }
.qv-settile-name { font-size: .78rem; font-weight: 700; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.qv-settile-meta { font-size: .7rem; color: var(--muted); }
.qv-switch { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: .78rem; font-weight: 700; cursor: pointer; }
.qv-switch small { font-weight: 600; color: var(--muted); }
.qv-switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.qv-switch-ui { flex-shrink: 0; width: 38px; height: 22px; border-radius: 999px; background: var(--line); position: relative; transition: background .2s; }
.qv-switch-ui::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 999px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .2s; }
.qv-switch input:checked + .qv-switch-ui { background: var(--primary); }
.qv-switch input:checked + .qv-switch-ui::after { transform: translateX(16px); }
.qv-switch input:focus-visible + .qv-switch-ui { outline: 2px solid var(--primary); outline-offset: 2px; }
.qv-setyear { color: var(--muted); }
.qv-chip-sm { padding: 5px 11px; font-size: .72rem; }
.qv-chip small { font-size: .7rem; opacity: .7; margin-left: 2px; }
.qv-sub-label { margin-top: 10px; }
.qv-chip.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.qv-start { width: 100%; margin-top: 20px; border: var(--bw) solid var(--line); border-radius: 14px; padding: 15px; font-family: inherit; font-size: .95rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; transition: transform .12s, box-shadow .12s; }
.qv-start:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-start:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.qv-xs-title { font-weight: 800; font-size: 1.05rem; margin-top: 12px; }
.qv-xs-p { font-size: .82rem; color: var(--muted); margin: 6px 0 4px; line-height: 1.55; }
.qv-xs-meta { display: flex; flex-direction: column; gap: 2px; margin-top: 10px; font-size: .8rem; font-weight: 700; }
.qv-xs-meta span + span { font-weight: 600; color: var(--muted); font-size: .74rem; }
.qv-xs-notes { margin: 12px 0 0; padding-left: 18px; font-size: .74rem; color: var(--muted); line-height: 1.55; display: grid; gap: 4px; }
.qv-xs-resume { display: grid; gap: 6px; margin-top: 12px; padding: 12px; border-radius: 14px; background: var(--primary-light); font-size: .82rem; }
.qv-xs-resume .qv-dock-row { margin-top: 6px; }
.qv-xs-review { padding-bottom: 10px; }
.qv-xs-rrow { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; font: inherit; background: none; border: 0; border-top: 1px solid var(--line); padding: 9px 2px; cursor: pointer; color: var(--ink); }
.qv-xs-rno { flex: none; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-size: .74rem; font-weight: 800; background: var(--line); }
.qv-xs-rrow.ok .qv-xs-rno { background: #dcfce7; color: #166534; }
.qv-xs-rrow.bad .qv-xs-rno { background: #fee2e2; color: #b91c1c; }
.qv-xs-rq { flex: 1; min-width: 0; font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qv-xs-rtag { flex: none; font-size: .72rem; font-weight: 700; color: var(--muted); }
.qv-xs-rrow.ok .qv-xs-rtag { color: #166534; }
.qv-xs-rrow.bad .qv-xs-rtag { color: #b91c1c; }
.qv-sheet { display: grid; gap: 12px; margin-top: 16px; text-align: left; }
.qv-sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.qv-sheet-head b { font-size: 1rem; }
.qv-sheet-pdf { font: inherit; font-size: .8rem; font-weight: 700; color: var(--primary); background: var(--surface); border: var(--bw) solid var(--line); border-radius: 999px; padding: 7px 14px; cursor: pointer; }
.qv-sq { background: #fff; border: 1px solid var(--line); border-left: 4px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.qv-sq.ok { border-left-color: #22c55e; } .qv-sq.bad { border-left-color: #ef4444; }
.qv-sq-top { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 8px; }
.qv-sq-no { font-weight: 800; font-size: .85rem; }
.qv-sq-tag { font-size: .72rem; font-weight: 800; border-radius: 999px; padding: 2px 9px; background: #f1f5f9; color: var(--muted); }
.qv-sq.ok .qv-sq-tag { background: #dcfce7; color: #166534; } .qv-sq.bad .qv-sq-tag { background: #fee2e2; color: #b91c1c; }
.qv-sq-star { font-size: .72rem; font-weight: 700; color: #b45309; }
.qv-sq-dom { margin-left: auto; font-size: .7rem; color: var(--muted); }
.qv-sq-q { white-space: pre-line; font-size: .9rem; line-height: 1.6; overflow-wrap: anywhere; }
.qv-sq-ch { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; }
.qv-sq-ch li { display: flex; gap: 8px; align-items: flex-start; padding: 6px 8px; border-radius: 8px; font-size: .84rem; line-height: 1.5; overflow-wrap: anywhere; }
.qv-sq-ch li.right { background: #dcfce7; color: #14532d; font-weight: 600; }
.qv-sq-ch li.mine { background: #fee2e2; color: #7f1d1d; }
.qv-sq-lt { flex: none; width: 1.2em; font-weight: 700; color: var(--muted); }
.qv-sq-ct { flex: 1; min-width: 0; }
.qv-sq-mk { flex: none; font-size: .7rem; font-weight: 800; }
.qv-sq-exp { margin-top: 10px; padding: 10px 12px; border-radius: 10px; background: #f6f7f9; font-size: .82rem; line-height: 1.6; white-space: pre-line; overflow-wrap: anywhere; }
.qv-sq-acts { margin-top: 10px; }
.qv-hint { text-align: center; font-size: .7rem; color: rgba(0,0,0,.4); margin-top: 10px; }

.qv-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.qv-quit { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; font-size: .85rem; cursor: pointer; flex-shrink: 0; }
.qv-bar { flex: 1; height: 10px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.qv-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width .35s; }
.qv-pill { font-size: .72rem; font-weight: 800; border-radius: 999px; padding: 3px 9px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.qv-streak { background: var(--accent-light); color: #a23b6c; flex-shrink: 0; transition: opacity .2s; }
.qv-streak.off { opacity: .45; }
.qv-score { background: var(--mint-light); color: #1f7a5c; }
.qv-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 10px; }
.qv-tag { font-size: .7rem; font-weight: 700; border-radius: 6px; padding: 2px 8px; background: var(--primary-light); color: var(--primary-dark); }
.qv-tag-set { background: #eef2ff; color: #4338ca; }
.qv-tag-redo { background: #fef3c7; color: #92400e; }
.qv-tag-redo.done { background: #dcfce7; color: #166534; }
.qv-tag-saved { background: var(--primary-light); color: var(--primary-dark); }
.qv-count { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.5); flex-shrink: 0; }
.qv-zen-tag { flex: 1; display: flex; align-items: center; gap: 5px; font-size: .8rem; font-weight: 800; color: var(--primary); }
.qv-running { text-align: right; font-size: .7rem; font-weight: 700; color: #15803d; margin-bottom: 10px; }
.qv-review-badge { display: inline-block; margin-bottom: 6px; }
.qv-q { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 18px; font-size: .95rem; font-weight: 700; color: var(--ink); line-height: 1.5; margin-bottom: 14px; white-space: pre-line; }
.qv-choices { display: flex; flex-direction: column; gap: 10px; }
.qv-choice { display: flex; align-items: center; gap: 10px; text-align: left; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 13px 14px; font-family: inherit; font-size: .85rem; color: var(--ink); cursor: pointer; box-shadow: var(--pop); transition: transform .1s, box-shadow .1s; }
.qv-choice:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-choice:disabled { cursor: default; }
.qv-letter { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: var(--primary-light); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .78rem; }
.qv-ctext { flex: 1; }
.qv-choice.correct { border-color: var(--mint); background: var(--mint-light); color: #1f7a5c; font-weight: 700; animation: qv-pop .35s; }
.qv-choice.correct .qv-letter { background: var(--mint); color: #fff; }
.qv-choice.wrong { border-color: #f28bb0; background: #fde7ef; color: #b0386a; animation: qv-shake .35s; }
.qv-choice.wrong .qv-letter { background: #e0719a; color: #fff; }
@keyframes qv-pop { 40% { transform: scale(1.03); } }
@keyframes qv-shake { 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
.qv-choice.dim { opacity: .5; }
.qv-feedback { margin-top: 14px; }
.qv-fb { font-size: .8rem; line-height: 1.5; padding: 10px 12px; border-radius: 14px; }
.qv-fb b { display: block; font-size: .92rem; }
.qv-fb.ok { color: #1f7a5c; background: var(--mint-light); }
.qv-fb.no { color: #b0386a; background: #fde7ef; }
.qv-exp { margin-top: 10px; font-size: .76rem; color: #b45309; background: #fffbeb; border-radius: 10px; padding: 10px 12px; line-height: 1.5; }
.qv-src { display: inline-block; margin: -4px 0 10px; font-size: .72rem; color: var(--primary-dark); text-decoration: none; background: var(--primary-light); border-radius: 999px; padding: 3px 10px; }
.qv-note { margin-top: 8px; font-size: .76rem; color: #1e40af; background: #eff6ff; border-radius: 8px; padding: 9px 11px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
.qv-next { width: 100%; margin-top: 14px; border: none; border-radius: 12px; padding: 13px; font-family: inherit; font-size: .88rem; font-weight: 800; color: #fff; background: linear-gradient(135deg,var(--primary),var(--primary-2)); cursor: pointer; }

.qv-report { margin-top: 12px; }
.qv-acts { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 6px; }
.qv-acts .qv-report-btn { padding: 9px 4px; }
.qv-cnt { display: inline-block; min-width: 1.4em; margin-left: 2px; border-radius: 999px; padding: 0 6px; font-size: .7rem; background: var(--accent); color: #fff; }
.qv-cnt.zero { background: var(--line); color: var(--muted); }
.qv-acts + .qv-report-panel { margin-top: 8px; }
.qv-save-btn.on { border-style: solid; border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }
.qv-report-btn { width: 100%; border: 1px dashed rgba(0,0,0,.2); background: none; border-radius: 10px; padding: 9px; font-family: inherit; font-size: .76rem; font-weight: 700; color: #64748b; cursor: pointer; }
.qv-report-hint { font-size: .7rem; color: rgba(0,0,0,.5); margin: 6px 0 2px; line-height: 1.5; }
.qv-edit-btn { margin-bottom: 6px; border-style: solid; border-color: #c7d2fe; color: #4338ca; background: #eef2ff; }
.qv-report-btn.done { color: #15803d; border-color: rgba(34,197,94,.4); cursor: default; }
.qv-report-panel { border: 1px solid var(--border); border-radius: 12px; padding: 10px; }
.qv-report-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.qv-report-chip { border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 5px 11px; font-family: inherit; font-size: .7rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.qv-report-chip.on { background: var(--primary); border-color: var(--ink); color: #fff; }
.qv-report-note { width: 100%; box-sizing: border-box; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px 10px; font-family: inherit; font-size: .78rem; resize: vertical; }
.qv-report-actions { display: flex; gap: 8px; margin-top: 8px; }
.qv-report-cancel { flex: 0 0 80px; border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .76rem; font-weight: 700; cursor: pointer; }
.qv-report-send { flex: 1; border: none; border-radius: 10px; padding: 8px; font-family: inherit; font-size: .78rem; font-weight: 800; color: #fff; background: var(--primary); cursor: pointer; }
.qv-report-send:disabled { background: #cbd5e1; cursor: default; }

.qv-result { text-align: center; padding: 8px 0 0; }
.qv-ring { position: relative; width: 170px; height: 170px; margin: 10px auto 6px; }
.qv-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.qv-ring-arc { stroke: var(--primary); transition: stroke-dashoffset .8s ease-out; }
.qv-ring-c { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.qv-ring-c b { font-family: var(--font-display); font-weight: 400; font-size: 2.2rem; color: var(--primary); line-height: 1; }
.qv-ring-c small { font-size: .8rem; color: var(--muted); margin-top: 2px; }
.qv-result-cmp { font-size: .82rem; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
.qv-result-cmp.up { color: #1f7a5c; }
.qv-result-cmp.down { color: #b0386a; }
.qv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
.qv-stat { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 9px 4px; }
.qv-stat b { display: block; font-size: 1.05rem; font-variant-numeric: tabular-nums; }
.qv-stat small { font-size: .7rem; color: var(--muted); }
.qv-stat.coin b { color: #d97706; }
.qv-rdom { text-align: left; }
.qv-result-emoji { font-size: 3.4rem; }
.qv-result-title { font-size: 1.15rem; font-weight: 800; }
.qv-result-score { font-family: var(--font-display); font-weight: 400; font-size: 2.8rem; color: var(--primary); line-height: 1; }
.qv-result-score span { font-size: 1.3rem; color: rgba(0,0,0,.35); }
.qv-result-pct { font-size: 1rem; font-weight: 700; color: #64748b; margin-top: 4px; }
.qv-result-coins { font-size: 1.2rem; font-weight: 800; color: #d97706; margin: 14px 0; }
.qv-result-nocoins { font-size: .72rem; color: rgba(0,0,0,.4); margin: 14px 0; }
.qv-result .qv-start { max-width: 260px; margin: 6px auto 0; }

.qv-history-btn { width: 100%; margin-top: 10px; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 700; font-size: .85rem; color: var(--ink); cursor: pointer; box-shadow: var(--pop); }
.qv-history-btn:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-hist-latest { font-size: .95rem; margin-bottom: 14px; }
.qv-trend { display: flex; align-items: flex-end; gap: 4px; height: 80px; padding: 8px; border: var(--bw) solid var(--line); border-radius: 12px; background: #fff; margin-bottom: 8px; }
.qv-trend-bar { flex: 1; min-width: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
.qv-dom-stats { display: flex; flex-direction: column; gap: 8px; }
.qv-dom-row { display: flex; align-items: center; gap: 8px; }
.qv-dom-name { width: 44px; font-size: .78rem; font-weight: 700; }
.qv-dom-bar { flex: 1; height: 14px; background: rgba(0,0,0,.07); border-radius: 999px; overflow: hidden; }
.qv-dom-fill { display: block; height: 100%; background: var(--primary); }
.qv-dom-val { font-size: .72rem; font-variant-numeric: tabular-nums; color: rgba(0,0,0,.6); }
.x2-pill { display: inline-block; margin-left: 4px; padding: 0 7px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 700; font-size: .7rem; vertical-align: 1px; }
</style>
