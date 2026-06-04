import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { enUS, esMX } from "@clerk/localizations";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router";
import "./index.css";
import "@/lib/i18n"; // initializes i18next before render
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";
import { AppRoutes } from "./routes/AppRoutes.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { MockDataProvider } from "@/lib/mock/store";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Clerk's localization is set once at mount from the persisted language.
// Changing it is deferred — switching locale reloads the page
const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
const clerkLocalization = storedLocale?.startsWith("es") ? esMX : enUS;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <ClerkProvider
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          localization={clerkLocalization}
        >
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <BrowserRouter>
              <MockDataProvider>
                <AppRoutes />
              </MockDataProvider>
            </BrowserRouter>
          </ConvexProviderWithClerk>
        </ClerkProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
