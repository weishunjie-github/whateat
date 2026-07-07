import Vue from 'vue'
import 'lib-flexible/flexible'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import store from './store'

import { Toast, Dialog } from 'vant'
Vue.use(Toast)
Vue.use(Dialog)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
