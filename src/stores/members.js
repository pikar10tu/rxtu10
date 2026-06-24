import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { R_SCI, R_CARE, RN } from '../data/students.js'
import { normalizeUserData } from '../data/userSchema.js'
import { readCache, slimForCache, MEMBERS_CACHE_KEY, MEMBERS_CACHE_TTL } from '../utils/membersCache.js'
import { useUsageStore } from './usage.js'
import { stripTrailingEmoji } from '../utils/text.js'

export const useMembersStore = defineStore('members', () => {
    const fbUsers    = ref({})   // { studentId: userObject }
    const students   = ref([])   // all students from static data
    const guestUsers = ref([])
    const loading    = ref(false)

    // Build student list from static data (runs once)
    function initStudents() {
        const parse = (s, track) => { const [nick, rest] = s.split(' ('); return { nickname: stripTrailingEmoji(nick), id: rest.replace(')', ''), track } }
        const sci  = R_SCI.map(s  => parse(s, 'sci'))
        const care = R_CARE.map(s => parse(s, 'care'))
        const names = RN.split(/(?=นาย|นางสาว)/).filter(n => n.trim()).map(n => n.replace(/^นาย|^นางสาว/, '').trim())
        const all = [...sci, ...care].sort((a, b) => a.id.localeCompare(b.id))
        all.forEach((s, i) => { s.realName = names[i] || 'ไม่ระบุ' })
        students.value = all
    }

    // อ่าน cache localStorage → hydrate in-memory ถ้าสด + shape ถูก (คืน true = ใช้ได้)
    function hydrateFromCache() {
        try {
            const hit = readCache(localStorage.getItem(MEMBERS_CACHE_KEY), Date.now(), MEMBERS_CACHE_TTL)
            if (!hit) return false
            fbUsers.value    = hit.fbUsers
            guestUsers.value = hit.guestUsers
            return true
        } catch { return false }
    }

    function writeCache() {
        try {
            const slim = slimForCache(fbUsers.value, guestUsers.value)
            localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify({ ts: Date.now(), ...slim }))
        } catch { /* localStorage เต็ม/ปิด — ไม่เป็นไร รอบหน้าค่อยยิง Firestore */ }
    }

    // { force } = true → ข้าม cache ยิง Firestore สดเสมอ (ปุ่ม ↻ / Admin triage)
    async function loadFbUsers({ force = false } = {}) {
        if (loading.value) return
        // in-memory มีแล้ว + ไม่ force → ข้าม (กันยิงซ้ำในเซสชันเดียว)
        if (!force && Object.keys(fbUsers.value).length) return
        // cache ข้ามเซสชันสด + ไม่ force → hydrate ไม่ยิง Firestore
        if (!force && hydrateFromCache()) return
        loading.value = true
        try {
            const snap = await getDocs(collection(db, 'users'))
            useUsageStore().track(snap.size) // ตัวถ่วง read หลัก — นับเข้าตัวประมาณการ
            const newFb = {}
            const guests = []
            snap.forEach(d => {
                const x = d.data()
                if (!x.studentId && !x.nickname) return
                // normalize first → canonical defaults + deep-defaulted nested
                // objects, then keep only the light subset the member views need.
                const n = normalizeUserData(x)
                const light = {
                    uid: d.id,
                    studentId: n.studentId,
                    nickname: stripTrailingEmoji(n.nickname || n.name?.split(' ')[0]) || '?',
                    realName: n.realName,
                    email: n.email,
                    role: n.role,
                    track: n.track,
                    accountType: n.accountType,
                    guestStatus: n.guestStatus,
                    guestReason: n.guestReason,
                    coins: n.coins,
                    pets: n.pets,
                    activePets: n.activePets,
                    residence: n.residence,
                    founder: n.founder === true,
                    tags: n.tags,
                    pvpVictories: n.pvpVictories,
                    towerBest: n.towerBest,
                    quizHigh: n.quizHigh,
                    drugHigh: n.drugHigh,
                    googlePhoto: n.googlePhoto,
                    customPhoto: n.customPhoto,
                    contact: n.contact,
                    likes: n.likes,
                    likedBy: n.likedBy,
                }
                if (n.accountType === 'guest' || n.track === 'guest') guests.push(light)
                else if (n.studentId) newFb[n.studentId] = light
            })
            fbUsers.value    = newFb
            guestUsers.value = guests
            writeCache() // เก็บ light subset ไว้ใช้ข้ามเซสชัน
        } catch (e) {
            console.error('[members]', e)
        } finally {
            loading.value = false
        }
    }

    return { fbUsers, students, guestUsers, loading, initStudents, loadFbUsers }
})
