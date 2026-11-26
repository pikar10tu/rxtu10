<!-- 🎯 โหมดโฟกัส · Co-working space (22 พ.ย. 2026 · เปิดทุกคน)
     เข้าแล้วจับเวลาทันที · กดได้แค่ "ไปทำข้อสอบ" หรือนั่งในห้อง · จิ้มพื้นเดิน จิ้มใกล้เคาน์เตอร์ว่างนั่ง
     ฉากพิกเซล 160×100 (Claude วาดด้วย pxl · ต้นฉบับ Claude outputs/focus-room-demo/art/room.px.js)
     ชั้นภาพเรียงตามตำแหน่งเท้า: คนหลังเคาน์เตอร์ถูกบัง คนเดินหน้าเคาน์เตอร์อยู่บน · เคาน์เตอร์เดินทะลุไม่ได้ (BFS)
     คนในห้อง/แชท = Realtime Database (composables/useFocusRoom.js) · เหรียญ/เวลาสะสม = Firestore ทุก 60 วิ (useFocusMode) -->
<template>
  <div class="tab-content fo" :class="{ saving: saver }">
    <header class="fo-head">
      <BackButton aria-label="ย้อนกลับ" @click="$router.back()" />
      <div class="fo-title"><b><Emoji char="🎯" /> Co-working space</b><small>ห้องอ่านหนังสือกับเพื่อน</small></div>
      <button type="button" class="fo-fb" @click="fbOpen = true"><Emoji char="🐞" /> แจ้งบัค/ข้อเสนอแนะ</button>
    </header>


    <!-- ฉาก -->
    <div ref="sceneEl" class="fo-scene" :class="['tod-' + tod, 'z-' + viewZone]" @click="onFloor">
      <img class="fo-bg" :src="ART['bg_' + viewZone]" alt="" draggable="false">
      <div class="fo-tint"></div>
      <!-- 📅 ปฏิทินฉีกนับวันสอบ CC2 (เฉพาะห้องสมุด) — เข้าห้องแล้วหน้าเมื่อวานฉีกปลิวออก -->
      <div v-if="viewZone === 'lib'" class="fo-cal" :aria-label="`อีก ${daysLeft} วันสอบ CC2`" role="img">
        <span class="fo-cal-pg"><b>{{ daysLeft }}</b><small>วัน</small></span>
        <span v-if="tearToday" class="fo-cal-pg tear" aria-hidden="true"><b>{{ daysLeft + 1 }}</b><small>วัน</small></span>
      </div>
      <!-- ☕ เคาน์เตอร์คาเฟ่ → เลี้ยงกาแฟผู้พัฒนา (27 พ.ย. 2026) -->
      <button v-if="viewZone === 'cafe'" type="button" class="fo-coffee" aria-label="เคาน์เตอร์คาเฟ่ เลี้ยงกาแฟผู้พัฒนา" @click.stop="openCoffee"><span><Emoji char="☕" /></span></button>
      <div class="fo-zsw" @click.stop>
        <button type="button" aria-label="โซนก่อนหน้า" @click="stepZone(-1)">‹</button>
        <span>{{ ZONES[ZI].label }}</span>
        <button type="button" aria-label="โซนถัดไป" @click="stepZone(1)">›</button>
      </div>
      <div v-for="(c, i) in COUNTERS" :key="'c' + i" class="fo-ent fo-desk" :style="entStyle(c[0], c[1], c[1] + 8.4)">
        <img :src="ART['desk_' + viewZone]" alt="" draggable="false">
      </div>
      <template v-for="p in others" :key="p.uid">
        <div v-if="pos[p.uid]" class="fo-ent fo-av" :class="{ walk: pos[p.uid].walking, away: p.away }" :style="entStyle(pos[p.uid].x, pos[p.uid].y, pos[p.uid].y)">
          <div class="fo-label"><span class="fo-nm">{{ p.name }}<template v-if="narrow"> <Emoji :char="p.away ? '💤' : STATUS_ICON[p.st] || '💤'" /></template></span><span v-if="!narrow" class="fo-st"><Emoji :char="p.away ? '💤' : STATUS_ICON[p.st] || '💤'" /> {{ p.away ? 'พักสายตา' : stText(p.st) }}</span></div>
          <div v-if="bubbles[p.uid]" class="fo-bubble">{{ bubbles[p.uid] }}</div>
          <span v-if="handUp(p)" class="fo-hand" aria-label="ยกมือรอไฮไฟว์"><Emoji char="✋" /></span>
          <span v-for="c in (fcoins[p.uid] || [])" :key="c" class="fo-coin"><Emoji char="🪙" />+{{ (p.house || 1) * FEST_X }}</span>
          <div class="fo-doll"><DollFigure :eq="eqOf(p.doll)" :scale="dollScale" :label="p.name" /></div>
        </div>
      </template>
      <div v-if="fm.state.active && !peeking" class="fo-ent fo-av me" :class="{ walk: me.walking }" :style="entStyle(me.x, me.y, me.y)">
        <div class="fo-label"><span class="fo-nm">{{ myName }}<template v-if="narrow"> <Emoji :char="STATUS_ICON[fm.status.value]" /></template></span><span v-if="!narrow" class="fo-st"><Emoji :char="STATUS_ICON[fm.status.value]" /> {{ stText(fm.status.value) }}</span></div>
        <div v-if="bubbles[room.myUid()]" class="fo-bubble">{{ bubbles[room.myUid()] }}</div>
        <span v-if="myHandUp" class="fo-hand" aria-label="ยกมือรอไฮไฟว์"><Emoji char="✋" /></span>
        <span v-for="c in coins" :key="c.id" class="fo-coin"><Emoji char="🪙" />+{{ c.v }}</span>
        <div class="fo-doll"><DollFigure :eq="myEq" :scale="dollScale" label="อวาตาร์ของฉัน" /></div>
      </div>
      <!-- ดูห้องอื่นอยู่ = แค่ดู · จะย้ายต้องกดปุ่มนี้ (หน้าตาเดียวกับปุ่มเริ่มโฟกัส · อยู่ห้องนี้แล้วหาย) -->
      <div v-if="peeking" class="fo-join" @click.stop>
        <p>{{ others.length ? `${others.length} คนอยู่ในห้อง` : 'ยังไม่มีใครในห้องนี้' }}</p>
        <button type="button" class="fo-btn primary big" @click="moveHere"><Emoji char="🚪" /> เข้าห้องนี้</button>
        <small>เวลาโฟกัสและเหรียญเดินต่อ ไม่เริ่มนับใหม่</small>
      </div>
      <div v-if="!fm.state.active" class="fo-join" @click.stop>
        <p>{{ others.length ? `${others.length} คนอยู่ในห้อง` : 'ยังไม่มีใครในห้องนี้ · เป็นคนแรกเลย' }}</p>
        <button type="button" class="fo-btn primary big" @click="join"><Emoji char="🎯" /> เริ่มโฟกัส</button>
        <small>อ่านหนังสือเพื่อสร้างรายได้ตามระดับที่อยู่ของคุณ<br>ตอนนี้ +{{ rateNow }} เหรียญ/วิ<template v-if="FEST_X > 1"> (×2 ถึง 31 ธ.ค.)</template></small>
      </div>
      <FocusSceneFx v-if="!saver" ref="sfx" :zone="viewZone" :me="fm.state.active && !peeking ? { x: me.x, y: me.y } : null" @tod="tod = $event" />
      <div v-for="c in claps" :key="c.id" class="fo-ent fo-clap" :style="entStyle(c.x, c.y, 999)" aria-hidden="true">
        <span class="l"><Emoji char="✋" /></span><span class="r"><Emoji char="✋" /></span><b>แปะ!</b>
      </div>
      <span v-for="t in taps" :key="t.id" class="fo-tap" :style="{ left: t.x / 1.6 + '%', top: t.y + '%' }"></span>

      <!-- แชทแบบเกมออนไลน์ยุคก่อน: มุมซ้ายล่าง ข้อความใหม่อยู่ล่างสุด เก่าดันหายไป · แตะเพื่อเลื่อนอ่านย้อน 50 ข้อความ -->
      <!-- ข้อความทะลุคลิกได้ (pointer-events: none) → จิ้มพื้นมุมซ้ายล่างเดินได้ · เปิดอ่านย้อนด้วยปุ่ม 💬 -->
      <div class="fo-chat" :class="{ open: chatOpen }" @click.stop>
        <div ref="chatBox" class="fo-chat-in">
          <div v-for="m in (chatOpen ? chat : chat.slice(narrow ? -3 : -5))" :key="m.id" class="fo-line">
            <time>{{ m.time }}</time> <template v-if="m.sys"><b>{{ m.text }}</b></template><template v-else><b>{{ m.who }}:</b> {{ m.text }}</template>
          </div>
        </div>
      </div>
      <button type="button" class="fo-chat-btn" :class="{ on: chatOpen }" :aria-label="chatOpen ? 'ปิดประวัติแชท' : 'อ่านแชทย้อนหลัง'" @click.stop="chatOpen = !chatOpen"><Emoji char="💬" /></button>
      <button v-if="fm.state.active && !peeking" type="button" class="fo-hf-btn" :class="{ on: myHandUp }" :aria-pressed="myHandUp" :aria-label="myHandUp ? 'เอามือลง' : 'ยกมือไฮไฟว์ · เพื่อนที่อยู่ใกล้กดด้วยก็ตบกัน'" @click.stop="toggleHand"><Emoji char="✋" /></button>
    </div>

    <form class="fo-say" @submit.prevent="send">
      <input v-model="draft" maxlength="80" :disabled="!fm.state.active || peeking" :placeholder="!fm.state.active ? 'กดเริ่มโฟกัสก่อนถึงจะคุยได้' : peeking ? 'กำลังดูห้องอื่น · เข้าห้องนี้ก่อนถึงจะคุยได้' : 'พิมพ์คุยกับเพื่อนในห้อง…'" aria-label="ข้อความแชท" autocomplete="off">
      <button type="submit" class="fo-btn">ส่ง</button>
    </form>

    <!-- เวลา + เหรียญ + ปุ่ม (ขึ้นเมื่อเข้าห้องแล้ว) -->
    <template v-if="fm.state.active">
      <!-- การ์ดเดียวกะทัดรัด: ซ้าย = เวลา+เหรียญ · ขวา = ปุ่ม (เพลเยอร์จะได้อยู่ในจอแรก) -->
      <section class="fo-card fo-stat">
        <!-- ซ้าย: 2 ตัวเลขหลักคู่กัน (เวลา | เหรียญวันนี้) + หลอดเพดาน 2 ชม. พร้อมคำอธิบายบรรทัดเดียว -->
        <div class="fo-left">
          <div class="fo-nums">
            <div class="fo-num"><small>⏱️ โฟกัสรอบนี้</small><b>{{ fmtClock(fm.state.secs) }}</b></div>
            <div class="fo-num"><small><Emoji char="🪙" /> เหรียญวันนี้</small><b>{{ Math.floor(fm.state.day.coins).toLocaleString() }}</b></div>
          </div>
          <div class="fo-cap" :class="{ full: fm.capFull.value }" role="progressbar" :aria-valuenow="Math.round(fm.capPct.value * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="กระปุกเหรียญ"><i :style="{ width: fm.capPct.value * 100 + '%' }"></i></div>
          <div class="fo-bank">
            <small class="fo-capt">{{ fm.capFull.value ? 'กระปุกเต็มแล้ว · กดรับก่อนถึงจะสะสมต่อ' : `สะสม +${house}/วิ · อีก ${capLeft} กระปุกเต็ม` }}</small>
            <button type="button" class="fo-claim" :disabled="!fm.bankCoins.value || fm.state.claiming" @click="claimCoins"><Emoji char="🪙" /> รับ {{ fm.bankCoins.value.toLocaleString() }}</button>
          </div>
        </div>
        <div class="fo-actions">
          <button type="button" class="fo-btn primary" @click="quizOpen = true"><Emoji char="✍️" /> ไปทำข้อสอบ</button>
          <button type="button" class="fo-btn" @click="startSaver"><Emoji char="🌙" /> โหมดโฟกัส</button>
          <button type="button" class="fo-btn" @click="leave">ออกจากห้อง</button>
        </div>
      </section>
    </template>

    <!-- 🌙 โหมดโฟกัส: จอดำเหมือนล็อกจอ (ประหยัดแบต) ไปอ่านหนังสือ/ไอแพดได้ · เวลา+เหรียญนับต่อ · กดค้าง 1.5 วิเพื่อกลับ -->
    <Teleport to="body">
      <div v-if="saver" class="fo-saver" @pointerdown="holdStart" @pointerup="holdEnd" @pointercancel="holdEnd" @pointerleave="holdEnd" @contextmenu.prevent>
        <div class="sv-mid">
          <small><Emoji char="🌙" /> โหมดโฟกัส</small>
          <b>{{ fmtClock(fm.state.secs) }}</b>
          <small><Emoji char="🪙" /> วันนี้ {{ Math.floor(fm.state.day.coins).toLocaleString() }}</small>
        </div>
        <div class="sv-hold">
          <svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="bg" /><circle cx="22" cy="22" r="19" class="fg" :class="{ run: holding }" /></svg>
          <span>{{ holding ? 'ปล่อย = ยกเลิก' : 'กดค้างเพื่อกลับ' }}</span>
        </div>
      </div>
    </Teleport>

    <FeedbackModal v-model="fbOpen" source="focus" placeholder="เจอบั๊กหรืออยากให้ห้องโฟกัสมีอะไรเพิ่ม เล่าได้เลย…" />

    <BottomSheet :open="why" icon="🌧️" title="เสียงพื้นหลังช่วยอะไร" @update:open="why = $event">
      <div class="fo-whybox">
        <p><b>กลบเสียงคนคุย:</b> งานวิจัยด้านความจำพบมานานว่าเสียงคนพูดที่ฟังรู้เรื่องรบกวนการอ่านและจำมากที่สุด แม้ไม่ได้ตั้งใจฟัง (irrelevant speech effect) เสียงพื้นหลังที่สม่ำเสมอช่วยกลบเสียงพวกนี้ได้</p>
        <p><b>Brown noise:</b> เสียงทุ้ม กลบเสียงย่านต่ำอย่างเสียงรถ แอร์ หรือคนคุยไกลๆ ได้ดี ไม่บาดหูเท่า white noise เลยเปิดยาวๆ ได้สบาย หลายคนบอกว่าหัวเงียบลงและตั้งใจได้นานขึ้น งานวิจัยที่ทดสอบ brown noise ตรงๆ ยังไม่มาก แต่หลักการกลบเสียงใช้ได้เหมือนกัน</p>
        <p><b>40 Hz:</b> เพลงที่มีจังหวะสั่น 40 ครั้งต่อวินาที ตรงกับคลื่นสมองช่วงแกมมา หลายคนเปิดตอนอ่านหนังสือแล้วรู้สึกโฟกัสดีขึ้น งานวิจัยยังเบื้องต้นอยู่ ฟังผ่านหูฟังจะได้ยินเต็มกว่าลำโพงมือถือ</p>
        <p><b>Pink noise:</b> สมดุลกว่า คล้ายน้ำตกไกลๆ มีงานที่เปิดเป็นจังหวะระหว่างหลับลึกแล้วความจำวันถัดไปดีขึ้น (Papalambros และคณะ, 2017) แต่เป็นตอนนอน ไม่ใช่ตอนอ่าน</p>
        <p><b>คนสมาธิหลุดง่ายอาจได้มากกว่า:</b> Söderlund และคณะ (2007) พบว่าเสียงพื้นหลังช่วยเด็กที่สมาธิหลุดง่ายจำได้ดีขึ้น แต่รบกวนเด็กที่ตั้งใจดีอยู่แล้วเล็กน้อย</p>
        <p class="fo-muted">สรุป: ช่วยกลบเสียงรอบตัวได้แน่ ที่เหลือแล้วแต่คน ลองเปิดเบาๆ ดู</p>
      </div>
    </BottomSheet>

    <!-- เลือกว่าจะทำข้อสอบแบบไหน (การ์ดเดียวกับหน้าเตรียมสอบ) -->
    <BottomSheet :open="quizOpen" icon="✍️" title="ทำข้อสอบแบบไหนดี" @update:open="quizOpen = $event">
      <p class="fo-lead"><Emoji char="🪙" /> ระหว่างทำข้อสอบ เวลาโฟกัสและเหรียญยังเดินต่อ · แตะป้าย <Emoji char="🎯" /> มุมจอเพื่อกลับห้องได้ทุกเมื่อ</p>
      <div class="fo-modes">
        <QuizModeCard emoji="🌅" title="ข้อสอบประจำวัน" subtitle="5 ข้อวันละรอบ · ลุ้นท็อป 10" to="/daily" />
        <QuizModeCard emoji="📝" title="ทั่วไป" subtitle="เลือกหมวด + จำนวนข้อ" to="/quiz" />
        <QuizModeCard emoji="♾️" title="Zen" subtitle="ทำเรื่อยๆ ไม่จำกัด" to="/quiz?mode=zen" />
        <QuizModeCard emoji="🔁" title="ข้อที่เคยผิด" subtitle="ทวนข้อที่พลาด" to="/quiz?mode=redo" />
        <QuizModeCard emoji="🔖" title="ข้อที่บันทึกไว้" subtitle="ทวนข้อที่กดเก็บไว้" to="/quiz?mode=saved" />
        <QuizModeCard emoji="⏱️" title="Time Attack" subtitle="แข่งกับเวลา มีอันดับในรุ่น" to="/study/time-attack" />
      </div>
    </BottomSheet>

    <!-- 🎵 มินิเพลเยอร์บรรทัดเดียว · แตะชื่อเพลง/☰ เปิดเพลย์ลิสต์ -->
    <section class="fo-mp" aria-label="เครื่องเล่นเพลง">
      <div class="mp-row">
        <button type="button" class="mp-b" aria-label="เพลงก่อนหน้า" @click="skip(-1)">⏮</button>
        <button type="button" class="mp-b mp-play" :aria-label="audio.track >= 0 ? 'หยุดเพลง' : 'เล่นเพลง'" @click="togglePlay">{{ audio.track >= 0 ? '❚❚' : '▶' }}</button>
        <button type="button" class="mp-b" aria-label="เพลงถัดไป" @click="skip(1)">⏭</button>
        <button type="button" class="mp-t" @click="listOpen = true">
          <span class="mp-name"><span :class="{ run: audio.track >= 0 }">{{ nowName }}</span></span>
          <small>{{ nowMood }}</small>
        </button>
        <button type="button" class="mp-b" :class="{ on: shuffle }" :aria-pressed="shuffle" aria-label="สุ่มเพลง" @click="toggleShuffle"><Emoji char="🔀" /></button>
        <button type="button" class="mp-b" :aria-label="audio.muted ? 'เปิดเสียง' : 'ปิดเสียง'" @click="setMuted(!audio.muted)"><Emoji :char="audio.muted ? '🔇' : '🔊'" /></button>
        <button type="button" class="mp-b" aria-label="เพลย์ลิสต์" @click="listOpen = true">☰</button>
      </div>
      <label class="mp-row mp-vol"><span aria-hidden="true"><Emoji char="🎵" /></span><input type="range" min="0" max="100" :value="audio.music" aria-label="ระดับเสียงเพลง" @input="setVolume('music', +$event.target.value)"><span class="mp-num">{{ audio.music }}</span></label>
      <div class="mp-row mp-amb" role="group" aria-label="เสียงพื้นหลัง">
        <span class="mp-lbl">เสียงพื้นหลัง</span>
        <button type="button" class="mp-q" :aria-expanded="why" aria-label="เสียงพื้นหลังช่วยอะไร" @click="why = !why">?</button>
        <button v-for="n in AMB" :key="n.key" type="button" class="mp-chip" :aria-pressed="audio.noise === n.key || ambLoading(n.key)" :aria-busy="ambLoading(n.key)" @click="!n.key || ambLoading(n.key) ? stopNoise() : playNoise(n.key)"><template v-if="ambLoading(n.key)"><span class="mp-spin" aria-hidden="true"></span> {{ audio.loadPct }}%</template><template v-else>{{ ambError(n.key) ? '⚠️ ' : '' }}{{ n.short }}</template></button>
      </div>
      <div v-if="audio.noiseLoading || audio.loadError" class="mp-row mp-load" role="status">{{ audio.noiseLoading ? `⏳ กำลังโหลดเสียง ${audio.loadPct}% · รอแป๊บนะ (โหลดครั้งแรกครั้งเดียว)` : '⚠️ โหลดเสียงไม่สำเร็จ · ลองกดใหม่อีกครั้ง' }}
      </div>
      <label class="mp-row mp-vol"><span aria-hidden="true"><Emoji char="🌧️" /></span><input type="range" min="0" max="100" :value="audio.bg" aria-label="ระดับเสียงพื้นหลัง" @input="setVolume('bg', +$event.target.value)"><span class="mp-num">{{ audio.bg }}</span></label>
    </section>

    <BottomSheet :open="listOpen" icon="🎵" title="เพลง & เสียงพื้นหลัง" @update:open="listOpen = $event">
      <div class="fo-sheet">
        <ul class="fo-list">
          <li v-for="(t, i) in TRACKS" :key="t.name">
            <button type="button" class="fo-trk" :class="{ on: audio.track === i }" @click="audio.track === i ? stopTrack() : play(i)">
              <span class="ic">{{ audio.track === i ? '❚❚' : '▶' }}</span><span class="tn">{{ t.name }}</span><span class="md">{{ t.mood }}</span>
            </button>
          </li>
        </ul>
        <small class="fo-muted">เสียงพื้นหลัง · เปิดคู่กับเพลงได้</small>
        <ul class="fo-list">
          <li v-for="n in NOISES" :key="n.key">
            <button type="button" class="fo-trk" :class="{ on: audio.noise === n.key || audio.noiseLoading === n.key }" :aria-busy="audio.noiseLoading === n.key" @click="audio.noise === n.key || audio.noiseLoading === n.key ? stopNoise() : playNoise(n.key)">
              <span class="ic"><span v-if="audio.noiseLoading === n.key" class="mp-spin" aria-hidden="true"></span><template v-else>{{ audio.noise === n.key ? '❚❚' : '▶' }}</template></span><span class="tn">{{ n.name }}</span><span class="md">{{ audio.noiseLoading === n.key ? `⏳ ${audio.loadPct}%` : audio.loadError === n.key ? '⚠️ โหลดไม่สำเร็จ' : n.mood }}</span>
            </button>
          </li>
        </ul>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BackButton from '../components/shared/BackButton.vue'
