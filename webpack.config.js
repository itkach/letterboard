var webpack = require("webpack"),
    path = require('path');

module.exports = {

  entry: {
    app:  path.resolve(__dirname, 'src/index.jsx'),
    qrcode: path.resolve(__dirname, 'src/qrcode-worker.js'),
    vendors: [
      'react',
      'react/addons',
      'react-tap-event-plugin',
      'reflux'
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendors", "vendors.js")
  ],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js' // Notice we use a variable
  },

  module: {

    preLoaders: [
      {
        test: /\.js(x?)$/,
        loader: "eslint-loader",
        exclude: /(node_modules|web_modules)/
      }
    ],

    loaders: [
      {
        test: require.resolve("react"),
        loader: "expose?React"
      },
      {
        test:   /\.css$/,
        exclude: /\.useable\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.useable\.css$/,
        loader: "style-loader/useable!css-loader"
      },
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        loader: 'url-loader?limit=30000&name=fonts/[name]-[hash].[ext]'
      },
      {
        test: /\.(svg|png|jpg)$/,
        loader: 'url-loader?limit=10000&name=images/[name]-[hash].[ext]'
      },
      {
        test: /\.js(x?)$/,
        exclude: /(node_modules|gen-nodejs|web_modules)/,
        loader: 'babel-loader?stage=1'
      }
    ]
  }
};
