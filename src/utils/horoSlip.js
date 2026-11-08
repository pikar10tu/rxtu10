/**
 * การ์ดแชร์ดวง "สลิป PharMoo" — วาดลง canvas 1080×1920 (สตอรี่ IG) ในเครื่อง ไม่ต้องใช้ไลบรารี
 * แบบ C ที่ user เลือก 9 พ.ย. 2026 (เดโม artifact QH9emkFDKCSpfzPmBWkh8R) · ส่วนท้ายเป็นสรุปขำๆ แทนบาร์โค้ด
 */
const W = 1080, H = 1920
const FONT = "'Chakra Petch', 'Kanit', sans-serif"
const BODY = "'Kanit', sans-serif"

let fontReady = null
/** โหลดฟอนต์ใบเสร็จครั้งเดียว (Google Fonts) — โหลดไม่ได้ก็ใช้ Kanit ของเว็บแทน */
export function loadSlipFont() {
  if (fontReady) return fontReady
  if (!document.getElementById('font-chakra')) {
    const l = document.createElement('link')
    l.id = 'font-chakra'; l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&display=swap'
    document.head.appendChild(l)
  }
  fontReady = Promise.all([
    document.fonts.load(`700 40px 'Chakra Petch'`, 'ดวง'), document.fonts.load(`400 40px 'Chakra Petch'`, 'ดวง'),
    document.fonts.load(`400 40px Kanit`, 'ดวง'),
  ]).catch(() => null)
  return fontReady
}

function wrap(ctx, text, maxW) {
  // ตัดบรรทัดภาษาไทย: แบ่งตามช่องว่างก่อน คำยาวเกินค่อยหั่นทีละตัวอักษร
  const out = []; let line = ''
  for (const word of text.split(/(\s+)/)) {
    const test = line + word
    if (ctx.measureText(test).width <= maxW || !line.trim()) { line = test; continue }
    out.push(line.trim()); line = word.trimStart()
  }
  if (line.trim()) out.push(line.trim())
  return out.flatMap(l => {
    if (ctx.measureText(l).width <= maxW) return [l]
    const parts = []; let cur = ''
    for (const ch of l) { if (ctx.measureText(cur + ch).width > maxW) { parts.push(cur); cur = ch } else cur += ch }
    return cur ? [...parts, cur] : parts
  })
}
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

/**
 * d = { name, dateText, sign, asc, starsArr:[w,m,l], card, lucky:'1 · 6', houseLine, colors:[hex…], slip:[3 บรรทัด], stamp }
 */
