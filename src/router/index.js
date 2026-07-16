import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/start'
  },
  {
    path: '/start',
    name: 'Start',
    component: () => import('../views/Start.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('../views/Menu.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../views/Detail.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('../views/Mine.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/random',
    name: 'Random',
    component: () => import('../views/Random.vue'),
    meta: { showTabBar: true }
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
