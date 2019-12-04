/**
 * This is a script for enabling development for the kibana environment that assumes you have the kibana src available
 * outside this project. Doing this creates a development experience that is VASTLY faster than developing the plugin
 * for production bundling.
 */

/*
  "preinstall": "node ../../kibana/preinstall_check",
  "kbn": "node ../../kibana/scripts/kbn",
  "es": "node ../../kibana/scripts/es",
  "lint": "eslint .",
  "start": "plugin-helpers start",
  "test:server": "plugin-helpers test:server",
  "test:browser": "plugin-helpers test:browser",
  "build": "plugin-helpers build"
*/

const isUsingNpm = process.env.npm_config_git !== undefined;

if (isUsingNpm) {
  console.error(`ERROR FOR COMMAND kibana-src: Use Yarn instead of npm. Its a kibana thing.`);
  process.exit(0);
}

const shell = require("shelljs");
const watch = require("node-watch");
const { resolve } = require('path');
const updatePlugins = require('./update-plugins');
const { existsSync } = require('fs');
const waitForMessage = require('./lib/wait-for-message');
const wait = require('./lib/wait');
const bigLog = require('./lib/big-log');
const npmPath = require('npm-path');
const launchTerminal = require('./lib/launch-terminal');

// We currently only support PORT 8000 for the kibana instance. It would require some extra work to get the port
// customizeable.
let kibanaReady;
const kibanaPromise = new Promise(r => (kibanaReady = r));
let stopping = false;
process.env.NODE_ENV = 'production';
const projectWorkingDirectory = resolve('./');

/**
 * Begins the bundling process with kibana specific operations.
 * This spawns a watch process that will cause rebundling when changes happen to the filesystem.
 */
async function startDev() {
  console.log('Starting dev process');
  const child = shell.exec('npm run kibana-dev', { async: true });
  await waitForMessage(child.stdout, "Build finished");
  await wait(100);
  console.log('Dev process ready');
}

/**
 * Begins the plugin updating process. This will monitor all plugin changes and trigger a plugin re-installation when
 * any changes are made.
 */
async function startPluginDev() {
  console.log('First plugin update');
  await updatePlugins(true);

  console.log('Monitoring Plugin directory for changes');
  let timer;

  watch(resolve('kibana-extra/chart'), { recursive: true }, function() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      updatePlugins(true);
    }, 500);
  });
}

/**
 * Stops the container running kibana
 */
async function stopKibana(final) {
  if (stopping) return;
  stopping = final;

  shell.cd(projectWorkingDirectory);
  console.log("Stopping containers...");
  shell.exec("docker-compose stop");
}

/**
 * Starts up the kibana server.
 * This spawns a kibana process that will keep running even if you exit
 */
async function startKibana() {
  const kibanaSrcPath = resolve("./kibana");
  const pluginSrcPath = resolve("./kibana-extra/chart");

  if (!existsSync(kibanaSrcPath)) {
    console.error("The kibana source files are not found at the expected location". kibanaSrcPath);
    process.exit(0);
  }

  // Run the preinstall check
  shell.execSync("node kibana/preinstall_check");

  console.log("Starting kibana plugin development with the kibana src files located at", kibanaSrcPath);

  // Ensure our kibana source is on the correct version
  {
    bigLog('Checking out correct version of kibana src', "git checkout v6.7.0");
    shell.cd(kibanaSrcPath);
    shell.exec("git stash");
    const gitProcess = shell.exec("git checkout v6.7.0", { async: true });

    // See if our git proccess errored while trying to switch
    waitForMessage(gitProcess.stderr, "Aborting").then(() => {
      console.error("Could not switch branches of kibana to the correct version", "6.7.0");
      shell.cd(projectWorkingDirectory);
      process.exit(0);
    });

    // Look for a success pattern
    await waitForMessage(gitProcess.stderr, "HEAD is now at");
    shell.exec("git stash");
    shell.cd(projectWorkingDirectory);
  }

  // Get elastic rolling for our kibana item
  {
    stopKibana();
    bigLog('STARTING ELASTIC');
    const elasticProcess = shell.exec("docker-compose up elasticsearch", { async: true });
    await waitForMessage(elasticProcess.stdout, "[RED] to [GREEN] (reason: [shards started");
    console.log("Elastic server started");
  }

  // // Make sure plugin installation is ready
  // {
  //   bigLog('Installing plugin dependencies...');
  //   shell.cd(pluginSrcPath);
  //   shell.exec("yarn");
  // }

  // Inform user it's time to do the kibana src stuff
  bigLog(
    "The kibana source should be ready for use. In a separate terminal:\n",
    "cd kibana-extra/chart\n",
    "yarn kbn bootstrap\n",
    "yarn start"
  );

  // Bootstrap the kibana src files to prepare them for running
  // {
  //   // console.log("Please esnure Kibana is bootstrapped properly");
  //   bigLog('Bootstrapping Kibana...');
  //   shell.cd(projectWorkingDirectory);
  //   // Normally, yarn and npm will add the node_modules/.bin to the PATH for the project you are working in.
  //   // Sincce we are executing from a different project, we must do that step for it so the bootstrap process
  //   // can find it's bin executables
  //   shell.cd(pluginSrcPath);
  //   npmPath.setSync();
  //   const bootstrap = shell.exec('yarn kbn bootstrap', { async: true });
  //   // bigLog("Launching process for bootstrap", resolve('./scripts/sh/kibana-bootstrap.sh'));
  //   // const bootstrap = launchTerminal(resolve('./scripts/sh/kibana-bootstrap.sh'), { cwd: kibanaSrcPath });
  //   // if (bootstrap.stdout) bootstrap.stdout.on('data', data => console.log(data.toString()));
  //   await waitForMessage(bootstrap.stdout, "Bootstrapping completed!");
  // }

  // // Fire up the kibana source and point to the correct elastic PORTs and host on the default PORT
  // {
  //   bigLog('Starting Kibana...');
  //   shell.cd(pluginSrcPath);
  //   const kibanaDevProcess = shell.exec("yarn start --elasticsearch.hosts http://localhost:9200 --port 5601", { async: true });
  //   await waitForMessage(kibanaDevProcess.stdout, `message":"server running at http://`, m => m.toLowerCase());
  //   try {
  //     kibanaReady();
  //   } catch (err) {}

  //   shell.cd(projectWorkingDirectory);
  // }

  shell.cd(projectWorkingDirectory);
  await kibanaPromise;
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
  // Now monitor the plugin for changes to cause a re-installation
  await startPluginDev();
  // We finish with starting kibana and elastic containers
  await startKibana();
}

start();
