<template>
  <div class="cart-page">
    <template v-if="cartList.length">
      <!-- 购物车列表 -->
      <div class="cart-list">
        <div class="cart-item" v-for="item in cartList" :key="item.id">
          <img :src="item.thumbImg" :alt="item.name" class="item-img" @error="onImgError" />
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-actions">
              <van-stepper
                :value="item.num"
                min="1"
                max="99"
                @change="val => onNumChange(item.id, val)"
              />
              <van-button
                size="mini"
                plain
                type="danger"
                icon="delete"
                @click="delItem(item.id)"
              >
                删除
              </van-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 批量操作 -->
      <div class="batch-bar">
        <van-button size="small" plain @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </van-button>
        <van-button size="small" plain type="danger" @click="confirmClear">
          清空购物车
        </van-button>
      </div>
      <!-- 祖福语输入 -->
      <div class="message-section">
        <div class="message-label">
          <van-icon name="edit" color="#ff6034" /> 添加留言 / 祖福语
        </div>
        <div class="message-quick">
          <span
            v-for="(msg, idx) in quickMessages"
            :key="idx"
            class="quick-tag"
            :class="{ active: customMessage === msg }"
            @click="selectQuickMsg(msg)"
          >{{ msg }}</span>
        </div>
        <div class="message-input-wrap">
          <input
            v-model="customMessage"
            class="message-input"
            placeholder="输入自定义祖福语..."
            maxlength="30"
          />
          <span class="message-count">{{ customMessage.length }}/30</span>
        </div>
      </div>
      <!-- 提交按钮 -->
      <div class="submit-bar">
        <van-button
          type="danger"
          round
          block
          size="large"
          icon="orders-o"
          @click="generateList"
        >
          {{ isTakeaway ? '生成外卖清单 · 分享给 TA' : '生成今日菜单 · 分享给会做饭的 TA' }}
        </van-button>
      </div>
    </template>
    <!-- 空状态 -->
    <EmptyState v-else icon="shopping-cart" text="购物车空空如也">
      <van-button type="danger" round size="small" style="margin-top: 16px" @click="$router.push('/menu')">
        {{ isTakeaway ? '去点外卖' : '去选菜' }}
      </van-button>
    </EmptyState>

    <!-- 清单预览弹窗 -->
    <van-overlay :show="showPreview" @click="showPreview = false" z-index="999">
      <div class="preview-modal" @click.stop>
        <h3 class="preview-title">{{ isTakeaway ? '杭州外卖清单预览' : '今日菜单预览' }}</h3>
        <div class="preview-img-wrap">
          <img :src="previewImg" class="preview-img" />
        </div>
        <div class="preview-tip">
          <span class="tip-hand">👆</span> 长按上方图片 · 保存到相册或分享给 TA
        </div>
        <div class="preview-actions">
          <van-button type="danger" round block icon="share-o" @click="shareOrSaveImage">
            分享给会做饭的 TA
          </van-button>
          <van-button plain round block style="margin-top: 10px" @click="showPreview = false">
            关闭
          </van-button>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import { Stepper, Button, Dialog, Toast, Overlay, Icon } from 'vant'
import QRCode from 'qrcode'
import EmptyState from '../components/EmptyState.vue'

