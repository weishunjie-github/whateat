<template>
  <div class="home-page" :class="{ 'loaded': loaded }">
    <!-- 背景 -->
    <div class="bg-img"></div>
    <div class="overlay"></div>

    <!-- 内容 -->
    <div class="content">
      <!-- 模式切换 -->
      <div class="mode-switch">
        <span
          class="mode-tag"
          :class="{ active: appMode === 'lunch' }"
          @click="setMode('lunch')"
        >🍱 今日午餐</span>
        <span
          class="mode-tag"
          :class="{ active: appMode === 'takeaway' }"
          @click="setMode('takeaway')"
        >🛵 {{ cityName }}外卖</span>
      </div>
      <div v-if="isTakeaway" class="city-switch" @click="showCityPicker = true">
        <van-icon name="location-o" /> 外卖城市：{{ cityName }}
      </div>
      <div v-if="isTakeaway" class="city-tip">外卖城市与天气定位相互独立</div>

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
            <span class="weather-desc">{{ weather.desc }} · {{ weather.city }} · 天气定位</span>
          </div>
        </template>
        <template v-else-if="weather.failed">
          <span class="weather-icon">🌤️</span>
          <div class="weather-info" @click="retryWeather">
            <span class="weather-desc-only">天气获取失败，点击重试</span>
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
      <p class="subtitle">{{ isTakeaway ? `精选${cityName}外卖，一键生成点餐清单` : '精选家常菜谱，一键生成今日菜单' }}</p>

      <!-- 进入菜单 -->
      <van-button
        type="danger"
        round
        size="large"
        class="enter-btn"
        @click="goMenu"
      >
        {{ isTakeaway ? `看看${cityName}今天点什么外卖 →` : '看看今天吃什么 →' }}
      </van-button>
    </div>

    <!-- ICP 备案号 -->
    <div class="icp-footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">浙ICP备2026053834号-1</a>
    </div>

    <!-- 城市选择弹窗 -->
    <van-popup v-model="showCityPicker" round position="bottom" :style="{ height: '40%' }">
      <div class="city-picker">
        <div class="city-picker-title">切换城市</div>
        <div class="city-list">
          <div
            v-for="city in cityOptions"
            :key="city.value"
            class="city-item"
            :class="{ active: currentCity === city.value }"
            @click="switchCity(city.value)"
          >
            <span class="city-name">{{ city.label }}</span>
            <van-icon v-if="currentCity === city.value" name="success" class="city-check" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Button, Toast, Popup, Icon } from 'vant'

const WEEK_MAP = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const CITY_OPTIONS = [
  { label: '杭州', value: 'hangzhou' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '苏州', value: 'suzhou' },
  { label: '南京', value: 'nanjing' },
  { label: '宁波', value: 'ningbo' },
  { label: '温州', value: 'wenzhou' },
  { label: '无锡', value: 'wuxi' },
  { label: '绍兴', value: 'shaoxing' },
  { label: '嘉兴', value: 'jiaxing' }
]

// ━━━ 天气服务配置 ━━━
// 主用高德（国内快、有城市名），高德不可用时自动降级 Open-Meteo（国外免Key）

// 高德开放平台 Key（免费申请）：https://console.amap.com → 创建应用 → 添加「Web服务」Key
const AMAP_KEY = '1a2673ad884056e2b573f5ef007be22f'

// 高德天气中文描述 → emoji
function weatherEmoji(text) {
  const t = text || ''
  if (t.includes('雷')) return '⛈️'
  if (t.includes('雪')) return '❄️'
  if (t.includes('雨')) return '🌧️'
  if (t.includes('雾') || t.includes('霾')) return '🌫️'
  if (t.includes('沙') || t.includes('尘') || t.includes('风')) return '💨'
  if (t.includes('阴')) return '☁️'
  if (t.includes('云')) return '⛅'
  if (t.includes('晴')) return '☀️'
  return '🌡️'
}

