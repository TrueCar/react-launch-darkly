// @flow
import React from "react";
import { Subscriber } from "react-broadcast";

import type { FeatureFlagType } from "../types";
import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <Subscriber channel={BROADCAST_CHANNEL}>
      {
        (config) => {
          if (config) {
            return (<FeatureFlagRenderer {...config} {...props} />);
          }

          return null;
        }
      }
    </Subscriber>
  );
}
