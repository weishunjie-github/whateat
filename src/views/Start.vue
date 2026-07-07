<template>
  <div class="start-page" :class="{ 'loaded': loaded }">
    <!-- 背景图 -->
    <div class="bg-img"></div>
    <!-- 渐变遮罩 -->
    <div class="overlay"></div>
    <!-- 内容 -->
    <div class="content">
      <h1 class="title">{{ weekTitle }}</h1>
      <p class="subtitle">精选家常菜谱，一键生成买菜清单</p>
      <van-button
        type="danger"
        round
        size="large"
        class="start-btn"
        @click="goMenu"
      >
        开始挑选菜品
      </van-button>
    </div>
  </div>
</template>

<script>
import { Button } from 'vant'

const WEEK_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default {
  name: 'Start',
  components: {
    [Button.name]: Button
  },
  data() {
    return {
      loaded: false,
      weekTitle: ''
    }
  },
  created() {
    const d = new Date()
    const day = WEEK_MAP[d.getDay()]
    this.weekTitle = `今天${day}，不知道中午吃啥？`
  },
  mounted() {
    setTimeout(() => { this.loaded = true }, 100)
  },
  methods: {
    goMenu() {
      this.$router.push('/menu')
    }
  }
}
</script>

<style scoped>
.start-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.start-page.loaded {
  opacity: 1;
}
.bg-img {
  position: absolute;
  inset: 0;
  background: url('https://picsum.photos/seed/foodbg/800/1400') center/cover no-repeat;
  filter: blur(1px) brightness(0.75);
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.55) 100%
  );
}
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 32px;
  text-align: center;
}
.title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  line-height: 1.4;
}
.subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 48px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.start-btn {
  width: 200px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: transform 0.15s;
}
.start-btn:active {
  transform: scale(0.93);
}
</style>
