<template>
  <div class="history-page">
    <!-- 顶部导航 -->
    <div class="history-header">
      <div class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" />
      </div>
      <div class="history-title">历史菜单</div>
      <div
        v-if="historyList.length"
        class="header-clear"
        @click="clearAllHistory"
      >
        <van-icon name="delete-o" /> 清空
      </div>
      <div v-else class="header-placeholder"></div>
    </div>

    <!-- 历史列表 -->
    <div class="history-content">
      <template v-if="historyList.length">
        <div class="history-grid">
          <div
            class="history-item"
            v-for="(item, idx) in historyList"
            :key="idx"
          >
            <img :src="item.img" class="history-img" @click="viewBigImg(item.img)" />
            <div class="history-meta">
              <span class="history-time">{{ item.time }}</span>
              <van-button
                size="mini"
                plain
                type="danger"
                icon="delete"
                @click="delHistory(idx)"
              />
            </div>
          </div>
        </div>
      </template>
      <EmptyState v-else icon="orders-o" text="暂无历史清单" />
    </div>

    <!-- 大图预览弹窗 -->
    <van-overlay :show="showBig" @click="showBig = false" z-index="999">
      <div class="big-img-wrap" @click.stop>
        <img :src="bigImgSrc" class="big-img" />
        <van-button plain round size="small" style="margin-top: 16px" @click="showBig = false">
          关闭
        </van-button>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import { Button, Dialog, Toast, Overlay, Icon } from 'vant'
import EmptyState from '../components/EmptyState.vue'

export default {
  name: 'History',
  components: {
    [Button.name]: Button,
    [Overlay.name]: Overlay,
    [Icon.name]: Icon,
    EmptyState
  },
  data() {
    return {
      showBig: false,
      bigImgSrc: ''
    }
  },
  computed: {
    historyList() {
      return this.$store.state.historyImgList
    }
  },
  methods: {
    viewBigImg(img) {
      this.bigImgSrc = img
      this.showBig = true
    },
    delHistory(idx) {
      Dialog.confirm({ title: '提示', message: '确定删除此清单记录吗？' })
        .then(() => {
          this.$store.commit('delHistoryImg', idx)
          Toast.success('已删除')
        })
        .catch(() => {})
    },
    clearAllHistory() {
      Dialog.confirm({ title: '提示', message: '确定清空全部历史清单记录吗？' })
        .then(() => {
          this.$store.commit('clearHistoryImg')
          Toast.success('已清空')
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
.history-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
}
.history-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}
.header-clear,
.header-placeholder {
  width: 60px;
  text-align: right;
}
.header-clear {
  font-size: 13px;
  color: #ff6034;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}
.history-content {
  padding: 14px 12px;
}
.history-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.history-img {
  width: 100%;
  display: block;
  cursor: pointer;
}
.history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fafafa;
}
.history-time {
  font-size: 12px;
  color: #999;
}
.big-img-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.big-img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>
