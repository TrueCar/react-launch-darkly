import React from "react";
import { render } from "@testing-library/react";
import LaunchDarkly from "../../src/components/LaunchDarkly";
import useFlags from "../../src/hooks/useFlags";
import * as LDClient from "launchdarkly-js-client-sdk";

LDClient.initialize = jest.fn(() => ({
  identify: () => new Promise([]),
  variation: () => "",
  on: () => {},
  track: () => {},
  allFlags: () => ({})
}));

describe("hooks/useFlags", () => {
  const flagKey = "abc";
  const generateConfig = bootstrap => {
    const config = {
      clientId: "80808080",
      user: {
        key: "abc123"
      },
      clientOptions: {
        baseUrl: "https://test"
      }
    };
    if (bootstrap) {
      config.clientOptions.bootstrap = bootstrap;
    }
    return config;
  };

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

  it("does not render control, challenger, or matched challenger value when config not provided", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly>
        <TestComponent />
      </LaunchDarkly>
    );

    expect(queryByText("Matched control")).toBeNull();
    expect(queryByText("Matched challenger")).toBeNull();
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
  });

  it("does not render control, challenger, or matched challenger value when flag not returned", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly {...generateConfig()}>
        <TestComponent />
      </LaunchDarkly>
    );

    expect(queryByText("Matched control")).toBeNull();
    expect(queryByText("Matched challenger")).toBeNull();
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
  });

  it("renders control", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly
        {...generateConfig({
          [flagKey]: "control"
        })}
      >
        <TestComponent flagKey={flagKey} />
      </LaunchDarkly>
    );

    getByText("Matched control");
    expect(queryByText("Matched challenger")).toBeNull();
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
  });

  it("renders challenger", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly
        {...generateConfig({
          [flagKey]: "challenger"
        })}
      >
        <TestComponent flagKey={flagKey} />
      </LaunchDarkly>
    );

    expect(queryByText("Matched control")).toBeNull();
    getByText("Matched challenger");
    expect(queryByText("Matched challenger 2")).toBeNull();
    getByText("Matched nothing");
  });

  it("renders challenger 2", () => {
    const { queryByText, getByText } = render(
      <LaunchDarkly
        {...generateConfig({
          [flagKey]: "challenger2"
        })}
      >
        <TestComponent flagKey={flagKey} />
      </LaunchDarkly>
    );

    expect(queryByText("Matched control")).toBeNull();
    getByText("Matched challenger");
    getByText("Matched challenger 2");
    getByText("Matched nothing");
  });
});
