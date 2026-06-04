import { Component, ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import i18n from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// NOTE: Once you get Clerk working you can simplify this error boundary
// or remove it entirely.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: ReactNode | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    const errorText = "" + (error as any).toString();
    if (
      errorText.includes("@clerk/clerk-react") &&
      errorText.includes("publishableKey")
    ) {
      const [clerkDashboardUrl] = errorText.match(/https:\S+/) ?? [];
      const trimmedClerkDashboardUrl = clerkDashboardUrl?.endsWith(".")
        ? clerkDashboardUrl.slice(0, -1)
        : clerkDashboardUrl;
      return {
        error: (
          <div className="flex flex-col gap-2">
            <p>
              Add{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                VITE_CLERK_PUBLISHABLE_KEY="{"<"}your publishable key{">"}"
              </code>{" "}
              to the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                .env.local
              </code>{" "}
              file
            </p>
            {clerkDashboardUrl ? (
              <p>
                You can find it at{" "}
                <a
                  href={trimmedClerkDashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {trimmedClerkDashboardUrl}
                </a>
              </p>
            ) : null}
            <p className="font-mono text-xs text-muted-foreground">
              Raw error: {errorText}
            </p>
          </div>
        ),
      };
    }

    return {
      error: (
        <p className="font-mono text-xs text-muted-foreground">{errorText}</p>
      ),
    };
  }

  componentDidCatch() {}

  render() {
    if (this.state.error !== null) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
          <Alert variant="destructive" className="max-w-lg">
            <TriangleAlert />
            <AlertTitle>{i18n.t(($) => $.errors.title)}</AlertTitle>
            <AlertDescription>
              {this.state.error}
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-fit"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="size-4" />
                {i18n.t(($) => $.errors.retry)}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
