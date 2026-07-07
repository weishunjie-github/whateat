const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // 相对路径，配合 hash 路由，部署在域名根目录或子目录都能正常加载资源
  publicPath: './',
  transpileDependencies: true
})
