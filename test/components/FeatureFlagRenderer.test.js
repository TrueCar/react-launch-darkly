import React from "react";
import { shallow, mount } from "enzyme";

import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import * as launchDarkly from "../../src/lib/launchDarkly";

describe("components/FeatureFlagRenderer", () => {
  const renderFeatureCallback = jest.fn().mockReturnValue("feature rendered");
  const renderDefaultCallback = jest.fn().mockReturnValue("default rendered");
  const initialRenderCallback = jest.fn().mockReturnValue("initial rendered");

  const launchDarklyConfig = {
    clientId: "abcdefg",
    user: "yoloman"
  };

  it("renders without an issue", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper).toBeDefined();
  });

  it("renders the proper data-qa attribute", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.find("[data-qa='FeatureFlag-my-test']")).toBeDefined();
  });

  it("calls componentDidMount", () => {
    const wrapper = mount(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: false, showFeature: false });
  });

  describe("the _renderLogic function", () => {
    describe("when showFeature is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ showFeature: true });
        expect(wrapper.text()).toEqual(renderFeatureCallback());
      });
    });

    describe("when showFeature is false", () => {
      describe("when checkFeatureFlagComplete is true", () => {
        describe("when renderDefaultCallback is provided", () => {
          it("renders the default callback", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                launchDarklyConfig={launchDarklyConfig}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
                renderDefaultCallback={renderDefaultCallback}
              />
            );
            wrapper.setState({ showFeature: false, checkFeatureFlagComplete: true });
            expect(wrapper.text()).toEqual(renderDefaultCallback());
          });
        });

        describe("when renderDefaultCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                launchDarklyConfig={launchDarklyConfig}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
              />
            );
            wrapper.setState({ showFeature: false, checkFeatureFlagComplete: true });
            wrapper.setProps({ renderDefaultCallback: null });
            expect(wrapper.text()).toEqual("");
          });
        });
      });

      describe("when checkFeatureFlagComplete is false", () => {
        describe("when initialRenderCallback is provided", () => {
          it("renders the initial callback", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                launchDarklyConfig={launchDarklyConfig}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
                initialRenderCallback={initialRenderCallback}
              />
            );
            wrapper.setState({ showFeature: false, checkFeatureFlagComplete: false });
            expect(wrapper.text()).toEqual(initialRenderCallback());
          });
        });

        describe("when initialRenderCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                launchDarklyConfig={launchDarklyConfig}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
              />
            );
            wrapper.setState({ showFeature: false, checkFeatureFlagComplete: false });
            wrapper.setProps({ initialRenderCallback: null });
            expect(wrapper.text()).toEqual("");
          });
        });
      });
    });

    describe("when all else fails", () => {
      it("it renders nothing", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ showFeature: false, checkFeatureFlagComplete: false });
        wrapper.setProps({ renderDefaultCallback: null, initialRenderCallback: null });
        expect(wrapper.text()).toEqual("");
      });
    });
  });

  describe("the _checkFeatureFlag function", () => {

    const variation = jest.fn();
    const getWrapper = () => {
      return mount(
        <FeatureFlagRenderer
          launchDarklyConfig={launchDarklyConfig}
          flagKey="my-test"
          renderFeatureCallback={renderFeatureCallback}
        />
      );
    };

    beforeEach(() => {
      launchDarkly.ldBrowserInit = jest.fn();
      launchDarkly.ldBrowserInit.mockImplementation(() => ({
        on: (ready, callback) => {
          callback();
        },
        variation
      }));
    });

    afterEach(() => {
      launchDarkly.ldBrowserInit.mockReset();
    });

    describe("when the feature flag comes back true", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => true);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });

    describe("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => false);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: false });
      });
    });

    describe("query param flag overrides if not undefined", () => {
      it("param 'features.flag=false' overrides LD data 'on'", () => {
        variation.mockImplementation(() => false);
        launchDarkly.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features.my-test=false");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: false });
      });
      it("param 'features.flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        launchDarkly.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features.my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
      it("param 'features=flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        launchDarkly.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features=my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
      it("param comma-list of features to enable", () => {
        variation.mockImplementation((flagKey, defaultValue) => {
          if(flagKey === "one" || flagKey === "my-test") {
            return false;
          }
          return true;
        });
        launchDarkly.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features=one,my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });
  });
});
