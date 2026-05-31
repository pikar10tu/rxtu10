<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">🏠 Home</div>

    <template v-if="authStore.isLoggedIn">
      <!-- โปรไฟล์ของฉัน (แตะเพื่อแก้ไข) -->
      <RouterLink to="/me" class="home-me">
        <img class="home-me-av" :src="myAvatar" alt="me" />
        <div class="home-me-info">
          <div class="home-me-nick">{{ authStore.userData?.nickname || 'ฉัน' }}</div>
          <div class="home-me-sub">🏠 Lv.{{ authStore.userData?.residence?.level || 1 }} · แตะเพื่อแก้โปรไฟล์</div>
        </div>
        <span class="home-me-arrow">›</span>
      </RouterLink>

      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
      <!-- ที่อยู่อาศัย (residence) — แกน prestige/coin-sink -->
      <ResidenceCard />
    </template>

    <!-- กระดานข่าว (เห็นได้ทุกคน) -->
    <NewsBoard />

    <!-- ทางเข้า Shop / Rank (ย้ายมาจากเมนูล่าง) -->
    <div class="home-shortcuts">
      <RouterLink to="/shop" class="home-shortcut">
        <span class="hs-icon">🛒</span>
        <span class="hs-label">Shop</span>
        <span class="hs-sub">ร้านค้า · กาชา · อัปเกรด</span>
      </RouterLink>
      <RouterLink to="/rank" class="home-shortcut">
        <span class="hs-icon">🏆</span>
        <span class="hs-label">Rank</span>
        <span class="hs-sub">อันดับ · ลีดเดอร์บอร์ด</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import ResidenceCard from '../components/residence/ResidenceCard.vue'
import DailyCard from '../components/home/DailyCard.vue'
import NewsBoard from '../components/home/NewsBoard.vue'

const authStore = useAuthStore()
const myAvatar = computed(() =>
  authStore.userData?.customPhoto || authStore.userData?.googlePhoto ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.userData?.nickname || '?')}&size=80&background=random`
)
</script>

<style scoped>
.home-me {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--border, #efe7fb);
  border-radius: 16px; padding: 12px 14px; margin-bottom: 14px;
  text-decoration: none; box-shadow: 0 2px 10px rgba(170,140,210,.1);
}
.home-me:active { transform: scale(.99); }
.home-me-av { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary, #b58df1); background: #eee; }
.home-me-info { flex: 1; min-width: 0; }
.home-me-nick { font-size: .92rem; font-weight: 800; color: var(--text, #4a3f5e); }
.home-me-sub { font-size: .66rem; color: var(--muted, #9b8fb0); }
.home-me-arrow { color: var(--muted, #9b8fb0); font-size: 1.4rem; }
.home-shortcuts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.home-shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 16px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  transition: transform 0.12s, background 0.12s;
}
.home-shortcut:active {
  transform: scale(0.97);
}
.home-shortcut:hover {
  background: rgba(255, 255, 255, 0.1);
}
.hs-icon {
  font-size: 1.6rem;
}
.hs-label {
  font-weight: 800;
  color: #fff;
  font-size: 0.95rem;
}
.hs-sub {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.45);
}
</style>
