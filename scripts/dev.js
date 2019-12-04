const { resolve } = require('path');
const DevServer = require('webpack-dev-server');
const webpack = require('webpack');
const program = require('commander');

program
.version('1.0.0', '-v', '--version')
.option(
  '-b, --bundle-test',
  `When provided, the bundle generated for the kibana plugin will be used as the src to test against.`
)
.option(
  '-p, debug-package',
  'When provided, this will trigger tools that help debug package size and utilization'
)
.parse(process.argv);

// Make sure our processed arguments are applied to the environment
// We do not apply 'undefined' to the env as it will cause an 'undefined' literal string
// to populate the item
if (program.bundleTest) process.env.BUNDLE_TEST = true;
if (program.debugPackage) process.env.DEBUG_PACKAGE = true;
process.env.NODE_ENV = 'development';

const compiler = webpack(require(resolve('webpack.config.js')));

const server = new DevServer(compiler, {
  contentBase: resolve('test/assets'),
  compress: true,
  port: process.env.PORT || 8080
});

server.listen(process.env.PORT || 8080, process.env.HOST || '0.0.0.0', () => {
  console.log(`Starting server on ${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 8080}`);
});
