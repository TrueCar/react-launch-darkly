import launchDarklyBrowser from "ldclient-js";
export function getLocation() {
  if (window.location) {
    return window.location.toString();
  }
  return "";
}
let ldClient;
let ldClientReady = false;
export function ldClientWrapper (key, user, options = {}) {
  const queue = [];

  if (!ldClient) {
    ldClient = launchDarklyBrowser.initialize(key, user, options);
  }

  if (!ldClientReady) {
    ldClient.on("ready", () => {
      ldClientReady = true;

      if (queue.length) {
        queue.forEach((callback) => {
          callback();
        });
      }
    });
  }

  // Create our own implementation of the ldclient-js' `on` function.
  // Multiple calls with `on('ready')` seem to not fire after the original client has been initialized.
  // By implementing our own, we can track the initial "ready" fire and decide how to proceed.
  ldClient.onReady = (callback) => {
    if (ldClientReady) {
      callback();
    } else {
      queue.push(callback);
    }
  };

  return ldClient;
}