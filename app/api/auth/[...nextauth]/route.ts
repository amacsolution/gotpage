import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import { UserData } from "../../profile/route"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const users = await query(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
          ) as UserData[]

          const user = users[0]
          if (!user) return null

          if (!user.password) return null;
          const isValid = await new Promise<boolean>((resolve, reject) => {
            bcrypt.compare(credentials.password, user.password!, (err, res) => {
              if (err) return reject(err);
              resolve(res ?? false);
            });
          });
          if (!isValid) return null

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          }
        } catch (err) {
          console.error("Login error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  secret: process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
