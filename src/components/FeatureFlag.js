/* @flow */
import React from "react";
import { Subscriber } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import FeatureFlagRenderer from "./FeatureFlagRenderer";
import { FeatureFlagType } from "../types/FeatureFlag";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <Subscriber channel={BROADCAST_CHANNEL}>
      {
        (config) => {
          if (config) {
            return (<FeatureFlagRenderer ldClientConfig={config} {...props} />);
          }

          return null;
        }
      }
    </Subscriber>
  );
}
