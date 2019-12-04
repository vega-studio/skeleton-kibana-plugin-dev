const shell = require("shelljs");
const watch = require("node-watch");
const { resolve } = require('path');
const updatePlugins = require('./update-plugins');

console.log();

// We currently only support PORT 8000 for the kibana instance. It would require some extra work to get the port
// customizeable.
let kibanaReady;
const kibanaPromise = new Promise(r => (kibanaReady = r));
let stopping = false;

process.env.NODE_ENV = 'production';

/**
 * Begins the bundling process with kibana specific operations.
 * This spawns a watch process that will cause rebundling when changes happen to the filesystem.
 */
async function startDev() {
  console.log('Starting dev process');

  const child = shell.exec('npm run kibana-dev', { async: true });

  child.stdout.on("data", async function(data) {
    console.log(`[Bundler]`,  data);
  });

  child.stderr.on("data", function(data) {
    console.log(`[Bundler]`,  data);
  });
}

/**
 * Begins the plugin updating process. This will monitor all plugin changes and trigger a plugin re-installation when
 * any changes are made.
 */
async function startPluginDev() {
  await kibanaPromise;
  console.log('First plugin install');
  updatePlugins();

  console.log('Monitoring Plugin directory for changes');
  let timer;

  watch(resolve('kibana-extra/chart'), { recursive: true }, function() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      updatePlugins();
    }, 500);
  });
}

/**
 * Stops the container running kibana
 */
async function stopKibana(final) {
  if (stopping) return;
  stopping = final;

  console.log("Stopping Kibana container...");
  shell.exec("docker-compose stop");
}

/**
 * Starts up the kibana server.
 * This spawns a kibana process that will keep running even if you exit
 */
async function startKibana(noElastic) {
  await stopKibana();
  console.log('Starting kibana');

  // Start both processes separated so if kibana shuts off the child process will die naturally
  shell.exec("docker-compose up elasticsearch", { async: true });
  let child = shell.exec("docker-compose up kibana", { async: true });
  let hasStarted = false;

  child.stdout.on("data", function(data) {
    if (
      !hasStarted &&
      data.toLowerCase().indexOf(`message":"server running at http://`) >= 0
    ) {
      console.log("kibana server started");
      hasStarted = true;

      try {
        kibanaReady();
      } catch (err) {}
    }
  });

  // If the child process exits before officially restarting, try removing the container and start again
  child.on('exit', function() {
    if (!hasStarted) {
      console.log('Removing kibana container to rebuild it...');
      shell.exec("docker-compose rm -f kibana");
      console.log("Attempting to start again");
      startKibana();
    }
  });

  await kibanaPromise;
  console.log("Started Kibana");
}

/**
 * This handles any case where the process crashes or exists. It should attempt to shut down the kibana container and
 * any other child process that could potentially get orphaned.
 */
function processExitStrategy() {
  /**
   * This will handle clean up when the process is told to quit.
   */
  async function exitHandler(options, exitCode) {
    if (options.cleanup) {
      await stopKibana(true);
    }

    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
  }

  //do something when app is closing
  process.on("exit", exitHandler.bind(null, { cleanup: true }));

  //catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { cleanup: true, exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { cleanup: true, exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { cleanup: true, exit: true }));

  //catches uncaught exceptions
  process.on(
    "uncaughtException",
    exitHandler.bind(null, { cleanup: true, exit: true })
  );
}

async function start() {
  // First ensure we have all of our process listeners set so we can gracefully exit
  processExitStrategy();
  // This should finish executing first to ensure our plugin environment is ready
  await startDev();
  // We finish with starting kibana and elastic containers
  startKibana();
  // Now monitor the plugin for changes to cause a re-installation
  await startPluginDev();
}

start();
