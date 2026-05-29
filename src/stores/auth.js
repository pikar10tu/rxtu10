import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    signInWithPopup, signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
    doc, getDoc, setDoc, onSnapshot,
    serverTimestamp,
} from 'firebase/firestore'
import { auth, db, provider, ADMIN_EMAIL, SNAPSHOT_DELAY } from '../firebase/config.js'

export const useAuthStore = defineStore('auth', () => {
    // ── State ──
    const currentUser = ref(null)
    const userData    = ref(null)
    const loading     = ref(true)
    let   _unsub      = null

    // ── Getters ──
    const isLoggedIn = computed(() => !!currentUser.value)
    const isAdmin    = computed(() => currentUser.value?.email === ADMIN_EMAIL)
    const isLinked   = computed(() => !!userData.value?.studentId)

    // ── Actions ──
    async function login() {
        try {
            provider.setCustomParameters({ prompt: 'select_account' })
            const result = await signInWithPopup(auth, provider)
            await ensureDoc(result.user)
        } catch (e) {
            if (e.code !== 'auth/popup-closed-by-user') throw e
        }
    }

    async function logout() {
        if (_unsub) { _unsub(); _unsub = null }
        await signOut(auth)
        currentUser.value = null
        userData.value    = null
    }

    async function ensureDoc(user) {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
            await setDoc(ref, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                googlePhoto: user.photoURL,
                customPhoto: null,
                coins: 2000,
                pets: [],
                eggs: [],
                activePet: null,
                activePets: [null, null, null],
                pvpVictories: 0,
                studentId: null,
                nickname: null,
                realName: null,
                track: null,
                quizHigh: 0,
                drugHigh: 0,
                ctHigh: 0,
                towerFloor: 1,
                towerBest: 0,
                towerLastReset: null,
                lastDaily: null,
                contact: { phone: '', ig: '', line: '' },
                likes: 0,
                likedBy: {},
                totalSpent: 0,
                pityClaimedRounds: 0,
                createdAt: serverTimestamp(),
            })
        }
    }

    // Block snapshot guard (matches existing app's __blockSnapshot pattern)
    let _blockSnapshot = false
    function blockSnapshot(ms = SNAPSHOT_DELAY) {
        _blockSnapshot = true
        setTimeout(() => { _blockSnapshot = false }, ms)
    }

    // Optimistic update — write local state immediately, Firestore confirms async
    function setUserDataOptimistic(patch) {
        userData.value = { ...userData.value, ...patch }
    }

    // ── Auth listener (call once in main.js) ──
    function init() {
        onAuthStateChanged(auth, async (user) => {
            currentUser.value = user
            if (user) {
                await ensureDoc(user)
                if (_unsub) _unsub()
                _unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                    if (_blockSnapshot) return
                    const data = snap.data()
                    // Migrate activePet → activePets[0] (one-time)
                    if (data?.activePet && !(data?.activePets || []).some(Boolean)) {
                        data.activePets = [data.activePet, null, null]
                    }
                    userData.value = data
                })
            } else {
                if (_unsub) { _unsub(); _unsub = null }
                userData.value = null
            }
            loading.value = false
        })
    }

    return {
        currentUser, userData, loading,
        isLoggedIn, isAdmin, isLinked,
        login, logout, ensureDoc,
        blockSnapshot, setUserDataOptimistic,
        init,
    }
})
