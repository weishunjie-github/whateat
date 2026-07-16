<template>
  <div class="random-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-title">{{ isTakeaway ? `🛵 ${cityName}随机选店` : '🎲 随机选菜' }}</div>
      <div class="header-desc">{{ isTakeaway ? '中午点哪家外卖，交给天意' : '让选择困难症不再困难' }}</div>
    </div>

    <!-- 快捷模式（仅午餐模式） -->
    <div class="mode-section" v-if="!isTakeaway">
      <div class="section-title">快捷模式</div>
      <div class="mode-cards">
        <div
          class="mode-card"
          :class="{ active: currentMode === 'fourOneSoup' }"
          @click="selectMode('fourOneSoup')"
        >
          <div class="mode-icon">🍲</div>
          <div class="mode-name">四菜一汤</div>
          <div class="mode-desc">3荤1素 + 1汤</div>
        </div>
        <div
          class="mode-card"
          :class="{ active: currentMode === 'oneMeatTwoVeg' }"
          @click="selectMode('oneMeatTwoVeg')"
        >
          <div class="mode-icon">🥗</div>
          <div class="mode-name">一荤两素</div>
          <div class="mode-desc">轻食搭配</div>
        </div>
        <div
          class="mode-card"
          :class="{ active: currentMode === 'custom' }"
          @click="selectMode('custom')"
        >
          <div class="mode-icon">✨</div>
          <div class="mode-name">自定义</div>
          <div class="mode-desc">随心搭配</div>
        </div>
      </div>
    </div>

    <!-- 自定义配置区（仅午餐模式） -->
    <transition name="fade">
      <div class="custom-section" v-if="currentMode === 'custom' && !isTakeaway">
        <div class="section-title">自定义搭配</div>
        <div class="custom-row" v-for="(item, idx) in customConfig" :key="idx">
          <div class="custom-label">{{ item.label }}</div>
          <div class="custom-stepper">
            <span class="stepper-btn" @click="changeNum(idx, -1)">−</span>
            <span class="stepper-val">{{ item.num }}</span>
            <span class="stepper-btn" @click="changeNum(idx, 1)">+</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 随机按钮 -->
    <div class="roll-section">
      <div class="roll-btn" :class="{ rolling: isRolling }" @click="rollDishes">
        <span v-if="!isRolling">{{ isTakeaway ? '🎰 随机选一家店' : '🎰 开始随机' }}</span>
        <span v-else>{{ isTakeaway ? '🎲 选店中...' : '🎲 选菜中...' }}</span>
      </div>
    </div>

    <!-- 结果展示 -->
    <transition name="slide-up">
      <div class="result-section" v-if="resultList.length">
        <div class="section-title">{{ isTakeaway ? '今天点这家' : '今日菜单' }}</div>
        <div class="result-list">
          <div
            class="result-item"
            v-for="dish in resultList"
            :key="dish.id"
            @click="$router.push('/detail/' + dish.id)"
          >
            <img :src="dish.thumbImg" :alt="dish.name" class="result-img" @error="onImgError" />
            <div class="result-info">
              <div class="result-name">{{ dish.name }}</div>
              <van-tag size="medium" :color="tagColor(dish.category)">{{ dish.category }}</van-tag>
              <div v-if="isTakeaway" class="result-shop-meta">
                <span>¥{{ dish.perPerson }}/人</span>
                <span>{{ dish.deliveryTime }}</span>
                <span>⭐ {{ dish.rating }}</span>
              </div>
            </div>
            <div class="result-add" @click.stop="addToCart(dish)">
              <span>+</span>
            </div>
          </div>
        </div>
        <!-- 操作按钮 -->
        <div class="result-actions">
          <div class="action-btn primary" @click="addAllToCart">
            {{ isTakeaway ? '📝 加入清单' : '🛒 全部加入购物车' }}
          </div>
          <div class="action-btn" @click="rollDishes">
            {{ isTakeaway ? '🔄 换一家' : '🔄 换一批' }}
          </div>
        </div>
      </div>
    </transition>
    <BackToTop />
  </div>
</template>

<script>
import { Tag, Toast } from 'vant'
import { dishes, takeawayDishes, shanghaiDishes, guangzhouDishes } from '../data/dishes'
import BackToTop from '../components/BackToTop.vue'

