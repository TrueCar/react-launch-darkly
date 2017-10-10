import launchDarklyBrowser from "ldclient-js";
const url = require("url");

export function getLocation() {
  if (window.location) {
    return window.location.toString();
  }
  return "";
}

let ldClient;
let ldClientReady = false;
export function ldClientWrapper (key, user, options) {
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

export function ldOverrideFlag(flagKey, typeFlagValue) {
  let override;
  /*
   POST /users?features=send-onboarding-email
   # Overrides the `send-onboarding-email` boolean feature flag, setting it to `true`
   GET /users/101?features=show-user-email,user-nicknames,hide-inactive-users
   # Enables the `show-user-email`, `user-nicknames`, and `hide-inactive-users` feature flags
   POST /users?features.verify-email=false&features.email-frequency=weekly
   # Disables the `verify-email` feature flag and sets the `email-frequency` variation to "weekly"
   */
  const query = url.parse(exports.getLocation(), true).query;
  const queryFlag = query["features." + flagKey];
  const queryFeatures = query["features"];

  if (typeof queryFlag !== "undefined"){
    if (queryFlag === ""){
      override = true;
    } else if (queryFlag === "false"){
      override = false;
    } else {
      override = queryFlag;
    }

    if (typeFlagValue === "number") {
      override = parseFloat(override);
    }
  } else if (queryFeatures) {
    queryFeatures.split(",").forEach((f) => {
      if (f === flagKey){
        override = true;
      }
    });
  }
  return override;
}

export function getAllFeatureFlags (key, user) {
  const ldClient = ldClientWrapper(key, user);
  return new Promise((resolve) => {
    ldClient.onReady(() => {
      resolve(ldClient.allFlags());
    });
  });
}
