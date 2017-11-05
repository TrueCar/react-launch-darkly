/* @flow */
import React from "react";
import { Broadcast } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";

type Props = {
  clientId: string,
  user: UserType,
  clientOptions: ClientOptionsType,
  children: any
};

export default function LaunchDarkly (props:Props) {
  const { clientId, user, children, clientOptions } = props;

  let config = null;

  // if clientId or user do not exist we still want to
  // render the Broadcast component but we want value
  // to be null.
  if (clientId && user) {
    config = {
      clientId,
      user,
      clientOptions
    };
  }

  return (
    <Broadcast channel={BROADCAST_CHANNEL} value={config}>
      {children}
    </Broadcast>
  );
}
