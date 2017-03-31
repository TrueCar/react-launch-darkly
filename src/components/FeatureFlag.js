/* @flow */
import React from "react";
import { Subscriber } from "react-broadcast";

import { ldClientWrapper } from "../lib/utils";
import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import FeatureFlagRenderer from "./FeatureFlagRenderer";
import { FeatureFlagType } from "../types/FeatureFlag";

export default function FeatureFlag (props:FeatureFlagType) {
  return (
    <Subscriber channel={BROADCAST_CHANNEL}>
      {
        (config) => {
          if (config) {
            const { clientId, user } = config;
            const ldClient = ldClientWrapper(clientId, user);

            return (<FeatureFlagRenderer ldClientWrapper={ldClient} {...props} />);
          }

          return null;
        }
      }
    </Subscriber>
  );
}
