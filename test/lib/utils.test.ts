jest.useFakeTimers();

jest.mock("ldclient-js");

import { initialize } from "ldclient-js";
import * as utils from "../../src/lib/utils";

describe("lib/utils", () => {
  (initialize as jest.Mock).mockImplementation(() => ({
    on: (event, callback) => {
      setTimeout(() => {
        callback();
      }, 1000);
    },
    variation: jest.fn,
    track: jest.fn,
    identify: jest.fn,
  }));

  const key = "my key";
  const user = { key: "my user" };
  const options = { baseUrl: "http://test" };

  it("exports functions", () => {
    expect(utils["ldClientWrapper"]).toBeDefined();
    expect(utils["ldOverrideFlag"]).toBeDefined();
    expect(utils["getAllFeatureFlags"]).toBeDefined();
  });

  describe("ldClientWrapper", () => {
    describe("proxies to ldClient", () => {
      beforeEach(() => {
        jest.clearAllMocks();
        utils.testExports.reset();
      });

      it("initializes with key, user and default options parameter", () => {
        utils.ldClientWrapper(key, user);
        expect(initialize).toBeCalledWith(key, user, {});
      });

      it("initializes with key, user and options", () => {
        utils.ldClientWrapper(key, user, options);
        expect(initialize).toBeCalledWith(key, user, options);
      });
    });

    it("does not instantiate ldclient-js more than once", () => {
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      expect(initialize).toHaveBeenCalledTimes(1);
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

  describe("identify", () => {
    it("ldclient-js identify is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(key, user), "identify");
      await utils.identify(1234, {});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("track", () => {
    it("ldclient-js track is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(key, user), "track");
      await utils.track(key, user, 1234);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("feature", () => {
    const key = "my key";
    const user = { key: "my user" };
    const featureFlag = "home-test";

    it("ldclient-js feature is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(key, user), "variation");
      await utils.feature(key, user, featureFlag);
      expect(spy).toHaveBeenCalled();
    });
  });

});
