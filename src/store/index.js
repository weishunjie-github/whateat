import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const CART_KEY = 'whateat_cart'
const HISTORY_KEY = 'whateat_history'
const MODE_KEY = 'whateat_app_mode'

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
    historyImgList: loadLocal(HISTORY_KEY, [])
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
    }
  },
  getters: {
    cartCount: state => state.cartList.reduce((sum, i) => sum + i.num, 0)
  }
})
