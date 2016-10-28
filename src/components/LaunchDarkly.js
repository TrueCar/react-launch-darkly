/* @flow */
import React, { Component } from "react";
import { Broadcast } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";
import { UserType } from "../types/User";

export default class LaunchDarkly extends Component {
  props: {
    clientId: Object,
    user: UserType,
    children: any
  };

  render () {
    const { clientId, user } = this.props;
    const value = {
      clientId,
      user
    };

    return (
      <Broadcast channel={BROADCAST_CHANNEL} value={value}>
        {this.props.children}
      </Broadcast>
    );
  }
}