import Emoji from '../components/shared/Emoji.vue'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'
import DollFigure from '../components/doll/DollFigure.vue'
import BottomSheet from '../components/shared/BottomSheet.vue'
import QuizModeCard from '../components/study/QuizModeCard.vue'
import FocusSceneFx from '../components/focus/FocusSceneFx.vue'
import { useCoffee } from '../composables/useCoffee.js'
import { examFestMulti } from '../utils/examFest.js'
import { focusBonus } from '../utils/supporter.js'
import FeedbackModal from '../components/shared/FeedbackModal.vue'
import { useAuthStore } from '../stores/auth.js'
import { dollOf } from '../utils/doll.js'
import { decodeDoll } from '../utils/dollCode.js'
import { serverTimestamp } from 'firebase/database'
import { useFocusRoom } from '../composables/useFocusRoom.js'
import { SEATS, COUNTERS, DOOR, seatFoot, freeSeat } from '../utils/focusLayout.js'
import { PLE_CC_DATE } from '../firebase/config.js'
import { dayKey } from '../utils/dailyChallenge.js'
import { useFocusMode, STATUS_LABEL, fmtClock, COIN_CAP_SECS } from '../composables/useFocusMode.js'
import { chime, TRACKS, NOISES, audioState as audio, playTrack, stopTrack, playNoise, stopNoise, setVolume, setMuted, setQuiet, stopAll } from '../utils/focusAudio.js'

