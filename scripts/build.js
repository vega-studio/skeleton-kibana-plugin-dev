//
// This file is created for hosting on Heroku
//
const shell = require("shelljs");
const { ZipUtil } = require('./lib/zip-util');
const { resolve } = require('path');

async function start() {
  shell.exec("npm run dist");

  const util = new ZipUtil();
  await util.zipDir(
    resolve('./kibana-extra/chart'),
    resolve('./kibana-extra/chart.zip'
  ));
}

start();
