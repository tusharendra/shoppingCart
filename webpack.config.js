const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: "./js/main.js",
  output: {
    path: __dirname+"/dist",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.css$/,
        
        use:[ {
           loader: 'style-loader',
           
          },
          {
            loader: 'css-loader'
         }]
       },
      {
        test: /\.scss$/,
        exclude: /(node_modules)/,
        use:{
           loader: 'sass-loader',
           options: {
              presets: ['env']
            }
        }
      }
    ]
  },
  plugins: [
  new HtmlWebpackPlugin({template: 'index.html'})
  ],
  devtool: 'source-map'
} 