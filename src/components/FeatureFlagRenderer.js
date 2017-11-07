/* @flow */
import { Component } from "react";

import { ldClientWrapper, ldOverrideFlag } from "../lib/utils";

type Props = FeatureFlagType & ConfigType;
type State = {
  checkFeatureFlagComplete: boolean,
  flagValue: any
};

export default class FeatureFlagRenderer extends Component<Props, State> {
  _isMounted: boolean;

  constructor (props:Props) {
    super(props);

    const { flagKey, clientOptions } = this.props;
    const bootstrap = clientOptions && clientOptions.bootstrap;

    this.state = {
      checkFeatureFlagComplete: false,
      flagValue: bootstrap &&
        typeof bootstrap === "object" &&
        bootstrap.hasOwnProperty(flagKey) ? bootstrap[flagKey] : false
    };
  }

  componentDidMount () {
    const { clientId, user, clientOptions } = this.props;

    // Only initialize the launch darkly js-client when in browser,
    // can not be initialized on SSR due to dependency on XMLHttpRequest.
    const ldClient = ldClientWrapper(clientId, user, clientOptions);

    this._isMounted = true;
    this.checkFeatureFlag(ldClient);
    this.listenFlagChangeEvent(ldClient);
  }

  componentWillUnmount () {
    this._isMounted = false;
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

  checkFeatureFlag (ldClient:LdClientWrapperType) {
    const { flagKey } = this.props;

    ldClient.onReady(() => {
      const flagValue = ldClient.variation(flagKey, false);
      this.setStateFlagValue(flagValue);
    });
  }

  listenFlagChangeEvent (ldClient:LdClientWrapperType) {
    const { flagKey } = this.props;

    ldClient.on(`change:${flagKey}`, (value) => {
      this.setStateFlagValue(value);
    });
  }

  setStateFlagValue (flagValue:FlagValueType) {
    const { flagKey } = this.props;
    const typeFlagValue = typeof flagValue;
    const defaultState = { checkFeatureFlagComplete: true };
    const override = ldOverrideFlag(flagKey, typeFlagValue);

    // Due to this function being called within a callback, we can run into issues
    // where we try to set the state for an unmounted component. Since `isMounted()` is deprecated
    // as part of a React class, we can create our own way to manage it within the protoype.
    // See https://github.com/facebook/react/issues/5465#issuecomment-157888325 for more info
    if (!this._isMounted) {
      return;
    }

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
