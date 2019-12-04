const { resolve } = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { WatchIgnorePlugin } = require('webpack');

console.log('NODE_ENV', process.env.NODE_ENV);

// This is an optional path that can be passed into the program. When set, the
// project will use the source code from the webgl project specified instead of
// the internally installed version. It can be set by environment variable, or
// by calling --devgl
const DEVGL = process.env.DEVGL;
const IS_KIBANA = process.env.NODE_ENV === 'kibana';
const IS_HEROKU = process.env.NODE_ENV === 'heroku';
const IS_RELEASE = process.env.NODE_ENV === 'release';
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || IS_RELEASE || IS_HEROKU;
const IS_UNIT_TESTS = process.env.NODE_ENV === 'unit-test';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' || IS_UNIT_TESTS;
const IS_BUNDLE_TEST = Boolean(process.env.BUNDLE_TEST);
const MODE = process.env.NODE_ENV = process.env.MODE || ((IS_RELEASE || IS_PRODUCTION || IS_HEROKU || IS_KIBANA) ? 'production' : 'development');

console.log('Bundle Mode', MODE);

const tslint = {
  loader: 'tslint-loader', options: {
    fix: false,
    emitErrors: true,
  }
};

const prettier = {
  loader: resolve('prettier-loader.js'),
};

const babelOptions = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: [
          'last 2 Chrome versions',
          'last 2 Safari versions',
          'last 2 Firefox versions'
        ]
      },
      modules: false
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread'
  ]
};

const plugins = [];
let externals = [];
let library;
let libraryTarget;

// We add a watch ignore plugin because the webpack 'ignored' property does not work correctly.
plugins.push(
  new WatchIgnorePlugin([
    resolve('./scripts'),
    resolve('./build'),
    resolve('./node_modules')
  ])
);

if (IS_DEVELOPMENT) {
  plugins.push(
    new CircularDependencyPlugin({
      exclude: /\bnode_modules\b/,
      failOnError: true,
    }),
  );

  if (process.env.DEBUG_PACKAGE) plugins.push(new BundleAnalyzerPlugin());
}

if (IS_PRODUCTION) {
  // We should minify and mangle our distribution for npm
  console.log('Minification enabled');
}

if (IS_KIBANA) {
  // library = "Map";
  libraryTarget = "umd";
}

let entry = 'src';
if (IS_DEVELOPMENT || IS_HEROKU) entry = 'test';
if (IS_BUNDLE_TEST) {
  console.log('Testing using the Kibana Library Bundle lib.js');
}

if (IS_UNIT_TESTS) entry = 'unit-test';
if (IS_KIBANA) entry = 'src/index.ts';

let path = resolve(__dirname, 'build');
if (IS_PRODUCTION) path = resolve(__dirname, 'build');
if (IS_UNIT_TESTS) path = resolve(__dirname, 'unit-test', 'build');
if (IS_KIBANA) path = resolve(__dirname, 'kibana-extra', 'diamond-chart', 'public');

console.log('Output path:', path);

module.exports = {
  devtool: IS_PRODUCTION ? 'none' : 'source-map',
  entry,
  externals,
  mode: MODE,

  module: {
    rules: [
      {
        test: /\.tsx?/, use: [
          { loader: 'babel-loader', options: babelOptions },
          {
            loader: 'ts-loader',
            options: { transpileOnly: IS_PRODUCTION || IS_UNIT_TESTS || IS_HEROKU }
          },
        ]
      },
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\.html$/, use: { loader: 'file-loader', options: { name: '[name].html' } } },
      { test: /\.(png|jpg)$/, loader: ['base64-inline-loader'] },
      { test: /\.geojson$/, use: [{ loader: 'json-loader' }] },
      { test: /\.css$/, use: 'raw-loader' },
      {
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        use: 'base64-inline-loader'
      }
    ],
  },

  output: {
    library,
    libraryTarget,
    path,
    filename: 'lib.js'
  },

  performance: {
    hints: false
  },

  plugins,

  resolve: {
    modules: ['.', './node_modules', './src'],
    extensions: ['.ts', '.tsx', '.js', '.json'],

    alias: IS_BUNDLE_TEST ? {
      "../src": path.resolve('../kibana-extra/diamond-chart/public/lib'),
    } : undefined
  },

  resolveLoader: {
    modules: ['node_modules', 'loaders']
  },
};

if (IS_DEVELOPMENT) {
  module.exports.module.rules.unshift({
    test: /\.tsx?/,
    exclude: DEVGL,
    use: [prettier, tslint],
    enforce: 'pre'
  });
}
