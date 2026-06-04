import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getCurrentUserOrThrow, userByTokenIdentifier } from "./lib/users";
import type { Doc } from "./_generated/dataModel";
import { onboardingGoal, UserStatus } from "../shared/enums";

const DEFAULT_USER_STATUS: UserStatus = "NEEDS_ONBOARDING";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return user;
  },
});

export const completeOnboarding = mutation({
  args: { goal: v.optional(onboardingGoal) },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const shouldSaveGoal = args.goal !== undefined && args.goal !== user.onboardingGoal;
    if (user.status !== "ONBOARDED" || shouldSaveGoal) {
      const patch: Partial<Doc<"users">> = {
        status: "ONBOARDED",
        updatedAt: Date.now(),
      };
      if (shouldSaveGoal) patch.onboardingGoal = args.goal;
      await ctx.db.patch("users", user._id, patch);
    }
    return user._id;
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not signed in");

    const existing = await userByTokenIdentifier(ctx, identity.tokenIdentifier);
    const now = Date.now();

    const authFields = {
      email: identity.email!,
      updatedAt: now,
      // add fields when needed if updated on clerk user object
    };

    if (existing) {
      const patch: Partial<Doc<"users">> = {};

      if (existing.email !== authFields.email) patch.email = authFields.email;
      // add fields when needed if updated on clerk user object

      if (Object.keys(patch).length > 0) {
        patch.updatedAt = now;
        await ctx.db.patch("users", existing._id, patch);
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      ...authFields,
      status: DEFAULT_USER_STATUS,
    });
  },
});
