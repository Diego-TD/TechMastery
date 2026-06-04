import { Route, Routes } from "react-router";
import { AppLayout } from "./AppLayout";
import { LandingPage } from "./LandingPage";
import { NotFound } from "./NotFound";
import { OnboardingPage } from "./OnboardingPage";
import { RouteGate } from "./RouteGate";
import { OverviewPage } from "@/features/overview/OverviewPage";
import { MapPage } from "@/features/map/MapPage";
import { InventoryPage } from "@/features/inventory/InventoryPage";
import { ReadinessPage } from "@/features/readiness/ReadinessPage";
import { SimulationsPage } from "@/features/simulations/SimulationsPage";

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
          <Route index element={<OverviewPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="readiness" element={<ReadinessPage />} />
          <Route path="simulations" element={<SimulationsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
