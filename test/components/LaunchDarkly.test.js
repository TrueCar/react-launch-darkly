import React from "react";
import { configure, shallow } from "enzyme";
import LaunchDarkly from "../../src/components/LaunchDarkly";

const Adapter = require("enzyme-adapter-react-16");
configure({ adapter: new Adapter() });

describe("components/LaunchDarkly", () => {
  it("broadcasts the config object", () => {
    const expectedConfig = {
      clientId: "12345",
      user: {
        key: "user123"
      }
    };
    const provider = shallow(
      <LaunchDarkly clientId={expectedConfig.clientId} user={expectedConfig.user}>
        <div>Hi</div>
      </LaunchDarkly>
    );
    expect(provider.props().value).toEqual(expectedConfig);
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
      let provider = shallow(<LaunchDarkly><div>Hi</div></LaunchDarkly>);
      expect(provider.props().value).toEqual(null);

      // with clientId
      provider = shallow(<LaunchDarkly clientId="asdf"><div>Hi</div></LaunchDarkly>);
      expect(provider.props().value).toEqual(null);

      // with user
      provider = shallow(<LaunchDarkly user={{name: "Kelly Slater"}}><div>Hi</div></LaunchDarkly>);
      expect(provider.props().value).toEqual(null);
    });
  });
});
