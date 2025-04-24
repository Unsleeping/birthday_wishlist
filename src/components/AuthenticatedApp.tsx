import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserBadge } from "./shared/UserBadge";
import { InvitationManager } from "./InvitationManager";
import { WishList } from "./WishList";
import { Toaster } from "./ui/toaster";
import { Button } from "./ui/button-simple";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export function AuthenticatedApp() {
  // Fetch data only when authenticated
  const user = useQuery(api.auth.loggedInUser);
  const acceptedInvitations = useQuery(api.invitations.listAccepted) ?? [];

  // For viewing friends' wishlists
  const [selectedFriendId, setSelectedFriendId] = useState<Id<"users"> | null>(
    null
  );
  const [selectedFriendName, setSelectedFriendName] = useState<string | null>(
    null
  );

  // Wait for user data to load
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  const viewFriendsList = () => {
    setSelectedFriendId(null);
    setSelectedFriendName(null);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Birthday Wishlist App</h1>
          <div className="flex items-center gap-4">
            <UserBadge />
          </div>
        </div>

        {selectedFriendId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={viewFriendsList}>
                ← Back to My Wishlists
              </Button>
            </div>
            <WishList
              userId={selectedFriendId}
              ownerName={selectedFriendName || undefined}
              isOwnList={false}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WishList isOwnList={true} />

            <div className="space-y-8">
              <InvitationManager />

              {acceptedInvitations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Friends' Wishlists
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {acceptedInvitations.map((invitation) => (
                        <div
                          key={invitation._id}
                          className="flex justify-between items-center p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
                          onClick={() => {
                            setSelectedFriendId(invitation.fromUserId);
                            setSelectedFriendName(invitation.fromUserEmail);
                          }}
                        >
                          <div>
                            <p className="font-medium">
                              {invitation.fromUserEmail}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Click to view wishlist
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="pointer-events-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        <Toaster />
      </div>
    </div>
  );
}
