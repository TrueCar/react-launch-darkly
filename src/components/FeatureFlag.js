// @flow
import React from "react";
import { LaunchDarklyConsumer } from "./Context";

import type { FeatureFlagType } from "../types";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <LaunchDarklyConsumer>
      {
        (config) => {
          if (config || props.initialRenderCallback) {
            return (<FeatureFlagRenderer {...(config || {})} {...props} />);
          }

          return null;
        }
      }
    </LaunchDarklyConsumer>
  );
}
