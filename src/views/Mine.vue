<template>
  <div class="mine-page">
    <!-- 用户资料卡片 -->
    <div class="user-card">
      <div class="avatar-wrap">
        <div class="avatar">{{ user.avatar }}</div>
        <div class="level-badge">Lv.{{ levelInfo.level }}</div>
      </div>
      <div class="user-info">
        <div class="nickname">{{ user.nickname || '美食家' }}</div>
        <div class="level-title">{{ levelInfo.title }}</div>
        <div class="level-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: levelInfo.percent + '%' }"></div>
          </div>
          <span class="progress-text">{{ levelInfo.exp }} / {{ levelInfo.nextExp || 'MAX' }} EXP</span>
        </div>
      </div>
      <div class="edit-btn" @click="openEdit">
        <van-icon name="edit" /> 编辑
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-item" @click="$router.push('/history')">
        <div class="menu-left">
          <div class="menu-icon history-icon">
            <van-icon name="orders-o" />
          </div>
          <span class="menu-label">历史菜单</span>
        </div>
        <div class="menu-right">
          <span v-if="historyList.length" class="menu-count">{{ historyList.length }} 条</span>
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
      <div class="menu-item" @click="openEdit">
        <div class="menu-left">
          <div class="menu-icon edit-icon">
            <van-icon name="user-o" />
          </div>
          <span class="menu-label">编辑资料</span>
        </div>
        <div class="menu-right">
          <van-icon name="arrow" class="menu-arrow" />
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="section tip-section">
      <van-icon name="info-o" color="#ff6034" size="18" />
      <p class="tip-text">
        生成清单后会自动保存到历史菜单。可点击图片查看大图，长按保存或分享给 TA
      </p>
    </div>

    <!-- 编辑资料弹窗 -->
    <van-popup
      v-model="showEdit"
      position="bottom"
      round
      closeable
      close-icon-position="top-right"
      :style="{ maxHeight: '70%' }"
      @closed="cancelEdit"
    >
      <div class="edit-popup">
        <div class="edit-title">编辑资料</div>
        <div class="edit-row">
          <label class="edit-label">头像</label>
          <div class="avatar-list">
            <span
              v-for="(icon, idx) in avatarOptions"
              :key="idx"
              class="avatar-option"
              :class="{ active: editForm.avatar === icon }"
              @click="editForm.avatar = icon"
            >{{ icon }}</span>
          </div>
        </div>
        <div class="edit-row">
          <label class="edit-label">昵称</label>
          <input
            v-model="editForm.nickname"
            class="edit-input"
            placeholder="请输入昵称"
            maxlength="12"
          />
        </div>
        <div class="edit-actions">
          <van-button type="danger" round block @click="saveUserInfo">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Button, Popup, Icon, Toast } from 'vant'

const AVATAR_OPTIONS = ['🍔', '🍜', '🍕', '🍣', '🥗', '🍰', '🍱', '🥤']

export default {
  name: 'Mine',
  components: {
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Icon.name]: Icon
  },
  data() {
    return {
      showEdit: false,
      editForm: {
        nickname: '',
        avatar: '🍔'
      },
      avatarOptions: AVATAR_OPTIONS
    }
  },
  computed: {
    user() {
      return this.$store.state.user
    },
    levelInfo() {
      return this.$store.getters.userLevel
    },
    historyList() {
      return this.$store.state.historyImgList
    }
  },
  methods: {
    openEdit() {
      this.editForm = {
        nickname: this.user.nickname,
        avatar: this.user.avatar
      }
      this.showEdit = true
    },
    cancelEdit() {
      this.showEdit = false
    },
    saveUserInfo() {
      const nickname = this.editForm.nickname.trim()
      if (!nickname) {
        Toast('昵称不能为空')
        return
      }
      this.$store.commit('setUserInfo', {
        nickname,
        avatar: this.editForm.avatar
      })
      Toast.success('保存成功')
      this.showEdit = false
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

/* 用户资料卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #ff7a4d, #ff6034);
  border-radius: 16px;
  padding: 20px 16px;
  color: #fff;
  box-shadow: 0 6px 18px rgba(255, 96, 52, 0.25);
  position: relative;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}
.level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #ffd93d;
  color: #7c4a00;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  border: 2px solid #ff6034;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.nickname {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}
.level-title {
  font-size: 13px;
  opacity: 0.95;
  margin-bottom: 8px;
}
.level-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 11px;
  opacity: 0.9;
  flex-shrink: 0;
}
.edit-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn:active {
  background: rgba(255, 255, 255, 0.35);
}

/* 功能菜单 */
.menu-section {
  background: #fff;
  border-radius: 12px;
  margin-top: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-item:active {
  background: #f9f9f9;
}
.menu-item + .menu-item {
  border-top: 1px solid #f5f5f5;
}
.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}
.history-icon {
  background: linear-gradient(135deg, #ff9a52, #ff6034);
}
.edit-icon {
  background: linear-gradient(135deg, #5c9aff, #3b7cff);
}
.menu-label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.menu-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-count {
  font-size: 13px;
  color: #999;
}
.menu-arrow {
  font-size: 16px;
  color: #ccc;
}

/* 使用说明 */
.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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

/* 编辑弹窗 */
.edit-popup {
  padding: 24px 18px 30px;
}
.edit-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}
.edit-row {
  margin-bottom: 20px;
}
.edit-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
}
.avatar-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.avatar-option {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.avatar-option.active {
  border-color: #ff6034;
  background: #fff4f0;
  transform: scale(1.08);
}
.edit-input {
  width: 100%;
  height: 44px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 15px;
  color: #333;
  outline: none;
  background: #fafafa;
  transition: border-color 0.2s;
}
.edit-input:focus {
  border-color: #ff6034;
  background: #fff;
}
.edit-actions {
  margin-top: 28px;
}
</style>
