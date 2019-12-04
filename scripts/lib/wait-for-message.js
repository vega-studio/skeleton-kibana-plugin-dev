/**
 * This method takes in a process's pipe started by shelljs THAT IS STARTED WITH { async: true }
 * This will wait for a message to be broadcast by the process on the pipe provided.
 */
module.exports = async function waitForMessage(pipe, message, transform) {
  transform = transform || (val => val);

  if (pipe) {
    let hasStarted = false;
    let ready;
    let promise = new Promise(r => (ready = r));

    pipe.on('data', data => {
      if (!hasStarted && transform(data.toString()).indexOf(message) >= 0) {
        hasStarted = true;
        ready();
      }
    });

    await promise;
  }

  else {
    console.warn(`Could not wait for message "${message}" from a process because the pipe is undefined`);
  }
}
