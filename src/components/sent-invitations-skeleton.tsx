import { Skeleton } from "./ui/skeleton";

export const SentInvitationsSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(1)].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 bg-muted rounded-md"
        >
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-20 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
};
