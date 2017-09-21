import React from "react";
import { shallow, mount } from "enzyme";
import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import * as utils from "../../src/lib/utils";

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

  beforeEach(() => {
    utils.ldClientWrapper = jest.fn();
    utils.ldClientWrapper.mockImplementation(() => ({
      onReady: (callback) => {
        callback();
      },
      variation
    }));
  });

  afterEach(() => {
    utils.ldClientWrapper.mockReset();
  });

  it("renders without an issue", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        ldClientWrapper={utils.ldClientWrapper()}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper).toBeDefined();
  });

  it("renders the proper data-qa attribute", () => {
    const wrapper = shallow(
      <FeatureFlagRenderer
        ldClientWrapper={utils.ldClientWrapper()}
        flagKey="my-test"
        renderFeatureCallback={renderFeatureCallback}
      />
    );
    expect(wrapper.find("[data-qa='FeatureFlag-my-test']")).toBeDefined();
  });

  describe("the _renderLogic function", () => {
    describe("when flagValue is true", () => {
      it("renders the feature callback", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            ldClientWrapper={utils.ldClientWrapper()}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: true });
        expect(wrapper.text()).toEqual(renderFeatureCallback().props.children);
      });
    });

    describe("when flagValue is object", () => {
      it("renders the feature callback for that object", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            ldClientWrapper={utils.ldClientWrapper()}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: { a: 1 } });
        expect(wrapper.text()).toEqual(renderFeatureCallback({ a: 1 }).props.children);
      });
    });

    describe("when flagValue is number", () => {
      it("renders the feature callback for that number", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            ldClientWrapper={utils.ldClientWrapper()}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: 1 });
        expect(wrapper.text()).toEqual(renderFeatureCallback(1).props.children);
      });
    });

    describe("when flagValue is array", () => {
      it("renders the feature callback for that array", () => {
        const wrapper = shallow(
          <FeatureFlagRenderer
            ldClientWrapper={utils.ldClientWrapper()}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: [1] });
        expect(wrapper.text()).toEqual(renderFeatureCallback([1]).props.children);
      });
    });

    describe("when flagValue is false", () => {
      describe("when checkFeatureFlagComplete is true", () => {
        describe("when renderDefaultCallback is provided", () => {
          it("renders the default callback", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                ldClientWrapper={utils.ldClientWrapper()}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
                renderDefaultCallback={renderDefaultCallback}
              />
            );
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
            expect(wrapper.text()).toEqual(renderDefaultCallback().props.children);
          });
        });

        describe("when renderDefaultCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                ldClientWrapper={utils.ldClientWrapper()}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
              />
            );
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: true });
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
                ldClientWrapper={utils.ldClientWrapper()}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
                initialRenderCallback={initialRenderCallback}
              />
            );
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
            expect(wrapper.text()).toEqual(initialRenderCallback().props.children);
          });
        });

        describe("when initialRenderCallback is not provided", () => {
          it("renders nothing", () => {
            const wrapper = shallow(
              <FeatureFlagRenderer
                ldClientWrapper={utils.ldClientWrapper()}
                flagKey="my-test"
                renderFeatureCallback={renderFeatureCallback}
              />
            );
            wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
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
            ldClientWrapper={utils.ldClientWrapper()}
            flagKey="my-test"
            renderFeatureCallback={renderFeatureCallback}
          />
        );
        wrapper.setState({ flagValue: false, checkFeatureFlagComplete: false });
        wrapper.setProps({ renderDefaultCallback: null, initialRenderCallback: null });
        expect(wrapper.type()).toEqual(null);
      });
    });
  });

  describe("the _checkFeatureFlag function", () => {
    const getWrapper = () => {
      return mount(
        <FeatureFlagRenderer
          ldClientWrapper={utils.ldClientWrapper()}
          flagKey="my-test"
          renderFeatureCallback={renderFeatureCallback}
        />
      );
    };

    describe("when the feature flag comes back true", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => true);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });

    describe("when the feature flag comes back false", () => {
      it("sets the state", () => {
        variation.mockImplementation(() => false);
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: false });
      });
    });

    describe("query param flag overrides if not undefined", () => {
      it("param 'features.flag=false' overrides LD data 'on'", () => {
        variation.mockImplementation(() => false);
        utils.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features.my-test=false");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: false });
      });

      it("param 'features.flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        utils.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features.my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });

      it("param 'features=flag' overrides LD data 'off'", () => {
        variation.mockImplementation(() => false);
        utils.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features=my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });

      it("param comma-list of features to enable", () => {
        variation.mockImplementation((flagKey) => {
          if(flagKey === "one" || flagKey === "my-test") {
            return false;
          }
          return true;
        });
        utils.getLocation = jest.fn().mockImplementation(() => "http://ab.cdef.com?features=one,my-test");
        const wrapper = getWrapper();
        expect(wrapper.state()).toEqual({ checkFeatureFlagComplete: true, flagValue: true });
      });
    });
  });
});
