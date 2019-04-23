// @flow
export type LdClientWrapperType = {
  on: (string, (FlagValueType) => void) => void,
  onReady: (() => void) => void,
  variation: (string, boolean) => FlagValueType
};

export type FeatureFlagType = {
  flagKey: string,
  renderFeatureCallback: FlagValueType => ?React$Element<any>,
  renderDefaultCallback?: () => ?React$Element<any>,
  initialRenderCallback?: () => ?React$Element<any>,
  forceInitialize: boolean
};

export type ConfigType = {
  clientId: string,
  user: UserType,
  clientOptions: ClientOptionsType
};

export type UserType = {
  // https://docs.launchdarkly.com/docs/js-sdk-reference#section-users
  key: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  custom?: Object
};

export type FlagValueType = string | Object | boolean;

export type ClientOptionsType = {
  // https://docs.launchdarkly.com/docs/js-sdk-reference#section-bootstrapping
  // Additionally used for SSR when an Object
  bootstrap?: string | { [flagKey: string]: FlagValueType },

  // https://docs.launchdarkly.com/docs/js-sdk-reference#section-secure-mode
  hash?: string,

  // https://github.com/launchdarkly/js-client/blob/master/src/index.js#L241-L243
  baseUrl?: string,
  eventsUrl?: string,
  streamUrl?: string,

  disableClient?: boolean
};
