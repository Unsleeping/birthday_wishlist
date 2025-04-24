import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Define an interface for the invitation document
interface InvitationDoc {
  _id: Id<"invitations">;
  _creationTime: number;
  fromUserId: Id<"users">;
  email: string;
  status: string;
}

export const create = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("invitations", {
      fromUserId: userId,
      email: args.email,
      status: "pending",
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .collect();
  },
});

export const listIncoming = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error("No email associated with account");

    // Now we know user.email is defined
    const email: string = user.email;

    // Get all invitations for this user
    const allInvitations = (await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect()) as InvitationDoc[];

    // Group invitations by fromUserId and keep only the most recent one
    const friendInvitationsMap = new Map<Id<"users">, InvitationDoc>();

    allInvitations.forEach((invitation) => {
      const fromUserId = invitation.fromUserId;
      const currentInvitation = friendInvitationsMap.get(fromUserId);

      // If we don't have an invitation from this friend yet, or this one is newer
      if (
        !currentInvitation ||
        invitation._creationTime > currentInvitation._creationTime
      ) {
        friendInvitationsMap.set(fromUserId, invitation);
      }
    });

    // Get the most recent invitation from each friend
    const latestInvitations = Array.from(friendInvitationsMap.values());

    return await Promise.all(
      latestInvitations.map(async (invitation) => {
        const fromUser = await ctx.db.get(invitation.fromUserId);
        return {
          ...invitation,
          fromUserEmail: fromUser?.email ?? "Unknown",
        };
      })
    );
  },
});

export const listAccepted = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error("No email associated with account");

    // Now we know user.email is defined
    const email: string = user.email;

    // Get all invitations for this user
    const allInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    // Group invitations by fromUserId and keep only the most recent one from each friend
    const friendInvitationsMap = new Map<Id<"users">, InvitationDoc>();

    allInvitations.forEach((invitation) => {
      // Type assertion to ensure we're working with the right type
      const invitationDoc = invitation as InvitationDoc;
      const fromUserId = invitationDoc.fromUserId;
      const currentInvitation = friendInvitationsMap.get(fromUserId);

      // If we don't have an invitation from this friend yet, or this one is newer
      if (
        !currentInvitation ||
        invitationDoc._creationTime > currentInvitation._creationTime
      ) {
        friendInvitationsMap.set(fromUserId, invitationDoc);
      }
    });

    // Filter to keep only accepted invitations
    const acceptedInvitations = Array.from(
      friendInvitationsMap.values()
    ).filter((invitation) => invitation.status === "accepted");

    return await Promise.all(
      acceptedInvitations.map(async (invitation) => {
        const fromUser = await ctx.db.get(invitation.fromUserId);
        return {
          ...invitation,
          fromUserEmail: fromUser?.email ?? "Unknown",
        };
      })
    );
  },
});

export const accept = mutation({
  args: { fromUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error("Not authenticated or no email");

    // Find the latest pending invitation from this user
    const invitations = (await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.fromUserId))
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), user.email),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect()) as InvitationDoc[];

    if (invitations.length === 0)
      throw new Error("No pending invitation found");

    // Sort by creation time descending to get the newest invitation
    const latestInvitation = invitations.sort(
      (a, b) => b._creationTime - a._creationTime
    )[0];

    await ctx.db.patch(latestInvitation._id, { status: "accepted" });
  },
});

export const remove = mutation({
  args: { friendUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find the invitation where the current user received an invitation from the friend
    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error("Not authenticated or no email");

    // Find the latest accepted invitation from this user
    const invitations = (await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", args.friendUserId))
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), user.email),
          q.eq(q.field("status"), "accepted")
        )
      )
      .collect()) as InvitationDoc[];

    if (invitations.length === 0)
      throw new Error("No accepted invitation found");

    // Sort by creation time descending to get the newest invitation
    const latestInvitation = invitations.sort(
      (a, b) => b._creationTime - a._creationTime
    )[0];

    // Update the status to "removed"
    await ctx.db.patch(latestInvitation._id, { status: "removed" });
  },
});

export const removeSent = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find the latest accepted invitation sent to this email
    const invitations = (await ctx.db
      .query("invitations")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("status"), "accepted")
        )
      )
      .collect()) as InvitationDoc[];

    if (invitations.length === 0)
      throw new Error("No accepted invitation found");

    // Sort by creation time descending to get the newest invitation
    const latestInvitation = invitations.sort(
      (a, b) => b._creationTime - a._creationTime
    )[0];

    // Update the status to "removed"
    await ctx.db.patch(latestInvitation._id, { status: "removed" });
  },
});
