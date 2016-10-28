export type FeatureFlagType = {
  flagKey: String,
  renderFeatureCallback: Function,
  renderDefaultCallback: ?Function,
  initialRenderCallback: ?Function
};

