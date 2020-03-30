import React from "react";
import { LaunchDarklyConsumer } from "./Context";

import { FeatureFlagType } from "../types";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default function FeatureFlag (props:FeatureFlagType) {
  const isConfigEmpty = (config) :boolean => (Object.keys(config).length === 0)

  return (
    <LaunchDarklyConsumer>
      {
        (config) => {
          if (!isConfigEmpty(config) || props.initialRenderCallback) {
            return (<FeatureFlagRenderer {...config} {...props} />);
          }

          return null;
        }
      }
    </LaunchDarklyConsumer>
  );
}
