import React from "react";
import { shallow, mount } from "enzyme";
import sinon, { spy, stub, sandbox } from "sinon";

import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import * as launchDarkly from "../../src/lib/launchDarkly";

describe("components/FeatureFlagRenderer", () => {
  const renderFeatureCallback = stub().returns("feature rendered");
  const renderDefaultCallback = stub().returns("default rendered");
  const initialRenderCallback = stub().returns("initial rendered");

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
    expect(wrapper).toContainEqual;
  });

  it("renders the proper data-qa attribute", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.find("[data-qa='FeatureFlag-my-test']")).toContainEqual;
  });

  it("calls componentDidMount", () => {
    spy(FeatureFlagRenderer.prototype, "componentDidMount");
    mount(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(FeatureFlagRenderer.prototype.componentDidMount).toContainEqual;
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

    const variation = stub();
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
      const ldClientStub = stub().returns({
        on: (ready, callback) => {
          callback();
        },
        variation: variation
      });
      stub(launchDarkly, "ldBrowserInit", ldClientStub);
    });

    afterEach(() => {
      sinon.restore(launchDarkly);
    });

    describe("when the feature flag comes back true", () => {
      it("sets the state", () => {
        variation.returns(true);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });

    describe("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.returns(false);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: false });
      });
    });

    describe("query param flag overrides if not undefined", () => {
      let _sandbox;
      beforeEach(() => {
        _sandbox = sandbox.create();
      });
      afterEach(() => {
        _sandbox.restore();
      });
      it("param 'features.flag=false' overrides LD data 'on'", () => {
        variation.returns(true);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features.my-test=false");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: false });
      });
      it("param 'features.flag' overrides LD data 'off'", () => {
        variation.returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features.my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
      it("param 'features=flag' overrides LD data 'off'", () => {
        variation.returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("httpd://ab.cdef.com?features=my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
      it("param comma-list of features to enable", () => {
        variation.withArgs("one").returns(false);
        variation.withArgs("my-test").returns(false);
        variation.withArgs("two").returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features=one,my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });
  });
});
