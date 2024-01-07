"use client";

import './../globals.css'
import { Sidebar } from '../../components/Sidebar/Sidebar';

import AuthProvider from '../../components/AuthProvider';



import { QueryClient, QueryClientProvider } from 'react-query';

import Head from 'next/head';

import { Inter } from 'next/font/google'
import { ProfilePicProvider } from '@/components/ProfilePicContext';
import { PostUpdateProvider } from '@/components/PostUpdateContext';
import { usePostUpdate } from "@/components/PostUpdateContext";
const font = Inter({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})


function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning={true}>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      <AuthProvider>
        <ProfilePicProvider>
        <PostUpdateProvider>
        {children}
        </PostUpdateProvider>
        </ProfilePicProvider>
      </AuthProvider>
    </html>


  )
}

export default RootLayout;