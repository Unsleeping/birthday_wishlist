import { useConvexAuth } from "convex/react";
import { AuthForm } from "./components/forms/AuthForm";
import { Toaster } from "./components/ui/toaster";

import { AuthenticatedApp } from "./components/AuthenticatedApp";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthForm />
        <Toaster />
      </div>
    );
  }

  return <AuthenticatedApp />;
}
