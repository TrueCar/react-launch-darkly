/* @flow */
import React, { Component } from "react";

import { ldBrowserInit } from "../lib/launchDarkly";
import { FeatureFlagType } from "../types/FeatureFlag";

type LaunchDarklyConfig = {
  apiKey: String,
  user: String
};

type Props = FeatureFlagType & LaunchDarklyConfig;

export default class FeatureFlagRenderer extends Component {
  props: Props;
  state: {
    checkFeatureFlagComplete: boolean,
    showFeature: boolean
  };

  constructor (props:Props) {
    super(props);

    this.state = {
      checkFeatureFlagComplete: false,
      showFeature: false
    };
  }

  componentDidMount () {
    this._checkFeatureFlag();
  }

  render () {
    return (
      <div>{ this._renderLogic() }</div>
    );
  }

  _renderLogic () {
    const { showFeature, checkFeatureFlagComplete } = this.state;
    const { renderFeatureCallback, renderDefaultCallback, initialRenderCallback } = this.props;

    if (showFeature) {
      return renderFeatureCallback();
    } else if (checkFeatureFlagComplete && renderDefaultCallback) {
      return renderDefaultCallback();
    }

    if (initialRenderCallback) {
      return initialRenderCallback();
    }

    return null;
  }

  _checkFeatureFlag () {
    const { launchDarklyConfig: { apiKey, user }, flagKey } = this.props;
    const ldClient = ldBrowserInit(apiKey, user);

    ldClient.on("ready", () => {
      const showFeature = ldClient.variation(flagKey, false);
      const defaultState = { checkFeatureFlagComplete: true };

      if (showFeature) {
        this.setState({ showFeature: true, ...defaultState });
      } else {
        this.setState({ showFeature: false, ...defaultState });
      }
    });
  }
}

