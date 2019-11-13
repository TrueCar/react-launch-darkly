// @flow
import React from "react";
import { LaunchDarklyProvider } from "./Context";
import { defaultControlTest, defaultChallengerTest } from "../lib/utils";
import type { UserType, ClientOptionsType, FlagValueType } from "../types";

type Props = {
  clientId: string,
  user: UserType,
  clientOptions: ClientOptionsType,
  children: any,
  controlTest?: (flagValue: FlagValueType) => boolean,
  challengerTest?: (flagValue: FlagValueType) => boolean
};

const LaunchDarkly = ({
  clientId,
  user,
  children,
  clientOptions,
  controlTest = defaultControlTest,
  challengerTest = defaultChallengerTest
}: Props) => {
  let config = null;

  // if clientId or user do not exist we still want to
  // render the Consumer component but we want value
  // to be null.
  if (clientId && user) {
    config = {
      clientId,
      user,
      clientOptions,
      controlTest,
      challengerTest
    };
  }

  return <LaunchDarklyProvider value={config}>{children}</LaunchDarklyProvider>;
};

export default LaunchDarkly;
