import launchDarklyBrowser from "ldclient-js";
const url = require("url");

export function getLocation() {
  if (window.location) {
    return window.location.toString();
  }
  return "";
}

export function ldBrowserInit (key, user) {
  return launchDarklyBrowser.initialize(key, user);
}

export function ldOverrideFlag(flagKey, typeShowFeature) {
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

    if (typeShowFeature === "number") {
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
  const ldClient = ldBrowserInit(key, user);
  return new Promise((resolve) => {
    ldClient.on("ready", () => {
      resolve(ldClient.allFlags());
    });
  });
}
