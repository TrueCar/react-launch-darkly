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
    flagValue: any
  };
  ldClient: Object

  constructor (props:Props) {
    super(props);

    const { launchDarklyConfig: { clientId, user } } = this.props;
    this.ldClient = ldBrowserInit(clientId, user);

    this.state = {
      checkFeatureFlagComplete: false,
      flagValue: false
    };
  }

  componentDidMount () {
    this._checkFeatureFlag();
    this._listenChangeFlag();
  }

  render () {
    return (
      <div>{ this._renderLogic() }</div>
    );
  }

  _renderLogic () {
    const { flagValue, checkFeatureFlagComplete } = this.state;
    const { renderFeatureCallback, renderDefaultCallback, initialRenderCallback } = this.props;

    if (flagValue) {
      return renderFeatureCallback(flagValue);
    } else if (checkFeatureFlagComplete && renderDefaultCallback) {
      return renderDefaultCallback();
    }

    if (initialRenderCallback) {
      return initialRenderCallback();
    }

    return null;
  }

  _listenChangeFlag () {
    const { flagKey } = this.props;

    this.ldClient.on("change", (v) => {
      this.setState({ flagValue: v[flagKey].current });
    });
  }

  _checkFeatureFlag () {
    const { flagKey } = this.props;

    this.ldClient.on("ready", () => {
      const flagValue = this.ldClient.variation(flagKey, false);
      const typeFlagValue = typeof flagValue;
      const defaultState = { checkFeatureFlagComplete: true };
      const override = ldOverrideFlag(flagKey, typeFlagValue);

      if (typeof override !== "undefined"){
        this.setState({ flagValue: override, ...defaultState});
      } else if (flagValue) {
        this.setState({ flagValue: flagValue, ...defaultState });
      } else {
        this.setState({ flagValue: false, ...defaultState });
      }
    });
  }
}
