import launchDarklyBrowser from "ldclient-js";

export function ldBrowserInit (key, user) {
  return launchDarklyBrowser.initialize(key, user);
}

export function getAllFeatureFlags (key, user) {
  const ldClient = ldBrowserInit(key, user);
  return ldClient.allFlags();
}
