<template>
  <div class="section-title"><slot /></div>
</template>

<style scoped>
/* ยกจาก StudyView .sv-section-title — margin-top เผื่อระยะระหว่างกลุ่ม */
.section-title {
  font-weight: 800;
  font-size: .82rem;
  color: var(--ink);
  margin: 18px 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