const CITY_NAME_MAP = {
  hangzhou: '杭州',
  shanghai: '上海',
  guangzhou: '广州'
}
const CITY_DISHES_MAP = {
  hangzhou: takeawayDishes,
  shanghai: shanghaiDishes,
  guangzhou: guangzhouDishes
}

export default {
  name: 'RandomSelect',
  components: {
    [Tag.name]: Tag,
    BackToTop
  },
  data() {
    return {
      currentMode: 'fourOneSoup',
      isRolling: false,
      resultList: []
    }
  },
  computed: {
    appMode() {
      return this.$store.state.appMode
    },
    isTakeaway() {
      return this.appMode === 'takeaway'
    },
    currentCity() {
      return this.$store.state.city
    },
    cityName() {
      return CITY_NAME_MAP[this.currentCity] || ''
    },
    allDishes() {
      if (!this.isTakeaway) return dishes
      return CITY_DISHES_MAP[this.currentCity] || takeawayDishes
    },
    customConfig() {
      if (this.isTakeaway) {
        return [
          { label: '中式快餐', category: '中式快餐', num: 1 },
          { label: '面食小吃', category: '面食小吃', num: 0 },
          { label: '烧烤夜宵', category: '烧烤夜宵', num: 0 },
          { label: '奶茶甜品', category: '奶茶甜品', num: 0 },
          { label: '咖啡轻食', category: '咖啡轻食', num: 0 },
          { label: '日韩料理', category: '日韩料理', num: 0 },
          { label: '火锅串串', category: '火锅串串', num: 0 },
          { label: '川湘赣菜', category: '川湘赣菜', num: 0 },
          { label: '粥粉汤饭', category: '粥粉汤饭', num: 0 },
          { label: '烘焙甜品', category: '烘焙甜品', num: 0 },
          { label: '水果切', category: '水果切', num: 0 }
        ]
      }
      return [
        { label: '中餐炒菜（荤）', category: '中餐炒菜', num: 2 },
        { label: '蔬菜（素）', category: '蔬菜', num: 1 },
        { label: '汤', category: '汤', num: 1 },
        { label: '烘焙', category: '烘焙', num: 0 }
      ]
    }
  },
  methods: {
    onImgError(e) {
      e.target.src = '/img/default-food.svg'
    },
    selectMode(mode) {
      this.currentMode = mode
      this.resultList = []
    },
    changeNum(idx, delta) {
      const item = this.customConfig[idx]
      const newVal = item.num + delta
      if (newVal >= 0 && newVal <= 10) {
        this.$set(this.customConfig, idx, { ...item, num: newVal })
      }
    },
    tagColor(category) {
      const map = this.isTakeaway
        ? {
            '中式快餐': '#ff6034',
            '面食小吃': '#ff9800',
            '烧烤夜宵': '#e91e63',
            '奶茶甜品': '#9c27b0',
            '咖啡轻食': '#4caf50',
            '日韩料理': '#2196f3',
            '火锅串串': '#f44336',
            '川湘赣菜': '#ff5722',
            '粥粉汤饭': '#00bcd4',
            '烘焙甜品': '#795548',
            '水果切': '#8bc34a'
          }
        : {
            '中餐炒菜': '#ff6034',
            '蔬菜': '#4caf50',
            '汤': '#2196f3',
            '烘焙': '#ff9800'
          }
      return map[category] || '#999'
    },
    getRandomItems(arr, count) {
      const shuffled = [...arr].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, Math.min(count, arr.length))
    },
    rollDishes() {
      if (this.isRolling) return
      this.isRolling = true
      this.resultList = []

      setTimeout(() => {
        let result = []

        if (this.isTakeaway) {
          // 外卖模式：直接随机选一家店
          const pool = this.allDishes.length > 0 ? this.allDishes : takeawayDishes
          result = this.getRandomItems(pool, 1)
        } else if (this.currentMode === 'fourOneSoup') {
          // 四菜一汤：3荤 + 1素 + 1汤（午餐模式）
          const meat = this.allDishes.filter(d => d.category === '中餐炒菜')
          const veg = this.allDishes.filter(d => d.category === '蔬菜')
          const soup = this.allDishes.filter(d => d.category === '汤')
          result = [
            ...this.getRandomItems(meat, 3),
            ...this.getRandomItems(veg, 1),
            ...this.getRandomItems(soup, 1)
          ]
        } else if (this.currentMode === 'oneMeatTwoVeg') {
          // 一荤两素
          const meat = this.allDishes.filter(d => d.category === '中餐炒菜')
          const veg = this.allDishes.filter(d => d.category === '蔬菜')
          result = [
            ...this.getRandomItems(meat, 1),
            ...this.getRandomItems(veg, 2)
          ]
        } else {
          // 自定义模式
          this.customConfig.forEach(cfg => {
            if (cfg.num > 0) {
              const pool = this.allDishes.filter(d => d.category === cfg.category)
              result.push(...this.getRandomItems(pool, cfg.num))
            }
          })
        }

        if (result.length === 0) {
          Toast('请至少选择一个分类数量')
          this.isRolling = false
          return
        }

        this.resultList = result
        this.isRolling = false
      }, 800)
    },
    addToCart(dish) {
      this.$store.commit('addCart', { ...dish, num: 1 })
      const msg = this.isTakeaway ? `${dish.name} 已加入清单` : `${dish.name} 已加入`
      Toast.success({ message: msg, duration: 1000 })
    },
    addAllToCart() {
      this.resultList.forEach(dish => {
        this.$store.commit('addCart', { ...dish, num: 1 })
      })
      const msg = this.isTakeaway ? '已加入外卖清单' : '已全部加入购物车'
      Toast.success({ message: msg, duration: 1200 })
    }
  }
}
</script>

