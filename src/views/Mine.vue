<template>
  <div class="mine-page">
    <!-- 历史采购清单 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title-inline">历史采购清单</h3>
        <span
          v-if="historyList.length"
          class="clear-all-btn"
          @click="clearAllHistory"
        >
          <van-icon name="delete-o" /> 一键清空
        </span>
      </div>
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

    <!-- 使用说明 -->
    <div class="section tip-section">
      <van-icon name="info-o" color="#ff6034" size="18" />
      <p class="tip-text">
        生成清单后会自动保存到此处。可点击图片查看大图，长按保存或分享给会做饭的 TA
      </p>
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
  name: 'Mine',
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
.mine-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 16px 12px 80px;
}
.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}
.section-title-inline {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  color: #ff6034;
  padding: 4px 10px;
  border-radius: 14px;
  background: #fff4f0;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-all-btn:active {
  transform: scale(0.94);
  background: #ffe4d9;
}
.history-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
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
  padding: 8px 10px;
  background: #fafafa;
}
.history-time {
  font-size: 12px;
  color: #999;
}
.tip-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fff9f5;
  border: 1px solid #ffe0c8;
}
.tip-text {
  font-size: 13px;
  color: #8a5a2f;
  line-height: 1.6;
  margin: 0;
  flex: 1;
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
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
</style>
