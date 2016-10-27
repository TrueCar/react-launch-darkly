/*global React*/
/*global describe it*/
/*global expect*/
import FeatureFlag from "components/common/FeatureFlag";
import { shallow, mount } from "enzyme";
import * as launchDarkly from "lib/launchDarkly";

describe("<FeatureFlag />", () => {
  const renderFeatureCallback = sinon.stub().returns("feature rendered");
  const renderDefaultCallback = sinon.stub().returns("default rendered");
  const initialRenderCallback = sinon.stub().returns("initial rendered");

  it("renders without an issue", () => {
    const wrapper = shallow(
      <FeatureFlag
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper).to.exist;
  });

  it("renders the proper data-qa attribute", () => {
    const wrapper = shallow(
      <FeatureFlag
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.find("[data-qa='FeatureFlag-my-test']")).to.exist;
  });

  it("calls componentDidMount", () => {
    sinon.spy(FeatureFlag.prototype, "componentDidMount");
    mount(
      <FeatureFlag
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(FeatureFlag.prototype.componentDidMount).to.have.property("callCount", 1);
  });

  describe("the _renderLogic function", () => {
    context("when showFeature is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallow(
          <FeatureFlag
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
              <FeatureFlag
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
              <FeatureFlag
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
              <FeatureFlag
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
              <FeatureFlag
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
          <FeatureFlag
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
    before(() => {
      const variation = sinon.stub();
      variation.onCall(0).returns(true);
      variation.onCall(1).returns(false);

      const ldClientStub = sinon.stub().returns({
        on: (ready, callback) => {
          callback();
        },
        variation: variation
      });
      sinon.stub(launchDarkly, "ldBrowserInit", ldClientStub);
    });

    context("when the feature flag comes back true", () => {
      it("sets the state", () => {
        const wrapper = mount(
          <FeatureFlag
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, showFeature: true });
      });
    });

    context("when the feature flag comes back false", () => {
      it("sets the state", () => {
        const wrapper = mount(
          <FeatureFlag
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        expect(wrapper.state()).to.deep.equal({ checkFeatureFlagComplete: true, showFeature: false });
      });
    });
  });
});
