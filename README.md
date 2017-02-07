# React-Launch-Darkly
*Simple component helpers to support LaunchDarkly in your react app.*

[![npm](https://img.shields.io/npm/v/react-launch-darkly.svg)](https://www.npmjs.com/package/react-launch-darkly)
[![Build Status](https://travis-ci.org/TrueCar/react-launch-darkly.svg?branch=master)](https://travis-ci.org/TrueCar/react-launch-darkly)

# Usage
To setup the `LaunchDarkly` component wrapper, you'll probably want to include it in a top-level
layout component:
```javascript
// MasterLayout.js
import React, { Component } from "react";
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

Then in your lower-level components, to make use of the `FeatureFlag` component:
```javascript
// Home.js
import React, { Component } from "react";
import { FeatureFlag } from "react-launch-darkly";

export default class Home extends Component {
  render () {
    return (
      <div>
        <FeatureFlag
          flagKey="home-test"
          renderFeatureCallback={this._renderFeature}
        />
      </div>
    );
  }

  _renderFeature () {
    return (
      <div>Your new feature!</div>
    );
  }
}
```
# Component Helpers

### `LaunchDarkly`
#### props

##### `clientId` : `string` (required)
This is the client id that is provided to you by LaunchDarkly.

##### `user` : `object` (required)
See the [LaunchDarkly docs](http://docs.launchdarkly.com/docs/js-sdk-reference#section-users) for more info.

---

### `FeatureFlag`
#### props

##### `flagKey` : `string` (required)
The `flagKey` prop is the feature flag key you defined in LaunchDarkly.

##### `renderFeatureCallback` : `function` (required)
The main callback function that renders your feature. In typical scenarios where your flag is a boolean,
you can simply create your function to return the necessary JSX:
```javascript
// Example FeatureFlag component
<FeatureFlag flagKey="example" renderFeatureCallback={this._renderFeature} />

// Callback function
_renderFeature () {
  return (<div>New Feature Here!</div>);
}
```

##### Multivariate Flag Support
When using a multivariate feature flag, the `renderFeatureCallback` prop will pass the value of
the flag as an argument to your callback function:
```javascript
// Example FeatureFlag component
<FeatureFlag flagKey="multivariate-example" renderFeatureCallback={this._renderFeature} />

// Callback function with feature flag value passed in
_renderFeature (featureFlagValue) {
  if (featureFlagValue === "A") {
    return (<div>Bucket "A" Feature!</div>);
  }

  return (<div>Default Bucket Feature Here!</div>);
}
```

#### `initialRenderCallback` : `function` (optional)
Since the feature flags are requested from LaunchDarkly after DOM load, there may be some latency in the rendering. This render callback allows you to provide some sort of feedback to indicate loading, e.g., the typical spinning loader.

#### `renderDefaultCallback` : `function` (optional)
This callback is provided for cases where you want to render something by default, think of it when your feature flag is "off" or falsy.
