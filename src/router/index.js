import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView     from '../views/HomeView.vue'
import MembersView  from '../views/MembersView.vue'
import PlayView     from '../views/PlayView.vue'
import StudyView    from '../views/StudyView.vue'
import ShopView     from '../views/ShopView.vue'
import RankView     from '../views/RankView.vue'
import AdminView    from '../views/AdminView.vue'

const routes = [
    { path: '/',        name: 'home',    component: HomeView    },
    { path: '/members', name: 'members', component: MembersView },
    { path: '/play',    name: 'play',    component: PlayView    },
    { path: '/study',   name: 'study',   component: StudyView   },
    { path: '/shop',    name: 'shop',    component: ShopView    },
    { path: '/rank',    name: 'rank',    component: RankView    },
    { path: '/admin',   name: 'admin',   component: AdminView   },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
})