<style scoped>
.random-page {
  min-height: 100vh;
  background: #f7f7f7;
  padding: 0 14px 80px;
}

/* 顶部 */
.page-header {
  padding: 24px 0 16px;
  text-align: center;
}
.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
.header-desc {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 模式卡片 */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 2px;
}
.mode-cards {
  display: flex;
  gap: 10px;
}
.mode-card {
  flex: 1;
  background: #fff;
  border-radius: 14px;
  padding: 16px 10px;
  text-align: center;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.25s;
  cursor: pointer;
}
.mode-card.active {
  border-color: #ff6034;
  background: #fff8f5;
  box-shadow: 0 4px 16px rgba(255,96,52,0.15);
}
.mode-card:active {
  transform: scale(0.96);
}
.mode-icon {
  font-size: 28px;
  margin-bottom: 6px;
}
.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.mode-desc {
  font-size: 11px;
  color: #999;
  margin-top: 3px;
}

/* 自定义配置 */
.custom-section {
  margin-top: 18px;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.custom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.custom-row:last-child {
  border-bottom: none;
}
.custom-label {
  font-size: 14px;
  color: #333;
}
.custom-stepper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stepper-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.stepper-btn:active {
  background: #ff6034;
  color: #fff;
  transform: scale(0.9);
}
.stepper-val {
  font-size: 16px;
  font-weight: 600;
  color: #ff6034;
  min-width: 20px;
  text-align: center;
}

/* 随机按钮 */
.roll-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
.roll-btn {
  width: 200px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ff6034, #ff8a65);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(255,96,52,0.35);
  cursor: pointer;
  transition: all 0.3s;
}
.roll-btn:active {
  transform: scale(0.95);
}
.roll-btn.rolling {
  animation: shake 0.5s infinite;
  opacity: 0.8;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-2deg); }
  75% { transform: translateX(4px) rotate(2deg); }
}

/* 结果区 */
.result-section {
  margin-top: 24px;
}
.result-list {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.result-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  transition: background 0.2s;
}
.result-item:last-child {
  border-bottom: none;
}
.result-item:active {
  background: #fef5f2;
}
.result-img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.result-info {
  flex: 1;
  margin-left: 12px;
}
.result-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}
.result-shop-meta {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.result-add {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6034, #ff8a65);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255,96,52,0.3);
  flex-shrink: 0;
  transition: transform 0.2s;
}
.result-add:active {
  transform: scale(0.85);
}

/* 操作按钮 */
.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.action-btn {
  flex: 1;
  height: 42px;
  border-radius: 21px;
  background: #fff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:active {
  transform: scale(0.96);
}
.action-btn.primary {
  background: linear-gradient(135deg, #ff6034, #ff8a65);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(255,96,52,0.25);
}

/* 动画 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-leave-active {
  transition: all 0.2s;
}
.slide-up-enter, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
