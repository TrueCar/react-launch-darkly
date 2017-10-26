/* @flow */
import { Component } from "react";

import { ldOverrideFlag } from "../lib/utils";
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
    this.checkFeatureFlag();
    this.listenFlagChangeEvent();
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

  checkFeatureFlag () {
    const { ldClientWrapper, flagKey } = this.props;

    ldClientWrapper.onReady(() => {
      const flagValue = ldClientWrapper.variation(flagKey, false);
      this.setStateFlagValue(flagValue);
    });
  }

  listenFlagChangeEvent () {
    const { ldClientWrapper, flagKey } = this.props;

    ldClientWrapper.on(`change:${flagKey}`, (value) => {
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
