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
    this._checkFeatureFlag();
    this._listenFlagChangeEvent();
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextState.flagValue !== this.state.flagValue ||
      nextState.checkFeatureFlagComplete !== this.state.checkFeatureFlagComplete
    );
  }

  render () {
    return this._renderLogic();
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

  _checkFeatureFlag () {
    const { ldClientWrapper, flagKey } = this.props;

    ldClientWrapper.onReady(() => {
      const flagValue = ldClientWrapper.variation(flagKey, false);
      this._setStateFlagValue(flagValue);
    });
  }

  _listenFlagChangeEvent () {
    const { ldClientWrapper, flagKey } = this.props;

    ldClientWrapper.on(`change:${flagKey}`, function(value) {
      this._setStateFlagValue(value);
    });
  }

  _setStateFlagValue (flagValue) {
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
