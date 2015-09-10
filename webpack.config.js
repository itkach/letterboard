var webpack = require("webpack");

module.exports = {

  entry: {
    app: './src/index.jsx',
    vendor: [
      'react',
      'react/addons',
      'react-tap-event-plugin',
      'reflux'
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      /* chunkName= */"vendor",
      /* filename= */"dist/js/vendor.bundle.js")
  ],

  output: {
    filename: 'dist/js/bundle.js'
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
        loader: 'url-loader?limit=30000&name=dist/fonts/[name]-[hash].[ext]'
      },
      {
        test: /\.(svg|png|jpg)$/,
        loader: 'url-loader?limit=10000&name=dist/images/[name]-[hash].[ext]'
      },
      {
        test: /\.js(x?)$/,
        exclude: /(node_modules|gen-nodejs|web_modules)/,
        loader: 'babel-loader?stage=1'
      }
    ]
  }
};
