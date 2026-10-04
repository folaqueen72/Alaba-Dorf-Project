import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins/anonymous";
import { prisma } from "./prisma";

// Admins sign in with email + password. Customers check out as guests
// (anonymous sessions) and can register with email + password later —
// their existing orders follow them via customer.userId.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [anonymous()],
});
