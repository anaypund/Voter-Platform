import { z } from "zod";

export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().optional(),
  passwordHash: z.string(),
  role: z.enum(["member", "admin"]).default("member"),
  isAdmin: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof userSchema>;
export type UpsertUser = Omit<User, "createdAt" | "updatedAt">;
