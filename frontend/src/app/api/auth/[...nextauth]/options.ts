import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import NextAuth from 'next-auth';

import axios from 'axios';

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
        try {
          // If credentials are present, make a request to the backend for authentication
          if (credentials) {
            const response = await axios.post(`${process.env.BACKEND_URL}/auth`, {
              username: credentials.username,
              password: credentials.password,
            });
    
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
  }
  

};

export default options;