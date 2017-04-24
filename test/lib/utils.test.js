import launchDarklyBrowser from "ldclient-js";
import * as utils from "./../../src/lib/utils.js";

describe("lib/utils", () => {
  jest.useFakeTimers();

  it("exports functions", () => {
    expect(utils["ldClientWrapper"]).toBeDefined();
    expect(utils["ldOverrideFlag"]).toBeDefined();
    expect(utils["getAllFeatureFlags"]).toBeDefined();
  });

  describe("ldClientWrapper", () => {
    const key = "my key";
    const user = "my user";

    launchDarklyBrowser.initialize = jest.fn().mockImplementation(() => ({
      on: (event, callback) => {
        setTimeout(() => {
          callback();
        }, 1000);
      }
    }));

    it("proxies to ldclient-js", () => {
      utils.ldClientWrapper(key, user);
      expect(launchDarklyBrowser.initialize).toBeCalledWith(key, user);
    });

    it("does not instantiate ldclient-js more than once", () => {
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      expect(launchDarklyBrowser.initialize).toHaveBeenCalledTimes(1);
    });

    it("onReady calls wait for ready event to fire", () => {
      const callbackMock = jest.fn();
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      expect(callbackMock.mock.instances.length).toBe(0);
    });

    it("executes all onReady calls after ldClient is ready", () => {
      const callbackMock = jest.fn();
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      jest.runAllTimers();
      expect(callbackMock.mock.instances.length).toBe(3);
    });
  });

  describe("getAllFeatureFlags", () => {

  });

  describe("ldOverrideFlag", () => {

  });

});
