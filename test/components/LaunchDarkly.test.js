import React, { Component } from "react";
import { shallow, mount } from "enzyme";
import { Broadcast } from "react-broadcast";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import FeatureFlag from "../../src/components/FeatureFlag";
import FeatureFlagRenderer from "../../src/components/FeatureFlagRenderer";
import { BROADCAST_CHANNEL } from "../../src/constants/LaunchDarkly";

describe("components/LaunchDarkly", () => {
  it("should setup a broadcast with on the correct channel", () => {
    const subject = shallow(
      <LaunchDarkly clientId="080808" user="zeke">
        <div>Hi</div>
      </LaunchDarkly>
    );

    const broadcast = subject.find(Broadcast);
    expect(broadcast.prop("channel")).toEqual(BROADCAST_CHANNEL);
  });

  it("should pass config object as the value to the broadcast", () => {
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

  it("should render the children", () => {
    const subject = shallow(
      <LaunchDarkly clientId="080808" user="zeke">
        <div>Hi</div>
      </LaunchDarkly>
    );

    const child = subject.find("div");
    expect(child.text()).toEqual("Hi");
  });

  it("should render Broadcast with a value of null when either clientId or user are missing", () => {
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

  // No longer a valid concern since we are not passing the clientId or user to any of the children.
  // Instead the ldClient is initialized in the LaunchDarkly component and passed down.
  // Keeping this test for now in case we need to alter it for some other concern.
  it.skip("should propagate clientId and user even when shouldComponentUpdate is false somewhere above the flag renderer", () => {
    class A extends Component {
      props: {
        children: any
      };

      shouldComponentUpdate () {
        return false;
      }

      render () {
        return (
          <div>{this.props.children}</div>
        );
      }
    }

    class App extends Component {
      constructor (props) {
        super(props);
        this.state = {
          user: "i"
        };

        this._renderFeature = this._renderFeature.bind(this);
        this._updateUser = this._updateUser.bind(this);
      }

      state: {
        user: String
      };

      render () {
        return (
          <LaunchDarkly clientId="808080" user={this.state.user}>
            <div>
              <button id="updateUser" onClick={this._updateUser}>UpdateUser</button>
              <A>
                <FeatureFlag
                  flagKey="abc"
                  renderFeatureCallback={this._renderFeature}
                />
              </A>
            </div>
          </LaunchDarkly>
        );
      }

      _renderFeature() {
        return <div>feature render</div>;
      }

      _updateUser () {
        this.setState({
          user: "imarealuser"
        });
      }
    }

    const subject = mount(
      <App />
    );

    const renderer = subject.find(FeatureFlagRenderer);
    expect(renderer.prop("launchDarklyConfig").user).toEqual("i");
    subject.find("#updateUser").simulate("click");
    expect(renderer.prop("launchDarklyConfig").user).toEqual("imarealuser");
  });
});
