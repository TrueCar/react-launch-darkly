/* @flow */
import React from "react";
import { Broadcast } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import { UserType } from "../types/User";

type Props = {
  clientId: Object,
  user: UserType,
  children: any,
  // Any option accepted by the Javascript client
  // https://github.com/launchdarkly/js-client/blob/master/src/index.js#L241
  // See src/lib/utils.js for details
  clientOptions: Object
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
      clientOptions: clientOptions
    };
  }

  return (
    <Broadcast channel={BROADCAST_CHANNEL} value={config}>
      {children}
    </Broadcast>
  );
}
