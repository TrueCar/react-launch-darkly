import React from "react";
import { LaunchDarklyProvider } from "./Context";

import { UserType, ClientOptionsType, ConfigType } from "../types"

interface Props {
  clientId?: string,
  user?: UserType,
  clientOptions?: ClientOptionsType,
  children: any
}

export default function LaunchDarkly (props:Props) {
  const { clientId, user, children, clientOptions } = props;

  let config: ConfigType | {} = {};

  // if clientId or user do not exist we still want to
  // render the Consumer component but we want value
  // to be null.
  if (clientId && user) {
    config = {
      clientId,
      user,
      clientOptions
    };
  }

  return (
    <LaunchDarklyProvider value={config}>
      {children}
    </LaunchDarklyProvider>
  );
}