export default {
  name: 'Cart',
  components: {
    [Stepper.name]: Stepper,
    [Button.name]: Button,
    [Overlay.name]: Overlay,
    [Icon.name]: Icon,
    EmptyState
  },
  data() {
    return {
      allSelected: true,
      showPreview: false,
      previewImg: '',
      customMessage: '',
      quickMessages: [
        '今天辛苦了，好好吃饭😋',
        '爱你，记得好好吃饭❤️',
        '合家欢吃，开开心心🎉',
        '祝你用餐愉快🌟'
      ]
    }
  },
  computed: {
    cartList() {
      return this.$store.state.cartList
    },
    isTakeaway() {
      return this.$store.state.appMode === 'takeaway'
    },
    shareTitle() {
      return this.isTakeaway ? '杭州外卖清单' : '今日午餐菜单'
    },
    fileName() {
      return this.isTakeaway ? '杭州外卖清单.png' : '今日菜单.png'
    }
  },
  methods: {
    onImgError(e) {
      e.target.src = '/img/default-food.svg'
    },
    onNumChange(id, val) {
      this.$store.commit('changeCartNum', { id, num: val })
    },
    delItem(id) {
      Dialog.confirm({ title: '提示', message: '确定删除该菜品吗？' })
        .then(() => {
          this.$store.commit('delCartItem', id)
          Toast.success('已删除')
        })
        .catch(() => {})
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.$store.commit('clearCart')
        Toast('购物车已清空')
      }
      this.allSelected = !this.allSelected
    },
    confirmClear() {
      Dialog.confirm({ title: '提示', message: '确定清空全部购物车吗？' })
        .then(() => {
          this.$store.commit('clearCart')
          Toast.success('已清空')
        })
        .catch(() => {})
    },
    selectQuickMsg(msg) {
      this.customMessage = this.customMessage === msg ? '' : msg
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    },
    async generateList() {
      if (!this.cartList.length) {
        Toast('购物车为空，请先添加菜品')
        return
      }
      // 生成二维码（扫码跳转到站点）
      const siteUrl = 'https://www.whateat.online'
      let qrImg = null
      try {
        const qrDataUrl = await QRCode.toDataURL(siteUrl, {
          margin: 1,
          width: 160,
          color: { dark: '#333333', light: '#ffffff' }
        })
        qrImg = await this.loadImage(qrDataUrl)
      } catch (e) {
        qrImg = null
      }
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      const W = 375
      const margin = 16
      const cardX = margin
      const cardW = W - margin * 2
      const headerH = 96
      const rowH = 44
      const listTop = margin + headerH + 6
      const listH = this.cartList.length * rowH
      const totalBarH = 46
      const hasMsg = this.customMessage.trim().length > 0
      const msgH = hasMsg ? 64 : 0
      const footerH = 120
      const H = listTop + listH + totalBarH + msgH + footerH + margin

      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.scale(dpr, dpr)

      // 圆角矩形辅助函数
      const rr = (x, y, w, h, r) => {
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + w, y, x + w, y + h, r)
        ctx.arcTo(x + w, y + h, x, y + h, r)
        ctx.arcTo(x, y + h, x, y, r)
        ctx.arcTo(x, y, x + w, y, r)
        ctx.closePath()
      }

      const now = new Date()
      const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`
      const totalCount = this.cartList.reduce((s, i) => s + i.num, 0)

      // 背景渐变
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#fff3ec')
      bg.addColorStop(1, '#ffe9df')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // 主卡片（白底圆角 + 阴影）
      rr(cardX, margin, cardW, H - margin * 2, 18)
      ctx.save()
      ctx.shadowColor = 'rgba(255,96,52,0.18)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 6
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.restore()

      // 头部橙色渐变（裁剪为卡片上圆角）
      ctx.save()
      rr(cardX, margin, cardW, H - margin * 2, 18)
      ctx.clip()
      const hg = ctx.createLinearGradient(cardX, margin, cardX + cardW, margin + headerH)
      hg.addColorStop(0, '#ff6a3d')
      hg.addColorStop(1, '#ff9a52')
      ctx.fillStyle = hg
      ctx.fillRect(cardX, margin, cardW, headerH)
      ctx.restore()

      // 标题（带柔和阴影）
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.12)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 1
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 21px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.isTakeaway ? '🛵 杭州外卖清单' : '🍱 今日午餐菜单', W / 2, margin + 40)
      ctx.restore()
      // 副标题胶囊
      const subText = `${dateStr}   共 ${totalCount} 份`
      ctx.font = '12px sans-serif'
      const subW = ctx.measureText(subText).width + 26
      const subX = W / 2 - subW / 2
      const subY = margin + 56
      rr(subX, subY, subW, 22, 11)
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(subText, W / 2, subY + 12)
      ctx.textBaseline = 'alphabetic'

      // 菜品列表
      this.cartList.forEach((item, idx) => {
        const y = listTop + idx * rowH
        const cy = y + rowH / 2
        // 交替行背景
        if (idx % 2 === 1) {
          ctx.fillStyle = '#fafafa'
          ctx.fillRect(cardX + 1, y, cardW - 2, rowH)
        }
        // 序号圆点
        ctx.beginPath()
        ctx.arc(cardX + 28, cy, 11, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6a3d'
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(idx + 1), cardX + 28, cy + 1)
        // 菜名
        ctx.textAlign = 'left'
        ctx.fillStyle = '#333'
        ctx.font = '15px sans-serif'
        ctx.fillText(item.name, cardX + 48, cy)
        // 数量胶囊标签
        const qtyText = '× ' + item.num
        ctx.font = 'bold 13px sans-serif'
        const tw = ctx.measureText(qtyText).width
        const pillW = tw + 20
        const pillH = 22
        const pillX = cardX + cardW - 16 - pillW
        const pillY = cy - pillH / 2
        rr(pillX, pillY, pillW, pillH, 11)
        ctx.fillStyle = '#fff0eb'
        ctx.fill()
        ctx.fillStyle = '#ff6a3d'
        ctx.textAlign = 'center'
        ctx.fillText(qtyText, pillX + pillW / 2, cy)
        ctx.textBaseline = 'alphabetic'
      })

      // 合计条
      const totalY = listTop + listH
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cardX + 16, totalY + 2)
      ctx.lineTo(cardX + cardW - 16, totalY + 2)
      ctx.stroke()
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999'
      ctx.textAlign = 'left'
      ctx.fillText('合计', cardX + 20, totalY + 30)
      ctx.font = 'bold 15px sans-serif'
      ctx.fillStyle = '#ff6a3d'
      ctx.textAlign = 'right'
      ctx.fillText(`${totalCount} 份`, cardX + cardW - 20, totalY + 30)

      // 祝福语
      if (hasMsg) {
        const my = totalY + totalBarH
        const boxX = cardX + 16
        const boxW = cardW - 32
        rr(boxX, my, boxW, 44, 12)
        ctx.fillStyle = '#fff6f1'
        ctx.fill()
        // 左侧橙色装饰竖条
        rr(boxX, my + 8, 4, 28, 2)
        ctx.fillStyle = '#ff8a5c'
        ctx.fill()
        // 左上引号装饰
        ctx.fillStyle = '#ffcbb3'
        ctx.font = 'bold 26px Georgia, serif'
        ctx.textAlign = 'left'
        ctx.fillText('“', boxX + 16, my + 30)
        // 祝福语文字（斜体）
        ctx.fillStyle = '#e85d20'
        ctx.font = 'italic 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(this.customMessage.trim(), W / 2, my + 28)
      }

      // ===== 底部区域 =====
      const fTop = totalY + totalBarH + msgH
      // 装饰点 + 温暖文案
      ctx.fillStyle = '#ffd9c8'
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.arc(W / 2 + i * 10, fTop + 10, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#cba99b'
      ctx.textAlign = 'center'
      ctx.fillText('♡  记得分享给会做饭的 TA 哦  ♡', W / 2, fTop + 26)

      // 二维码 + 说明（水平居中）
      const QR = 64
      const line1 = '扫码发现更多'
      const line2 = '家常菜谱等你做'
      ctx.font = 'bold 14px sans-serif'
      const t1w = ctx.measureText(line1).width
      ctx.font = '12px sans-serif'
      const t2w = ctx.measureText(line2).width
      const textW = Math.max(t1w, t2w)
      const blockW = QR + 14 + textW
      const bx = (W - blockW) / 2
      const qy = fTop + 40
      if (qrImg) {
        // 二维码白底圆角衬底
        rr(bx - 4, qy - 4, QR + 8, QR + 8, 8)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = '#f0e4dd'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.drawImage(qrImg, bx, qy, QR, QR)
      }
      // 右侧说明文字
      const tx = bx + QR + 14
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ff6a3d'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(line1, tx, qy + 26)
      ctx.fillStyle = '#999'
      ctx.font = '12px sans-serif'
      ctx.fillText(line2, tx, qy + 46)

      const base64 = canvas.toDataURL('image/png')
      this.previewImg = base64
      this.showPreview = true
      // 内容签名（菜品+份数+祝福语），用于去重，同一份菜单不重复记录
      const sign = this.cartList.map(i => `${i.id}x${i.num}`).join('|') + '#' + this.customMessage.trim()
      this.$store.commit('saveHistoryImg', { img: base64, sign })
    },
    async shareOrSaveImage() {
      try {
        const blob = await (await fetch(this.previewImg)).blob()
        const file = new File([blob], this.fileName, { type: blob.type })
        // 优先系统分享（移动端可直接分享到微信/保存相册）
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: this.shareTitle })
          return
        }
        // 微信等内置浏览器不支持下载，引导长按图片
        const isWechat = /micromessenger/i.test(navigator.userAgent)
        if (isWechat) {
          Toast({
            message: '请长按上方图片，保存到相册或分享给 TA',
            duration: 2500
          })
          return
        }
        // 非微信环境降级为下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        Toast.success('图片已开始下载')
      } catch (e) {
        if (e && e.name === 'AbortError') return // 用户取消分享
        Toast({
          message: '请长按上方图片保存到相册',
          duration: 2500
        })
      }
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 12px 140px;
}
.cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cart-item {
  display: flex;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  gap: 12px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.item-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.batch-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
  padding: 0 4px;
}
.submit-bar {
  position: fixed;
  bottom: 60px;
  left: 12px;
  right: 12px;
  z-index: 50;
}
.preview-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.18);
}
.preview-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  text-align: center;
}
.preview-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 12px 0;
  font-size: 13px;
  font-weight: 500;
  color: #ff6034;
  background: linear-gradient(135deg, #fff0e8, #ffe4d6);
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px dashed #ffb995;
}
.tip-hand {
  display: inline-block;
  font-size: 15px;
  animation: tip-bounce 1.2s ease-in-out infinite;
}
@keyframes tip-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.preview-img-wrap {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  display: block;
}
.preview-actions {
  margin-top: 16px;
}

/* 祖福语区域 */
.message-section {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-top: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.message-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.message-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.quick-tag {
  display: inline-block;
  padding: 6px 12px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}
.quick-tag.active {
  color: #ff6034;
  background: #fff4f0;
  border-color: #ff6034;
  font-weight: 500;
}
.quick-tag:active {
  transform: scale(0.95);
}
.message-input-wrap {
  position: relative;
}
.message-input {
  width: 100%;
  height: 38px;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 0 50px 0 14px;
  font-size: 13px;
  color: #333;
  outline: none;
  background: #fafafa;
  transition: border-color 0.2s;
}
.message-input:focus {
  border-color: #ff6034;
  background: #fff;
}
.message-input::placeholder {
  color: #ccc;
}
.message-count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #ccc;
}
</style>
