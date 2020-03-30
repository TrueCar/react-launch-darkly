import React from "react";
import { shallow, mount, configure } from "enzyme";
import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import * as utils from "../../src/lib/utils";
import { ClientOptionsType } from "../../src/types";

import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

describe("components/FeatureFlagRenderer", () => {
  const renderFeatureCallback = jest.fn().mockImplementation((flagValue) => {
    if(flagValue === {a: 1}) {return <div>"feature object 1"</div>;}
    if(flagValue === 1) {return <div>"feature number 1"</div>;}
    if(flagValue === [1]) {return <div>"feature array 1"</div>;}
    return (
      <div>"feature rendered"</div>
    );
  });
  const renderDefaultCallback = jest.fn().mockReturnValue(<div>"default rendered"</div>);
  const initialRenderCallback = jest.fn().mockReturnValue(<div>"initial rendered"</div>);
  const variation = jest.fn();
  const ldClientWrapperOn = jest.fn();
  const ldClientWrapperOnReady = jest.fn((callback) => {
    callback();
  });

  interface RenderOptions {
    clientOptions?: ClientOptionsType;
    renderDefaultCallback?: jest.Mock;
    initialRenderCallback?: jest.Mock;
  }

  const shallowRender = (options?: RenderOptions) => (
    shallow(
      <FeatureFlagRenderer
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
        user={{key: "test"}}
        clientId="123"
        {...options}
      />,{ disableLifecycleMethods: true }
    )
  );
  const mountRender = (options?: RenderOptions) => (
    mount(
      <FeatureFlagRenderer
        user={{key: "test"}}
        clientId="123"
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
        {...options}
      />
    )
  );

  beforeEach(() => {
    (utils.ldClientWrapper as jest.Mock) = jest.fn();
    (utils.ldClientWrapper as jest.Mock).mockImplementation(() => ({
      onReady: ldClientWrapperOnReady,
      on: ldClientWrapperOn,
      variation
    }));
  });

  afterEach(() => {
    (utils.ldClientWrapper as jest.Mock).mockReset();
  });

  describe("when instantiated", () => {
    it("sets the state", () => {
      const wrapper = shallowRender();
      expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: false, flagValue: false });
    });

    describe ("when bootstrap has flag key and value", () => {
      it("sets the state", () => {
        const clientOptions = {
          bootstrap: {
            "my-test": true
          }
        };
        const wrapper = shallowRender({ clientOptions });
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: false, flagValue: true });
      });
    });
  });

  describe("when rendered", () => {
    it("renders the proper data-qa attribute", () => {
      expect(shallowRender().find("[data-qa='FeatureFlag-my-test']")).toBeDefined();
    });

    describe("when flagValue is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallowRender();
        wrapper.setState({ flagValue: true });
        expect(wrapper.text()).toEqual(renderFeatureCallback().props.children);
      });
    });

    describe("when flagValue is object", () => {
      it("renders the feature callback for that object", () => {
        const wrapper = shallowRender();
        wrapper.setState({ flagValue: { a: 1 } });
        expect(wrapper.text()).toEqual(renderFeatureCallback({ a: 1 }).props.children);
      });
    });

    describe("when flagValue is number", () => {
      it("renders the feature callback for that number", () => {
        const wrapper = shallowRender();
        wrapper.setState({ flagValue: 1 });
        expect(wrapper.text()).toEqual(renderFeatureCallback(1).props.children);
      });
    });

    describe("when flagValue is array", () => {
      it("renders the feature callback for that array", () => {
        const wrapper = shallowRender();
        wrapper.setState({ flagValue: [1] });
        expect(wrapper.text()).toEqual(renderFeatureCallback([1]).props.children);
      });
    });

    describe("when flagValue is false", () => {
      describe("when checkFeatureFlagComplete is true", () => {
        describe("when renderDefaultCallback is provided", () => {
          it("renders the default callback", () => {
            const wrapper = shallowRender({ renderDefaultCallback });
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
            expect(wrapper.text()).toEqual(renderDefaultCallback().props.children);
          });
        });

        describe("when renderDefaultCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallowRender();
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
            wrapper.setProps({ renderDefaultCallback: null });
            expect(wrapper.text()).toEqual("");
          });
        });
      });

      describe("when checkFeatureFlagComplete is false", () => {
        describe("when initialRenderCallback is provided", () => {
          it("renders the initial callback", () => {
            const wrapper = shallowRender({ initialRenderCallback });
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
            expect(wrapper.text()).toEqual(initialRenderCallback().props.children);
          });
        });

        describe("when initialRenderCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallowRender();
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
            wrapper.setProps({ initialRenderCallback: null });
            expect(wrapper.text()).toEqual("");
          });
        });
      });
    });

    describe("when all else fails", () => {
      it("it renders nothing", () => {
        const wrapper = shallowRender();
        wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
        wrapper.setProps({ renderDefaultCallback: null, initialRenderCallback: null });
        expect(wrapper.type()).toEqual(null);
      });
    });
  });

  describe("when mounted", () => {
    describe("when disableClient is true", () => {
      const clientOptions = {
        disableClient: true
      };

      beforeEach(() => {
        mountRender({ clientOptions });
      });

      it("does not initialize the ldClientWrapper", () => {
        expect(utils.ldClientWrapper).not.toHaveBeenCalled();
      });

      it("does not listen to onReady", () => {
        expect(ldClientWrapperOnReady).not.toHaveBeenCalled();
      });

      it("does not listen to change event", () => {
        expect(ldClientWrapperOn).not.toHaveBeenCalled();
      });
    });

    it("initializes the ldClientWrapper", () => {
      const config = {
        clientId: "80808080",
        user: {
          key: "abc123"
        },
        clientOptions: {
          baseUrl: "https://test"
        }
      };

      mountRender({ ...config });

      expect(utils.ldClientWrapper).toHaveBeenCalledWith(config.clientId, config.user, config.clientOptions);
    });

    describe("when change event emits", () => {
      jest.useFakeTimers();

      it("updates the state", () => {
        const expectedFlagValue = { foo: "bar" };
        const callbackSpy = jest.fn();

        variation.mockImplementation(() => true);
        ldClientWrapperOn.mockImplementation((type, callback) => {
          if (type === "change:my-test") {
            setTimeout(() => {
              callbackSpy(expectedFlagValue);
              callback(expectedFlagValue);
            }, 1000);
          }
        });

        const wrapper = mountRender();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
        expect(callbackSpy).not.toHaveBeenCalled();

        jest.runAllTimers();
        expect(callbackSpy).toHaveBeenCalled();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: expectedFlagValue });
      });
    });

    describe("when the feature flag comes back true", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => true);
        const wrapper = mountRender();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });

    describe("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => false);
        const wrapper = mountRender();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: false });
      });
    });

    describe("query param flag overrides if not undefined", () => {
      beforeEach( () => {
        (utils.getLocation as jest.Mock) = jest.fn();
      });
      it("param 'features.flag=false' overrides LD data 'on'", () => {
        variation.mockImplementation(() => false);
        (utils.getLocation as jest.Mock).mockImplementation(() => "http://ab.cdef.com?features.my-test=false");

        const wrapper = mountRender();

        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: false });
      });

      it("param 'features.flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        (utils.getLocation as jest.Mock).mockImplementation(() => "http://ab.cdef.com?features.my-test");

        const wrapper = mountRender();

        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });

      it("param 'features=flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        (utils.getLocation as jest.Mock).mockImplementation(() => "http://ab.cdef.com?features=my-test");

        const wrapper = mountRender();

        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });

      it("param comma-list of features to enable", () => {
        variation.mockImplementation((flagKey) => {
          if(flagKey === "one" || flagKey === "my-test") {
            return false;
          }
          return true;
        });
        (utils.getLocation as jest.Mock).mockImplementation(() => "http://ab.cdef.com?features=one,my-test");
        const wrapper = mountRender();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });
  });

  describe("when unmounted", () => {
    it("keeps track of mount state on instance", () => {
      const wrapper = mountRender();
      const wrapperInstance = wrapper.instance();
      // @ts-ignore
      expect(wrapperInstance._isMounted).toBe(true);
      wrapper.unmount();
      // @ts-ignore
      expect(wrapperInstance._isMounted).toBe(false);
    });
  });
});
