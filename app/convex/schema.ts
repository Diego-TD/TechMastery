import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { userStatus } from "../shared/enums";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    status: userStatus,
    updatedAt: v.number(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
});
