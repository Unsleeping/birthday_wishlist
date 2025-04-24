import { Skeleton } from "./ui/skeleton";

type WishListSkeletonProps = {
  isOwnList: boolean;
};

export const WishListSkeleton = ({ isOwnList }: WishListSkeletonProps) => {
  return (
    <div className="space-y-4">
      {[...Array(1)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg"
        >
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          {isOwnList && <Skeleton className="h-8 w-20" />}
        </div>
      ))}
    </div>
  );
};
