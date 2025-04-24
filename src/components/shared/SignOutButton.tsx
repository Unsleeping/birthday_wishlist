import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button-simple";

export function SignOutButton() {
  const { signOut } = useAuthActions();

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
