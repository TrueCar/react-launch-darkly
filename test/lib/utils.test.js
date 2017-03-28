import launchDarklyBrowser from "ldclient-js";
import * as utils from "./../../src/lib/utils.js";

describe("lib/utils", () => {
  it("exports functions", () => {
    expect(utils["ldClientWrapper"]).toBeDefined();
    expect(utils["ldOverrideFlag"]).toBeDefined();
    expect(utils["getAllFeatureFlags"]).toBeDefined();
  });

  describe("ldClientWrapper", () => {
    const key = "my key";
    const user = "my user";

    it("proxies to ldclient-js", () => {
      launchDarklyBrowser.initialize = jest.fn();
      utils.ldClientWrapper(key, user);
      expect(launchDarklyBrowser.initialize).toBeCalledWith(key, user);
    });

    it("does not instantiate ldclient-js more than once", () => {
      launchDarklyBrowser.initialize = jest.fn(() => ({}));
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      expect(launchDarklyBrowser.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllFeatureFlags", () => {

  });

  describe("ldOverrideFlag", () => {

  });

});