export function drawSlip(canvas, d) {
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  // พื้นลายทาง
  ctx.fillStyle = '#d8e2ff'; ctx.fillRect(0, 0, W, H)
  ctx.save(); ctx.strokeStyle = '#c6d3ff'; ctx.lineWidth = 34
  for (let x = -H; x < W + H; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke() }
  ctx.restore()

  // วาดสลิปในพิกัดเสมือนที่เล็กกว่า แล้วขยาย K เท่า → กระดาษเต็มภาพ (ไม่ลอยเล็กกลางพื้น)
  const K = 1.22, VW = W / K, VH = H / K
  ctx.save(); ctx.scale(K, K)
  const pad = 56, sw = VW - 70, sx = (VW - sw) / 2, inner = sw - pad * 2
  let stampY = 0
  // วาดเนื้อหาก่อนเพื่อวัดความสูง → วาดจริงอีกรอบบนกระดาษ
  const layout = (draw) => {
    let y = 0
    const text = (t, { size = 40, weight = 400, color = '#222', align = 'left', font = FONT, lh = 1.5, x = 0 } = {}) => {
      ctx.font = `${weight} ${size}px ${font}`
      const lines = wrap(ctx, t, inner - x)
      for (const l of lines) {
        y += size * lh
        if (draw) { ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(l, align === 'center' ? sx + sw / 2 : sx + pad + x, draw.y0 + y - size * .35) }
      }
    }
    const row = (k, v, { size = 42, weight = 600 } = {}) => {
      y += size * 1.65
      if (!draw) return
      ctx.font = `400 ${size}px ${FONT}`; ctx.fillStyle = '#333'; ctx.textAlign = 'left'; ctx.fillText(k, sx + pad, draw.y0 + y - size * .4)
      ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = '#111'; ctx.textAlign = 'right'; ctx.fillText(v, sx + sw - pad, draw.y0 + y - size * .4)
    }
    const dash = () => {
      y += 34
      if (draw) { ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = '#999'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx + pad, draw.y0 + y); ctx.lineTo(sx + sw - pad, draw.y0 + y); ctx.stroke(); ctx.restore() }
      y += 22
    }
    y += 70
    text('✦ PharMoo ✦', { size: 78, weight: 700, align: 'center', color: '#1a1a1a', lh: 1.15 })
    text('ดวงประจำวัน สำหรับนักศึกษาเภสัชสายมู', { size: 34, align: 'center', color: '#666', font: BODY, lh: 1.6 })
    text(`ใบเสร็จ · ${d.dateText}`, { size: 32, align: 'center', color: '#666', lh: 1.5 })
    text(`ลูกค้า: ${d.name} · ราศี${d.sign}${d.asc ? ` · ลัคนา${d.asc}` : ''}`, { size: 32, align: 'center', color: '#666', lh: 1.5 })
    dash()
    // ดาวแต่ละด้าน + คำสรุปบรรทัดใต้ (ตัด "งาน:" นำหน้าออก)
    const sub = (t) => text(t.replace(/^[^:]+:\s*/, ''), { size: 33, color: '#555', font: BODY, lh: 1.4 })
    row('การงาน/การเรียน', stars(d.starsArr[0])); sub(d.slip[0]); y += 8
    row('การเงิน', stars(d.starsArr[1])); sub(d.slip[1]); y += 8
    row('ความรัก', stars(d.starsArr[2])); sub(d.slip[2])
    dash()
    row('ไพ่วันนี้', d.card)
    row('เลขนำโชค', d.lucky)
    dash()
    stampY = y
    text(d.houseLine, { size: 44, weight: 700, color: '#111', lh: 1.4 })
    text(d.houseDesc, { size: 34, color: '#444', font: BODY, lh: 1.5 })
    y += 10
    if (d.colors?.length) {
      row('สีมงคลวันนี้', '')
      y += 14
      if (draw) {
        const gap = 20, n = d.colors.length, cw = (inner - gap * (n - 1)) / n
        d.colors.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(sx + pad + i * (cw + gap), draw.y0 + y, cw, 56, 10); ctx.fill() })
      }
      y += 70
    }
    dash()
    text('RxTU10', { size: 32, weight: 600, align: 'center', color: '#777', lh: 1.6 })
    y += 60
    return y
  }
  const sh = layout(null)
  const sy = Math.max(30, (VH - sh) / 2)
  // กระดาษ + ขอบหยัก
  ctx.save()
  ctx.translate(VW / 2, VH / 2); ctx.rotate(-1.5 * Math.PI / 180); ctx.translate(-VW / 2, -VH / 2)
  ctx.shadowColor = 'rgba(42,53,100,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24
  ctx.fillStyle = '#fffefb'
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy); ctx.lineTo(sx + sw, sy + sh)
  const r = 16, step = 48
  for (let x = sx + sw; x > sx; x -= step) ctx.arc(x - step / 2, sy + sh, Math.min(r, step / 2), 0, Math.PI, false)
  ctx.lineTo(sx, sy); ctx.closePath(); ctx.fill()
  ctx.shadowColor = 'transparent'
  layout({ y0: sy })
  // ตราประทับ
  ctx.save(); ctx.translate(sx + sw - pad - 110, sy + stampY + 10); ctx.rotate(-8 * Math.PI / 180)
  ctx.strokeStyle = '#d6336c'; ctx.fillStyle = '#d6336c'; ctx.globalAlpha = .85; ctx.lineWidth = 7
  ctx.font = `700 46px ${FONT}`; const tw = ctx.measureText(d.stamp).width
  ctx.beginPath(); ctx.roundRect(-tw / 2 - 26, -44, tw + 52, 80, 16); ctx.stroke()
  ctx.textAlign = 'center'; ctx.fillText(d.stamp, 0, 14)
  ctx.restore()
  ctx.restore()
  ctx.restore()
  return canvas
}

/** แชร์/บันทึกรูป — มือถือเปิดเมนูแชร์ (IG/LINE) · ไม่รองรับ = ดาวน์โหลดไฟล์ */
export async function shareCanvas(canvas, filename) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return 'shared' } catch (e) { if (e?.name === 'AbortError') return 'cancel' }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return 'saved'
}
