/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const path = require("path");
const packageData = require("./package.json");
const { merge } = require("webpack-merge");

const shared = {
  // Turns on tree-shaking and minification in the default Terser minifier
  // https://webpack.js.org/plugins/terser-webpack-plugin/
  mode: "production",
  devtool: false,
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  module: {
  rules: [
    {
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    },
    {
      test: /\.(ts|js)x?$/,
      loader: "babel-loader",
    },
  ],
},
  optimization: {
    // Disable compression because it makes debugging more difficult for KolMafia
    minimize: false,
  },
  performance: {
    // Disable the warning about assets exceeding the recommended size because this isn't a website script
    hints: false,
  },
  plugins: [],
  externals: {
    // Necessary to allow kolmafia imports.
    kolmafia: "commonjs kolmafia",
    // Add any ASH scripts you would like to use here to allow importing. E.g.:
    // "canadv.ash": "commonjs canadv.ash",
  },
};

const entry = merge(
  {
    entry: {
      // Define files webpack will emit, does not need to correspond 1:1 with every typescript file
      // You need an emitted file for each entrypoint into your code, e.g. the main script and the ccs or ccs consult script it calls
      folgerCS: "./src/main.ts",
    },
    output: {
      path: path.resolve(__dirname, "KoLmafia", "scripts", packageData.name),
    },
  },
  shared
);

const relay = merge(
  {
    entry: {
      // Define files webpack will emit, does not need to correspond 1:1 with every typescript file
      // You need an emitted file for each entrypoint into your code, e.g. the main script and the ccs or ccs consult script it calls
      relay_folgerCS: "./src/relay.ts",
    },
    output: {
      path: path.resolve(__dirname, "KoLmafia", "relay"),
    },
  },
  shared
);

module.exports = [entry, relay];
