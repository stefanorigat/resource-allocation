import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLanding = nextUrl.pathname === '/';
      
      if (isOnLanding) {
        if (isLoggedIn) {
          // Redirect authenticated users from landing page to dashboard
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true; // Landing page is accessible for unauthenticated users
      }
      
      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to landing page
      }
      
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

