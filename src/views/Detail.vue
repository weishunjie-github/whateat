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
    </div>
    <!-- 做菜步骤 -->
    <div class="step-section">
      <h3 class="section-title">
        <van-icon name="label-o" /> 做菜步骤
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
      <div class="stepper-wrap">
        <van-stepper v-model="num" min="1" max="99" />
      </div>
      <van-button
        type="danger"
        round
        class="add-cart-btn"
        @click="addToCart"
      >
        加入购物车
      </van-button>
    </div>
  </div>
</template>

<script>
import { Tag, Stepper, Button, Icon, Toast } from 'vant'
import { dishes } from '../data/dishes'

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
    steps() {
      return this.dish.cookStep ? this.dish.cookStep.split('\n') : []
    }
  },
  created() {
    const id = parseInt(this.$route.params.id)
    this.dish = dishes.find(d => d.id === id) || {}
  },
  methods: {
    onImgError(e) {
      e.target.src = '/img/default-food.svg'
    },
    addToCart() {
      this.$store.commit('addCart', { ...this.dish, num: this.num })
      Toast.success({ message: `已加入 ${this.num} 份`, duration: 1200 })
      this.num = 1
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
