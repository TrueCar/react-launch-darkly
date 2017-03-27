import launchDarklyBrowse from "ldclient-js";

export default function LDClientWrapper () {
  let ldClient;

  function init (key, user) {
    if (!ldClient) {
      ldClient = launchDarklyBrowse.initialize(key, user);
    }

    return ldClient;
  }

  return {
    init,
    ...ldClient
  };
}
