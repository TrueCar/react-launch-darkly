import React from "react";
import { render, wait } from "@testing-library/react";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import useFlags from "../../src/hooks/useFlags";
import * as utils from "../../src/lib/utils";

import * as LDClient from "ldclient-js";

LDClient.initialize = jest.fn(() => ({
  identify: () => new Promise([]),
  variation: () => "",
  on: () => {},
  track: () => {},
  allFlags: () => ({})
}));

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

  utils.ldClientWrapper = jest.fn(() => ({
    onReady: jest.fn(),
    on: jest.fn()
  }));

  const TestComponent = (props = {}) => {
    const { matchControl, matchChallenger, match } = useFlags(
      props.flagKey || ""
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

  it.only("renders control", async () => {
    LDClient.initialize = jest.fn(() => ({
      identify: () => new Promise([]),
      variation: () => "",
      on: () => {},
      track: () => {},
      allFlags: () => ({
        [flagKey]: "control"
      })
    }));

    console.log("allFlags", utils.testExports.allFlags());

    await wait(() => {
      utils.getAllFeatureFlags(config.clientId, config.user);
    });

    console.log("allFlags after wait", utils.testExports.allFlags());

    const { queryByText, getByText, rerender, debug } = render(
      <LaunchDarkly {...config}>
        <TestComponent flagKey={flagKey} />
      </LaunchDarkly>
    );

    // rerender(
    //   <LaunchDarkly {...config}>
    //     <TestComponent flagKey={flagKey} />
    //   </LaunchDarkly>
    // );

    getByText("Matched control");
    expect(queryByText("Matched challenger")).toBeNull();
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
  });
});
