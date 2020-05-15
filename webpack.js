const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const path = require("path");

module.exports = {
    mode: "development",
    entry: ["./static/app.jsx", "webpack-hot-middleware/client"],
    output: {
	    filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
        publicPath: '/'
    },
    devServer: {
        contentBase: './public',
        hot: true,
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new CopyWebpackPlugin([
            {
                from: "static",
                to: "",
            		ignore: [ "*.jsx" ]
            }
        ]),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
    rules: [
        {
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["babel-preset-react"]
                }
            }
        }
    ]
  }
}
