import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const CART_KEY = 'whateat_cart'
const HISTORY_KEY = 'whateat_history'
const MODE_KEY = 'whateat_app_mode'
const USER_KEY = 'whateat_user'
const CITY_KEY = 'whateat_city'

const LEVEL_RULES = [
  { level: 1, title: '吃货新人', min: 0, max: 9 },
  { level: 2, title: '干饭小能手', min: 10, max: 49 },
  { level: 3, title: '点单达人', min: 50, max: 149 },
  { level: 4, title: '美食家', min: 150, max: 299 },
  { level: 5, title: '食神', min: 300, max: Infinity }
]

function loadLocal(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch (e) {
    return fallback
  }
}

function saveLocal(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

export default new Vuex.Store({
  state: {
    appMode: loadLocal(MODE_KEY, 'lunch'),
    cartList: loadLocal(CART_KEY, []),
    historyImgList: loadLocal(HISTORY_KEY, []),
    user: loadLocal(USER_KEY, { nickname: '美食家', avatar: '🍔', exp: 0, lastLoginDate: '' }),
    city: loadLocal(CITY_KEY, 'hangzhou')
  },
  mutations: {
    setAppMode(state, mode) {
      state.appMode = mode
      saveLocal(MODE_KEY, mode)
    },
    addCart(state, dish) {
      const existing = state.cartList.find(item => item.id === dish.id)
      if (existing) {
        existing.num += (dish.num || 1)
      } else {
        state.cartList.push({ ...dish, num: dish.num || 1 })
      }
      saveLocal(CART_KEY, state.cartList)
    },
    changeCartNum(state, { id, num }) {
      const item = state.cartList.find(i => i.id === id)
      if (item) {
        item.num = num > 0 ? num : 1
      }
      saveLocal(CART_KEY, state.cartList)
    },
    delCartItem(state, id) {
      state.cartList = state.cartList.filter(i => i.id !== id)
      saveLocal(CART_KEY, state.cartList)
    },
    clearCart(state) {
      state.cartList = []
      saveLocal(CART_KEY, state.cartList)
    },
    saveHistoryImg(state, payload) {
      // 兼容旧调用（直接传 base64 字符串）
      const img = typeof payload === 'string' ? payload : payload.img
      const sign = typeof payload === 'string' ? '' : (payload.sign || '')
      const time = new Date().toLocaleString('zh-CN')
      // 同一份菜单（签名相同）不重复记录，仅更新最近一条
      if (sign && state.historyImgList.length && state.historyImgList[0].sign === sign) {
        state.historyImgList[0].img = img
        state.historyImgList[0].time = time
      } else {
        const nextId = state.historyImgList.reduce((m, i) => Math.max(m, i.id || 0), 0) + 1
        state.historyImgList.unshift({ id: nextId, img, sign, time })
      }
      saveLocal(HISTORY_KEY, state.historyImgList)
    },
    delHistoryImg(state, index) {
      state.historyImgList.splice(index, 1)
      saveLocal(HISTORY_KEY, state.historyImgList)
    },
    clearHistoryImg(state) {
      state.historyImgList = []
      saveLocal(HISTORY_KEY, state.historyImgList)
    },
    setUserInfo(state, payload) {
      state.user = { ...state.user, ...payload }
      saveLocal(USER_KEY, state.user)
    },
    addExp(state, delta) {
      state.user.exp = (state.user.exp || 0) + delta
      saveLocal(USER_KEY, state.user)
    },
    checkIn(state) {
      const today = new Date().toDateString()
      if (state.user.lastLoginDate !== today) {
        state.user.lastLoginDate = today
        state.user.exp = (state.user.exp || 0) + 1
        saveLocal(USER_KEY, state.user)
      }
    },
    setCity(state, city) {
      state.city = city
      saveLocal(CITY_KEY, city)
    }
  },
  getters: {
    cartCount: state => state.cartList.reduce((sum, i) => sum + i.num, 0),
    userLevel: state => {
      const exp = state.user.exp || 0
      let idx = LEVEL_RULES.findIndex(r => exp < r.min)
      if (idx === -1) idx = LEVEL_RULES.length
      const rule = LEVEL_RULES[idx - 1]
      const nextRule = LEVEL_RULES[idx]
      const percent = nextRule
        ? ((exp - rule.min) / (nextRule.min - rule.min)) * 100
        : 100
      return {
        level: rule.level,
        title: rule.title,
        exp,
        nextExp: nextRule ? nextRule.min : null,
        percent: Math.min(100, Math.max(0, percent))
      }
    }
  }
})
