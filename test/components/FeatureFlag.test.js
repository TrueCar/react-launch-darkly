import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { Subscriber } from "react-broadcast";

import FeatureFlag from "../../src/components/FeatureFlag";
import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import { BROADCAST_CHANNEL } from "../../src/constants/LaunchDarkly";

describe("components/FeatureFlag", () => {
  const defaultProps = {
    flagKey: "abc",
    renderFeatureCallback: () => <div>hi!</div>
  };

  it("should pass the correct broadcast channel to it", () => {
    const subject = mount(
      <LaunchDarkly apiKey="80808080" user="hi">
        <FeatureFlag {...defaultProps} />
      </LaunchDarkly>
    );

    const subscriber = subject.find(Subscriber);

    expect(subscriber.prop("channel")).to.equal(BROADCAST_CHANNEL);
  });

  it("should pass the props to FeatuerFlagRenderer", () => {
    const allProps = {
      ...defaultProps,
      renderDefaultCallback: () => <div>Default</div>,
      initialRenderCallback: () => <div>Initial…</div>
    };

    const subject = mount(
      <LaunchDarkly apiKey="80808080" user="hi">
        <FeatureFlag {...allProps} />
      </LaunchDarkly>
    );

    const renderer = subject.find(FeatureFlagRenderer);
    expect(renderer.prop("flagKey")).to.equal(allProps.flagKey);
    expect(renderer.prop("renderFeatureCallback")).to.equal(allProps.renderFeatureCallback);
    expect(renderer.prop("renderDefaultCallback")).to.equal(allProps.renderDefaultCallback);
    expect(renderer.prop("initialRenderCallback")).to.equal(allProps.initialRenderCallback);
  });

  it("should pass the launchDarklyConfig to FeatuerFlagRenderer", () => {
    const subject = mount(
      <LaunchDarkly apiKey="80808080" user="hi">
        <FeatureFlag {...defaultProps} />
      </LaunchDarkly>
    );

    const renderer = subject.find(FeatureFlagRenderer);
    expect(renderer.prop("launchDarklyConfig")).to.deep.equal({
      apiKey: "80808080",
      user: "hi"
    });
  });
});

