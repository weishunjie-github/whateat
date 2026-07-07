import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const CART_KEY = 'whateat_cart'
const HISTORY_KEY = 'whateat_history'

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
    cartList: loadLocal(CART_KEY, []),
    historyImgList: loadLocal(HISTORY_KEY, [])
  },
  mutations: {
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
    saveHistoryImg(state, base64) {
      state.historyImgList.unshift({
        img: base64,
        time: new Date().toLocaleString('zh-CN')
      })
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
