import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
      .withIndex("by_from_user", q => q.eq("fromUserId", userId))
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
    
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", q => q.eq("email", email))
      .collect();
      
    return await Promise.all(
      invitations.map(async (invitation) => {
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
    
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", q => q.eq("email", email))
      .filter(q => q.eq(q.field("status"), "accepted"))
      .collect();
      
    return await Promise.all(
      invitations.map(async (invitation) => {
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
    
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_from_user", q => q.eq("fromUserId", args.fromUserId))
      .filter(q => q.eq(q.field("email"), user.email))
      .unique();
    
    if (!invitation) throw new Error("Invitation not found");
    
    await ctx.db.patch(invitation._id, { status: "accepted" });
  },
});
