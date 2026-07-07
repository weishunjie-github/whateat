<template>
  <div class="empty-state">
    <div class="empty-icon">
      <van-icon :name="icon" size="64" color="#c8c9cc" />
    </div>
    <p class="empty-text">{{ text }}</p>
    <slot></slot>
  </div>
</template>

<script>
import { Icon } from 'vant'

export default {
  name: 'EmptyState',
  components: {
    [Icon.name]: Icon
  },
  props: {
    icon: { type: String, default: 'search' },
    text: { type: String, default: '暂无数据' }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.empty-icon {
  margin-bottom: 16px;
}
.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
