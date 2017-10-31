describe("lib/ldClientWrapper", () => {
  jest.useFakeTimers();

  let utils = require("./../../src/lib/ldClientWrapper");
  let ldClient = require("ldclient-js");

  const mockLdClient = (() => {
    ldClient.initialize = jest.fn().mockImplementation(() => ({
      on: (event, callback) => {
        setTimeout(() => {
          callback();
        }, 1000);
      }
    }));
  });
  mockLdClient();

  it("exports functions", () => {
    expect("ldClientWrapper").toBeDefined();
  });

  describe("ldClientWrapper", () => {
    const key = "my key";
    const user = "my user";
    const options = { baseUrl: "http://test" };

    describe("proxies to ldClient", () => {
      beforeEach(() => {
        // `ldClientWrapper` is a singleton, we need to reset the module cache with each test
        // to be able to properly assert each instance of `ldClientWrapper`
        jest.resetModules();
        utils = require("./../../src/lib/ldClientWrapper");
        ldClient = require("ldclient-js");
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
});