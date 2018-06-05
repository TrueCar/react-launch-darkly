# React-Launch-Darkly
*Simple component helpers to support LaunchDarkly in your react app.*

[![npm](https://img.shields.io/npm/v/react-launch-darkly.svg)](https://www.npmjs.com/package/react-launch-darkly)
[![Build Status](https://travis-ci.org/TrueCar/react-launch-darkly.svg?branch=master)](https://travis-ci.org/TrueCar/react-launch-darkly)

## Installation
`npm install --save react-launch-darkly`

## Basic Usage
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

## Docs
- [LaunchDarkly component](https://github.com/TrueCar/react-launch-darkly#launchdarkly-component)
- [FeatureFlag component](https://github.com/TrueCar/react-launch-darkly#featureflag-component)
- [SSR Support](https://github.com/TrueCar/react-launch-darkly#ssr-support)
- [Overriding Feature Flags](https://github.com/TrueCar/react-launch-darkly#overriding-feature-flags)
- [Identifying new users](https://github.com/TrueCar/react-launch-darkly#Identify-a-new-user)

---

### `LaunchDarkly` component
Main component that initializes the [LaunchDarkly js-client](https://github.com/launchdarkly/js-client).

#### props

##### `clientId` : `string` (required)
This is the client id that is provided to you by LaunchDarkly.

##### `user` : `object` (required)
See the [LaunchDarkly docs](http://docs.launchdarkly.com/docs/js-sdk-reference#section-users) for more info.

##### `clientOptions` : `object` (optional)

Options that are passed to the LaunchDarkly JS client for additional configuration and features:
- [Bootstrapping](https://docs.launchdarkly.com/docs/js-sdk-reference#section-bootstrapping)
- [Secure Mode](https://docs.launchdarkly.com/docs/js-sdk-reference#section-secure-mode)
- [Setting LaunchDarkly Enterprise URLs](https://github.com/launchdarkly/js-client/blob/master/src/index.js#L241-L243)

---

### `FeatureFlag` component
Note that this component has to be rendered as a child of `LaunchDarkly`

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

---

### SSR Support
SSR is opt-in and you need to specify the initial set of feature flag keys and values through
the `bootstrap` property on `clientOptions`:
```javascript
// currentUser.featureFlags
// >> { "your-feature-flag": true }
const clientOptions = {
  bootstrap: currentUser.featureFlags
};
```

What this gives you is that on SSR, we use the set of feature flags found on `bootstrap` to render
your `FeatureFlag` component. When your `FeatureFlag` component is mounted, it will then initialize
the LaunchDarkly js-client and make the proper XHRs to LaunchDarkly to populate the available
feature flags within js-client's internal state. Thus taking precedence over the feature flags
present in `bootstrap`.

#### Disable LaunchDarkly js-client Initialization (Preventing XHRs)
In the event that you opt-in for SSR, you may not want to make any additional XHRs to LaunchDarkly
since you already have the feature flags provided from your server through `bootstrap`, you can
disable this by supplying `disableClient: true`:
```javascript
const clientOptions = {
  bootstrap: currentUser.featureFlags,
  disableClient: true
};
```

---

### Overriding Feature Flags

If you need to temporarily override the variation reported by a feature flag for
testing or demonstration purposes, you can do so using special query parameters
in the request URL. This can be useful for seeing the possible effects of
enabling a feature flag or to force a specific variation of a multivariate flag.

Do note that overriding a feature flag does not report it to LaunchDarkly nor does it persist.
It's merely a mechanism for testing or demonstration purposes. One notable use-case is in
integration and/or end-to-end testing.

#### Enabling Boolean Feature Flags

You can enable a set of boolean feature flags with a comma-delimited list in the
`features` query parameter:

```
// Overrides the `send-onboarding-email` boolean feature flag, setting it to `true`
http://localhost/users?features=send-onboarding-email
```

```
// Enables the `show-user-email`, `user-nicknames`, and `hide-inactive-users` feature flags
http://localhost/users/101?features=show-user-email,user-nicknames,hide-inactive-users
```

#### Advanced Feature Flag Overriding

If you need to temporarily set a boolean feature flag to `false` or override the
variation reported by a multivariate feature flag, you can use
`features.{feature_flag}` query parameters:

```
// Disables the `verify-email` feature flag and sets the `email-frequency` variation to "weekly"
http://localhost/users?features.verify-email=false&features.email-frequency=weekly
```

The values "true" and "false" are converted into `true` and `false` boolean
values. If the query parameter value is omitted, then the feature flag will be
reported as enabled:

```
// Enables the `show-user-email` feature flag
http://localhost/users/101?features.show-user-email
```

---

### Identify a new user

If you need to change the configured user for the launch darkly client you can do that by calling `identify`.
```
import { identify } from "react-launch-darkly";

identify(launchDarklyClientKey, launchDarklyUser, optionalUserHash);

```

See Launch Darkly's [documentation](https://docs.launchdarkly.com/docs/js-sdk-reference#section-changing-the-user-context) for more information.

#### Examples
```
// Overrides the `send-onboarding-email` boolean feature flag, setting it to `true`
http://localhost/users?features=send-onboarding-email

// Enables the `show-user-email`, `user-nicknames`, and `hide-inactive-users` feature flags
http://localhost/users/101?features=show-user-email,user-nicknames,hide-inactive-users

// Disables the `verify-email` feature flag and sets the `email-frequency` variation to "weekly"
http://localhost/users?features.verify-email=false&features.email-frequency=weekly

// Enables the `show-user-email` feature flag
http://localhost/users/101?features.show-user-email
```
