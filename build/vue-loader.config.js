module.exports = (isDev) => {
  // return 一个配置项
  return {
    // 写.vue文件的时候，清楚template(html)上字符串间的空格
    preserveWhitepace: true,
    // 把.vue文件内的css样式放到一个单独的css文件里，注意css无热加载,如需热加载要安装vue-style-loader
    extractCSS: !isDev,
    // 使用cssModules相比于使用scoped的好处是能增加了一个可以自定义class的功能，增强了保密性
    cssModules: {
      localIdentName: isDev ? '[path]-[name]-[hash:base64:5]' : '[hash:base64:5]',
      // 使用驼峰形式，将css里面使用的“-”方式连接的类名转化成驼峰格式
      camelCase: true
    }

    // 热重载，会根据传入的process.env.NODE_ENV是否等于production来判断，在production
    // 的情况下会关闭热重载功能，如果不是说production则会开启
    // hotReload:false,//根据环境变量生成

  }
}
