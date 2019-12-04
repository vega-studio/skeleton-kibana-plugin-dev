const child_process = require('child_process');

module.exports = function update(pluginName) {
  // Execute the command on this processes stack to bypass many issues
  // We first execute the removal of the plugin
  try {
    console.log('Executing remove...');
    child_process.execFileSync(
      'docker-compose',
      `exec kibana /usr/share/kibana/bin/kibana-plugin remove ${pluginName}`.split(' '),
      {stdio: 'inherit'}
    );
  }

  catch(err) {
    // This most likely fails because the plugin does not exist yet, so we will still
    // continue and attempt to install the plugin.
  }

  // Next we execute the re-adding of the plugin
  console.log('Executing installation...');
  child_process.execFileSync(
    'docker-compose',
    `exec kibana /usr/share/kibana/bin/kibana-plugin install file:/usr/etc/${pluginName}.zip`.split(' '),
    {stdio: 'inherit'}
  );
}