/* @flow */
import React, { Component } from "react";

import { ldBrowserInit } from "../lib/launchDarkly";
import { FeatureFlagType } from "../types/FeatureFlag";

const url = require('url');

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
    const { launchDarklyConfig: { clientId, user }, flagKey } = this.props;
    const ldClient = ldBrowserInit(clientId, user);

    ldClient.on("ready", () => {
      const showFeature = ldClient.variation(flagKey, false);
      const defaultState = { checkFeatureFlagComplete: true };

      let override;
      /**
       * Follow this overriding convention:
       * @link https://git.corp.tc/capsela/tc_feature_flagging#overriding-feature-flags
       **/
      const query = url.parse(window.location.toString(), true).query;
      const queryFlag = query["features." + flagKey];

      if (typeof queryFlag !== "undefined"){
        if (queryFlag === ""){
          override = true;
        } else if (queryFlag === "false"){
          override = false;
        }
      }

      if (typeof override !== "undefined"){
        this.setState({ showFeature: override, ...defaultState});
      } else if (showFeature) {
        this.setState({ showFeature: true, ...defaultState });
      } else {
        this.setState({ showFeature: false, ...defaultState });
      }
    });
  }
}

