/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');

const env = process.env.NODE_ENV;

const reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react',
};

const config = {
  externals: {
    react: reactExternal,
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'babel-loader!ts-loader', exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  output: {
    library: 'ReduxForms',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
};

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false,
      },
    })  // eslint-disable-line comma-dangle
  );
}

module.exports = config;
