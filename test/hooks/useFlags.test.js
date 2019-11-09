import React from "react";
import { render } from "@testing-library/react";

import LaunchDarkly from "../../src/components/LaunchDarkly";
import useFlags from "../../src/hooks/useFlags";

describe("hooks/useFlags", () => {
  const flagKey = "abc";
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
    const { matchControl, matchChallenger, match } = useFlags(props.flag || "");
    return (
      <div>
        {matchControl() && <p>Matched control</p>}
        {matchChallenger() && <p>Matched challenger</p>}
        {match("challenger2") && <p>Matched challenger 2</p>}
        <p>Matched nothing</p>
      </div>
    );
  };

  it("does not render control, challenger, or matched challenger value", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly {...config}>
        <TestComponent />
      </LaunchDarkly>
    );

    expect(queryByText("Matched control")).toBeNull();
    expect(queryByText("Matched challenger")).toBeNull();
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
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
