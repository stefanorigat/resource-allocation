import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_ID || 'placeholder',
      clientSecret: process.env.KEYCLOAK_SECRET || 'placeholder',
      issuer: process.env.KEYCLOAK_ISSUER || 'https://placeholder.com/realms/placeholder',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Store the id_token for Keycloak logout
      if (account?.provider === 'keycloak') {
        user.idToken = account.id_token;
      }
      return true;
    },
    async jwt({ token, account }) {
      // Persist the id_token in the JWT
      if (account?.provider === 'keycloak') {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add id_token to the session
      session.idToken = token.idToken as string;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Sign out from Keycloak when NextAuth session ends
      if (token?.idToken) {
        const issuerUrl = process.env.KEYCLOAK_ISSUER || 'https://placeholder.com/realms/placeholder';
        const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout`;
        const params = new URLSearchParams({
          id_token_hint: token.idToken as string,
          post_logout_redirect_uri: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        });
        
        try {
          await fetch(`${logoutUrl}?${params.toString()}`, { method: 'GET' });
        } catch (error) {
          console.error('Error during Keycloak logout:', error);
        }
      }
    },
  },
});

