import React from "react";
import { shallow } from "enzyme";
import { Broadcast } from "react-broadcast";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import { BROADCAST_CHANNEL } from "../../src/constants/LaunchDarkly";

describe("components/LaunchDarkly", () => {
  it("sets up a broadcast with the correct channel", () => {
    const subject = shallow(
      <LaunchDarkly clientId="080808" user="zeke">
        <div>Hi</div>
      </LaunchDarkly>
    );

    const broadcast = subject.find(Broadcast);
    expect(broadcast.prop("channel")).toEqual(BROADCAST_CHANNEL);
  });

  it("broadcasts the config object", () => {
    const expectedConfig = {
      clientId: "12345",
      user: {
        key: "user123"
      }
    };
    const subject = shallow(
      <LaunchDarkly clientId={expectedConfig.clientId} user={expectedConfig.user}>
        <div>Hi</div>
      </LaunchDarkly>
    );

    const broadcast = subject.find(Broadcast);
    expect(broadcast.prop("value")).toEqual(expectedConfig);
  });

  describe("when clientOptions is available", () => {
    it("adds clientOptions to broadcasted value", () => {
      const expectedConfig = {
        clientId: "12345",
        user: {
          key: "user123"
        },
        clientOptions: {
          baseUrl: "http://test"
        }
      };
      const subject = shallow(
        <LaunchDarkly
          clientId={expectedConfig.clientId}
          user={expectedConfig.user}
          clientOptions={expectedConfig.clientOptions}
        >
          <div>Hi</div>
        </LaunchDarkly>
      );

      const broadcast = subject.find(Broadcast);
      expect(broadcast.prop("value")).toEqual(expectedConfig);
    });
  });

  it("renders the children", () => {
    const subject = shallow(
      <LaunchDarkly clientId="080808" user="zeke">
        <div>Hi</div>
      </LaunchDarkly>
    );

    const child = subject.find("div");
    expect(child.text()).toEqual("Hi");
  });

  describe("when either clientId or user are missing", () => {
    it("broadcasts null", () => {
      // with neither
      let subject = shallow(<LaunchDarkly><div>Hi</div></LaunchDarkly>);
      let child = subject.find("Broadcast");
      expect(child.props().value).toEqual(null);

      // with clientId
      subject = shallow(<LaunchDarkly clientId="asdf"><div>Hi</div></LaunchDarkly>);
      child = subject.find("Broadcast");
      expect(child.props().value).toEqual(null);

      // with user
      subject = shallow(<LaunchDarkly user={{name: "Kelly Slater"}}><div>Hi</div></LaunchDarkly>);
      child = subject.find("Broadcast");
      expect(child.props().value).toEqual(null);
    });
  });
});
