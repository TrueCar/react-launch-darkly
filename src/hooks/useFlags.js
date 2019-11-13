// @flow
import React from "react";
import { LaunchDarklyContext } from "../components/Context";
import type { LdClientWrapperType, FlagValueType } from "../types";
import { ldClientWrapper, ldOverrideFlag } from "../lib/utils";

type UseFlagsReturn = {
  matchControl: () => boolean,
  matchChallenger: () => boolean,
  match: (value: string) => boolean
};

const useFlags = (flagKey: string): UseFlagsReturn => {
  const config = React.useContext(LaunchDarklyContext);
  const { clientId, user, clientOptions, controlTest, challengerTest } =
    config || {};
  const bootstrap = clientOptions && clientOptions.bootstrap;

  const [flagValue, setFlagValue] = React.useState(
    bootstrap && typeof bootstrap === "object" && bootstrap[flagKey]
      ? bootstrap[flagKey]
      : false
  );

  const setStateFlagValue = React.useCallback(
    (flagValue: FlagValueType) => {
      const typeFlagValue = typeof flagValue;
      const override = ldOverrideFlag(flagKey, typeFlagValue);

      if (typeof override !== "undefined") {
        // Override is set for this flag key, use override instead
        setFlagValue(override);
      } else if (flagValue) {
        setFlagValue(flagValue);
      } else {
        setFlagValue(false);
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

  const matchControl = () => (controlTest ? controlTest(flagValue) : false);
  const matchChallenger = () =>
    challengerTest ? challengerTest(flagValue) : false;
  const match = value => flagValue === value;

  return {
    matchControl,
    matchChallenger,
    match
  };
};

export default useFlags;
