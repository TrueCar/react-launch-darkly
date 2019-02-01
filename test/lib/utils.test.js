describe("lib/utils", () => {
  jest.useFakeTimers();

  let utils = require("./../../src/lib/utils");
  let ldClient = require("ldclient-js").default;

  const mockLdClient = (() => {
    ldClient.identify = jest.fn();

    ldClient.initialize = jest.fn().mockImplementation(() => ({
      on: (event, callback) => {
        setTimeout(() => {
          callback();
        }, 1000);
      },
      variation: jest.fn,
      track: jest.fn,
      identify: jest.fn,
    }));
  });
  mockLdClient();

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
        // `ldClientWrapper` is a singleton, we need to reset the module cache with each test
        // to be able to properly assert each instance of `ldClientWrapper`
        jest.resetModules();
        utils = require("./../../src/lib/utils");
        ldClient = require("ldclient-js").default;
        mockLdClient();
      });

      it("initializes with key, user and default options parameter", () => {
        utils.ldClientWrapper(key, user);
        expect(ldClient.initialize).toBeCalledWith(key, user, {});
      });

      it("initializes with key, user and options", () => {
        utils.ldClientWrapper(key, user, options);
        expect(ldClient.initialize).toBeCalledWith(key, user, options);
      });
    });

    it("does not instantiate ldclient-js more than once", () => {
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      utils.ldClientWrapper(key, user);
      expect(ldClient.initialize).toHaveBeenCalledTimes(1);
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

  describe("identify", () => {
    it("ldclient-js identify is called", () => {
      utils.identify(1234, {}).then( () => {
        expect(ldClient.identify).toHaveBeenCalled();
      });
    });
  });

  describe("track", () => {
    it("is called", async () => {
      const spy = jest.spyOn(utils, "track");
      await utils.track(1234);
      expect(spy).toHaveBeenCalled();
    });

    it("ldclient-js track is called", async () => {
      // console.log(ldClient);
      const spy = jest.spyOn(utils.ldClientWrapper(), "track");
      await utils.track(1234);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("ldOverrideFlag", () => {
  });

  describe("feature", () => {
    const key = "my key";
    const user = { key: "my user" };
    const featureFlag = "home-test";

    it("is called", async () => {
      const spy = jest.spyOn(utils, "feature");
      await utils.feature(key, user, featureFlag);
      expect(spy).toHaveBeenCalled();
    });

    it("ldclient-js feature is called", async () => {
      // console.log(ldClient);
      const spy = jest.spyOn(utils.ldClientWrapper(), "variation");
      await utils.feature(key, user, featureFlag);
      expect(spy).toHaveBeenCalled();
    });
  });

});