const ART = Object.fromEntries(Object.entries(import.meta.glob('../assets/focus/*.png', { eager: true, import: 'default' }))
  .map(([k, v]) => [k.split('/').pop().replace('.png', ''), v]))
const ZONES = [{ key: 'lib', label: '📚 ห้องสมุด' }, { key: 'cafe', label: '☕ คาเฟ่' }, { key: 'forest', label: '🌳 สวน' }]

const router = useRouter()
const auth = useAuthStore()
const house = computed(() => auth.userData?.residence?.level || 1)
const fm = useFocusMode(() => house.value)
const myEq = computed(() => dollOf(auth.userData).eq)
const myName = computed(() => auth.userData?.nickname || 'ฉัน')
// ห้องที่ "กำลังดู" แยกจากห้องที่ "นั่งอยู่" (fm.state.zone) · เลื่อน ‹ › = แค่ดู ไม่ย้าย
const viewZone = ref(fm.state.zone)
const peeking = computed(() => fm.state.active && viewZone.value !== fm.state.zone)
const ZI = computed(() => Math.max(0, ZONES.findIndex(z => z.key === viewZone.value)))
function stepZone(d) { setView(ZONES[(ZI.value + d + ZONES.length) % ZONES.length].key) }
function setView(z) {
  if (z === viewZone.value) return
  if (myHandUp.value) lowerHand()   // ไปดูห้องอื่น = เอามือลง
  viewedAt = Date.now()   // คนที่อยู่ในห้องนั้นก่อนแล้ว → โผล่ที่เดิม ไม่เดินจากประตู ไม่มีกริ่ง
  viewZone.value = z
  room.watchChat(z)
  if (!fm.state.active) fm.setZone(z)
}
function moveHere() { pickZone(viewZone.value) }
const daysLeft = Math.max(0, Math.ceil((new Date(PLE_CC_DATE).getTime() - Date.now()) / 86400000))
// ฉีกหน้าเมื่อวานแค่ครั้งแรกของวัน (จำในเครื่อง) — รอบต่อไปเห็นเลขวันนี้นิ่งๆ
const CAL_KEY = 'rxtu.focus.calTorn'
const tearToday = ref(false)
function maybeTear() {
  if (viewZone.value !== 'lib') return
  let last = ''; try { last = localStorage.getItem(CAL_KEY) || '' } catch { /* private mode */ }
  if (last === dayKey()) return
  tearToday.value = true
  try { localStorage.setItem(CAL_KEY, dayKey()) } catch { /* private mode */ }
}
watch(viewZone, maybeTear, { immediate: true })
const sfx = ref(null)
const tod = ref('day')
const { toast } = useToast()
const { confirm } = useConfirm()
async function claimCoins() {
  const got = await fm.claim()
  if (got) toast(`รับ ${got.toLocaleString()} เหรียญแล้ว 🪙`, 'success')
}
const capLeft = computed(() => { const m = Math.ceil((COIN_CAP_SECS - fm.state.bank.secs) / 60); return m >= 60 ? `${Math.floor(m / 60)} ชม. ${m % 60} น.` : `${m} น.` })

