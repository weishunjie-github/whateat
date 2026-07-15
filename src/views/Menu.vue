<template>
  <div
    class="menu-page"
    @touchstart="onPullStart"
    @touchmove="onPullMove"
    @touchend="onPullEnd"
  >
    <!-- 下拉进入首页提示 -->
    <div
      class="pull-hint"
      :class="{ 'pull-hint-anim': !pulling }"
      :style="{ height: pullDistance + 'px' }"
    >
      <span class="pull-hint-inner" v-show="pullDistance > 6">
        <span class="pull-arrow" :class="{ flip: pullDistance >= pullThreshold }">↓</span>
        {{ pullDistance >= pullThreshold ? '松开进入首页' : '下拉进入首页' }}
      </span>
    </div>
    <!-- 顶部搜索头部 -->
    <div class="search-header">
      <div class="search-header-title">
        <span>{{ pageTitle }}</span>
        <span class="home-entry" @click="goHome">
          <van-icon name="wap-home-o" /> 首页
        </span>
      </div>
      <van-search
        v-model="keyword"
        placeholder="搜索菜品名称"
        shape="round"
        background="transparent"
        class="custom-search"
        @search="onSearch"
        @clear="keyword = ''"
      />
    </div>
    <!-- 分类标签 -->
    <van-tabs
      v-model="activeTab"
      color="#ff6034"
      title-active-color="#ff6034"
      sticky
      line-width="30"
      class="custom-tabs"
    >
      <van-tab
        v-for="cat in categoryList"
        :key="cat"
        :title="cat"
      />
    </van-tabs>
    <!-- 菜品列表 -->
    <div class="dish-list" v-if="filteredDishes.length">
      <div
        class="dish-card"
        v-for="dish in filteredDishes"
        :key="dish.id"
        @click="goDetail(dish.id)"
      >
        <div class="thumb-wrap">
          <img :src="dish.thumbImg" :alt="dish.name" class="thumb" @error="onImgError" />
        </div>
        <div class="info">
          <div class="dish-name">{{ dish.name }}</div>
          <div class="dish-tag">
            <van-tag type="primary" color="#ff6034" size="medium">{{ dish.category }}</van-tag>
          </div>
          <div class="dish-intro">{{ dish.intro }}</div>
          <div class="add-btn" @click.stop="quickAdd(dish)">
            <span class="add-btn-icon">+</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 空状态 -->
    <EmptyState
      v-else
      icon="search"
      :text="keyword ? '暂无相关菜品，换个关键词试试' : '当前分类暂无菜品'"
    />

    <!-- 购物车预览浮层 -->
    <transition name="slide-up">
      <div class="cart-preview" v-if="cartList.length" @click="$router.push('/cart')">
        <div class="cart-preview-left">
          <div class="cart-preview-avatars">
            <img
              v-for="item in cartPreviewList"
              :key="item.id"
              :src="item.thumbImg"
              :alt="item.name"
              class="cart-preview-avatar"
              @error="onImgError"
            />
            <span v-if="cartList.length > 4" class="cart-preview-more">+{{ cartList.length - 4 }}</span>
          </div>
          <div class="cart-preview-info">
            <span class="cart-preview-count">已选 <b>{{ cartTotalCount }}</b> 份</span>
            <span class="cart-preview-names">{{ cartNames }}</span>
          </div>
        </div>
        <div class="cart-preview-btn">
          去下单
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Search, Tabs, Tab, Tag, Button, Toast, Icon } from 'vant'
import { dishes, categoryList, takeawayDishes, takeawayCategoryList } from '../data/dishes'
import EmptyState from '../components/EmptyState.vue'

