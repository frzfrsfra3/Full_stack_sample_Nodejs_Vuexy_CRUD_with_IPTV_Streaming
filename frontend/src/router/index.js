import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/ip-tv',
        name: 'ip-tv',
        component: () => import('@/pages/ip-tv/index.vue'),
      },
      {
        path: '/ip-tv/add',
        name: 'ip-tv-add',
        component: () => import('@/pages/ip-tv/Add.vue'),
      },
      {
        path: '/ip-tv/edit/:id',
        name: 'ip-tv-edit-id',
        component: () => import('@/pages/ip-tv/edit/[id].vue'),
      },
      {
        path: '/ip-tv/activate/:id',
        name: 'ip-tv-activate-id',
        component: () => import('@/pages/ip-tv/activate/[id].vue'),
      },
      {
        path: '/ip-tv/filtered/pending',
        name: 'ip-tv-filtered-pending',
        component: () => import('@/pages/ip-tv/filtered/pending/index.vue'),
      },
      {
        path: '/ip-tv/filtered/activate/:id',
        name: 'ip-tv-filtered-activate-id',
        component: () => import('@/pages/ip-tv/filtered/activate/[id].vue'),
      },
      {
        path: '/ip-tv/profiles',
        name: 'ip-tv-profiles',
        component: () => import('@/pages/ip-tv/profiles/index.vue'),
      },
      {
        path: '/ip-tv/profiles/add',
        name: 'ip-tv-profiles-add',
        component: () => import('@/pages/ip-tv/profiles/add.vue'),
      },
      {
        path: '/ip-tv/profiles/edit/:id',
        name: 'ip-tv-profiles-edit-id',
        component: () => import('@/pages/ip-tv/profiles/edit/[id].vue'),
      },
      {
        path: '/ip-tv/streams',
        name: 'ip-tv-streams',
        component: () => import('@/pages/ip-tv/streams/index.vue'),
      },
      {
        path: '/ip-tv/streams/add',
        name: 'ip-tv-streams-add',
        component: () => import('@/pages/ip-tv/streams/add.vue'),
      },
      {
        path: '/ip-tv/streams/watch',
        name: 'ip-tv-streams-watch',
        component: () => import('@/pages/ip-tv/streams/watch.vue'),
      },
      {
        path: '/',
        redirect: '/ip-tv',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token')
  if (to.path === '/login') {
    next()
  } else if (!isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router