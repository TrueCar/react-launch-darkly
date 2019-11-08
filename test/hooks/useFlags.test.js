import React from "react";
import { render } from "@testing-library/react";

import LaunchDarkly from "../../src/components/LaunchDarkly";
import useFlags from "../../src/hooks/useFlags";

describe("hooks/useFlags", () => {
  const config = {
    clientId: "80808080",
    user: {
      key: "abc123"
    },
    clientOptions: {
      baseUrl: "https://test"
    }
  };

  const TestComponent = (props = {}) => {
    const { matchControl, matchChallenger, match } = useFlags(
      props.flag || "abc"
    );
    return (
      <div>
        {matchControl() && <p>Matched control</p>}
        {matchChallenger() && <p>Matched challenger</p>}
        {match("challenger2") && <p>Matched challenger 2</p>}
        <p>Matched nothing</p>
      </div>
    );
  };

  it("passes the props to FeatureFlagRenderer", () => {
    const { queryByText, findByText, debug } = render(
      <LaunchDarkly
        clientId={config.clientId}
        user={config.user}
        clientOptions={config.clientOptions}
      >
        <TestComponent />
      </LaunchDarkly>
    );

    debug();
    // expect(renderer.prop("renderFeatureCallback")).toEqual(
    //   allProps.renderFeatureCallback
    // );
    // expect(renderer.prop("renderDefaultCallback")).toEqual(
    //   allProps.renderDefaultCallback
    // );
    // expect(renderer.prop("initialRenderCallback")).toEqual(
    //   allProps.initialRenderCallback
    // );
    // expect(renderer.prop("clientId")).toEqual(config.clientId);
    // expect(renderer.prop("user")).toEqual(config.user);
    // expect(renderer.prop("clientOptions")).toEqual(config.clientOptions);
  });
  // describe("when Broadcast sends no value", () => {
  //   it("does not render the FeatureFlagRenderer component", () => {
  //     const subject = mount(
  //       <LaunchDarkly>
  //         <FeatureFlag {...defaultProps} />
  //       </LaunchDarkly>
  //     );
  //     const renderer = subject.find(FeatureFlagRenderer);
  //     expect(renderer).toHaveLength(0);
  //   });
  //   it("renders the initial render callback, even if LD config is absent", () => {
  //     const initialRenderCallback = jest
  //       .fn()
  //       .mockReturnValue(<div>"initial rendered"</div>);
  //     mount(
  //       <LaunchDarkly>
  //         <FeatureFlag
  //           {...defaultProps}
  //           initialRenderCallback={initialRenderCallback}
  //         />
  //       </LaunchDarkly>
  //     );
  //     expect(initialRenderCallback).toHaveBeenCalledTimes(1);
  //   });
  // });
});
