import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { R_SCI, R_CARE, RN } from '../data/students.js'
import { normalizeUserData } from '../data/userSchema.js'

export const useMembersStore = defineStore('members', () => {
    const fbUsers    = ref({})   // { studentId: userObject }
    const students   = ref([])   // all students from static data
    const guestUsers = ref([])
    const loading    = ref(false)

    // Build student list from static data (runs once)
    function initStudents() {
        const sci  = R_SCI.map(s  => { const [nick, rest] = s.split(' (');  return { nickname: nick, id: rest.replace(')', ''), track: 'sci'  } })
        const care = R_CARE.map(s => { const [nick, rest] = s.split(' (');  return { nickname: nick, id: rest.replace(')', ''), track: 'care' } })
        const names = RN.split(/(?=นาย|นางสาว)/).filter(n => n.trim()).map(n => n.replace(/^นาย|^นางสาว/, '').trim())
        const all = [...sci, ...care].sort((a, b) => a.id.localeCompare(b.id))
        all.forEach((s, i) => { s.realName = names[i] || 'ไม่ระบุ' })
        students.value = all
    }

    async function loadFbUsers() {
        if (loading.value) return
        loading.value = true
        try {
            const snap = await getDocs(collection(db, 'users'))
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
                    nickname: n.nickname || n.name?.split(' ')[0] || '?',
                    realName: n.realName,
                    email: n.email,
                    role: n.role,
                    track: n.track,
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
                if (n.track === 'guest') guests.push(light)
                else if (n.studentId) newFb[n.studentId] = light
            })
            fbUsers.value    = newFb
            guestUsers.value = guests
        } catch (e) {
            console.error('[members]', e)
        } finally {
            loading.value = false
        }
    }

    return { fbUsers, students, guestUsers, loading, initStudents, loadFbUsers }
})
