import * as ldClient from "./../../src/lib/launchDarkly.js";
import launchDarklyBrowser from "ldclient-js";

describe("lib/launchDarkly", () => {
  it("exports three functions", () => {
    expect(ldClient["ldBrowserInit"]).toBeDefined();
    expect(ldClient["ldOverrideFlag"]).toBeDefined();
    expect(ldClient["getAllFeatureFlags"]).toBeDefined();
  });

  describe("ldBroswerInit", () => {
    it("proxies to ldclient-js", () => {
      launchDarklyBrowser.initialize = jest.fn();
      const key = "my key";
      const user = "my user";
      ldClient.ldBrowserInit(key, user);
      expect(launchDarklyBrowser.initialize).toBeCalledWith(key, user);

    });
  });
  describe("getAllFeatureFlags", () => {

  });
  describe("ldOverrideFlag", () => {

  });

});