// Open-Meteo WMO weather_code → emoji + 中文（降级方案用）
const WMO_MAP = {
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
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Icon.name]: Icon
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
      },
      showCityPicker: false,
      cityOptions: CITY_OPTIONS
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
      const map = { hangzhou: '杭州', shanghai: '上海', guangzhou: '广州', suzhou: '苏州', nanjing: '南京', ningbo: '宁波', wenzhou: '温州', wuxi: '无锡', shaoxing: '绍兴', jiaxing: '嘉兴' }
      return map[this.currentCity] || '杭州'
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
      // 主用高德，失败自动降级 Open-Meteo
      console.log('[天气] 开始获取，先尝试高德方案')
      this.fetchWeatherByAmap().catch(err => {
        console.log('[天气] 高德方案失败，降级 Open-Meteo，原因:', err.message)
        this.fetchWeatherByOpenMeteo()
      })
    },
    retryWeather() {
      this.weather = { ...this.weather, loaded: false, failed: false }
      this.loadWeather()
    },
    setWeather(icon, temp, desc, city) {
      this.weather = { loaded: true, failed: false, icon, temp, desc, city: city || '当前位置' }
    },
    markWeatherFailed() {
      this.weather = { ...this.weather, loaded: false, failed: true }
    },
    fetchWithTimeout(url, ms) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), ms)
      return fetch(url, { signal: controller.signal }).then(res => {
        clearTimeout(timer)
        if (!res.ok) throw new Error('http ' + res.status)
        return res
      })
    },
    // ━━━ 方案一：高德（IP 定位 + 实时天气，国内直连）━━━
    async fetchWeatherByAmap() {
      // Key 未配置时直接跳过，走降级
      if (!AMAP_KEY || AMAP_KEY === 'YOUR_AMAP_KEY') throw new Error('no amap key')
      console.log('[天气][高德] 开始请求')
      // 1) IP 定位拿城市 adcode（局域网/无法定位时兜底上海 310000）
      const ipRes = await this.fetchWithTimeout(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`, 8000)
      const ipData = await ipRes.json()
      console.log('[天气][高德] IP定位返回:', ipData.city, ipData.adcode)
      const validAdcode = ipData && ipData.adcode && ipData.adcode !== '[]'
      const adcode = validAdcode ? ipData.adcode : '310000'
      const cityName = (ipData && ipData.city && ipData.city !== '[]') ? ipData.city : '上海'
      // 2) 查实时天气
      const wUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${adcode}&extensions=base`
      const wRes = await this.fetchWithTimeout(wUrl, 8000)
      const wData = await wRes.json()
      console.log('[天气][高德] 天气返回:', wData)
      const live = wData && wData.lives && wData.lives[0]
      if (!live) throw new Error('no weather data')
      this.setWeather(
        weatherEmoji(live.weather),
        Math.round(Number(live.temperature)),
        live.weather || '未知',
        live.city || cityName
      )
      console.log('[天气][高德] 成功:', live.city, live.temperature + '°', live.weather)
    },
    // ━━━ 方案二：Open-Meteo 降级（IP 定位 + 天气，免Key）━━━
    async fetchWeatherByOpenMeteo() {
      const fallback = { lat: 31.23, lon: 121.47, city: '上海' }
      console.log('[天气][Open-Meteo] 降级方案开始')
      try {
        // IP 定位拿经纬度（失败用上海兜底）
        let lat = fallback.lat, lon = fallback.lon, city = fallback.city
        try {
          const ipData = await this.fetchWithTimeout('https://ipwho.is/', 6000).then(r => r.json())
          if (ipData && ipData.success && ipData.latitude) {
            lat = ipData.latitude
            lon = ipData.longitude
            city = ipData.city || '当前位置'
          }
          console.log('[天气][Open-Meteo] IP定位:', city, lat, lon)
        } catch (e) { console.log('[天气][Open-Meteo] IP定位失败，用上海兜底') }
        // 查 Open-Meteo 天气
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        const data = await this.fetchWithTimeout(url, 8000).then(r => r.json())
        const cur = data && data.current
        if (!cur) throw new Error('no weather data')
        const map = WMO_MAP[cur.weather_code] || { icon: '🌡️', desc: '未知' }
        this.setWeather(map.icon, Math.round(cur.temperature_2m), map.desc, city)
        console.log('[天气][Open-Meteo] 成功:', city, cur.temperature_2m + '°', map.desc)
      } catch (e) {
        console.log('[天气][Open-Meteo] 失败:', e.message)
        this.markWeatherFailed()
      }
    },
    goMenu() {
      this.$router.push('/menu')
    },
    setMode(mode) {
      if (mode === this.appMode) return
      this.$store.commit('setAppMode', mode)
      Toast({ message: mode === 'takeaway' ? `已切换到${this.cityName}外卖` : '已切换到今日午餐', duration: 1200 })
    },
    switchCity(city) {
      if (city === this.currentCity) {
        this.showCityPicker = false
        return
      }
      this.$store.commit('setCity', city)
      this.showCityPicker = false
      Toast.success({ message: `已切换至${this.cityName}`, duration: 1200 })
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
  background: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1400&fit=crop') center/cover no-repeat;
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
.mode-switch {
  display: inline-flex;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  padding: 5px;
  border-radius: 22px;
  margin-bottom: 18px;
  backdrop-filter: blur(4px);
}
.mode-tag {
  padding: 7px 16px;
  border-radius: 17px;
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  transition: all 0.25s ease;
  cursor: pointer;
}
.mode-tag.active {
  background: rgba(255,255,255,0.95);
  color: #ff6034;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.icp-footer {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 2;
}
.icp-footer a {
  font-size: 10px;
  color: rgba(255,255,255,0.28);
  text-decoration: none;
  transition: color 0.2s;
}
.icp-footer a:active {
  color: rgba(255,255,255,0.5);
}
.city-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.15);
  padding: 6px 14px;
  border-radius: 16px;
  margin-bottom: 6px;
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.2s;
}
.city-switch:active {
  background: rgba(255,255,255,0.25);
  transform: scale(0.96);
}
.city-tip {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  margin-bottom: 16px;
}
.city-picker {
  padding: 16px 20px 24px;
}
.city-picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 16px;
}
.city-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f7f8fa;
  font-size: 15px;
  color: #333;
  transition: all 0.2s;
}
.city-item.active {
  background: #fff4ef;
  color: #ff6034;
  font-weight: 600;
}
.city-check {
  font-size: 18px;
  color: #ff6034;
}
</style>
