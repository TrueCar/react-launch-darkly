import launchDarklyBrowser from "ldclient-js";

export function ldBrowserInit (key, user) {
  return launchDarklyBrowser.initialize(key, user);
}

export function getAllFeatureFlags (key, user) {
  const ldClient = ldBrowserInit(key, user);
  return new Promise((resolve, reject) => {
    ldClient.on("ready", () => {
      resolve(ldClient.allFlags());
    });
  });
}
