import { Route, Routes } from "react-router";
import { AppLayout } from "./AppLayout";
import { LandingPage } from "./LandingPage";
import { NotFound } from "./NotFound";
import { OnboardingPage } from "./OnboardingPage";
import { RouteGate } from "./RouteGate";
import { AccountsPage } from "./app/AccountsPage";
import { AppHome } from "./app/AppHome";
import { DevicesPage } from "./app/DevicesPage";
import { ReadinessPage } from "./app/ReadinessPage";

/**
 * The full route tree. `RouteGate` is the root layout, so the central
 * auth/onboarding gate runs on every navigation. Nested screens never add
 * their own auth redirects.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RouteGate />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppHome />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="readiness" element={<ReadinessPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
