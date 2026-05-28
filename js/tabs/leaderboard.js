// ════════════════════════════════════════
// TAB: LEADERBOARD (🏆 Rank)
// ════════════════════════════════════════

let _lbMode = 'coins';

function _allUsers() {
    const users = [];
    const fbU = window.__fbUsers || {};
    const stu = window.__students || [];
    stu.forEach(s => {
        const live = fbU[s.id];
        if (!live) return;
        users.push({ ...s, ...live });
    });
    return users;
}

function _photoFor(u) {
    const def = `https://ui-avatars.com/api/?name=${encodeURIComponent((u.nickname || '?').split(' ')[0])}&background=${u.track === 'sci' ? '2563eb' : '10b981'}&color=fff&size=64`;
    return u.customPhoto || u.googlePhoto || def;
}

function _rankEmoji(i) {
    if (i === 0) return '<span class="rank-num gold">🥇</span>';
    if (i === 1) return '<span class="rank-num silver">🥈</span>';
    if (i === 2) return '<span class="rank-num bronze">🥉</span>';
    return `<span class="rank-num">${i + 1}</span>`;
}

const BOARDS = [
    {
        key: 'coins',
        icon: '🪙',
        label: 'เหรียญ',
        title: 'อันดับเหรียญสะสม',
        sub: 'Coins Ranking',
        val: u => u.coins || 0,
        fmt: v => v.toLocaleString() + ' 🪙',
        sublabel: 'เหรียญ',
    },
    {
        key: 'pvp',
        icon: '⚔️',
        label: 'PvP',
        title: 'อันดับ PvP',
        sub: 'PvP Victories',
        val: u => u.pvpVictories || 0,
        fmt: v => v + ' ชนะ',
        sublabel: 'ครั้ง',
    },
    {
        key: 'tower',
        icon: '🗼',
        label: 'Tower',
        title: 'อันดับ Tower',
        sub: 'Highest Floor',
        val: u => u.towerBest || 0,
        fmt: v => 'ชั้น ' + v,
        sublabel: 'ชั้น',
    },
    {
        key: 'quiz',
        icon: '👥',
        label: 'ทายชื่อ',
        title: 'อันดับทายชื่อเพื่อน',
        sub: 'Name Quiz Highscore',
        val: u => u.quizHigh || 0,
        fmt: v => v + ' แต้ม',
        sublabel: 'แต้ม',
    },
    {
        key: 'drug',
        icon: '💊',
        label: 'ทายยา',
        title: 'อันดับทายยา',
        sub: 'Drug Quiz Highscore',
        val: u => u.drugHigh || 0,
        fmt: v => v + ' แต้ม',
        sublabel: 'แต้ม',
    },
    {
        key: 'pet',
        icon: '🐾',
        label: 'สัตว์',
        title: 'อันดับ Collection',
        sub: 'Unique Pets Collected',
        val: u => new Set((u.pets || []).map(p => p.id)).size,
        fmt: v => v + ' ตัว',
        sublabel: 'ตัว',
    },
];

function _renderBoard(board) {
    const users = _allUsers()
        .map(u => ({ ...u, _val: board.val(u) }))
        .filter(u => u._val > 0)
        .sort((a, b) => b._val - a._val)
        .slice(0, 50);

    const myId = window.userData?.studentId;

    if (users.length === 0) {
        return `<div style="text-align:center;padding:24px;color:rgba(255,255,255,.4);font-size:0.84rem">
            ยังไม่มีข้อมูล
        </div>`;
    }

    return users.map((u, i) => {
        const isMe = u.id === myId || u.studentId === myId;
        const photo = _photoFor(u);
        const tc = u.track === 'sci' ? 'var(--sci)' : 'var(--care)';
        return `<div class="rank-row${isMe ? ' me' : ''}">
            ${_rankEmoji(i)}
            <img class="rank-photo" src="${photo}" loading="lazy"
                onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=?&background=1e293b&color=fff&size=64'">
            <div class="rank-info">
                <div class="rank-nick">${u.nickname || '—'}${isMe ? ' <span style="font-size:0.58rem;color:#fbbf24">(คุณ)</span>' : ''}</div>
                <div class="rank-sub" style="color:${tc}">${u.track === 'sci' ? 'Sci-Pharm' : 'Care-Pharm'}</div>
            </div>
            <div>
                <div class="rank-val">${board.fmt(u._val)}</div>
                <div class="rank-val-label">${board.sublabel}</div>
            </div>
        </div>`;
    }).join('');
}

export function buildLeaderboard() {
    const board = BOARDS.find(b => b.key === _lbMode) || BOARDS[0];

    return `
    <div style="padding-bottom:8px">
        <div style="font-size:1.1rem;font-weight:800;color:#fff;margin-bottom:4px">🏆 อันดับ</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,.4)">Leaderboard — อัพเดทแบบเรียลไทม์</div>
    </div>

    <div class="rank-tab-row">
        ${BOARDS.map(b => `
            <button class="rank-tab-btn${_lbMode === b.key ? ' active' : ''}"
                onclick="window._lbSwitch('${b.key}')">
                ${b.icon} ${b.label}
            </button>
        `).join('')}
    </div>

    <div class="rank-card">
        <div class="rank-header">
            <span class="rank-header-icon">${board.icon}</span>
            <span class="rank-header-title">${board.title}</span>
            <span class="rank-header-sub">${board.sub}</span>
        </div>
        <div id="rank-body">
            ${_renderBoard(board)}
        </div>
    </div>

    <div style="text-align:center;font-size:0.65rem;color:rgba(255,255,255,.25);padding:4px 0 8px">
        แสดงเฉพาะผู้ใช้ที่ Login แล้ว · Top 50
    </div>`;
}

window._lbSwitch = (key) => {
    _lbMode = key;
    const main = document.getElementById('main-content');
    if (main && window.__tab === 'rank') {
        main.innerHTML = buildLeaderboard();
    }
};
