/* @flow */
import { Component } from "react";

import { ldClientWrapper, ldOverrideFlag } from "../lib/utils";
import { FeatureFlagType } from "../types/FeatureFlag";

type Props = FeatureFlagType & { ldClientWrapper: Object };

export default class FeatureFlagRenderer extends Component {
  props: Props;
  state: {
    checkFeatureFlagComplete: boolean,
    flagValue: any
  };

  constructor (props:Props) {
    super(props);

    this.state = {
      checkFeatureFlagComplete: false,
      flagValue: false
    };
  }

  componentDidMount () {
    const { clientId, user, clientOptions, ldClientWrapper } = this.props.ldClientConfig;

    // Only initialize the launch darkly js-client when in browser,
    // can not be initialized on SSR due to dependency on XMLHttpRequest.
    const ldClient = ldClientWrapper(clientId, user, clientOptions);

    this.checkFeatureFlag(ldClient);
    this.listenFlagChangeEvent(ldClient);
  }

  render () {
    return this.renderLogic();
  }

  renderLogic () {
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

  checkFeatureFlag (ldClient) {
    const { flagKey } = this.props;

    ldClient.onReady(() => {
      const flagValue = ldClientWrapper.variation(flagKey, false);
      this.setStateFlagValue(flagValue);
    });
  }

  listenFlagChangeEvent (ldClient) {
    const { flagKey } = this.props;

    ldClient.on(`change:${flagKey}`, (value) => {
      this.setStateFlagValue(value);
    });
  }

  setStateFlagValue (flagValue) {
    const { flagKey } = this.props;
    const typeFlagValue = typeof flagValue;
    const defaultState = { checkFeatureFlagComplete: true };
    const override = ldOverrideFlag(flagKey, typeFlagValue);

    if (typeof override !== "undefined") {
      // Override is set for this flag key, use override instead
      this.setState({ flagValue: override, ...defaultState });
    } else if (flagValue) {
      this.setState({ flagValue: flagValue, ...defaultState });
    } else {
      this.setState({ flagValue: false, ...defaultState });
    }
  }
}
