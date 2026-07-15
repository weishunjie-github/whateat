<template>
  <div class="tabbar-wrap">
    <van-tabbar v-model="active" route fixed placeholder active-color="#ff6034" inactive-color="#aaa">
      <van-tabbar-item to="/menu">
        <span slot="icon" slot-scope="props" class="tab-icon">
          <van-icon :name="props.active ? 'orders-o' : 'bars'" />
        </span>
        <span class="tab-label">{{ isTakeaway ? '外卖' : '菜单' }}</span>
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="cartCount || null">
        <span slot="icon" slot-scope="props" class="tab-icon">
          <van-icon :name="props.active ? 'shopping-cart' : 'cart-o'" />
        </span>
        <span class="tab-label">{{ isTakeaway ? '下单' : '下单' }}</span>
      </van-tabbar-item>
      <van-tabbar-item to="/random">
        <span slot="icon" slot-scope="props" class="tab-icon">
          <van-icon :name="props.active ? 'award' : 'award-o'" />
        </span>
        <span class="tab-label">随机</span>
      </van-tabbar-item>
      <van-tabbar-item to="/mine">
        <span slot="icon" slot-scope="props" class="tab-icon">
          <van-icon :name="props.active ? 'contact' : 'user-o'" />
        </span>
        <span class="tab-label">我的</span>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem, Icon } from 'vant'

export default {
  name: 'TabBar',
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    [Icon.name]: Icon
  },
  data() {
    return {
      active: 0
    }
  },
  computed: {
    cartCount() {
      return this.$store.getters.cartCount
    },
    isTakeaway() {
      return this.$store.state.appMode === 'takeaway'
    }
  }
}
</script>

<style scoped>
.tabbar-wrap >>> .van-tabbar {
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
  height: 56px;
}
.tabbar-wrap >>> .van-tabbar-item {
  transition: color 0.2s;
}
.tabbar-wrap >>> .van-tabbar-item--active {
  background: transparent;
}
.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.van-tabbar-item--active .tab-icon {
  transform: scale(1.15);
}
.tab-label {
  font-size: 10px;
  margin-top: 2px;
  letter-spacing: 0.5px;
}
</style>
