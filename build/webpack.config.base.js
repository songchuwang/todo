// 把所有要在webpack配置里面都要用到的共同的配置放到这里，是所有环境都要用到的(开发、正式环境)
const path = require('path')
const createVueLoaderOptions = require('./vue-loader.config')

// 在启动脚本的时候，设置的环境变量全部存在process.env这个对象里面
const isDev = process.env.NODE_ENV === 'development'
const config = {
  entry: path.join(__dirname, '../client/index.js'),
  output: {
    // hash与chunkhash的区别：使用chunkhash会对每个chunk(节点单独生成一个hash)，而使用
    // hash会对整个文件各部分生成同一个hash
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|vue)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        // 在vue-loader处理.vue文件之前让eslint先检测一遍，称之为预处理
        enforce: 'pre'
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: createVueLoaderOptions(isDev)
      },

      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // 忽略node_modules文件的编译,因为已经编译过了,所以不需要再重新编译一次了
        exclude: /node_modules/

      },
      {
        test: /\.css$/,
        use: [
        // style-loader把css写到html里面去
          'style-loader',
          // css-loader只是处理css文件，把里面的内容读出来，至于是要把它写入一个
          // 新的文件还是插入html里面，要用'style-loader'来处理
          'css-loader'
        ]
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [
        // 之所以用对象的形式写，是因为loader可以配置一些选项
          {
          // url-loader可以把图片转换成base64代码直接写在js内容里面，不用生成一个新文件
          // 有利于减少http请求，它封装了file-loader(把图片读取一下，换个名字或地方)
            loader: 'url-loader',
            options: {
            // 如果图片文件的大小小于1024，那么它会转成base64代码，写到js里面去
              limit: 1024,
              // 指定文件名字,name指文件原来的名字，ext是其扩展名
              name: 'resources/[path][name].[hash:8].[ext]'

            }

          }
        ]

      }
    ]
  }

}

module.exports = config
