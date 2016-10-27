import launchDarklyBrowser from "ldclient-js";

export function ldBrowserInit (key, user) {
  return launchDarklyBrowser.initialize(key, user);
}

