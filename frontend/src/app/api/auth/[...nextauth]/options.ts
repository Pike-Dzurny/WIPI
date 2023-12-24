import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import NextAuth from 'next-auth';

import axios from 'axios';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
      id: number; // Add the id field
    };
  }
}

class AuthDetails {
  username: string;
  password: string;

  constructor(username: string, password: string) {
      this.username = username;
      this.password = password;
  }
}

//     signOut: '/signout',
export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        console.log('Consle is being tried');  // Log the credentials
        console.log(credentials);
        try {
          // If credentials are present, make a request to the backend for authentication
          if (credentials) {
            const authDetails = new AuthDetails(credentials.username, credentials.password);
            console.log('Sending credentials:', authDetails);  // Log the credentials
            const response = await axios.post(`http://api:8000/auth`, authDetails);
            console.log('Received response');  // Log the response

            // If the response is OK and includes user data, return the user object
            if (response.status === 200 && response.data) {
              return response.data;
            }
          } 
          // If credentials are not valid, return null to indicate authentication failure
          return null;
        } catch (error) {
          // Catch and log any errors, then return null to indicate authentication failure
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
    newUser: '/signup' 
  },
  callbacks: {
    redirect: async ({ url, baseUrl }) => {
      return url === baseUrl ? '/signin' : url
    },
    async jwt({ token, user }) {
      // If user object is available (i.e., on sign in), add the user's ID to the JWT
      console.log('JWT is being tried');  // Log the credentials
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Add the user's ID from the JWT to the session object
      console.log('Session is being tried');  // Log the credentials
      (session.user as any).id = token.userId;
      return session;
    }
    
  },
  
  
};

export default options;