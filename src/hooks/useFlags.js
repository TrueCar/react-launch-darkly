// @flow
import React from "react";
import { LaunchDarklyContext } from "../components/Context";
import { type LdClientWrapperType, type FlagValueType } from "../types";
import { ldClientWrapper, ldOverrideFlag } from "../lib/utils";

type UseFlagsReturn = {
  matchControl: () => boolean,
  matchChallenger: () => boolean,
  match: (value: string) => boolean
};

const useFlags = (flagKey: string): UseFlagsReturn => {
  const config = React.useContext(LaunchDarklyContext);
  const { clientId, user, clientOptions } = config || {};
  const bootstrap = clientOptions && clientOptions.bootstrap;

  const [
    checkFeatureFlagComplete,
    setCheckFeatureFlagComplete
  ] = React.useState(false);
  const [flagValue, setFlagValue] = React.useState(
    bootstrap && bootstrap[flagKey] ? bootstrap[flagKey] : false
  );

  const setStateFlagValue = React.useCallback(
    (flagValue: FlagValueType) => {
      const typeFlagValue = typeof flagValue;
      const override = ldOverrideFlag(flagKey, typeFlagValue);

      // Due to this function being called within a callback, we can run into issues
      // where we try to set the state for an unmounted component. Since `isMounted()` is deprecated
      // as part of a React class, we can create our own way to manage it within the protoype.
      // See https://github.com/facebook/react/issues/5465#issuecomment-157888325 for more info
      // if (!this._isMounted) {
      //   return;
      // }

      if (typeof override !== "undefined") {
        // Override is set for this flag key, use override instead
        setFlagValue(override);
        setCheckFeatureFlagComplete(true);
      } else if (flagValue) {
        setFlagValue(flagValue);
        setCheckFeatureFlagComplete(true);
      } else {
        setFlagValue(false);
        setCheckFeatureFlagComplete(true);
      }
    },
    [flagKey]
  );

  const checkFeatureFlag = React.useCallback(
    (ldClient: LdClientWrapperType) => {
      ldClient.onReady(() => {
        const flagValue = ldClient.variation(flagKey, false);

        console.log("ldClient.variation(flagKey, false)", flagKey, flagValue);

        setStateFlagValue(flagValue);
      });
    },
    [flagKey, setStateFlagValue]
  );

  const listenFlagChangeEvent = React.useCallback(
    (ldClient: LdClientWrapperType) => {
      ldClient.on(`change:${flagKey}`, value => {
        setStateFlagValue(value);
      });
    },
    [flagKey, setStateFlagValue]
  );

  const initializeClient = React.useCallback(() => {
    if (clientId && user && clientOptions) {
      // Only initialize the launch darkly js-client when in browser,
      // can not be initialized on SSR due to dependency on XMLHttpRequest.
      const ldClient = ldClientWrapper(clientId, user, clientOptions);
      checkFeatureFlag(ldClient);
      listenFlagChangeEvent(ldClient);
    }
  }, [checkFeatureFlag, clientId, clientOptions, listenFlagChangeEvent, user]);

  React.useEffect(() => {
    if (!(clientOptions && clientOptions.disableClient) || (user && clientId)) {
      initializeClient();
    }
  }, [clientId, clientOptions, initializeClient, user]);

  const matchControl = () => checkFeatureFlagComplete;
  const matchChallenger = () => flagValue;
  const match = value => flagValue === value;

  return {
    matchControl,
    matchChallenger,
    match
  };
};

export default useFlags;
