// ════════════════════════════════════════
// TAB: ADMIN PANEL (⚙️ Admin)
// ════════════════════════════════════════
import { db, ADMIN_EMAIL } from '../config.js';

const _sanitize = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
import {
    collection, getDocs, doc, updateDoc, deleteDoc,
    addDoc, serverTimestamp, increment, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function isAdmin() {
    return window.currentUser?.email === ADMIN_EMAIL;
}

function _photoFor(u) {
    const def = `https://ui-avatars.com/api/?name=${encodeURIComponent((u.nickname || '?').split(' ')[0])}&background=e2e8f0&color=334155&size=64`;
    return u.customPhoto || u.googlePhoto || def;
}

export function buildAdmin() {
    if (!isAdmin()) {
        return `<div style="text-align:center;padding:60px 20px">
            <div style="font-size:3rem;margin-bottom:12px">🔒</div>
            <div style="font-weight:800;font-size:1.1rem;color:var(--text);margin-bottom:6px">ไม่มีสิทธิ์เข้าถึง</div>
            <div style="font-size:0.8rem;color:var(--muted)">หน้านี้สำหรับ Admin เท่านั้น</div>
        </div>`;
    }

    const allFbUsers  = Object.values(window.__fbUsers || {});
    const guestUsers  = window.__guestUsers || [];
    const totalLinked = allFbUsers.length;
    const totalGuests = guestUsers.length;
    const totalCoins  = allFbUsers.reduce((s, u) => s + (u.coins || 0), 0);
    const totalPets   = allFbUsers.reduce((s, u) => s + (u.pets?.length || 0), 0);

    return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text)">⚙️ Admin Panel</div>
            <div style="font-size:0.68rem;color:var(--muted)">RxTU10 Dashboard · ${ADMIN_EMAIL}</div>
        </div>
        <span class="admin-badge">ADMIN</span>
    </div>

    <!-- Overview Stats -->
    <div class="admin-section">
        <div class="admin-section-header">
            <span class="admin-section-icon">📊</span>
            <span class="admin-section-title">ภาพรวม</span>
        </div>
        <div class="admin-section-body">
            <div class="admin-stat-grid">
                <div class="admin-stat-cell">
                    <b>${totalLinked}</b>
                    <small>สมาชิก Linked</small>
                </div>
                <div class="admin-stat-cell">
                    <b>${totalGuests}</b>
                    <small>Guest</small>
                </div>
                <div class="admin-stat-cell">
                    <b>${totalCoins.toLocaleString()}</b>
                    <small>🪙 รวมทั้งหมด</small>
                </div>
                <div class="admin-stat-cell">
                    <b>${totalPets}</b>
                    <small>🐾 Pet ทั้งหมด</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Broadcast Announcement -->
    <div class="admin-section">
        <div class="admin-section-header">
            <span class="admin-section-icon">📢</span>
            <span class="admin-section-title">ส่ง Announcement</span>
        </div>
        <div class="admin-section-body">
            <input class="admin-input" id="adm-ann-emoji" placeholder="Emoji (เช่น 🎉)" maxlength="4" style="width:70px;display:inline-block;margin-right:6px">
            <textarea class="admin-textarea" id="adm-ann-text" rows="2" maxlength="120"
                placeholder="ข้อความ announcement (ไม่เกิน 120 ตัวอักษร)..."></textarea>
            <button class="btn-admin-action" onclick="window.adminPostAnn()">📢 ส่ง Announcement</button>
        </div>
    </div>

    <!-- News Management -->
    <div class="admin-section">
        <div class="admin-section-header">
            <span class="admin-section-icon">📰</span>
            <span class="admin-section-title">จัดการข่าว</span>
        </div>
        <div class="admin-section-body">
            <button class="btn-admin-action" onclick="window.adminLoadNews()">📋 โหลดข่าวล่าสุด</button>
            <div id="adm-news-list" style="margin-top:10px"></div>
        </div>
    </div>

    <!-- Member List -->
    <div class="admin-section">
        <div class="admin-section-header">
            <span class="admin-section-icon">👥</span>
            <span class="admin-section-title">รายชื่อสมาชิก (${totalLinked} คน)</span>
        </div>
        <div class="admin-section-body">
            <input class="admin-input" id="adm-search" placeholder="🔍 ค้นหาชื่อ..."
                oninput="window.adminFilterUsers(this.value)">
            <div id="adm-user-list" style="max-height:320px;overflow-y:auto">
                ${_renderUserList(allFbUsers)}
            </div>
        </div>
    </div>

    <!-- Coins Management -->
    <div class="admin-section">
        <div class="admin-section-header">
            <span class="admin-section-icon">🪙</span>
            <span class="admin-section-title">จัดการเหรียญ</span>
        </div>
        <div class="admin-section-body">
            <div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">ให้/ลดเหรียญสมาชิกคนเดียวด้วย Student ID</div>
            <input class="admin-input" id="adm-coin-sid" placeholder="Student ID (เช่น 6518610016)">
            <input class="admin-input" id="adm-coin-amt" type="number" placeholder="จำนวนเหรียญ (+/-)">
            <button class="btn-admin-action" onclick="window.adminGiveCoins()">🪙 ให้/ลดเหรียญ</button>
        </div>
    </div>

    <!-- Danger Zone -->
    <div class="admin-section" style="border-color:rgba(220,38,38,.2)">
        <div class="admin-section-header" style="background:rgba(220,38,38,.05)">
            <span class="admin-section-icon">⚠️</span>
            <span class="admin-section-title" style="color:#fca5a5">Danger Zone</span>
        </div>
        <div class="admin-section-body">
            <div style="font-size:0.72rem;color:var(--muted);margin-bottom:8px">ลบ user ที่ใช้ email ผิด (เช่น test account)</div>
            <input class="admin-input" id="adm-del-uid" placeholder="UID ของ user ที่ต้องการลบ">
            <button class="btn-admin-danger" onclick="window.adminDeleteUser()">🗑️ ลบ User</button>
        </div>
    </div>`;
}

function _renderUserList(users) {
    if (users.length === 0) return '<div style="color:var(--muted);font-size:0.8rem">ไม่มีข้อมูล</div>';
    return users.sort((a, b) => (b.coins || 0) - (a.coins || 0)).map(u => {
        const tc = u.track === 'sci' ? 'var(--sci)' : 'var(--care)';
        const photo = _photoFor(u);
        return `<div class="admin-user-row">
            <img class="admin-user-photo" src="${photo}" loading="lazy"
                onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=?&background=e2e8f0&color=334155&size=64'">
            <div class="admin-user-info">
                <div class="admin-user-nick">${u.nickname || '—'}</div>
                <div class="admin-user-meta" style="color:${tc}">${u.id || u.studentId} · ${u.track?.toUpperCase()}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
                <div style="font-size:0.78rem;font-weight:700;color:#fbbf24">${(u.coins || 0).toLocaleString()}🪙</div>
                <div style="font-size:0.58rem;color:var(--muted)">${(u.pets || []).length} pets</div>
            </div>
        </div>`;
    }).join('');
}

// ── Admin Window Actions ──

window.adminFilterUsers = (q) => {
    const list = document.getElementById('adm-user-list');
    if (!list) return;
    const users = Object.values(window.__fbUsers || {});
    const filtered = q.trim()
        ? users.filter(u => (u.nickname || '').includes(q) || (u.realName || '').includes(q) || (u.studentId || '').includes(q))
        : users;
    list.innerHTML = _renderUserList(filtered);
};

window.adminPostAnn = async () => {
    if (!isAdmin()) return;
    const emoji = _sanitize(document.getElementById('adm-ann-emoji')?.value.trim() || '📢');
    const text  = _sanitize(document.getElementById('adm-ann-text')?.value.trim());
    if (!text) { window.toast('กรุณาใส่ข้อความ', 'error'); return; }
    try {
        await addDoc(collection(db, 'news'), {
            emoji, msg: `[ADMIN] ${text}`,
            ts: serverTimestamp(),
            uid: window.currentUser?.uid || 'admin',
        });
        document.getElementById('adm-ann-text').value = '';
        window.toast('ส่ง Announcement แล้ว!', 'success');
    } catch (e) {
        window.toast('ส่งไม่สำเร็จ', 'error');
    }
};

window.adminLoadNews = async () => {
    if (!isAdmin()) return;
    const list = document.getElementById('adm-news-list');
    if (!list) return;
    list.innerHTML = '<div style="color:var(--muted);font-size:0.8rem">กำลังโหลด...</div>';
    try {
        const q2 = query(collection(db, 'news'), orderBy('ts', 'desc'), limit(20));
        const snap = await getDocs(q2);
        if (snap.empty) { list.innerHTML = '<div style="color:var(--muted);font-size:0.8rem">ไม่มีข่าว</div>'; return; }
        list.innerHTML = snap.docs.map(d => {
            const x = d.data();
            const ts = x.ts?.toDate?.()?.toLocaleString('th') || '—';
            return `<div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="font-size:1.1rem;flex-shrink:0">${x.emoji || '📰'}</span>
                <div style="flex:1;min-width:0">
                    <div style="font-size:0.8rem;color:var(--text)">${x.msg || ''}</div>
                    <div style="font-size:0.62rem;color:var(--muted);margin-top:2px">${ts}</div>
                </div>
                <button onclick="window.adminDelNews('${d.id}')"
                    style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#f87171;border-radius:8px;padding:3px 8px;font-size:0.65rem;cursor:pointer;flex-shrink:0">
                    ลบ
                </button>
            </div>`;
        }).join('');
    } catch (e) {
        list.innerHTML = '<div style="color:#f87171;font-size:0.8rem">โหลดไม่สำเร็จ</div>';
    }
};

window.adminDelNews = async (newsId) => {
    if (!isAdmin()) return;
    try {
        await deleteDoc(doc(db, 'news', newsId));
        window.toast('ลบข่าวแล้ว', 'success');
        window.adminLoadNews();
    } catch (e) {
        window.toast('ลบไม่สำเร็จ', 'error');
    }
};

window.adminGiveCoins = async () => {
    if (!isAdmin()) return;
    const sid = document.getElementById('adm-coin-sid')?.value.trim();
    const amt = parseInt(document.getElementById('adm-coin-amt')?.value);
    if (!sid || isNaN(amt)) { window.toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }

    try {
        const snap = await getDocs(collection(db, 'users'));
        let found = null;
        snap.forEach(d => { if (d.data().studentId === sid) found = d; });
        if (!found) { window.toast(`ไม่พบ Student ID: ${sid}`, 'error'); return; }
        await updateDoc(doc(db, 'users', found.id), { coins: increment(amt) });
        window.toast(`${amt > 0 ? '+' : ''}${amt}🪙 → ${sid}`, 'success');
        document.getElementById('adm-coin-sid').value = '';
        document.getElementById('adm-coin-amt').value = '';
    } catch (e) {
        window.toast('ไม่สำเร็จ: ' + e.message, 'error');
    }
};

window.adminDeleteUser = async () => {
    if (!isAdmin()) return;
    const uid = document.getElementById('adm-del-uid')?.value.trim();
    if (!uid) { window.toast('กรุณาใส่ UID', 'error'); return; }
    const ok = await window._confirm(`⚠️ ลบ User UID: ${uid}\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!\nยืนยันการลบ?`);
    if (!ok) return;
    try {
        await deleteDoc(doc(db, 'users', uid));
        window.toast('ลบ User สำเร็จ', 'success');
        document.getElementById('adm-del-uid').value = '';
    } catch (e) {
        window.toast('ลบไม่สำเร็จ: ' + e.message, 'error');
    }
};
