<template>
  <div class="mailbox-card">
    <div class="mb-head">
      <span class="mb-title"><Emoji char="📬" /> กล่องจดหมาย</span>
      <span v-if="mailbox.attention" class="mb-badge">{{ mailbox.attention }}</span>
      <button class="mb-refresh" :disabled="mailbox.loading" @click="mailbox.load({ force: true })">↻</button>
    </div>

    <div v-if="mailbox.loading && !mailbox.mails.length" class="mb-empty">กำลังโหลด…</div>
    <div v-else-if="!mailbox.mails.length" class="mb-empty">ยังไม่มีจดหมาย</div>
    <ul v-else class="mb-list">
      <li
        v-for="m in mailbox.mails" :key="m.id"
        class="mb-item" :class="{ unread: !m.read }"
        @click="mailbox.markRead(m.id)"
      >
        <span class="mb-ico"><Emoji :char="typeIcon(m)" /></span>
        <div class="mb-body">
          <div class="mb-item-title">{{ m.title }}</div>
          <div v-if="m.body" class="mb-item-text">{{ m.body }}</div>
          <div class="mb-meta">{{ fromLabel(m.from) }} · {{ fmtTime(m.createdAt) }}</div>
        </div>
        <div class="mb-action">
          <button
            v-if="hasReward(m)"
            class="mb-claim" :class="{ done: m.claimed }"
            :disabled="m.claimed || claimingId === m.id"
            @click.stop="onClaim(m)"
          >{{ m.claimed ? 'รับแล้ว ✓' : `รับ ${m.reward.coins}` }}<Emoji v-if="!m.claimed" char="🪙" /></button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, onMounted } from 'vue'
import { useMailbox } from '../../stores/mailbox.js'
import { useToast } from '../../composables/useToast.js'
import { canClaim, rewardCoins } from '../../utils/mailbox.js'

const mailbox = useMailbox()
const { toast } = useToast()
const claimingId = ref(null)

onMounted(() => mailbox.load())

function hasReward(m) { return rewardCoins(m) > 0 }
function typeIcon(m) { return m.type === 'reward' ? '🎁' : m.type === 'gift' ? '🎁' : '📢' }
function fromLabel(from) {
  return from === 'system' ? 'ระบบ' : from === 'daily' ? 'เดลี่' : from === 'admin' ? 'แอดมิน' : 'เพื่อน'
}
function fmtTime(t) {
  const ms = t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : new Date(t).getTime())
  if (!ms || Number.isNaN(ms)) return ''
  return new Date(ms).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

async function onClaim(m) {
  if (claimingId.value || !canClaim(m)) return
  claimingId.value = m.id
  try {
    const coins = await mailbox.claim(m.id)
    if (coins > 0) toast(`รับ ${coins.toLocaleString()} เหรียญแล้ว`, 'success')
    else if (coins === 0) toast('จดหมายนี้รับไปแล้ว', 'info')
    else toast('รับรางวัลไม่สำเร็จ', 'error')
  } finally { claimingId.value = null }
}
</script>

<style scoped>
.mailbox-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; padding: 14px; margin-bottom: 14px; box-shadow: var(--pop); }
.mb-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.mb-title { font-weight: 800; font-size: .95rem; }
.mb-badge { font-size: .62rem; font-weight: 800; color: #fff; background: #ef4444; border-radius: 999px; padding: 1px 7px; min-width: 18px; text-align: center; }
.mb-refresh { margin-left: auto; border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 28px; height: 28px; font-size: .8rem; cursor: pointer; color: rgba(0,0,0,.55); }
.mb-refresh:disabled { opacity: .5; }
.mb-empty { font-size: .76rem; color: rgba(0,0,0,.4); text-align: center; padding: 12px 0; }
.mb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.mb-item { display: flex; align-items: flex-start; gap: 10px; border: 1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 10px; background: #fff; cursor: pointer; }
.mb-item.unread { background: #eef2ff; border-color: rgba(79,70,229,.3); }
.mb-ico { font-size: 1.3rem; flex-shrink: 0; }
.mb-body { flex: 1; min-width: 0; }
.mb-item-title { font-weight: 800; font-size: .8rem; color: #1e293b; }
.mb-item-text { font-size: .72rem; color: rgba(0,0,0,.6); line-height: 1.4; margin-top: 2px; }
.mb-meta { font-size: .62rem; color: rgba(0,0,0,.4); margin-top: 4px; }
.mb-action { flex-shrink: 0; }
.mb-claim { border: none; border-radius: 9px; padding: 7px 11px; font-family: inherit; font-size: .72rem; font-weight: 800; color: #fff; background: var(--mint); cursor: pointer; white-space: nowrap; }
.mb-claim.done { background: rgba(0,0,0,.12); color: rgba(0,0,0,.5); cursor: default; }
.mb-claim:disabled { cursor: default; }
</style>
