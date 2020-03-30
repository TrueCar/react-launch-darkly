export type LdClientWrapperType = {
  on: (string, callback: (FlagValueType) => void) => void,
  onReady: (callback: () => void) => void,
  variation: (string, boolean) => FlagValueType
};

export interface FeatureFlagType {
  flagKey: string,
  renderFeatureCallback: (FlagValueType) => React.ReactElement<any> | null | undefined,
  renderDefaultCallback?: () => React.ReactElement<any> | null | undefined,
  initialRenderCallback?: () => React.ReactElement<any> | null | undefined
};

export interface ConfigType {
  clientId?: string,
  user?: UserType,
  clientOptions?: ClientOptionsType
};

export interface UserType {
  // https://docs.launchdarkly.com/docs/js-sdk-reference#section-users
  key: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  custom?: Object
};

export type FlagValueType = string | Object | boolean;

export interface ClientOptionsType  {
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
