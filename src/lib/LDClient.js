import launchDarklyBrowser from "ldclient-js";

export default function LDClient () {
  let ldClient;

  function init (key, user) {
    if (!ldClient) {
      ldClient = launchDarklyBrowser.initialize(key, user);
    }

    return ldClient;
  }

  return {
    init,
    ...ldClient
  };
}
