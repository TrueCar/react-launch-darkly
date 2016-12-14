# React-Launch-Darkly
*Simple component helpers to support LaunchDarkly in your react app.*

## Features
Supports bare minimum usage of LaunchDarkly, take a look at this [issue](https://github.com/TrueCar/react-launch-darkly/issues/2) to see what we don't support, yet.
If you'd like to see a feature implemented, feel free to submit a PR and we'll have a look.

## Usage
To setup the LaunchDarkly client container, you'll probably want to include it one of your top-level
layout components:
```javascript
// MasterLayout.js
import React, { Component, PropTypes } from "react";
import { LaunchDarkly } from "react-launch-darkly";

export default class MasterLayout extends Component {
  render () {
    return (
      <div>
        <LaunchDarkly clientId={YOUR_LAUNCH_DARKLY_CLIENT_ID} user={{ key: "YOUR_USER_KEY" }}>
          {this.props.children}
        </LaunchDarkly>
      </div>
    );
  }
}
```

Then in your lower-level components, if you wanted to feature flag a specific feature:
```javascript
// Home.js
import React, { Component } from "react";
import { FeatureFlag } from "react-launch-darkly";

export default class Home extends Component {
  render () {
    return (
      <div>
        <FeatureFlag
          // This is the feature flag key you defined in LaunchDarkly
          flagKey="home-test"

          // What to render if the feature is "on"
          renderFeatureCallback={this._renderFeature}

          // (Optional) If you want to have a fallback of some sort when the feature is "off"
          renderDefaultCallback={this._renderDefault}

          // (Optional) Since the feature flags are requested from LaunchDarkly after DOM load,
          // there might be some latency in the rendering. This render callback allows you to
          // provide some sort of feedback to indicate loading or perhaps a placeholder to avoid
          // a FOUC or a jump in element rendering.
          initialRenderCallback={this._initialRender}
        />
      </div>
    );
  }

  _initialRender () {
    return (
      <div>Loading…</div>
    );
  }

  _renderFeature () {
    return (
      <div>The feature is turned on</div>
    );
  }

  _renderDefault () {
    return (
      <div>_default_</div>
    );
  }
}

```
