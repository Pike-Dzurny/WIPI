"use client";

import './../globals.css'
import { Sidebar } from '../../components/Sidebar/Sidebar';

import AuthProvider from '../../components/AuthProvider';



import { QueryClient, QueryClientProvider } from 'react-query';

import Head from 'next/head';

import { Inter } from 'next/font/google'
const font = Inter({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})


function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient();

  return (

    <QueryClientProvider client={queryClient}>
    <Head>
    </Head>
    <html lang="en">
      <AuthProvider>
        {children}
      </AuthProvider>
    </html>
    </QueryClientProvider>

  )
}

export default RootLayout;