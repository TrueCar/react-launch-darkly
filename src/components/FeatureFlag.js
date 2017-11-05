/* @flow */
import React from "react";
import { Subscriber } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <Subscriber channel={BROADCAST_CHANNEL}>
      {
        (config) => {
          if (config) {
            return (<FeatureFlagRenderer config={config} {...props} />);
          }

          return null;
        }
      }
    </Subscriber>
  );
}
