jest.useFakeTimers();

jest.mock("launchdarkly-js-client-sdk");

import { initialize } from "launchdarkly-js-client-sdk";
import * as utils from "../../src/lib/utils";

describe("lib/utils", () => {
  initialize.mockImplementation(() => ({
    on: (event, callback) => {
      setTimeout(() => {
        callback();
      }, 1000);
    },
    variation: jest.fn,
    track: jest.fn,
    identify: jest.fn
  }));

  it("exports functions", () => {
    expect(utils["ldClientWrapper"]).toBeDefined();
    expect(utils["ldOverrideFlag"]).toBeDefined();
    expect(utils["getAllFeatureFlags"]).toBeDefined();
  });

  describe("ldClientWrapper", () => {
    const key = "my key";
    const user = { key: "my user" };
    const options = { baseUrl: "http://test" };

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

    it("does not instantiate launchdarkly-js-client-sdk more than once", () => {
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
      expect(callbackMock.mock.instances).toHaveLength(0);
    });

    it("executes all onReady calls after ldClient is ready", () => {
      const callbackMock = jest.fn();
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      utils.ldClientWrapper(key, user).onReady(callbackMock);
      jest.runAllTimers();
      expect(callbackMock.mock.instances).toHaveLength(3);
    });
  });

  describe("getAllFeatureFlags", () => {});

  describe("identify", () => {
    it("launchdarkly-js-client-sdk identify is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(), "identify");
      await utils.identify(1234, {});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("track", () => {
    it("launchdarkly-js-client-sdk track is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(), "track");
      await utils.track(1234);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("ldOverrideFlag", () => {});

  describe("feature", () => {
    const key = "my key";
    const user = { key: "my user" };
    const featureFlag = "home-test";

    it("launchdarkly-js-client-sdk feature is called", async () => {
      const spy = jest.spyOn(utils.ldClientWrapper(), "variation");
      await utils.feature(key, user, featureFlag);
      expect(spy).toHaveBeenCalled();
    });
  });
});
