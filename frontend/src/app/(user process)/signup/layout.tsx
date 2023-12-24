"use client";

import './../../globals.css'
import AuthProvider from '../../../components/AuthProvider';

import { Inter } from 'next/font/google'
const font = Inter({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="en">
        <body className={`${font.className} antialiased sm:bg-gradient-to-br sm:from-sky-50 sm:via-slate-100 sm:to-indigo-100 sm:min-h-screen` }>
        <div className="flex items-center justify-center min-h-screen">
                  {children}
        </div>
        </body>
    </html>

  )
}

export default RootLayout;