"use client";

import { Roboto } from 'next/font/google'
import './../../globals.css'
import AuthProvider from '../../../components/AuthProvider';
const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})


function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="en">
        <body className={`${font.className} antialiased bg-gradient-to-br from-sky-50 to-cyan-100 min-h-screen` }>
        <div className="flex items-center justify-center min-h-screen">
                  {children}
        </div>
        </body>
    </html>

  )
}

export default RootLayout;