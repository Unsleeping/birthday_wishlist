import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "../../convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-simple";
import { Badge } from "@/components/ui/badge-simple";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentInvitationsSkeleton } from "./sent-invitations-skeleton";
import { RemoveFriendAlert } from "./remove-friend-alert";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          Accepted
        </Badge>
      );
    case "removed":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">Removed</Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export function InvitationManager() {
  const sentInvitations = useQuery(api.invitations.list);
  const incomingInvitations = useQuery(api.invitations.listIncoming) ?? [];
  const createInvitation = useMutation(api.invitations.create);
  const acceptInvitation = useMutation(api.invitations.accept);
  const removeFriend = useMutation(api.invitations.remove);
  const removeSentInvitation = useMutation(api.invitations.removeSent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For remove friend confirmation dialog
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{
    id: Id<"users"> | null;
    name: string;
    isSent: boolean;
  } | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: InviteFormValues) => {
    setIsSubmitting(true);
    try {
      await createInvitation({ email: values.email });
      form.reset();
      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to send invitation", {
        description: `Please check your email and try again. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvitation = async (fromUserId: Id<"users">) => {
    try {
      await acceptInvitation({ fromUserId });
      toast.success("Invitation accepted!");
    } catch (error) {
      toast.error("Failed to accept invitation", {
        description: `Please check your invitation and try again. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  const openRemoveDialog = (
    friendId: Id<"users"> | null,
    friendName: string,
    isSent = false
  ) => {
    setFriendToRemove({ id: friendId, name: friendName, isSent });
    setShowRemoveDialog(true);
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;

    try {
      if (friendToRemove.isSent) {
        // This is a sent invitation
        await removeSentInvitation({ email: friendToRemove.name });
      } else if (friendToRemove.id) {
        // This is a received invitation
        await removeFriend({ friendUserId: friendToRemove.id });
      }
      toast.success("Friend removed successfully");
    } catch (error) {
      toast.error("Failed to remove friend", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setShowRemoveDialog(false);
      setFriendToRemove(null);
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    void handleSubmit(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Manage Invitations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Friend's Email</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <Button
                      type="submit"
                      variant="default"
                      disabled={isSubmitting}
                    >
                      Invite
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <Separator />

        <Tabs defaultValue="sent">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received" className="relative">
              Received
              {incomingInvitations.filter((inv) => inv.status === "pending")
                .length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {
                    incomingInvitations.filter(
                      (inv) => inv.status === "pending"
                    ).length
                  }
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Sent Invitations</h3>
              {!sentInvitations && <SentInvitationsSkeleton />}
              {sentInvitations?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No invitations sent
                </p>
              ) : (
                <div className="space-y-3">
                  {sentInvitations?.map((invitation) => (
                    <div
                      key={invitation._id}
                      className="flex justify-between items-center p-3 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="mt-1">
                          {getStatusBadge(invitation.status)}
                        </div>
                      </div>
                      {invitation.status === "accepted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            openRemoveDialog(
                              null,
                              invitation.email,
                              true // Mark as sent invitation
                            )
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Received Invitations</h3>

              {incomingInvitations.filter((inv) => inv.status === "pending")
                .length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700 mb-4">
                  <p className="font-medium">
                    You have{" "}
                    {
                      incomingInvitations.filter(
                        (inv) => inv.status === "pending"
                      ).length
                    }{" "}
                    pending invitation
                    {incomingInvitations.filter(
                      (inv) => inv.status === "pending"
                    ).length > 1
                      ? "s"
                      : ""}
                    !
                  </p>
                  <p className="text-sm">
                    Accept invitations to view and share wishlists with friends.
                  </p>
                </div>
              )}

              {incomingInvitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No invitations received
                </p>
              ) : (
                <div className="space-y-3">
                  {incomingInvitations
                    .sort((a, b) => {
                      // Custom sort: pending first, then accepted, then removed
                      const statusOrder = {
                        pending: 0,
                        accepted: 1,
                        removed: 2,
                      };
                      const statusA =
                        statusOrder[a.status as keyof typeof statusOrder] ?? 3;
                      const statusB =
                        statusOrder[b.status as keyof typeof statusOrder] ?? 3;
                      return statusA - statusB;
                    })
                    .map((invitation) => (
                      <div
                        key={invitation._id}
                        className="flex justify-between items-center p-3 bg-muted rounded-md"
                      >
                        <div>
                          <p className="font-medium">
                            From: {invitation.fromUserEmail}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(invitation.status)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {invitation.status === "pending" ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                void handleAcceptInvitation(
                                  invitation.fromUserId
                                )
                              }
                            >
                              Accept
                            </Button>
                          ) : (
                            invitation.status === "accepted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  openRemoveDialog(
                                    invitation.fromUserId,
                                    invitation.fromUserEmail,
                                    false // Mark as received invitation
                                  )
                                }
                              >
                                Remove
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <RemoveFriendAlert
          open={showRemoveDialog}
          onOpenChange={setShowRemoveDialog}
          friendToRemove={friendToRemove}
          onCancel={() => setFriendToRemove(null)}
          onConfirm={confirmRemoveFriend}
        />
      </CardContent>
    </Card>
  );
}
