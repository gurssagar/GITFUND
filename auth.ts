
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    authorization: {
      params: {
        scope: "read:user repo admin:repo_hook write:issues write:pull_requests read:pull_requests"  // 👈 important
      }
    }
  })],
  callbacks: {
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session.user as any).username = token.username;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.accessToken = account.access_token;
        token.username = profile?.login;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to /signup after successful authentication
      if (url === baseUrl+"/Login") {
        return `${baseUrl}/Signup`;
      }
      return url;
    }
  }
});