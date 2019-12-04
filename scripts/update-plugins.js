const updatePlugin = require('./lib/kibana-plugin-update');
const ZipUtil = require("./lib/zip-util");
const { resolve } = require('path');
const shell = require("shelljs");

module.exports = async function updatePlugins(preventInstall) {
  console.log('Zipping plugin...');
  const zip = new ZipUtil();
  await zip.zipDir(
    resolve('./kibana-extra/chart'),
    resolve('./kibana-extra/chart.zip'),
    'kibana/chart/'
  );
  console.log('Zip Complete');

  if (preventInstall) return;
  // With the plugins all built we must now install the plugins into the kibana instance
  await installPlugins();
}

/**
 * This will update ALL of the plugins listed under the kibana-extra folder within the kibana docker instance. This
 * will do a full install of each plugin by performing kibana-plugin remove <plugin> then kibana-plugin add <plugin>
 * for each .zip file found in the plugins folder.
 */
async function installPlugins() {
  updatePlugin('chart');

  console.log('Stopping kibana container...');
  shell.exec("docker-compose stop kibana");
  console.log('Restarting kibana container...');
  shell.exec("docker-compose up kibana", { async: true });
}
