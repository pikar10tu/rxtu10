<template>
  <div class="tab-content">
    <header class="home-head">
      <div class="home-head-badge"><Emoji char="🧪" /></div>
      <div class="home-head-txt">
        <h1 class="home-head-title">RxTU10</h1>
        <p class="home-head-sub">เภสัช มธ. รุ่น 10 · หน้าหลัก</p>
      </div>
    </header>

    <template v-if="authStore.isLoggedIn">
      <!-- โปรไฟล์ของฉัน (แตะเพื่อแก้ไข) -->
      <RouterLink to="/me" class="home-me">
        <img class="home-me-av" :src="myAvatar" alt="me" @error="(e) => fallbackAvatar(e, authStore.userData?.nickname)" />
        <div class="home-me-info">
          <div class="home-me-nick">{{ authStore.userData?.nickname || 'ฉัน' }}</div>
          <div class="home-me-sub"><Emoji char="🏠" /> Lv.{{ authStore.userData?.residence?.level || 1 }} · แตะเพื่อแก้โปรไฟล์</div>
        </div>
        <span class="home-me-arrow">›</span>
      </RouterLink>

      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
      <!-- เควสต์ประจำวัน (progress 3 แถบ + รับรางวัล buff/ตั๋ว) -->
      <DailyQuestCard />
      <!-- กล่องจดหมาย (รางวัล/ประกาศ) -->
      <MailboxCard />
      <!-- ที่อยู่อาศัย (residence) — แกน prestige/coin-sink -->
      <ResidenceCard />
    </template>

    <!-- ทางเข้าลัด -->
    <div class="home-shortcuts">
      <RouterLink to="/shop" class="home-shortcut sc-shop">
        <span class="hs-icon"><Emoji char="🛒" /></span>
        <span class="hs-label">Shop</span>
        <span class="hs-sub">กาชาไข่</span>
      </RouterLink>
      <RouterLink v-if="authStore.isLoggedIn" to="/pets" class="home-shortcut sc-pets">
        <span class="hs-icon"><Emoji char="🧪" /></span>
        <span class="hs-label">สัตว์เลี้ยง</span>
        <span class="hs-sub">คลัง · ห้องทดลอง</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { letterAvatar, fallbackAvatar } from '../utils/avatar.js'
import ResidenceCard from '../components/residence/ResidenceCard.vue'
import DailyCard from '../components/home/DailyCard.vue'
import DailyQuestCard from '../components/home/DailyQuestCard.vue'
import MailboxCard from '../components/home/MailboxCard.vue'

const authStore = useAuthStore()
const myAvatar = computed(() =>
  authStore.userData?.customPhoto || authStore.userData?.googlePhoto ||
  letterAvatar(authStore.userData?.nickname)
)
</script>

<style scoped>
/* ── header: display font + sticker badge ── */
.home-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.home-head-badge {
  width: 50px; height: 50px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.7rem; border-radius: 16px;
  background: var(--gold); border: 2px solid var(--ink); box-shadow: var(--pop);
  transform: rotate(-6deg);
}
.home-head-txt { min-width: 0; }
.home-head-title {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.85rem; line-height: 1; color: var(--ink); margin: 0;
  letter-spacing: .5px;
}
.home-head-sub { font-size: .68rem; color: var(--muted); margin: 4px 0 0; font-weight: 600; }

/* ── "ฉัน" sticker card ── */
.home-me {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 2px solid var(--ink);
  border-radius: 18px; padding: 12px 14px; margin-bottom: 14px;
  box-shadow: var(--pop); transition: transform .12s, box-shadow .12s;
}
.home-me:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--ink); }
.home-me-av { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--ink); background: #eee; }
.home-me-info { flex: 1; min-width: 0; }
.home-me-nick { font-size: .95rem; font-weight: 800; color: var(--ink); }
.home-me-sub { font-size: .66rem; color: var(--muted); }
.home-me-arrow { color: var(--ink); font-size: 1.4rem; font-weight: 800; }

/* ── colourful sticker shortcuts ── */
.home-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 12px;
  margin-top: 4px;
}
.home-shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 10px 13px;
  border-radius: 18px;
  background: #fff;
  border: 2px solid var(--ink);
  box-shadow: var(--pop);
  transition: transform .12s, box-shadow .12s;
}
.home-shortcut:active {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 var(--ink);
}
.hs-icon {
  font-size: 1.5rem;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px; border: 2px solid var(--ink);
}
.sc-shop .hs-icon { background: #ffe1ea; }
.sc-pets .hs-icon { background: #e2f7f0; }
.hs-label {
  font-weight: 800;
  color: var(--ink);
  font-size: 0.92rem;
  margin-top: 2px;
}
.hs-sub {
  font-size: 0.6rem;
  color: var(--muted);
  font-weight: 600;
}
</style>
