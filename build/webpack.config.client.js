const path = require('path')
const webpack = require('webpack')
// 合并不同的webpack配置需要的插件，根据webpack里面所以的配置项，合理地合并webpack config
const merge = require('webpack-merge')
const HTMLPlugin = require('html-webpack-plugin')
// 把一些非js内容单独打包成一个类型的静态资源文件
const ExtractPlugin = require('extract-text-webpack-plugin')
const baseConfig = require('./webpack.config.base')

// 在启动脚本的时候，设置的环境变量全部存在process.env这个对象里面
const isDev = process.env.NODE_ENV === 'development'

// 给webpack在编译的过程中以及在页面上自己写js代码的时候去判断环境
const defaultPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isDev ? '"development"' : '"production"'
    }
  }),
  new HTMLPlugin()
]

const devServer = {
  port: 8000,
  host: '0.0.0.0',
  overlay: {
    errors: true

  },
  // webpack启动devServer时自动打开浏览器
  // open:true

  // hot只重新渲染修改过部分的内容
  hot: true
}
let config
// 开发环境下的配置
if (isDev) {
  config = merge(baseConfig, {
    devtool: '#cheap-module-eval-source-map',
    module: {
      rules: [{
        test: /\.styl$/,
        use: [
          'style-loader',
          // import其他css文件时使用cssodule模式
          // {
          //   loader:'css-loader',
          //   options:{
          //     module:true,
          //     localIdentName:isDev?'[path]-[name]-[hash:base64:5]':'[hash:base64:5]',
          //   }
          // },
          'css-loader',
          {
            // 使用stylus-loader会生产sourceMap，而postcss-loader也会生成sourceMap
            // 该选项可以直接使用前面的sourceMap，提高编译效率
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'stylus-loader'
        ]
      }]
    },
    devServer,
    plugins: defaultPlugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])
  })
} else {
  config = merge(baseConfig, {
    entry: {
      app: path.join(__dirname, '../client/index.js'),
      // 把诸如vue的类库单独打包成一个静态资源文件，有助于提升性能，放在vendor里面
      vendor: ['vue']
    },
    output: {
      filename: '[name].[chunkhash:8].js'
    },
    module: {
      rules: [{
        test: /\.styl$/,
        use: ExtractPlugin.extract({
          // 把css-loader处理出来的内容，在外面包了一层js代码，用于把css代码写入html里面
          // (生成一个style标签并将其插入html里，将css代码插入style里)
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              // 使用stylus-loader会生产sourceMap，而postcss-loader也会生成sourceMap
              // 该选项可以直接使用前面的sourceMap，提高编译效率
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            'stylus-loader'
          ]
        })
      }]
    },
    plugins: defaultPlugins.concat([
      // 指定输出的静态文件的名字,方括号内会根据输出的css文件内容进行哈希生成单独的值
      new ExtractPlugin('style.[contentHash:8].css'),
      new webpack.optimize.CommonsChunkPlugin({
        // name需要相等，否则无法识别
        name: 'vendor'
      }),
      // 把与webpack相关的代码单独打包到一个文件,在有新的模块加入的时候,webpack给每一个模块
      // 加一个id,利于长缓存。（这段代码必须放在vendor后面）
      new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
      })
    ])
  })
}

module.exports = config
