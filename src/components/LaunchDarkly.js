/* @flow */
import React from "react";
import { Broadcast } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import { UserType } from "../types/User";

type Props = {
  clientId: Object,
  user: UserType,
  children: any
};

export default function LaunchDarkly (props:Props) {
  const { clientId, user, children } = props;
  const value = {
    clientId,
    user
  };

  return (
    <Broadcast channel={BROADCAST_CHANNEL} value={value}>
      {children}
    </Broadcast>
  );
}

