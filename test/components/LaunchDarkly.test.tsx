import React from "react";
import { configure, shallow } from "enzyme";
import LaunchDarkly from "../../src/components/LaunchDarkly";

const Adapter = require("enzyme-adapter-react-16");
configure({ adapter: new Adapter() });

describe("components/LaunchDarkly", () => {
  it("sets props to the context provider value", () => {
    const expectedConfig = {
      clientId: "12345",
      user: {
        key: "user123"
      }
    };
    const provider = shallow(
        <LaunchDarkly clientId={expectedConfig.clientId} user={expectedConfig.user}>
            <span>Hi</span>
        </LaunchDarkly>);
    expect(provider.find("ContextProvider").props().value).toEqual(expectedConfig);
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
      <LaunchDarkly clientId="080808" user={{key: "zeke"}}>
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
      expect(provider.props().value).toEqual({});

      // with clientId
      provider = shallow(<LaunchDarkly clientId="asdf"><div>Hi</div></LaunchDarkly>);
      expect(provider.props().value).toEqual({});

      // with user
      provider = shallow(<LaunchDarkly user={{key: "key", firstName: "Kelly"}}><div>Hi</div></LaunchDarkly>);
      expect(provider.props().value).toEqual({});
    });
  });
});
