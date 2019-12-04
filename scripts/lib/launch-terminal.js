const path = require('path');
const childProcess = require('child_process');
const process = require('process');
const shelljs = require('shelljs');

/**
 * Runs a script in a completely new window. Helps with contextual issues child processes can introduce for more
 * complicated systems. This can ONLY operate by executing a script file.
 *
 * @param {string} scriptFile Path to the script to execute
 * @param {string} processConfig The configuration for the child_process spawned
 */
module.exports = function launchTerminal(scriptFile, processConfig) {
  const startCommandScript = path.resolve(scriptFile);
  shelljs.chmod('-c', '+x', startCommandScript);

  // MACS
  if (process.platform === 'darwin') {
    return childProcess.spawnSync('open', [startCommandScript], processConfig);
  }

  // LINUX and MAC SYSTEMS
  if (process.platform === 'linux') {
    processConfig.detached = true;
    return childProcess.spawn('sh', [startCommandScript], processConfig);

  }

  // WINDOWZ
  else if (/^win/.test(process.platform)) {
    processConfig.detached = true;
    processConfig.stdio = 'ignore';
    return childProcess.spawn('cmd.exe', ['/C', startCommandScript], processConfig);
  }

  // UNSUPPORTED
  else {
    console.log(`Cannot start the packager. Unknown platform ${process.platform}`);
  }
};
