import launchDarklyBrowser from "ldclient-js";
const url = require('url');

export function ldBrowserInit (key, user) {
  return launchDarklyBrowser.initialize(key, user);
}

export function ldOverrideFlag(flagKey) {
  let override;
  /**
   * Follow this overriding convention:
   * @link https://git.corp.tc/capsela/tc_feature_flagging#overriding-feature-flags
   **/
  const query = url.parse(window.location.toString(), true).query;
  const queryFlag = query["features." + flagKey];

  if (typeof queryFlag !== "undefined"){
    if (queryFlag === ""){
      override = true;
    } else if (queryFlag === "false"){
      override = false;
    }
  }
  return override;
}

export function getAllFeatureFlags (key, user) {
  const ldClient = ldBrowserInit(key, user);
  return new Promise((resolve, reject) => {
    ldClient.on("ready", () => {
      resolve(ldClient.allFlags());
    });
  });
}
