import { v, type Infer } from "convex/values";

export const userStatus = v.union(v.literal("NEEDS_ONBOARDING"), v.literal("ONBOARDED"));
export type UserStatus = Infer<typeof userStatus>;
