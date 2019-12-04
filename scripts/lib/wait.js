/**
 * Wait for a desired amount of time before resolving.
 */
module.exports = async function wait(t) {
  return new Promise(r => (setTimeout(r, t)));
}
