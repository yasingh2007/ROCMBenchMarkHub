import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function upsertGithubUser(profile: {
  id: string;
  login: string;
  name?: string | null;
  avatar_url?: string | null;
}) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.githubId, profile.id))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const row = {
    id: nanoid(),
    githubId: profile.id,
    login: profile.login,
    name: profile.name ?? profile.login,
    avatarUrl: profile.avatar_url ?? null,
  };

  await db.insert(users).values(row);
  return row;
}

const providers = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

// Local / preview login when GitHub OAuth is not configured
providers.push(
  Credentials({
    id: "dev-login",
    name: "Dev Login",
    credentials: {
      username: { label: "GitHub username", type: "text" },
    },
    async authorize(credentials) {
      const username =
        (credentials?.username as string | undefined)?.trim() || "rocm-dev";

      const db = await getDb();
      const githubId = `dev:${username}`;
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.githubId, githubId))
        .limit(1);

      if (existing[0]) {
        return {
          id: existing[0].id,
          name: existing[0].name ?? existing[0].login,
          email: `${existing[0].login}@users.noreply.github.com`,
          image: existing[0].avatarUrl,
        };
      }

      const row = {
        id: nanoid(),
        githubId,
        login: username,
        name: username,
        avatarUrl: `https://avatars.githubusercontent.com/${username}`,
      };
      await db.insert(users).values(row);

      return {
        id: row.id,
        name: row.name,
        email: `${row.login}@users.noreply.github.com`,
        image: row.avatarUrl,
      };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const gh = profile as {
          id: number | string;
          login: string;
          name?: string | null;
          avatar_url?: string | null;
        };
        const row = await upsertGithubUser({
          id: String(gh.id),
          login: gh.login,
          name: gh.name,
          avatar_url: gh.avatar_url,
        });
        user.id = row.id;
        user.name = row.name ?? row.login;
        user.image = row.avatarUrl;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-rocm-benchmark-hub-secret-change-me",
});
