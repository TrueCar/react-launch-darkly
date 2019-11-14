import React from "react";
import { configure, shallow } from "enzyme";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import { defaultControlTest, defaultChallengerTest } from "../../src/lib/utils";

const Adapter = require("enzyme-adapter-react-16");
configure({ adapter: new Adapter() });

describe("components/LaunchDarkly", () => {
  it("sets props to the context provider value", () => {
    const expectedConfig = {
      clientId: "12345",
      user: {
        key: "user123"
      },
      clientOptions: void 0,
      controlTest: defaultControlTest,
      challengerTest: defaultChallengerTest
    };
    const provider = shallow(
      <LaunchDarkly
        clientId={expectedConfig.clientId}
        user={expectedConfig.user}
      >
        <span>Hi</span>
      </LaunchDarkly>
    );
    expect(provider.find("ContextProvider").props().value).toEqual(
      expectedConfig
    );
  });

  describe("when clientOptions is available", () => {
    it("adds clientOptions to the context value", () => {
      const expectedConfig = {
        clientId: "12345",
        user: {
          key: "user123"
        },
        clientOptions: {
          baseUrl: "http://test"
        },
        controlTest: defaultControlTest,
        challengerTest: defaultChallengerTest
      };
      const provider = shallow(
        <LaunchDarkly
          clientId={expectedConfig.clientId}
          user={expectedConfig.user}
          clientOptions={expectedConfig.clientOptions}
        >
          <div>Hi</div>
        </LaunchDarkly>
      );
      expect(provider.prop("value")).toEqual(expectedConfig);
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
      let provider = shallow(
        <LaunchDarkly>
          <div>Hi</div>
        </LaunchDarkly>
      );
      expect(provider.props().value).toEqual(null);

      // with clientId
      provider = shallow(
        <LaunchDarkly clientId="asdf">
          <div>Hi</div>
        </LaunchDarkly>
      );
      expect(provider.props().value).toEqual(null);

      // with user
      provider = shallow(
        <LaunchDarkly user={{ name: "Kelly Slater" }}>
          <div>Hi</div>
        </LaunchDarkly>
      );
      expect(provider.props().value).toEqual(null);
    });
  });
});
