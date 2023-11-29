"use client";

import { Roboto } from 'next/font/google'
import './../../globals.css'

import Image from 'next/image';

import { useRef, useEffect, useState } from 'react';


const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import { useSession } from 'next-auth/react';

function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {  
    
    const iconstuff = useRef('');
    const { status } = useSession();
  console.log("this is working")
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 275);
      if(currentScrollY > 275) {
        iconstuff.current = 'hi';
      }
      else {
        iconstuff.current = '';
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (status === 'authenticated' || status === 'loading') {
    return (
        <body className={`${font.className} antialiased bg-gradient-to-br from-sky-50 to-cyan-100` }>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="hidden md:block md:col-span-1">
          </div>
          <div className="col-span-full md:col-span-1">
          <div className="flex flex-row pt-0 md:pt-10 rounded-none md:rounded-t-3xl">
            <div className="flex border-l border-r shrink-0 shadow-inner min-h-screen flex-col flex-1 justify-between mx-auto z-0 bg-slate-50">
              {children}
            </div>
          </div>
          </div>
          <div className="hidden md:block md:col-span-1">
            <div className="relative justify-start">
                <div className={`fixed p-8 bottom-0 mb-4 mr-4 transition-all duration-500 ease-in-out ${isScrolled ? 'expanded' : ''}`}>
                    <div className="circle shadow-xl p-2 bg-slate-50 rounded-full flex flex-row items-center gap-x-2 overflow-hidden">
                        <Image
                          className="shadow-inner rounded-full w-full h-full object-cover"
                          alt="Icon"
                          src="https://img1.cgtrader.com/items/2870638/80931d2ba4/large/smiley-ball-3d-model-obj-blend.jpg"
                          width={60} // Add the width property
                          height={60} // Add the height property
                        />                           
                        <div className={`icon1 transition-all duration-500 ease-in-out transform ${isScrolled ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                        {iconstuff.current}
                        </div>
                        <div className={`icon2 transition-all duration-500 ease-in-out transform ${isScrolled ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                        {/* Icon 2 here */}
                        </div>
                      </div>
                    </div>
                </div>
         </div>
        </div>
        </body>
    );
  }

  return null;
}
export default RootLayout;