import "@lumina/env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from "../plugins/plugins.prisma"
import { resend } from "../plugins/plugins.resend"

// auth instance resposible for all the auth features


export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    process.env.CORS_ORIGIN!,
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,

    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: user.email,
        subject: "Reset your password",
        html: `Click <a href="${url}">here</a> to reset your password.`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,

    async sendVerificationEmail({ user, url }) {
      await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: user.email,
        subject: "Verify your email",
        html: `Click <a href="${url}">here</a> to verify your email.`,
      });
    },
  },

  session: {
    fields: {
      ipAddress: "ip",
    },
  },

  verification: {
    modelName: "AuthVerification",
  },
});