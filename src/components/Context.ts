import React from "react";
import { ConfigType } from "../types";

const { Provider: LaunchDarklyProvider, Consumer: LaunchDarklyConsumer } = React.createContext<ConfigType>({});

export { LaunchDarklyProvider, LaunchDarklyConsumer };
