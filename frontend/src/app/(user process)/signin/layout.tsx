"use client";

import { Roboto } from 'next/font/google'
import './../../globals.css'


const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import AuthProvider from '../../../components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {


  
  return (
    <html lang="en">
      {//<body className={`${font.className} antialiased min-h-screen bg-cover`} style={{backgroundImage: "url('Background-Gradient.jpg')"}}>
      }
      <body className={`${font.className} antialiased min-h-screen bg-gradient-to-br from-sky-50 via-slate-100 to-indigo-100`}>
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-64 -left-64 w-screen h-screen bg-gradient-radial from-sky-300 via-transparent to-transparent rounded-full z-[-1] pulse-slow"></div>
          <div className="absolute -top-32 -right-32 w-screen h-screen bg-gradient-radial from-teal-200 via-transparent to-transparent rounded-full z-[-1] slow-spin"></div>
          <div className="absolute -bottom-64 -right-64 w-screen h-screen bg-gradient-radial from-violet-200 via-transparent to-transparent rounded-full z-[-1] pulse-slow"></div>
        </div> */}
        <div className="flex items-center justify-center min-h-screen">

        <AuthProvider>
          {children}
        </AuthProvider>
        </div>
        </body>
    </html>
  )
}