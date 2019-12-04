const { resolve } = require('path');
const webpack = require('webpack');

process.env.NODE_ENV = 'kibana';

async function buildWebpack() {
  let finish;
  const promise = new Promise(r => (finish = r));

  console.log(resolve("webpack.config.js"));
  const config = require(resolve("webpack.config.js"));

  // Suppress warnings as most that appear are useless for this project
  config.stats = "errors-only";

  const compiler = webpack(config);

  // This hook is implemented to simply give us immediate feedback when a new bundle is starting. Otherwise, you will
  // wait with no indication that webpack is even trying to bundle or not.
  compiler.hooks.watchRun.tap("BeginBuildPlugin", compilation => {
    console.log("Bundling...");
  });

  compiler.hooks.afterEmit.tap("AfterEmitPlugin", async compilation => {
    finish();
    console.log("Build finished:", config.output.path, config.output.filename);
  });

  compiler.watch(
    {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: ["scripts", "build", "node_modules"]
    },
    (error, stats) => {
      if (error) {
        console.error(error);
      } else {
        console.log(
          stats.toString({
            colors: true
          })
        );
      }
    }
  );

  await promise;
}

buildWebpack();
