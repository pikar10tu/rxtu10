<!-- แชร์ดวง: สร้างสลิป PharMoo เป็นรูป แล้วแชร์/บันทึก (z410: เปิดจากใน BottomSheet z400) -->
<template>
  <button class="hsr-btn" :disabled="busy" @click="make">{{ busy ? 'กำลังสร้างรูป…' : '🧾 แชร์ดวงวันนี้' }}</button>
  <Teleport to="body">
    <div v-if="img" class="hsr-ov" @click.self="img = ''">
      <img :src="img" alt="สลิปดวงวันนี้" class="hsr-img" />
      <div class="hsr-acts">
        <button class="hsr-go" @click="share">แชร์ / บันทึกรูป</button>
        <button class="hsr-x" @click="img = ''">ปิด</button>
      </div>
      <p class="hsr-hint">ถ้าแชร์ไม่ขึ้น กดค้างที่รูปแล้วเลือกบันทึกได้</p>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../../composables/useToast.js'
import { drawSlip, loadSlipFont, shareCanvas } from '../../utils/horoSlip.js'

const props = defineProps({ data: { type: Object, required: true } })
const { toast } = useToast()
const busy = ref(false)
const img = ref('')
let canvas = null

async function make() {
  busy.value = true
  try {
    await loadSlipFont()
    canvas = drawSlip(document.createElement('canvas'), props.data)
    img.value = canvas.toDataURL('image/png')
  } catch (e) { console.error('[horo share]', e); toast('สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง', 'error') } finally { busy.value = false }
}
async function share() {
  if (!canvas) return
  const r = await shareCanvas(canvas, `pharmoo-${props.data.fileDay}.png`)
  if (r === 'saved') toast('บันทึกรูปแล้ว', 'success')
}
</script>

<style scoped>
.hsr-btn { font: inherit; font-weight: 800; font-size: .9rem; width: 100%; border: 0; border-radius: 14px; padding: 12px; cursor: pointer; color: #fff; background: linear-gradient(135deg, #6d5bd0, #d6336c); box-shadow: var(--pop); }
.hsr-btn:disabled { opacity: .6; }
.hsr-ov { position: fixed; inset: 0; z-index: 410; background: rgba(20, 22, 48, .85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px 16px; }
.hsr-img { max-height: 72vh; max-width: 100%; border-radius: 12px; box-shadow: 0 16px 40px rgba(0, 0, 0, .4); }
.hsr-acts { display: flex; gap: 10px; }
.hsr-go, .hsr-x { font: inherit; font-weight: 800; font-size: .9rem; border: 0; border-radius: 999px; padding: 11px 20px; cursor: pointer; }
.hsr-go { background: #fff; color: #6d5bd0; }
.hsr-x { background: rgba(255, 255, 255, .15); color: #fff; }
.hsr-hint { margin: 0; font-size: .74rem; color: rgba(255, 255, 255, .7); }
</style>
