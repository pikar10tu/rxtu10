<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">🏠 Home</div>

    <!-- ที่อยู่อาศัย (residence) — แกน prestige/coin-sink -->
    <ResidenceCard v-if="authStore.isLoggedIn" />

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
import { useAuthStore } from '../stores/auth.js'
import ResidenceCard from '../components/residence/ResidenceCard.vue'

const authStore = useAuthStore()
</script>

<style scoped>
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
