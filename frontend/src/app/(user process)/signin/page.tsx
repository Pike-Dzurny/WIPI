'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Inter } from 'next/font/google'
const font = Inter({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import React from 'react';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.


import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';



const words = ["home", "friend", "group", "clique", "band"];
const colorClasses = ['bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500', 'bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400', 'bg-gradient-to-r from-fuchsia-500 via-red-600 to-orange-400', 'bg-gradient-to-r from-red-500 to-red-800', 'bg-gradient-to-r from-fuchsia-600 to-pink-600', 'bg-gradient-to-r from-rose-400 to-orange-300', 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500'];


/**
 * React component that handles the sign-in functionality for a user.
 * 
 * @returns The rendered sign-in form and associated functionality.
 */
export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(words[0]);
  const rotatingTextRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const particlesInit = useCallback(async engine => {
    console.log(engine);
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadSlim(engine);
}, []);

const particlesLoaded = useCallback(async container => {
    console.log(container);
}, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user && status === 'authenticated') {
      router.push('/');
    }

  
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);

      // Update the CSS class when the text changes
      if (rotatingTextRef.current) {
        rotatingTextRef.current.classList.remove('rotating-text');
        void rotatingTextRef.current.offsetWidth; // Trigger a reflow
        rotatingTextRef.current.classList.add('rotating-text');
      }

    }, 3000); // Change the word every 2 seconds


  
    return () => clearInterval(interval); // Clean up on unmount
  }, [session, router, status]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    if (username && password) {
      const result = await signIn('credentials', { redirect: false, username, password });
      console.log(result);
      if (result?.ok && result.url) {
        console.log(`Result_URL: ${result.url} | Result_OK: ${result.ok} | Result: ${result}`);
        router.push('/');
      } else {
        setError('Sorry, your password was incorrect. Please double-check your password.');
      }
    } else {
      setError('Username and password are required.');
    }
  }, [router]);



  if (status === 'unauthenticated') {
    return (
      <div className={`${font.className} flex flex-col md:flex-row items-center justify-center min-h-screen p-4 md:p-24 pt-16 md:pt-24 px-`}>
        <header className="fixed flex top-0 left-0 right-0 items-right justify-end py-4 px-8 backdrop-blur-2xl bg-opacity-30 font-light">
          <div className="flex">test</div>
        </header>
        <Particles id="tsparticles" url="http://foo.bar/particles.json" init={particlesInit} loaded={particlesLoaded} />

        <div className="hidden md:block md:w-2/3 md:h-max text-center med:px-20 mx-auto py-32">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-between w-full h-full">
              <div className="text-right flex-1">
                <span className="text-5xl font-bold">Your next artistic</span>
              </div>
              <div className="text-left ml-3 flex-1">
                <div ref={rotatingTextRef} className="rotating-text text-5xl font-bold ml-1">
                    <span className={`${colorClasses[index % colorClasses.length]} bg-clip-text text-transparent`}>
                      {words[index]}
                    </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text- font-light mt-2 text-left whitespace-normal px-16">Discover a world where your creativity knows no bounds. Join our art-centric social media platform to explore, share, and redefine art in a community brimming with inspiration and innovation. Embark on a journey of endless creative possibilities. Be part of the movement shaping the future of art.</p>
          <div className="flex pt-4">
            <hr className="h-0.5 border-none bg-gradient-to-l from-indigo-200 flex-grow" />
            <hr className="h-0.5 border-none bg-gradient-to-r  from-indigo-200 flex-grow" />
          </div>
        </div>
        <div className="w-full md:w-1/3 med:pr-20 flex flex-col items-center justify-center">
          <form onSubmit={handleSubmit} className="shadow p-5 border-gray-200 rounded-md bg-white mb-4 w-full">
            <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-700 mb-4">Sign back in</h2>

            <div className="relative mb-4">
              <input name="username" required className="input-field w-full p-2 border-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400 rounded-md" />
              <label className="label absolute left-2 top-2 transition-all duration-200 text-gray-400">Username</label>
            </div>

            <div className="relative mb-4">
              <input name="password" type="password" required className="input-field w-full p-2 border-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-400 rounded-md" />
              <label className="label absolute left-2 top-2 transition-all duration-200 text-gray-400">Password</label>
            </div>
            <button type="submit" className="mb-4 w-full p-2 text-white rounded-md Sign_In_Button hover:bg-slate-100/90">Sign In</button>
            <hr className='p-2'/>
            {error && <div className="text-center mx-auto text-red-500">{error}</div>}

            <Link href="/forgot-password">
              <p className="text-sky-500 text-center hover:text-sky-400">Forgot Password?</p>
            </Link>
          </form>
          <div className="group shadow p-5 border-gray-200 rounded-md bg-white flex flex-col items-center w-full">
            <p className="mb-4 text-gray-700">Don&apos;t have an account?</p>
            <Link href="/signup" className='w-full'>
            <div className='relative'>
              <div className="absolute w-full p-2 inset-0 rounded-md bg-green-300 blur-sm group-hover:bg-green-500 group-hover:blur trasnition duration-1000 group-hover:duration-300"></div>
              <div className="relative w-full p-2 text-white text-center rounded-md Sign_Up_Button">Sign Up</div>
            </div>
            </Link>
          </div>
        </div>

      </div>
    );
  }
}