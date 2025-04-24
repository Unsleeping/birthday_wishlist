import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-simple";
import { WishForm } from "@/components/forms/WishForm";
import { WishListSkeleton } from "@/components/wish-list-skeleton";

interface WishListProps {
  userId?: Id<"users">;
  ownerName?: string;
  isOwnList?: boolean;
}

export function WishList({
  userId,
  ownerName,
  isOwnList = true,
}: WishListProps) {
  // If it's our own list, don't pass userId (which will make it use the current user's ID)
  // If it's someone else's list, pass the userId prop
  const wishlistParams = isOwnList ? {} : { userId };
  const wishes = useQuery(api.wishes.list, wishlistParams);

  const archiveWish = useMutation(api.wishes.archive);

  const handleArchive = async (wishId: Id<"wishes">) => {
    try {
      await archiveWish({ wishId });
      toast.success("Wish archived!");
    } catch (error) {
      toast.error("Failed to archive wish", {
        description: `Please check your wish and try again. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {!isOwnList && ownerName ? `${ownerName}'s Wishlist` : "My Wishlist"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 ">
        {isOwnList && <WishForm />}

        <div className="space-y-4 overflow-y-auto max-h-[500px] border rounded-lg p-4">
          {!wishes && <WishListSkeleton isOwnList={isOwnList} />}
          {wishes?.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No wishes yet
            </p>
          ) : (
            wishes?.map((wish) => (
              <div
                key={wish._id}
                className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{wish.description}</p>
                  <a
                    href={wish.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Item →
                  </a>
                </div>
                {isOwnList && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleArchive(wish._id)}
                  >
                    Archive
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
