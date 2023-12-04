"use client";

import './../../globals.css'
import AuthProvider from '../../../components/AuthProvider';
import ParticleBackground from '../../../components/Particles/particle';

import { Inter } from 'next/font/google'
const font = Inter({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="en">
        <body className={`${font.className} antialiased bg-gradient-to-br from-sky-50 via-slate-100 to-indigo-100 min-h-screen` }>
        <div className="flex items-center justify-center min-h-screen">
                  {children}
                  <ParticleBackground />
        </div>
        </body>
    </html>

  )
}

export default RootLayout;