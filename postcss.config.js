const autoprefixer = require('autoprefixer')
// 通过postcss优化css代码，比如给一些css代码加浏览器前缀属性，就可以用autoprefixer插件
module.exports = {
  plugins:[
    autoprefixer()
  ]
}