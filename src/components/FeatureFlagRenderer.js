/* @flow */
import React, { Component } from "react";

import { ldBrowserInit, ldOverrideFlag } from "../lib/launchDarkly";
import { FeatureFlagType } from "../types/FeatureFlag";

type LaunchDarklyConfig = {
  clientId: String,
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
      return renderFeatureCallback(showFeature);
    } else if (checkFeatureFlagComplete && renderDefaultCallback) {
      return renderDefaultCallback();
    }

    if (initialRenderCallback) {
      return initialRenderCallback();
    }

    return null;
  }

  _checkFeatureFlag () {
    const { launchDarklyConfig: { clientId, user }, flagKey } = this.props;
    const ldClient = ldBrowserInit(clientId, user);

    ldClient.on("ready", () => {
      const showFeature = ldClient.variation( flagKey, false);
      const typeShowFeature = typeof showFeature;
      const defaultState = { checkFeatureFlagComplete: true };
      const override = ldOverrideFlag(flagKey, typeShowFeature);

      if (typeof override !== "undefined"){
        this.setState({ showFeature: override, ...defaultState});
      } else if (showFeature) {
        this.setState({ showFeature: showFeature, ...defaultState });
      } else {
        this.setState({ showFeature: false, ...defaultState });
      }
    });
  }
}
