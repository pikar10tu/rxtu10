import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { R_SCI, R_CARE, RN } from '../data/students.js'

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
                const light = {
                    uid: d.id,
                    studentId: x.studentId,
                    nickname: x.nickname || x.name?.split(' ')[0] || '?',
                    realName: x.realName,
                    email: x.email,
                    role: x.role || 'student',
                    track: x.track,
                    coins: x.coins || 0,
                    pets: x.pets || [],
                    activePets: x.activePets || [],
                    residence: x.residence || { level: 1 },
                    founder: x.founder === true,
                    pvpVictories: x.pvpVictories || 0,
                    towerBest: x.towerBest || 0,
                    quizHigh: x.quizHigh || 0,
                    drugHigh: x.drugHigh || 0,
                    googlePhoto: x.googlePhoto,
                    customPhoto: x.customPhoto,
                    contact: x.contact || {},
                    likes: x.likes || 0,
                }
                if (x.track === 'guest') guests.push(light)
                else if (x.studentId) newFb[x.studentId] = light
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
