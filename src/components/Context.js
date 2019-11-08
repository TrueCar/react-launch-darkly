// @flow
import React from "react";

const DEFAULT_CONTEXT = {};

export const LaunchDarklyContext = React.createContext(DEFAULT_CONTEXT);

export const {
  Provider: LaunchDarklyProvider,
  Consumer: LaunchDarklyConsumer
} = LaunchDarklyContext;