// ── คนในห้อง (Realtime Database) ──
const room = useFocusRoom()
const { openCoffee } = useCoffee()
const FEST_X = examFestMulti()
const rateNow = computed(() => (house.value + focusBonus(auth.userData)) * FEST_X)   // ☕ ชุดเบค +5 · 📚 ×2
const others = computed(() => room.people.value.filter(p => p.zone === viewZone.value && p.uid !== room.myUid()))
const takenSeats = () => new Set(others.value.map(p => p.seat).filter(s => s >= 0))
const DEFAULT_EQ = dollOf({}).eq
const eqCache = {}
const eqOf = (code) => (code ? (eqCache[code] ||= (decodeDoll(code) || DEFAULT_EQ)) : DEFAULT_EQ)
const me = reactive({ x: DOOR[0], y: DOOR[1], seat: -1, walking: false })

// ── วาง entity: ซ้าย/บนเป็น % ของฉาก · z เรียงตามตำแหน่งเท้า ──
const entStyle = (x, y, depth) => ({ left: (x / 160 * 100) + '%', top: y + '%', zIndex: Math.round(depth * 10) })

// ── เดิน: BFS กริด 2px เลี่ยงเคาน์เตอร์ (ช่วงหน้าเคาน์เตอร์ y+4..y+10) ──
const CELL = 2, GW = 80, GH = 50, Y0 = 52, Y1 = 98
const inCounter = (x, y) => COUNTERS.find(([cx, cy]) => x >= cx - 28 && x <= cx + 28 && y >= cy + 4 && y <= cy + 10)
const blocked = (x, y) => y < Y0 || y > Y1 || x < 6 || x > 154 || !!inCounter(x, y)
function findPath(sx, sy, tx, ty) {
  const key = (i, j) => j * GW + i
  const si = Math.round(sx / CELL), sj = Math.round(sy / CELL), ti = Math.round(tx / CELL), tj = Math.round(ty / CELL)
  const prev = new Map([[key(si, sj), -1]]), q = [[si, sj]]
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  for (let h = 0; h < q.length; h++) {
    const [i, j] = q[h]
    if (i === ti && j === tj) break
    for (const [di, dj] of D) {
      const ni = i + di, nj = j + dj, kk = key(ni, nj)
      if (ni < 0 || nj < 0 || ni >= GW || nj >= GH || prev.has(kk)) continue
      if (blocked(ni * CELL, nj * CELL) && !(ni === ti && nj === tj)) continue
      if (di && dj && (blocked((i + di) * CELL, j * CELL) || blocked(i * CELL, (j + dj) * CELL))) continue
      prev.set(kk, key(i, j)); q.push([ni, nj])
    }
  }
  if (!prev.has(key(ti, tj))) return [[sx, sy], [tx, ty]]   // หาทางไม่เจอ (เช่นเริ่มในเคาน์เตอร์) → เดินตรง
  const out = []
  for (let c = key(ti, tj); c !== -1; c = prev.get(c)) out.unshift([(c % GW) * CELL, Math.floor(c / GW) * CELL])
  out[0] = [sx, sy]; out[out.length - 1] = [tx, ty]
  return out
}
// เดินตามจุด (ใช้ทั้งตัวเราและเพื่อน) · obj = reactive { x, y, walking }
const rafs = new Map()
function animate(obj, pts, done) {
  cancelAnimationFrame(rafs.get(obj))
  if (!pts || pts.length < 2) { obj.walking = false; done?.(); return }
  obj.walking = true
  let i = 1, last = performance.now()
  const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now
    let move = 45 * dt
    while (move > 0 && i < pts.length) {
      const [tx, ty] = pts[i], dx = tx - obj.x, dy = ty - obj.y, d = Math.hypot(dx, dy)
      if (d <= move) { obj.x = tx; obj.y = ty; move -= d; i++ } else { obj.x += dx / d * move; obj.y += dy / d * move; move = 0 }
    }
    if (i < pts.length) rafs.set(obj, requestAnimationFrame(step)); else { obj.walking = false; rafs.delete(obj); done?.() }
  }
  rafs.set(obj, requestAnimationFrame(step))
}
const walkTo = (obj, tx, ty, done) => animate(obj, findPath(obj.x, obj.y, tx, ty), done)
function stopAllWalks() { rafs.forEach(id => cancelAnimationFrame(id)); rafs.clear(); me.walking = false }

// ตำแหน่งที่วาดของเพื่อน — เป้าหมายเปลี่ยน = เดินไปตามทาง · คนเพิ่งเข้า = เดินจากประตู
const pos = reactive({})
let viewedAt = Date.now()   // เพิ่งเปิดหน้า/เพิ่งสลับห้องที่ดู
watch(others, (list) => {
  const seen = new Set()
  for (const p of list) {
    seen.add(p.uid)
    const tx = p.x ?? DOOR[0], ty = p.y ?? DOOR[1]
    let o = pos[p.uid]
    if (!o) {
      const fresh = Date.now() - viewedAt > 2500
      pos[p.uid] = o = reactive({ x: fresh ? DOOR[0] : tx, y: fresh ? DOOR[1] : ty, walking: false, tx, ty })
      if (fresh) { walkTo(o, tx, ty); if (fm.state.active) chime('door') }   // 🔔 กริ๊ง: มีคนเพิ่งเข้าห้อง
    } else if (o.tx !== tx || o.ty !== ty) { o.tx = tx; o.ty = ty; walkTo(o, tx, ty) }
  }
  for (const uid of Object.keys(pos)) if (!seen.has(uid)) { cancelAnimationFrame(rafs.get(pos[uid])); delete pos[uid] }
}, { immediate: true, deep: true })

function pickZone(z) {
  stopAllWalks()
  if (myHandUp.value) lowerHand()
  fm.setZone(z)
  if (viewZone.value !== z) { viewedAt = Date.now(); viewZone.value = z }
  room.watchChat(z)
  if (!fm.state.active) return
  const seat = freeSeat(takenSeats())
  const [tx, ty] = seat >= 0 ? seatFoot(seat) : [80, 80]
  me.seat = seat; me.x = DOOR[0]; me.y = DOOR[1]
  room.patch({ zone: z, seat, x: tx, y: ty })
  walkTo(me, tx, ty)
}

