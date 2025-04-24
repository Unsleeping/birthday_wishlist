import { Id } from "../../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";

interface RemoveFriendAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendToRemove: {
    id: Id<"users"> | null;
    name: string;
    isSent: boolean;
  } | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function RemoveFriendAlert({
  open,
  onOpenChange,
  friendToRemove,
  onCancel,
  onConfirm,
}: RemoveFriendAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Friend</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {friendToRemove?.name}? They will no
            longer be able to see your wishlist, and you won't see theirs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
