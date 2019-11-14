// @flow
import React from "react";
import type { ConfigType } from "../types";

export const LaunchDarklyContext = React.createContext<ConfigType | null>(null);

export const {
  Provider: LaunchDarklyProvider,
  Consumer: LaunchDarklyConsumer
} = LaunchDarklyContext;