const sceneEl = ref(null)
const sceneW = ref(480)
let ro = null
onMounted(() => { ro = new ResizeObserver(([e]) => { sceneW.value = e.contentRect.width }); if (sceneEl.value) ro.observe(sceneEl.value) })
onBeforeUnmount(() => ro?.disconnect())
const narrow = computed(() => sceneW.value < 440)
const dollScale = computed(() => (narrow.value ? 1 : 1.5))
const STATUS_ICON = { here: '🟢', quiz: '✍️', game: '🎮', deep: '🌙', afk: '💤' }
// ป้ายสถานะแบบไม่มีอีโมจินำหน้า (อีโมจิวาดด้วย <Emoji> แยก ให้เป็น Fluent เหมือนทั้งเว็บ)
const stText = (st) => (STATUS_LABEL[st] || STATUS_LABEL.afk).replace(/^\S+\s/, '')
const taps = ref([])
let tapId = 0
function onFloor(e) {
  if (!fm.state.active || peeking.value) return
  const r = sceneEl.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width * 160, y = (e.clientY - r.top) / r.height * 100
  const id = ++tapId; taps.value.push({ id, x, y }); setTimeout(() => { taps.value = taps.value.filter(t => t.id !== id) }, 600)
  const taken = takenSeats()
  let best = -1, bd = 12
  SEATS.forEach(([sx, sy], i) => { if (taken.has(i)) return; const d = Math.hypot((sx - x) / 1.5, sy - y); if (d < bd) { bd = d; best = i } })
  let tx, ty
  if (best >= 0) [tx, ty] = seatFoot(best)
  else {
    tx = Math.max(8, Math.min(152, x)); ty = Math.max(Y0, Math.min(Y1, y))
    const c = inCounter(tx, ty); if (c) ty = c[1] + 12   // จิ้มโดนเคาน์เตอร์ → ไปยืนหน้าเคาน์เตอร์
  }
  me.seat = best
  walkTo(me, tx, ty, () => room.patch({ seat: best, x: tx, y: ty }))   // ส่งตำแหน่งตอนถึงที่เท่านั้น
}

// ── ✋ ไฮไฟว์ (22 พ.ย.) ──
// ยกมือ = presence.hf (เวลาเซิร์ฟเวอร์) ค้าง 30 วิ · สองคนยกพร้อมกันและอยู่ใกล้ (เคาน์เตอร์เดียวกัน/ยืนติดกัน) = ตบกัน
// ทุกเครื่องตรวจคู่เอง (คนดูก็เห็นแปะ) · เจ้าของมือเอามือตัวเองลง · ข้อความในแชทให้ uid น้อยกว่าเป็นคนเขียน (ขึ้นครั้งเดียว)
const HF_MS = 30000
const nowTick = ref(Date.now())
let hfTick = 0
const raisedAt = (p) => (typeof p?.hf === 'number' ? p.hf : 0)
const handUp = (p) => raisedAt(p) > 0 && nowTick.value - raisedAt(p) < HF_MS
const myPres = computed(() => room.people.value.find(p => p.uid === room.myUid()))
const handPending = ref(false)   // กดแล้วรอเซิร์ฟเวอร์ประทับเวลา
const myHandUp = computed(() => fm.state.active && !peeking.value && (handPending.value || handUp(myPres.value)))
let hfOff = 0
function toggleHand() {
  if (myHandUp.value) { lowerHand(); return }
  handPending.value = true
  room.patch({ hf: serverTimestamp() })
  clearTimeout(hfOff); hfOff = setTimeout(lowerHand, HF_MS)
}
function lowerHand() { handPending.value = false; clearTimeout(hfOff); room.patch({ hf: null }) }
watch(myPres, (p) => { if (raisedAt(p)) handPending.value = false })
const near = (a, b) => Math.abs(a.x - b.x) <= 30 && Math.abs(a.y - b.y) <= 14
const claps = ref([])
const clapped = new Set()
let clapId = 0
watch([() => room.people.value, nowTick], () => {
  const up = room.people.value.filter(p => p.zone === viewZone.value && handUp(p) && typeof p.x === 'number')
  const used = new Set()
  for (const a of up) for (const b of up) {
    if (a.uid >= b.uid || used.has(a.uid) || used.has(b.uid) || !near(a, b)) continue
    used.add(a.uid); used.add(b.uid)
    const key = `${a.uid}:${raisedAt(a)}|${b.uid}:${raisedAt(b)}`
    if (clapped.has(key)) continue
    clapped.add(key)
    const id = ++clapId
    claps.value.push({ id, x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 22 })
    setTimeout(() => { claps.value = claps.value.filter(c => c.id !== id) }, 1300)
    chime('clap')
    const mine = room.myUid()
    if (a.uid === mine || b.uid === mine) lowerHand()
    if (a.uid === mine) room.say(viewZone.value, `✋ ${a.name} และ ${b.name} ได้ไฮไฟว์กัน!`, { sys: 'hf' })
  }
})

// ── เหรียญเด้ง ──
const coins = ref([])
// เพื่อน: เด้งวิละครั้งตามระดับบ้านของเพื่อน (ไม่บอก ให้สังเกตเอง) · เครื่องเราวาดเอง ไม่ใช้เน็ต · คนปัดจอ (away) ไม่เด้ง
const fcoins = reactive({})
let fcoinTimer = 0, fcoinId = 0
function friendPop() {
  others.value.forEach((p, i) => {
    if (p.away) return
    setTimeout(() => {
      const id = ++fcoinId
      ;(fcoins[p.uid] ||= []).push(id)
      setTimeout(() => { fcoins[p.uid] = (fcoins[p.uid] || []).filter(x => x !== id) }, 1600)
    }, (i * 170) % 900)
  })
}
let coinId = 0
watch(() => fm.state.pops, () => {
  if (fm.capFull.value) return
  const id = ++coinId
  coins.value.push({ id, v: fm.state.lastGain % 1 ? fm.state.lastGain.toFixed(1) : fm.state.lastGain })
  setTimeout(() => { coins.value = coins.value.filter(c => c.id !== id) }, 1600)
})

// ── แชท (RTDB รายวัน แยกโซน) · บับเบิ้ลค้างเหนือหัว 5 วิ · ย้อน 50 ข้อความ ──
const chatOpen = ref(false)
const chatBox = ref(null)
watch(chatOpen, () => nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight }))
const hhmm = (ms) => (typeof ms === 'number' ? new Date(ms) : new Date()).toTimeString().slice(0, 5)
const chat = computed(() => room.chat.value.map(m => ({ id: m.id, who: m.name, text: m.text, sys: !!m.sys, time: hhmm(m.at) })))
const bubbles = reactive({})
const seenMsg = new Set()
let lastChime = 0
let chatPrimed = false
watch(() => room.chat.value, (list) => {
  for (const m of list) {
    if (seenMsg.has(m.id)) continue
    seenMsg.add(m.id)
    if (!chatPrimed) continue   // ข้อความเก่าตอนเพิ่งเปิด ไม่ต้องเด้งบับเบิ้ล
    // เข้าห้อง/สลับห้องที่ดู = ได้ประวัติทั้งชุดมาใหม่ → บับเบิ้ล+เสียงเฉพาะข้อความสด (ไม่เกิน 10 วิ) · m.at ยังไม่ประทับ = เพิ่งส่ง
    if (typeof m.at === 'number' && Date.now() - m.at > 10000) continue
    // 🔔 ป๊อก: เฉพาะข้อความคนอื่น · ไม่เกินทุก 5 วิ · เฉพาะตอนเราอยู่ในห้อง
    if (m.uid !== room.myUid() && fm.state.active && Date.now() - lastChime > 5000) { lastChime = Date.now(); chime('chat') }
    if (m.sys) continue   // ข้อความระบบ (ไฮไฟว์) ไม่ขึ้นบับเบิ้ล
    bubbles[m.uid] = m.text
    setTimeout(() => { if (bubbles[m.uid] === m.text) delete bubbles[m.uid] }, 5000)
  }
  chatPrimed = true
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
})
const draft = ref('')
let lastSend = 0
function send() {
  if (!fm.state.active || peeking.value || !draft.value.trim()) return
  if (Date.now() - lastSend < 3000) return
  if (room.say(fm.state.zone, draft.value)) { lastSend = Date.now(); draft.value = '' }
}

