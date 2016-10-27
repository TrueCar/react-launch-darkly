/* @flow */
import React, { Component } from "react";
import { Broadcast } from "react-broadcast";

import { BROADCAST_CHANNEL } from "../constants/LaunchDarkly.js";

export default class LaunchDarkly extends Component {
  props: {
    apiKey: String,
    user: String,
    children: any
  };

  render () {
    const { apiKey, user } = this.props;
    const value = {
      apiKey,
      user
    };

    return (
      <Broadcast channel={BROADCAST_CHANNEL} value={value}>
        {this.props.children}
      </Broadcast>
    );
  }
}

