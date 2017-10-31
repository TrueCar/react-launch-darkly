export function ldOverrideFlag(flagKey, typeFlagValue) {
    const url = require("url");
    let override;
    /*
     POST /users?features=send-onboarding-email
     # Overrides the `send-onboarding-email` boolean feature flag, setting it to `true`
     GET /users/101?features=show-user-email,user-nicknames,hide-inactive-users
     # Enables the `show-user-email`, `user-nicknames`, and `hide-inactive-users` feature flags
     POST /users?features.verify-email=false&features.email-frequency=weekly
     # Disables the `verify-email` feature flag and sets the `email-frequency` variation to "weekly"
     */
    const query = url.parse(exports.getLocation(), true).query;
    const queryFlag = query["features." + flagKey];
    const queryFeatures = query["features"];
  
    if (typeof queryFlag !== "undefined"){
      if (queryFlag === ""){
        override = true;
      } else if (queryFlag === "false"){
        override = false;
      } else {
        override = queryFlag;
      }
  
      if (typeFlagValue === "number") {
        override = parseFloat(override);
      }
    } else if (queryFeatures) {
      queryFeatures.split(",").forEach((f) => {
        if (f === flagKey){
          override = true;
        }
      });
    }
    return override;
}