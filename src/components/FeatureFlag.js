// @flow
import React from "react";
import { Subscriber } from "react-broadcast";

import type { FeatureFlagType, ConfigType } from "../types";
import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <Subscriber channel={BROADCAST_CHANNEL}>
      {
        (config:ConfigType) => {
          if (config) {
            return (<FeatureFlagRenderer {...config} {...props} />);
          }

          return null;
        }
      }
    </Subscriber>
  );
}