// ── 🌙 โหมดโฟกัส (จอดำประหยัดแบต) ──
// หน้าห้องถูกซ่อนด้วย content-visibility (ไม่วาดอะไรเลย) · ขอ wake lock กันจอดับ (เครื่องไหนไม่ให้ก็ไม่เป็นไร)
const saver = ref(false)
const holding = ref(false)
let holdT = 0, wake = null
async function lockOn() { try { wake = await navigator.wakeLock?.request('screen') } catch { wake = null } }
function onVis() { if (saver.value && !document.hidden) lockOn() }   // กลับจากปัดจอ wake lock หลุด → ขอใหม่
function startSaver() { saver.value = true; setQuiet(true); fm.setSaver(true); lockOn(); document.addEventListener('visibilitychange', onVis) }
function stopSaver() {
  saver.value = false; setQuiet(false); holding.value = false; clearTimeout(holdT); fm.setSaver(false)
  wake?.release?.().catch(() => {}); wake = null; document.removeEventListener('visibilitychange', onVis)
}
function holdStart() { holding.value = true; clearTimeout(holdT); holdT = setTimeout(stopSaver, 1500) }
function holdEnd() { holding.value = false; clearTimeout(holdT) }

const quizOpen = ref(false)
const listOpen = ref(false)
const why = ref(false)
async function join() {   // เข้าห้อง: เดินจากประตูล่างกลางไปที่นั่งว่าง แล้วเริ่มจับเวลา
  // 📱 นับเครื่องเดียว: มีอีกเครื่องนั่งอยู่ → ถามก่อน ยืนยันแล้วเครื่องนั้นออก
  if (await room.otherDevice() && !await confirm('ตอนนี้คุณนั่งอยู่ในห้องจากอีกเครื่อง 📱\nเข้าจากเครื่องนี้แทน?\nเครื่องก่อนหน้าจะออกจากห้อง')) return
  fm.enter()
  const seat = freeSeat(takenSeats())
  const [tx, ty] = seat >= 0 ? seatFoot(seat) : [80, 80]
  me.seat = seat; me.x = DOOR[0]; me.y = DOOR[1]
  room.join({ zone: fm.state.zone, seat, x: tx, y: ty, st: fm.status.value })
  walkTo(me, tx, ty)
  if (audio.track < 0) play(Math.floor(Math.random() * TRACKS.length))
}
function leave() { stopSaver(); if (myHandUp.value) lowerHand(); viewZone.value = fm.state.zone; fm.leave(); room.leave(); stopAll(); stopAllWalks() }
// มินิเพลเยอร์
const lastTrack = ref(0)
const nowName = computed(() => TRACKS[audio.track >= 0 ? audio.track : lastTrack.value].name)
const nowMood = computed(() => (audio.track >= 0 ? TRACKS[audio.track].mood : 'กด ▶ เพื่อเล่น'))
const noiseName = computed(() => NOISES.find(n => n.key === audio.noise)?.name || '')
function play(i) { lastTrack.value = i; playTrack(i) }
function togglePlay() { if (audio.track >= 0) stopTrack(); else play(lastTrack.value) }
function skip(d) { play(shuffle.value ? randomOther() : ((audio.track >= 0 ? audio.track : lastTrack.value) + d + TRACKS.length) % TRACKS.length) }
// ปุ่ม "ปิด" มี key '' ตรงกับสถานะว่าง ('' = ไม่ได้โหลด) → ต้องกันไม่ให้นับว่ากำลังโหลด/พัง (บั๊ก 24 พ.ย. ปุ่มปิดหมุน 0% ค้าง)
const ambLoading = (k) => !!k && audio.noiseLoading === k
const ambError = (k) => !!k && audio.loadError === k
const AMB = [{ key: '', short: 'ปิด' }, { key: 'brown', short: 'Brown' }, { key: 'pink', short: 'Pink' }, { key: 'rain', short: 'ฝน' }, { key: '40hz', short: '40 Hz' }]
// 🔀 สุ่ม: กดข้าม = สุ่มเพลงอื่น · เปิดไว้แล้วเปลี่ยนเพลงเองทุก ~3 นาที
const shuffle = ref(false)
let shuffleTimer = 0
const randomOther = () => { const cur = audio.track >= 0 ? audio.track : lastTrack.value; let i = cur; while (i === cur && TRACKS.length > 1) i = Math.floor(Math.random() * TRACKS.length); return i }
function toggleShuffle() {
  shuffle.value = !shuffle.value
  clearInterval(shuffleTimer)
  if (shuffle.value) { if (audio.track < 0) play(randomOther()); shuffleTimer = setInterval(() => { if (audio.track >= 0) play(randomOther()) }, 180000) }
}

onMounted(() => {
  room.watchChat(fm.state.zone)
  if (fm.state.active) {
    const mine = room.people.value.find(p => p.uid === room.myUid())
    if (mine) { me.x = mine.x; me.y = mine.y; me.seat = mine.seat ?? -1 }
    else {   // รีเฟรชแล้ว presence หาย (onDisconnect) → เข้าห้องใหม่ที่นั่งว่าง
      const seat = freeSeat(takenSeats()); const [tx, ty] = seat >= 0 ? seatFoot(seat) : [80, 80]
      me.seat = seat; me.x = tx; me.y = ty
      room.join({ zone: fm.state.zone, seat, x: tx, y: ty, st: fm.status.value }, { auto: true })
    }
  }
  fcoinTimer = setInterval(() => { if (!document.hidden && !saver.value) friendPop() }, 1000)
  hfTick = setInterval(() => { if (!document.hidden && !saver.value) nowTick.value = Date.now() }, 1000)   // 🔋 จอดำ/ปัดแอป = ไม่ต้องวาดใหม่ทุกวิ
})
// เครื่องอื่นยึดห้อง → ปิดจอดำ/เพลงในเครื่องนี้ (fm.leave อยู่ที่ FocusPill)
watch(() => room.kicked.value, () => { stopSaver(); handPending.value = false; stopAll(); stopAllWalks(); viewZone.value = fm.state.zone })
onBeforeUnmount(() => { stopSaver(); clearInterval(hfTick); clearTimeout(hfOff); clearInterval(fcoinTimer); clearInterval(shuffleTimer); stopAllWalks(); room.unwatchChat(); room.release() })
</script>

