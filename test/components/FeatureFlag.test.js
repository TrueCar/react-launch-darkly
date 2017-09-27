import React from "react";
import { mount } from "enzyme";
import { Subscriber } from "react-broadcast";

import FeatureFlag from "../../src/components/FeatureFlag";
import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import { BROADCAST_CHANNEL } from "../../src/constants/LaunchDarkly";
import * as utils from "../../src/lib/utils";

describe("components/FeatureFlag", () => {
  const defaultProps = {
    flagKey: "abc",
    renderFeatureCallback: () => <div>hi!</div>
  };

  it("should pass the correct broadcast channel to it", () => {
    const subject = mount(
      <LaunchDarkly clientId="80808080" user="hi">
        <FeatureFlag {...defaultProps} />
      </LaunchDarkly>
    );

    const subscriber = subject.find(Subscriber);
    expect(subscriber.prop("channel")).toEqual(BROADCAST_CHANNEL);
  });

  it("should pass the props to FeatuerFlagRenderer", () => {
    const allProps = {
      ...defaultProps,
      renderDefaultCallback: () => <div>Default</div>,
      initialRenderCallback: () => <div>Initial…</div>
    };

    const subject = mount(
      <LaunchDarkly clientId="80808080" user="hi">
        <FeatureFlag {...allProps} />
      </LaunchDarkly>
    );

    const renderer = subject.find(FeatureFlagRenderer);
    expect(renderer.prop("flagKey")).toEqual(allProps.flagKey);
    expect(renderer.prop("renderFeatureCallback")).toEqual(allProps.renderFeatureCallback);
    expect(renderer.prop("renderDefaultCallback")).toEqual(allProps.renderDefaultCallback);
    expect(renderer.prop("initialRenderCallback")).toEqual(allProps.initialRenderCallback);
  });

  it("should pass the ldClientWrapper to FeatuerFlagRenderer", () => {
    const subject = mount(
      <LaunchDarkly clientId="80808080" user="hi">
        <FeatureFlag {...defaultProps} />
      </LaunchDarkly>
    );

    const renderer = subject.find(FeatureFlagRenderer);
    expect(renderer.prop("ldClientWrapper")).toEqual(utils.ldClientWrapper());
  });

  describe("when Broadcast sends no value", () => {
    it("should not render the FeatureFlagRenderer component", () => {
      const subject = mount(
        <LaunchDarkly>
          <FeatureFlag {...defaultProps} />
        </LaunchDarkly>
      );
      const renderer = subject.find(FeatureFlagRenderer);
      expect(renderer).toHaveLength(0);
    });
  });
});
