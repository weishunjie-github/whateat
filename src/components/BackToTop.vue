<template>
  <transition name="fade">
    <div v-show="visible" class="back-to-top" @click="scrollToTop">
      <van-icon name="back-top" />
    </div>
  </transition>
</template>

<script>
import { Icon } from 'vant'

export default {
  name: 'BackToTop',
  components: {
    [Icon.name]: Icon
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    this.scrollTarget = this.getScrollTarget()
    this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeDestroy() {
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener('scroll', this.onScroll)
    }
  },
  methods: {
    getScrollTarget() {
      // 优先使用页面主滚动容器，兜底为 window
      const pageEl = document.querySelector('.router-view') || document.querySelector('#app')
      if (pageEl && pageEl.scrollHeight > pageEl.clientHeight) {
        return pageEl
      }
      return window
    },
    onScroll() {
      const scrollTop = this.scrollTarget === window
        ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
        : this.scrollTarget.scrollTop
      this.visible = scrollTop > 300
    },
    scrollToTop() {
      if (this.scrollTarget === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        this.scrollTarget.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }
}
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 16px;
  bottom: 86px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  color: #ff6034;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  z-index: 88;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}
.back-to-top:active {
  transform: scale(0.9);
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
</style>
