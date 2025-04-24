import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  wishes: defineTable({
    userId: v.id("users"),
    description: v.string(),
    link: v.string(),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"]),
  
  invitations: defineTable({
    fromUserId: v.id("users"),
    email: v.string(),
    status: v.string(),
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_email", ["email"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
