import React from "react";
import { LaunchDarklyConsumer } from "./Context";

import { FeatureFlagType, ConfigType } from "../types";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

const FeatureFlag: React.FC<FeatureFlagType> = (props) => {
  const isConfigEmpty = (config: ConfigType): boolean => !Object.keys(config).length;

  return (
    <LaunchDarklyConsumer>
      {
        (config: ConfigType) => {
          if (!isConfigEmpty(config) || props.initialRenderCallback) {
            return (<FeatureFlagRenderer {...config} {...props} />);
          }

          return null;
        }
      }
    </LaunchDarklyConsumer>
  );
};

export default FeatureFlag;
