import { useConvexAuth } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { InvitationManager } from "./InvitationManager";
import { WishList } from "./WishList";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex justify-end">
          <SignOutButton />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WishList />
          <InvitationManager />
        </div>
      </div>
    </div>
  );
}
