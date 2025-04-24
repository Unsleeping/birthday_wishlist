import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    description: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("wishes", {
      userId,
      description: args.description,
      link: args.link,
      isArchived: false,
    });
  },
});

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    // If userId is provided, fetch that user's wishes
    // Otherwise fetch the current user's wishes
    const targetUserId = args.userId ?? currentUserId;

    return await ctx.db
      .query("wishes")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

export const archive = mutation({
  args: {
    wishId: v.id("wishes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wish = await ctx.db.get(args.wishId);
    if (!wish) throw new Error("Wish not found");
    if (wish.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.wishId, { isArchived: true });
  },
});
