import { describe, expect, it } from "vitest";
import { resolveRedirect, type SessionState } from "./routeGate";

const APP_PATHS = ["/app", "/app/accounts", "/app/devices", "/app/readiness"];

describe("resolveRedirect", () => {
  it("never redirects while loading", () => {
    for (const path of ["/", "/onboarding", ...APP_PATHS, "/nope"]) {
      expect(resolveRedirect("loading", path)).toBeNull();
    }
  });

  describe("signedOut", () => {
    it("stays on the landing route", () => {
      expect(resolveRedirect("signedOut", "/")).toBeNull();
    });

    it("redirects onboarding and app routes to /", () => {
      for (const path of ["/onboarding", ...APP_PATHS]) {
        expect(resolveRedirect("signedOut", path)).toBe("/");
      }
    });
  });

  describe("needsOnboarding", () => {
    it("stays on the onboarding route", () => {
      expect(resolveRedirect("needsOnboarding", "/onboarding")).toBeNull();
    });

    it("redirects landing and app routes to /onboarding", () => {
      for (const path of ["/", ...APP_PATHS]) {
        expect(resolveRedirect("needsOnboarding", path)).toBe("/onboarding");
      }
    });
  });

  describe("onboarded", () => {
    it("stays on any app route", () => {
      for (const path of APP_PATHS) {
        expect(resolveRedirect("onboarded", path)).toBeNull();
      }
    });

    it("redirects landing and onboarding to /app", () => {
      for (const path of ["/", "/onboarding"]) {
        expect(resolveRedirect("onboarded", path)).toBe("/app");
      }
    });
  });

  it("lets unknown paths fall through to the 404 for every state", () => {
    const states: SessionState[] = [
      "signedOut",
      "needsOnboarding",
      "onboarded",
    ];
    for (const state of states) {
      expect(resolveRedirect(state, "/totally-unknown")).toBeNull();
      // "/application" must not be treated as the "/app" zone
      expect(resolveRedirect(state, "/application")).toBeNull();
    }
  });
});
