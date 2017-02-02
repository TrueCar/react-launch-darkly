import React from "react";
import { shallow, mount } from "enzyme";
import { expect } from "chai";
import { spy, stub, sandbox } from "sinon";

import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import * as launchDarkly from "../../src/lib/launchDarkly";

describe("components/FeatureFlagRenderer", () => {
  const renderFeatureCallback = stub().returns("feature rendered");
  renderFeatureCallback.withArgs({a: 1}).returns("feature object 1");
  renderFeatureCallback.withArgs(1).returns("feature number 1");
  renderFeatureCallback.withArgs([1]).returns("feature array 1");
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
    context("when flagValue is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: true });
        expect(wrapper.text()).to.equal(renderFeatureCallback());
      });
    });

    context("when flagValue is object", () => {
      it("renders the feature callback for that object", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: { a: 1 } });
        expect(wrapper.text()).to.equal(renderFeatureCallback({ a: 1 }));
      });
    });

    context("when flagValue is number", () => {
      it("renders the feature callback for that number", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: 1 });
        expect(wrapper.text()).to.equal(renderFeatureCallback(1));
      });
    });

    context("when flagValue is array", () => {
      it("renders the feature callback for that array", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            launchDarklyConfig={launchDarklyConfig}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: [1] });
        expect(wrapper.text()).to.equal(renderFeatureCallback([1]));
      });
    });

    context("when flagValue is false", () => {
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
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
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
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
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
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
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
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
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
        wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
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
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });

    context("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.returns(false);
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: false });
      });
    });

    describe("query param flag overrides if not undefined", () => {
      let _sandbox;
      before(() => {
        _sandbox = sandbox.create();
      });
      afterEach(() => {
        _sandbox.restore();
      });
      it("param 'features.flag=false' overrides LD data 'on'", () => {
        variation.returns(true);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features.my-test=false");
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: false });
      });
      it("param 'features.flag' overrides LD data 'off'", () => {
        variation.returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features.my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: true });
      });
      it("param 'features=flag' overrides LD data 'off'", () => {
        variation.returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("httpd://ab.cdef.com?features=my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: true });
      });
      it("param comma-list of features to enable", () => {
        variation.withArgs("one").returns(false);
        variation.withArgs("my-test").returns(false);
        variation.withArgs("two").returns(false);
        sandbox.stub(launchDarkly, "getLocation").returns("http://ab.cdef.com?features=one,my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });
  });
});