export default {
  name: 'Menu',
  components: {
    [Search.name]: Search,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Tag.name]: Tag,
    [Button.name]: Button,
    [Icon.name]: Icon,
    EmptyState
  },
  data() {
    return {
      keyword: '',
      activeTab: 0,
      pulling: false,
      pullDistance: 0,
      pullStartY: 0,
      pullThreshold: 80
    }
  },
  computed: {
    appMode() {
      return this.$store.state.appMode
    },
    isTakeaway() {
      return this.appMode === 'takeaway'
    },
    pageTitle() {
      return this.isTakeaway ? '杭州外卖' : '今日午餐'
    },
    categoryList() {
      return this.isTakeaway ? takeawayCategoryList : categoryList
    },
    dishes() {
      return this.isTakeaway ? takeawayDishes : dishes
    },
    currentCategory() {
      return this.categoryList[this.activeTab]
    },
    filteredDishes() {
      let list = this.dishes
      if (this.currentCategory !== '全部') {
        list = list.filter(d => d.category === this.currentCategory)
      }
      if (this.keyword.trim()) {
        const kw = this.keyword.trim().toLowerCase()
        list = list.filter(d => d.name.toLowerCase().includes(kw))
      }
      return list
    },
    cartList() {
      return this.$store.state.cartList
    },
    cartPreviewList() {
      return this.cartList.slice(0, 4)
    },
    cartTotalCount() {
      return this.cartList.reduce((sum, i) => sum + i.num, 0)
    },
    cartNames() {
      return this.cartList.map(i => i.name).join('、')
    }
  },
  methods: {
    onImgError(e) {
      e.target.src = '/img/default-food.svg'
    },
    goHome() {
      this.$router.push('/start')
    },
    onPullStart(e) {
      // 仅在页面滚动到顶部时才允许触发下拉
      const top = window.pageYOffset || document.documentElement.scrollTop || 0
      if (top > 0) { this.pulling = false; return }
      this.pullStartY = e.touches[0].clientY
      this.pulling = true
    },
    onPullMove(e) {
      if (!this.pulling) return
      const top = window.pageYOffset || document.documentElement.scrollTop || 0
      if (top > 0) { this.pulling = false; this.pullDistance = 0; return }
      const dy = e.touches[0].clientY - this.pullStartY
      if (dy <= 0) { this.pullDistance = 0; return }
      // 阻尼效果，最大下拉 130px
      this.pullDistance = Math.min(dy * 0.5, 130)
    },
    onPullEnd() {
      if (!this.pulling) return
      if (this.pullDistance >= this.pullThreshold) {
        this.$router.push('/start')
      }
      this.pulling = false
      this.pullDistance = 0
    },
    onSearch() {
      // 搜索已通过 computed 实时过滤
    },
    goDetail(id) {
      this.$router.push(`/detail/${id}`)
    },
    quickAdd(dish) {
      this.$store.commit('addCart', { ...dish, num: 1 })
      Toast.success({ message: '已加入购物车', duration: 1200 })
    }
  }
}
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background: #f5f6f8;
  padding-bottom: 120px;
}

/* 搜索头部 */
.search-header {
  background: linear-gradient(135deg, #ff6034 0%, #ff8a5c 100%);
  padding: 12px 16px 8px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 16px rgba(255, 96, 52, 0.2);
}
.search-header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.home-entry {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.home-entry:active {
  transform: scale(0.93);
  background: rgba(255, 255, 255, 0.35);
}

/* 下拉进入首页提示 */
.pull-hint {
  height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
  color: #ff6034;
  font-size: 14px;
}
.pull-hint-anim {
  transition: height 0.28s ease;
}
.pull-hint-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  white-space: nowrap;
}
.pull-arrow {
  display: inline-block;
  transition: transform 0.25s ease;
}
.pull-arrow.flip {
  transform: rotate(180deg);
}

/* 搜索框深度样式 */
.search-header >>> .van-search {
  padding: 0;
}
.search-header >>> .van-search__content {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.search-header >>> .van-search__content--round {
  border-radius: 22px;
}

/* 分类标签 */
.menu-page >>> .custom-tabs .van-tabs__nav {
  background: #fff;
}
.menu-page >>> .custom-tabs .van-tab {
  font-size: 14px;
  font-weight: 500;
}
.menu-page >>> .custom-tabs .van-tab--active {
  font-weight: 600;
}
.menu-page >>> .custom-tabs .van-tabs__line {
  height: 3px;
  border-radius: 3px;
}
.dish-list {
  padding: 12px 14px;
}
.dish-card {
  display: flex;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}
.dish-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.thumb-wrap {
  width: 110px;
  min-width: 110px;
  height: 110px;
  overflow: hidden;
}
.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.dish-card:active .thumb {
  transform: scale(1.05);
}
.info {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.dish-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
}
.dish-tag {
  margin: 4px 0;
}
.dish-intro {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}
.add-btn {
  align-self: flex-end;
  margin-top: 6px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6034, #ff8a5c);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(255, 96, 52, 0.35);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
}
.add-btn:active {
  transform: scale(0.85);
  box-shadow: 0 1px 4px rgba(255, 96, 52, 0.3);
}
.add-btn-icon {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin-top: -1px;
}

/* 购物车预览浮层 */
.cart-preview {
  position: fixed;
  bottom: 60px;
  left: 10px;
  right: 10px;
  height: 52px;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 0 12px;
  z-index: 90;
  cursor: pointer;
  transition: transform 0.2s;
}
.cart-preview:active {
  transform: scale(0.97);
}
.cart-preview-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.cart-preview-avatars {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.cart-preview-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  margin-left: -8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.cart-preview-avatar:first-child {
  margin-left: 0;
}
.cart-preview-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #666;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  border: 2px solid #fff;
}
.cart-preview-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cart-preview-count {
  font-size: 13px;
  color: #333;
}
.cart-preview-count b {
  color: #ff6034;
  font-weight: 700;
}
.cart-preview-names {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}
.cart-preview-btn {
  flex-shrink: 0;
  height: 36px;
  padding: 0 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff6034, #ff8a5c);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
  box-shadow: 0 3px 10px rgba(255, 96, 52, 0.3);
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
