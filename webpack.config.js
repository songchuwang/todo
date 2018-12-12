const path = require('path')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')
// 把一些非js内容单独打包成一个类型的静态资源文件
const ExtractPlugin = require('extract-text-webpack-plugin')

// 在启动脚本的时候，设置的环境变量全部存在process.env这个对象里面
const isDev = process.env.NODE_ENV === 'development'
const config = {
  entry: path.join(__dirname, './src/index.js'),
  output: {
    // hash与chunkhash的区别：使用chunkhash会对每个chunk(节点单独生成一个hash)，而使用
    // hash会对整个文件各部分生成同一个hash
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 使用eslint自动检测代码
      {
        test: /\.(vue|js|jsx)$/,
        loader: 'eslint-loader',
        // 预处理
        enforce:'pre'

      },
      {
        test:/\.jsx$/,
        loader:'babel-loader',
        exclude:/node_modules/
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
              name: '[name].[ext]'

            }

          }
        ]

      }
    ]
  },
  plugins: [
    // 给webpack在编译的过程中以及在页面上自己写js代码的时候去判断环境
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isDev ? '"development"' : '"production"'
      }
    }),
    new HTMLPlugin()
  ]

}

if (isDev) {
  // 开发环境下对css文件打包入js文件内
  config.module.rules.push({
      test: /\.styl$/,
      use: [
        'vue-style-loader',
        'css-loader',
        {
          // 使用stylus-loader会生产sourceMap，而postcss-loader也会生成sourceMap
          // 该选项可以直接使用前面的sourceMap，提高编译效率
          loader:'postcss-loader',
          options:{
            sourceMap:true
          }
        },
        'stylus-loader'
      ]
  }),
  config.devtool = '#cheap-module-eval-source-map',
  config.devServer = {
    port: 8000,
    host: '0.0.0.0',
    overlay: {
      errors: true
    },
    // webpack启动devServer时自动打开浏览器
    // open:true

    // hot只重新渲染修改过部分的内容
    hot:true
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
}else {
  config.entry = {
    app:path.join(__dirname,'src/index.js'),
    // 把诸如vue的类库单独打包成一个静态资源文件，有助于提升性能，放在vendor里面
    vendor:['vue']
  }
  config.output.filename = '[name].[chunkhash:8].js',
  config.module.rules.push(
    {
      test: /\.styl$/,
      use: ExtractPlugin.extract({
        // 把css-loader处理出来的内容，在外面包了一层js代码，用于把css代码写入html里面
        // (生成一个style标签并将其插入html里，将css代码插入style里)
        fallback:'vue-style-loader',
        use:[
          'css-loader',
          {
            // 使用stylus-loader会生产sourceMap，而postcss-loader也会生成sourceMap
            // 该选项可以直接使用前面的sourceMap，提高编译效率
            loader:'postcss-loader',
            options:{
              sourceMap:true
            }
          },
          'stylus-loader'
        ]
      })
    },
  )
  config.plugins.push(
    // 指定输出的静态文件的名字,方括号内会根据输出的css文件内容进行哈希生成单独的值
    new ExtractPlugin('style.[contentHash:8].css'),
    new webpack.optimize.CommonsChunkPlugin({
      // name需要相等，否则无法识别
      name: 'vendor'
    }),
    // 把与webpack相关的代码单独打包到一个文件,在有新的模块加入的时候,webpack给每一个模块
    // 加一个id,利于长缓存。（这段代码必须放在vendor后面）
    new webpack.optimize.CommonsChunkPlugin({
      name:'runtime'
    })
  )
}

module.exports = config