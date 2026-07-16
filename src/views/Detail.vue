<template>
  <div class="detail-page">
    <!-- 大图 -->
    <div class="detail-img-wrap">
      <img :src="dish.detailImg" :alt="dish.name" class="detail-img" @error="onImgError" />
      <div class="img-overlay"></div>
    </div>
    <!-- 基础信息 -->
    <div class="info-section">
      <h1 class="dish-name">{{ dish.name }}</h1>
      <van-tag type="primary" color="#ff6034" size="large">{{ dish.category }}</van-tag>
      <p class="dish-intro">{{ dish.intro }}</p>
      <div v-if="isTakeaway" class="shop-info-bar">
        <div class="shop-info-item">
          <span class="shop-info-value">¥{{ dish.perPerson }}</span>
          <span class="shop-info-label">人均</span>
        </div>
        <div class="shop-info-item">
          <span class="shop-info-value">{{ dish.deliveryTime }}</span>
          <span class="shop-info-label">配送</span>
        </div>
        <div class="shop-info-item">
          <span class="shop-info-value">{{ dish.rating }}</span>
          <span class="shop-info-label">评分</span>
        </div>
      </div>
      <div v-if="isTakeaway && dish.signature" class="signature">{{ dish.signature }}</div>
    </div>
    <!-- 详情/步骤 -->
    <div class="step-section">
      <h3 class="section-title">
        <van-icon :name="isTakeaway ? 'shop-o' : 'label-o'" /> {{ isTakeaway ? '推荐理由' : '做菜步骤' }}
      </h3>
      <div class="steps">
        <p v-for="(step, idx) in steps" :key="idx" class="step-item">{{ step }}</p>
      </div>
    </div>
    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <van-button
        plain
        type="default"
        round
        icon="arrow-left"
        class="back-btn"
        @click="$router.back()"
      >
        返回
      </van-button>
      <div v-if="!isTakeaway" class="stepper-wrap">
        <van-stepper v-model="num" min="1" max="99" />
      </div>
      <van-button
        type="danger"
        round
        class="add-cart-btn"
        @click="addToCart"
      >
        {{ isTakeaway ? '加入清单' : '加入购物车' }}
      </van-button>
    </div>
  </div>
</template>

<script>
import { Tag, Stepper, Button, Icon, Toast } from 'vant'
import { dishes, takeawayDishes, shanghaiDishes, guangzhouDishes } from '../data/dishes'

const CITY_DISHES_MAP = {
  hangzhou: takeawayDishes,
  shanghai: shanghaiDishes,
  guangzhou: guangzhouDishes
}

export default {
  name: 'Detail',
  components: {
    [Tag.name]: Tag,
    [Stepper.name]: Stepper,
    [Button.name]: Button,
    [Icon.name]: Icon
  },
  data() {
    return {
      dish: {},
      num: 1
    }
  },
  computed: {
    isTakeaway() {
      return this.$store.state.appMode === 'takeaway'
    },
    steps() {
      return this.dish.cookStep ? this.dish.cookStep.split('\n') : []
    }
  },
  created() {
    const id = parseInt(this.$route.params.id)
    const list = this.isTakeaway
      ? (CITY_DISHES_MAP[this.$store.state.city] || takeawayDishes)
      : dishes
    this.dish = list.find(d => d.id === id) || {}
  },
  methods: {
    onImgError(e) {
      e.target.src = '/img/default-food.svg'
    },
    addToCart() {
      const num = this.isTakeaway ? 1 : this.num
      this.$store.commit('addCart', { ...this.dish, num })
      Toast.success({ message: this.isTakeaway ? '已加入清单' : `已加入 ${num} 份`, duration: 1200 })
      if (!this.isTakeaway) this.num = 1
    }
  }
}
</script>

<style scoped>
.detail-page {
  background: #fff;
  padding-bottom: 80px;
}
.detail-img-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}
.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
}
.info-section {
  padding: 16px 16px 0;
}
.dish-name {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px;
}
.dish-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 12px 0 0;
}
.shop-info-bar {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff8f0, #fff);
  border-radius: 10px;
  border: 1px solid #ffe8d6;
}
.shop-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.shop-info-value {
  font-size: 18px;
  font-weight: 700;
  color: #ff6034;
}
.shop-info-label {
  font-size: 12px;
  color: #999;
}
.signature {
  margin-top: 14px;
  padding: 10px 14px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  font-size: 13px;
  color: #389e0d;
  line-height: 1.5;
}
.step-section {
  padding: 20px 16px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.steps {
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
}
.step-item {
  font-size: 14px;
  color: #555;
  line-height: 2;
  margin: 0;
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}
.back-btn {
  flex-shrink: 0;
}
.stepper-wrap {
  flex-shrink: 0;
}
.add-cart-btn {
  flex: 1;
  min-width: 0;
}
</style>
