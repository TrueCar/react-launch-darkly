import ldClientWrapper from "../lib/ldClientWrapper"
let ldClient;
export function getAllFeatureFlags (key, user) {
  const ldClient = ldClientWrapper(key, user);
  return new Promise((resolve) => {
    ldClient.onReady(() => {
      resolve(ldClient.allFlags());
    });
  });
}