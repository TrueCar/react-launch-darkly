import React from "react";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import { spy, stub } from "sinon";

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
    expect(wrapper).to.exist;
  });

  it("renders the proper data-qa attribute", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        launchDarklyConfig={launchDarklyConfig}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.find("[data-qa='FeatureFlag-my-test']")).to.exist;
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
    expect(FeatureFlagRenderer.prototype.componentDidMount).to.have.property("callCount", 1);
  });

  describe("the _renderLogic function", () => {
    context("when showFeature is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ showFeature: true });
        expect(wrapper.text()).to.equal(renderFeatureCallback());
      });
    });

    context("when showFeature is false", () => {
      context("when checkFeatureFlagComplete is true", () => {
        context("when renderDefaultCallback is provided", () => {
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
            expect(wrapper.text()).to.equal(renderDefaultCallback());
          });
        });

        context("when renderDefaultCallback is not provided", () => {
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
            expect(wrapper.text()).to.equal("");
          });
        });
      });

      context("when checkFeatureFlagComplete is false", () => {
        context("when initialRenderCallback is provided", () => {
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
            expect(wrapper.text()).to.equal(initialRenderCallback());
          });
        });

        context("when initialRenderCallback is not provided", () => {
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
            expect(wrapper.text()).to.equal("");
          });
        });
      });
    });

    context("when all else fails", () => {
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
        expect(wrapper.text()).to.equal("");
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
    before(() => {

      const ldClientStub = stub().returns({
        on: (ready, callback) => {
          callback();
        },
        variation: variation
      });
      stub(launchDarkly, "ldBrowserInit", ldClientStub);
    });

    context("when the feature flag comes back true", () => {
      it("sets the state", () => {
        variation.returns(true);
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });

    context("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.returns(false);
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, showFeature: false });
      });
    });
  });
});

