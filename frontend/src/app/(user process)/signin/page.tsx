'use client';

import { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';



export default function SignIn() {


    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();
    const words = ["home", "community", "group", "friend", "life"];
    const [currentWord, setCurrentWord] = useState(words[0]);
    const rotatingTextRef = useRef<HTMLElement | null>(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (status === 'loading') return;
      if (session?.user && status === 'authenticated') {
        router.push('/');
      }
    
      const handleAnimationIteration = () => {
        setIndex((index + 1) % words.length);
      };
    
      const rotatingTextElement = rotatingTextRef.current;
      if (rotatingTextElement) {
        rotatingTextElement.addEventListener('animationiteration', handleAnimationIteration);
      
        return () => {
          rotatingTextElement.removeEventListener('animationiteration', handleAnimationIteration);
        };
      }
    }, [session, router, status, words]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      };
    if(status === 'unauthenticated') {
    return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 md:p-24">
      <div className="hidden md:block md:w-2/3 text-center pl-20 mx-auto">
        <div className="flex items-center justify-center">
          <div className="flex justify-between w-full">
            <div className="text-right flex-1">
              <span className="text-5xl font-bold">Your next artistic</span>
            </div>
            <div className="text-left ml-3 flex-1">
              <div className="rotating-text text-5xl font-bold">
                <span ref={rotatingTextRef}>{words[index]}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text- font-light mt-4 text-left whitespace-normal px-16">Effortlessly blend AI-generated ideas with your unique artistic style, creating a synergy that pushes the boundaries of creativity offering an endless stream of inspiration and a new frontier in the art world. Join us and be part of the movement redefining creativity.</p>
        <div className="flex pt-4">
          <hr className="h-0.5 border-none bg-gradient-to-l from-indigo-200 flex-grow" />
          <hr className="h-0.5 border-none bg-gradient-to-r  from-indigo-200 flex-grow" />
        </div>
      </div>
      <div className="w-full md:w-1/3 pr-20">
        <form onSubmit={handleSubmit} className="shadow p-5 border-gray-300 rounded-md bg-white mb-4">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-4">Sign back in</h2>

          <input name="username" placeholder="Username" required className="mb-4 w-full p-2 border-2 border-gray-300 rounded-md" />
          <input name="password" type="password" placeholder="Password" required className="mb-4 w-full p-2 border-2 border-gray-300 rounded-md" />
          <button type="submit" className="mb-4 w-full p-2 bg-sky-500 hover:bg-sky-400 text-white rounded-md">Sign In</button>
          <hr className='p-2'/>         
          {error && <div className="text-center mx-auto text-red-500">{error}</div>}

          <Link href="/forgot-password">
            <p className="text-sky-500 text-center hover:text-sky-500">Forgot Password?</p>
          </Link>
        </form>
        <div className="shadow p-5 border-gray-300 rounded-md bg-white flex flex-col items-center w-full">
            <p className="mb-4">Don&apos;t have an account?</p>
            <Link href="/signup" className='w-full'>
                <div className="w-full p-2 bg-green-500 text-white text-center rounded-md">Sign Up</div>
            </Link>
        </div>
      </div>
    </div>
  );
    }
}