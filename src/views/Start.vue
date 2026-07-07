<template>
  <div class="home-page" :class="{ 'loaded': loaded }">
    <!-- 背景 -->
    <div class="bg-img"></div>
    <div class="overlay"></div>

    <!-- 内容 -->
    <div class="content">
      <!-- 问候语 -->
      <p class="greeting">{{ greeting }}</p>

      <!-- 日期卡片 -->
      <div class="date-card">
        <div class="date-main">
          <span class="date-day">{{ dateInfo.day }}</span>
          <span class="date-month">{{ dateInfo.month }}月</span>
        </div>
        <div class="date-sub">
          <span class="date-week">{{ dateInfo.week }}</span>
          <span class="date-year">{{ dateInfo.year }}年</span>
        </div>
      </div>

      <!-- 天气卡片 -->
      <div class="weather-card">
        <template v-if="weather.loaded">
          <span class="weather-icon">{{ weather.icon }}</span>
          <div class="weather-info">
            <span class="weather-temp">{{ weather.temp }}°</span>
            <span class="weather-desc">{{ weather.desc }} · {{ weather.city }}</span>
          </div>
        </template>
        <template v-else-if="weather.failed">
          <span class="weather-icon">🌤️</span>
          <div class="weather-info">
            <span class="weather-desc-only">天气获取失败</span>
          </div>
        </template>
        <template v-else>
          <span class="weather-icon">⏳</span>
          <div class="weather-info">
            <span class="weather-desc-only">天气加载中...</span>
          </div>
        </template>
      </div>

      <!-- 标语 -->
      <h1 class="slogan">{{ slogan }}</h1>
      <p class="subtitle">精选家常菜谱，一键生成今日菜单</p>

      <!-- 进入菜单 -->
      <van-button
        type="danger"
        round
        size="large"
        class="enter-btn"
        @click="goMenu"
      >
        看看今天吃什么 →
      </van-button>
    </div>
  </div>
</template>

<script>
import { Button } from 'vant'

const WEEK_MAP = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// Open-Meteo weather_code 映射（emoji + 中文）
const WEATHER_MAP = {
  0: { icon: '☀️', desc: '晴' },
  1: { icon: '🌤️', desc: '晴间多云' },
  2: { icon: '⛅', desc: '多云' },
  3: { icon: '☁️', desc: '阴' },
  45: { icon: '🌫️', desc: '雾' },
  48: { icon: '🌫️', desc: '雾凇' },
  51: { icon: '🌦️', desc: '小毛毛雨' },
  53: { icon: '🌦️', desc: '毛毛雨' },
  55: { icon: '🌦️', desc: '大毛毛雨' },
  61: { icon: '🌧️', desc: '小雨' },
  63: { icon: '🌧️', desc: '中雨' },
  65: { icon: '🌧️', desc: '大雨' },
  66: { icon: '🌧️', desc: '冻雨' },
  67: { icon: '🌧️', desc: '强冻雨' },
  71: { icon: '🌨️', desc: '小雪' },
  73: { icon: '🌨️', desc: '中雪' },
  75: { icon: '❄️', desc: '大雪' },
  77: { icon: '🌨️', desc: '雪粒' },
  80: { icon: '🌦️', desc: '阵雨' },
  81: { icon: '🌦️', desc: '强阵雨' },
  82: { icon: '⛈️', desc: '暴阵雨' },
  85: { icon: '🌨️', desc: '阵雪' },
  86: { icon: '❄️', desc: '强阵雪' },
  95: { icon: '⛈️', desc: '雷阵雨' },
  96: { icon: '⛈️', desc: '雷阵雨伴冰雹' },
  99: { icon: '⛈️', desc: '强雷阵雨伴冰雹' }
}

export default {
  name: 'Home',
  components: {
    [Button.name]: Button
  },
  data() {
    return {
      loaded: false,
      greeting: '',
      slogan: '',
      dateInfo: { year: '', month: '', day: '', week: '' },
      weather: {
        loaded: false,
        failed: false,
        icon: '',
        temp: '',
        desc: '',
        city: ''
      }
    }
  },
  created() {
    this.initDateAndGreeting()
    this.loadWeather()
  },
  mounted() {
    setTimeout(() => { this.loaded = true }, 100)
  },
  methods: {
    initDateAndGreeting() {
      const d = new Date()
      this.dateInfo = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        week: WEEK_MAP[d.getDay()]
      }
      const h = d.getHours()
      if (h < 6) {
        this.greeting = '夜深了，注意休息 🌙'
        this.slogan = '深夜也要好好吃饭'
      } else if (h < 11) {
        this.greeting = '早上好呀 ☀️'
        this.slogan = '今天中午想吃点什么？'
      } else if (h < 14) {
        this.greeting = '中午好 🍚'
        this.slogan = '到饭点啦，今天吃什么？'
      } else if (h < 18) {
        this.greeting = '下午好 ☕'
        this.slogan = '想好晚上吃什么了吗？'
      } else {
        this.greeting = '晚上好 🌆'
        this.slogan = '今天辛苦了，好好吃顿饭吧'
      }
    },
    loadWeather() {
      // 默认上海坐标，定位失败时兜底
      const fallback = { lat: 31.23, lon: 121.47, city: '上海' }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => this.fetchWeather(pos.coords.latitude, pos.coords.longitude, ''),
          () => this.fetchWeather(fallback.lat, fallback.lon, fallback.city),
          { timeout: 5000 }
        )
      } else {
        this.fetchWeather(fallback.lat, fallback.lon, fallback.city)
      }
    },
    async fetchWeather(lat, lon, city) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        const res = await fetch(url)
        const data = await res.json()
        const code = data.current.weather_code
        const map = WEATHER_MAP[code] || { icon: '🌡️', desc: '未知' }
        this.weather = {
          loaded: true,
          failed: false,
          icon: map.icon,
          temp: Math.round(data.current.temperature_2m),
          desc: map.desc,
          city: city || '当前位置'
        }
      } catch (e) {
        this.weather = { ...this.weather, loaded: false, failed: true }
      }
    },
    goMenu() {
      this.$router.push('/menu')
    }
  }
}
</script>

<style scoped>
.home-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.home-page.loaded {
  opacity: 1;
}
.bg-img {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1400&fit=crop') center/cover no-repeat;
  filter: brightness(0.7);
}
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,96,52,0.25) 0%, rgba(0,0,0,0.65) 100%);
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
.greeting {
  font-size: 16px;
  color: rgba(255,255,255,0.95);
  margin: 0 0 16px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
/* 日期卡片 */
.date-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}
.date-main {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.4);
}
.date-day {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
}
.date-month {
  font-size: 20px;
  font-weight: 600;
}
.date-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 15px;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.date-week {
  font-weight: 600;
}
/* 天气卡片 */
.weather-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 16px;
  padding: 10px 18px;
  margin-bottom: 36px;
}
.weather-icon {
  font-size: 28px;
}
.weather-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.weather-temp {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}
.weather-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.88);
}
.weather-desc-only {
  font-size: 13px;
  color: rgba(255,255,255,0.88);
}
/* 标语 */
.slogan {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  line-height: 1.4;
}
.subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  margin: 0 0 40px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.enter-btn {
  width: 220px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: transform 0.15s;
}
.enter-btn:active {
  transform: scale(0.93);
}
</style>
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