<style scoped>
.fo { display: flex; flex-direction: column; gap: 10px; }
.fo.saving { content-visibility: hidden; }   /* โหมดโฟกัส: ไม่วาดห้องเลย */
/* 🔋 ประหยัดพลังงาน (27 พ.ย.): จอดำโหมดโฟกัสอยู่ → ซ่อนฉาก+หยุดอนิเมชันข้างใต้ (เดิมยังวาดตัวละคร/ออร่า/แสงอยู่ใต้จอดำ) */
.fo.saving > :not(.fo-saver) { visibility: hidden; }
.fo.saving *, .fo.saving *::before, .fo.saving *::after { animation-play-state: paused !important; }
.fo.saving .fo-saver { visibility: visible; }
.fo.saving .fo-saver, .fo.saving .fo-saver * { animation-play-state: running !important; }
.fo-saver { position: fixed; inset: 0; z-index: 600; background: #000; color: rgba(255,255,255,.45); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 30vh 16px calc(48px + env(safe-area-inset-bottom, 0px)); user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: none; }
.sv-mid { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.sv-mid b { font-size: 3rem; font-weight: 300; letter-spacing: .04em; font-variant-numeric: tabular-nums; color: rgba(255,255,255,.6); }
.sv-mid small { font-size: .85rem; }
.sv-hold { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: .8rem; }
.sv-hold svg { width: 56px; height: 56px; transform: rotate(-90deg); }
.sv-hold circle { fill: none; stroke-width: 3; }
.sv-hold .bg { stroke: rgba(255,255,255,.12); }
.sv-hold .fg { stroke: rgba(255,255,255,.7); stroke-linecap: round; stroke-dasharray: 119.4; stroke-dashoffset: 119.4; }
.sv-hold .fg.run { animation: sv-fill 1.5s linear forwards; }
@keyframes sv-fill { to { stroke-dashoffset: 0; } }
.fo-head { display: flex; align-items: center; gap: 10px; }
.fo-title { flex: 1; display: flex; flex-direction: column; line-height: 1.2; }
.fo-title b { font-size: 1.05rem; }
.fo-title small, .fo-muted { font-size: .75rem; color: var(--muted); }
.fo-fb { font-family: inherit; font-size: .72rem; font-weight: 700; background: #fde2ec; color: #b4235a; border: 0; border-radius: 99px; padding: 4px 10px; cursor: pointer; white-space: nowrap; }
.fo-zones { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.fo-zones button, .fo-btn { font-family: inherit; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 12px; padding: 8px 10px; font-size: .85rem; font-weight: 600; cursor: pointer; text-align: center; }
.fo-zones button[aria-pressed="true"], .fo-btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.fo-btn.sm { padding: 4px 10px; font-size: .78rem; }
.fo-btn.big { font-size: 1rem; padding: 10px 22px; border-radius: 99px; box-shadow: var(--shadow-lg); }
.fo-join { position: absolute; inset: 0; z-index: 1500; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(15,23,42,.28); cursor: default; }
.fo-join p, .fo-join small { color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.7); font-size: .85rem; }
.fo-join small { font-size: .75rem; }
.fo-modes { display: grid; gap: 8px; }
.fo-lead { margin: -4px 0 12px; font-size: .82rem; line-height: 1.5; color: #92400e; background: #fef3c7; border-radius: 10px; padding: 8px 10px; }
.fo-note { margin-top: 10px; font-size: .78rem; }
.fo-sheet { display: flex; flex-direction: column; gap: 10px; }
.fo-mp { display: flex; flex-direction: column; gap: 6px; background: #1e293b; color: #fff; border-radius: 14px; padding: 6px 8px; box-shadow: var(--shadow-md); }
.mp-row { display: flex; align-items: center; gap: 4px; }
.mp-amb { border-top: 1px solid rgba(255,255,255,.12); padding-top: 6px; gap: 6px; flex-wrap: wrap; }
.mp-lbl { font-size: .75rem; opacity: .8; }
.mp-q { width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(255,255,255,.4); background: transparent; color: #fff; font-size: .7rem; font-weight: 700; cursor: pointer; margin-right: 4px; font-family: inherit; }
.mp-q[aria-expanded="true"] { background: var(--primary); border-color: var(--primary); }
.mp-vol { gap: 8px; padding: 0 6px; font-size: .8rem; }
.mp-vol input { flex: 1; min-width: 0; height: 32px; margin: 0; background: transparent; -webkit-appearance: none; appearance: none; cursor: pointer; }
.mp-vol input::-webkit-slider-runnable-track { height: 6px; border-radius: 99px; background: rgba(255,255,255,.22); }
.mp-vol input::-moz-range-track { height: 6px; border-radius: 99px; background: rgba(255,255,255,.22); }
.mp-vol input::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; margin-top: -8px; border-radius: 50%; background: #fff; border: 3px solid var(--primary); box-shadow: 0 1px 4px rgba(0,0,0,.35); }
.mp-vol input::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 3px solid var(--primary); }
.mp-vol input:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 8px; }

.mp-num { width: 24px; text-align: right; font-size: .7rem; opacity: .7; font-variant-numeric: tabular-nums; }
.mp-chip { font-family: inherit; font-size: .75rem; font-weight: 600; color: #fff; background: rgba(255,255,255,.1); border: 0; border-radius: 99px; padding: 3px 10px; cursor: pointer; }
.mp-chip[aria-pressed="true"] { background: var(--primary); }
.fo-zsw { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); z-index: 1600; display: flex; align-items: center; gap: 4px; }
.fo-zsw span { font-size: .95rem; padding: 4px 14px !important; font-weight: 700; color: #fff; background: rgba(15,23,42,.38); border-radius: 99px; padding: 2px 10px; white-space: nowrap; }
.fo-zsw button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: rgba(15,23,42,.32); color: #fff; font-size: 1.1rem; line-height: 1; cursor: pointer; opacity: .8; }
.fo-zsw button:hover { opacity: 1; }
.mp-b { flex: none; width: 34px; height: 34px; border: 0; border-radius: 10px; background: transparent; color: #fff; font-size: .95rem; cursor: pointer; font-family: inherit; }
.mp-b:hover, .mp-b.on { background: rgba(255,255,255,.14); }
.mp-play { background: var(--primary); }
.mp-t { flex: 1; min-width: 0; border: 0; background: transparent; color: #fff; text-align: left; font-family: inherit; cursor: pointer; display: flex; flex-direction: column; line-height: 1.25; padding: 0 4px; }
.mp-name { overflow: hidden; white-space: nowrap; font-size: .85rem; font-weight: 700; }
.mp-name span { display: inline-block; }
.mp-name span.run { animation: mp-scroll 10s linear infinite; padding-left: 100%; }
@keyframes mp-scroll { to { transform: translateX(-100%); } }
.mp-t small { font-size: .7rem; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.fo-cal { position: absolute; left: 82.5%; top: 14%; width: 10%; height: 13%; z-index: 1; pointer-events: none; container-type: size; }
.fo-cal-pg { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; background: #e7e0cf; color: #2a2238; }
.fo-cal-pg b { font-size: 62cqh; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.fo-cal-pg small { font-size: .7rem; font-weight: 700; color: #c8575a; transform: scale(.85); }
.fo-cal-pg.tear { transform-origin: 0 0; animation: fo-tear 1.4s .6s ease-in forwards; }
@keyframes fo-tear { 0% { transform: none; } 30% { transform: rotate(-12deg); } 100% { transform: translate(-40%, 260%) rotate(-70deg); opacity: 0; } }
.fo-bg, .fo-desk img { transition: filter 2s; }
/* แสงตามเวลาจริง — ย้อมฉาก+เคาน์เตอร์ (คนไม่ย้อม = เหมือนมีโคมส่องอยู่ ชื่ออ่านออกเสมอ) */
.fo-tint { position: absolute; inset: 0; mix-blend-mode: multiply; pointer-events: none; transition: background 2s; }
.tod-morning .fo-tint { background: rgba(255, 200, 210, .2); }
.tod-dusk .fo-tint { background: rgba(255, 150, 80, .3); }
.tod-night .fo-tint { background: rgba(40, 50, 120, .55); }
.tod-night.z-lib .fo-tint, .tod-night.z-cafe .fo-tint { background: rgba(60, 60, 130, .34); }
.tod-night.z-lib .fo-desk img, .tod-night.z-cafe .fo-desk img { filter: brightness(.82) saturate(.9); }
.tod-dusk .fo-desk img { filter: sepia(.35) brightness(.9); }
.tod-night .fo-desk img { filter: brightness(.6) saturate(.8); }
.fo-scene { container-type: inline-size; position: relative; width: 100%; aspect-ratio: 160 / 100; border-radius: 14px; overflow: hidden; cursor: pointer; background: #222; box-shadow: var(--shadow-md); }
.fo-bg, .fo-ent img { image-rendering: pixelated; user-select: none; }
.fo-coffee { position: absolute; left: 44%; top: 16%; width: 12%; height: 18%; z-index: 3; border: 0; padding: 0; background: none; cursor: pointer; border-radius: 8px; }
.fo-coffee span { position: absolute; left: 50%; top: -2px; transform: translateX(-50%); display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: var(--pop); font-size: .9rem; animation: foCoffee 1.8s ease-in-out infinite; }
.fo-coffee:focus { outline: none; }   /* 27 พ.ย. user: กรอบสี่เหลี่ยมใหญ่เกิน → ไม่ไฮไลต์ทั้งพื้นที่ ขยายถ้วยแทน */
.fo-coffee:hover span, .fo-coffee:focus-visible span { box-shadow: var(--pop), 0 0 0 2px #fff, 0 0 0 4px #8a5a3b; }
@keyframes foCoffee { 50% { transform: translate(-50%, -4px); } }
.fo-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.fo-ent { position: absolute; transform: translate(-50%, -100%); pointer-events: none; display: flex; flex-direction: column; align-items: center; }
.fo-desk { width: calc(54 / 160 * 100%); transform: translate(-50%, -30%); }
.fo-desk img { width: 100%; display: block; }
.fo-doll { line-height: 0; }
.fo-av.away { opacity: .5; }
.fo-av.walk .fo-doll { animation: fo-step .25s steps(2) infinite; }
@keyframes fo-step { 50% { transform: translateY(-2px); } }
.fo-label { position: absolute; bottom: 100%; display: flex; flex-direction: column; align-items: center; gap: 1px; margin-bottom: -10px; }
.fo-nm, .fo-st { font-size: .7rem; line-height: 1.25; border-radius: 6px; padding: 0 5px; white-space: nowrap; }
.fo-nm { background: rgba(255,255,255,.92); color: #1e293b; }
.me .fo-nm { background: var(--primary); color: #fff; }
.fo-st { background: rgba(30,41,59,.72); color: #fff; }
.fo-bubble { position: absolute; bottom: 100%; margin-bottom: 26px; width: max-content; max-width: 150px; background: #fff; color: #1e293b; border: 1px solid var(--border); border-radius: 10px; padding: 3px 8px; font-size: .75rem; text-align: center; box-shadow: var(--shadow-md); z-index: 2; }
.fo-bubble::after { content: ""; position: absolute; left: 50%; top: 100%; margin-left: -5px; border: 5px solid transparent; border-top-color: #fff; }
.fo-coin :deep(img), .fo-coin :deep(.emoji) { width: 1.05em; height: 1.05em; vertical-align: -.15em; margin-right: 1px; }
.fo-coin { white-space: nowrap; position: absolute; bottom: 100%; margin-bottom: 22px; font-weight: 800; font-size: .8rem; color: #b45309; text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff; animation: fo-rise 1.6s ease-out forwards; }
@keyframes fo-rise { 0% { transform: translateY(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateY(-26px); opacity: 0; } }
.fo-tap { position: absolute; width: 16px; height: 7px; border: 2px solid #fff; border-radius: 50%; transform: translate(-50%, -50%); animation: fo-tap .6s ease-out forwards; pointer-events: none; z-index: 1; }
@keyframes fo-tap { to { transform: translate(-50%, -50%) scale(2); opacity: 0; } }

.fo-chat { position: absolute; left: 6px; bottom: 6px; z-index: 2000; max-width: 70%; pointer-events: none; }
.fo-chat.open { pointer-events: auto; bottom: 40px; }
.fo-chat-btn { position: absolute; left: 6px; bottom: 6px; z-index: 2001; width: 30px; height: 30px; border: 0; border-radius: 50%; background: rgba(15,23,42,.45); color: #fff; font-size: .9rem; cursor: pointer; display: none; }
.fo-hf-btn { position: absolute; right: 6px; bottom: 6px; z-index: 2001; width: 38px; height: 38px; border: 0; border-radius: 50%; background: rgba(15,23,42,.45); font-size: 1.1rem; cursor: pointer; display: grid; place-items: center; }
.fo-hf-btn.on { background: var(--accent); }
.fo-hf-btn.on :deep(*), .fo-hand { animation: fo-wave 1s ease-in-out infinite; transform-origin: bottom center; }
.fo-hand { position: absolute; bottom: 100%; right: -6px; margin-bottom: 4px; font-size: 1.1rem; }
@keyframes fo-wave { 0%, 100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
.fo-clap { pointer-events: none; display: flex; flex-direction: row; align-items: center; transform: translate(-50%, -50%); }
.fo-clap .l, .fo-clap .r { font-size: 1.4rem; display: inline-block; }
.fo-clap .l { animation: fo-clap-l 1.3s ease-out forwards; }
.fo-clap .r { animation: fo-clap-r 1.3s ease-out forwards; }
.fo-clap b { position: absolute; left: 50%; top: -14px; transform: translateX(-50%); font-size: .85rem; color: #b45309; white-space: nowrap; text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff; animation: fo-pop 1.3s ease-out forwards; }
@keyframes fo-clap-l { 0% { transform: translateX(-18px) rotate(20deg); } 25%, 70% { transform: translateX(2px) rotate(20deg); } 100% { transform: translateX(2px) rotate(20deg); opacity: 0; } }
@keyframes fo-clap-r { 0% { transform: scaleX(-1) translateX(-18px) rotate(20deg); } 25%, 70% { transform: scaleX(-1) translateX(2px) rotate(20deg); } 100% { transform: scaleX(-1) translateX(2px) rotate(20deg); opacity: 0; } }
@keyframes fo-pop { 0%, 22% { opacity: 0; transform: translateX(-50%) scale(.6); } 35% { opacity: 1; transform: translateX(-50%) scale(1.25); } 75% { opacity: 1; transform: translateX(-50%) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-8px); } }
.fo-chat-btn.on { background: var(--primary); }
.fo-chat-in { display: flex; flex-direction: column; gap: 1px; max-height: 6.8em; overflow: hidden; }
.fo-chat.open .fo-chat-in { max-height: 55%; height: 150px; overflow-y: auto; background: rgba(15,23,42,.62); border-radius: 8px; padding: 4px 6px; }
.fo-line { font-size: .72rem; line-height: 1.3; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.85); word-break: break-word; }
.fo-line time { opacity: .75; font-variant-numeric: tabular-nums; }
.fo-chat:not(.open) .fo-line:nth-last-child(n+4) { opacity: .55; }
.fo-chat-btn { display: block; }
.fo-chat:not(.open) { left: 42px; }
.fo-say { display: flex; gap: 6px; }
.fo-say input { flex: 1; min-width: 0; font-family: inherit; font-size: .9rem; border: 1px solid var(--border); border-radius: 10px; padding: 7px 10px; background: var(--surface); color: var(--text); }

.fo-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.fo-stat { flex-direction: row; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; }
.fo-left { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.fo-nums { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fo-num { display: flex; flex-direction: column; min-width: 0; }
.fo-num + .fo-num { border-left: 1px solid var(--border); padding-left: 10px; }
.fo-num small { font-size: .72rem; color: var(--muted); white-space: nowrap; }
.fo-num b { font-size: 1.25rem; line-height: 1.2; font-variant-numeric: tabular-nums; }
.fo-cap { height: 6px; border-radius: 99px; background: var(--border); overflow: hidden; }
.fo-cap i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--gold), #f97316); transition: width .5s; }
.fo-cap.full i { background: var(--care); }
.fo-capt { font-size: .72rem; color: var(--muted); }
.fo-bank { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fo-claim { flex: none; border: 0; border-radius: 99px; padding: 4px 12px; font-weight: 800; font-size: .78rem; background: linear-gradient(90deg, var(--gold), #f97316); color: #fff; cursor: pointer; }
.fo-claim:disabled { opacity: .45; cursor: default; }
.fo-claim :deep(img), .fo-claim :deep(.emoji) { width: 1em; height: 1em; vertical-align: -.12em; }
.fo-actions { display: flex; flex-direction: column; gap: 6px; flex: none; }
.fo-actions .fo-btn { padding: 7px 12px; font-size: .82rem; }
.fo-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fo-h { font-size: .92rem; }
.fo-list { list-style: none; border: 1px solid var(--border); border-radius: 12px; overflow: hidden auto; max-height: 240px; }
.fo-list li + li { border-top: 1px solid var(--border); }
.fo-trk { display: flex; align-items: center; gap: 10px; width: 100%; background: var(--surface); color: var(--text); border: 0; padding: 9px 12px; font-family: inherit; font-size: .85rem; text-align: left; cursor: pointer; }
.fo-trk .ic { width: 22px; height: 22px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--bg); color: var(--primary); font-size: .7rem; }
.fo-trk .tn { flex: 1; min-width: 0; }
.fo-trk .md { font-size: .7rem; color: var(--muted); border: 1px solid var(--border); border-radius: 99px; padding: 0 8px; white-space: nowrap; }
.fo-trk.on { background: var(--primary-light); }
.fo-trk.on .ic { background: var(--primary); color: #fff; }
.fo-why { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); font-weight: 700; cursor: pointer; font-family: inherit; }
.fo-whybox { font-size: .8rem; line-height: 1.55; background: var(--bg); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.fo-vol { display: flex; align-items: center; gap: 8px; font-size: .85rem; }
.fo-vol input { flex: 1; }
.mp-spin { display: inline-block; width: .9em; height: .9em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: mp-spin .8s linear infinite; vertical-align: -0.12em }
@keyframes mp-spin { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .mp-spin { animation-duration: 2.4s } }
.mp-load { font-size: .78rem; opacity: .85; justify-content: center }
</style>
