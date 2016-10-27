/* @flow */
import React, { Component } from "react";
import { Subscriber } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import FeatureFlagRenderer from "./FeatureFlagRenderer";

export default class FeatureFlag extends Component {
  render () {
    return (
      <Subscriber channel={BROADCAST_CHANNEL}>
        { (launchDarklyConfig) => (
            <FeatureFlagRenderer
              launchDarklyConfig={launchDarklyConfig}
              {...this.props}
            />
          )
        }
      </Subscriber>
    );
  }
}

