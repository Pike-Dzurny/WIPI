"use client";

import { Roboto } from 'next/font/google';
import './../../globals.css';

import { useRef, useEffect, useState } from 'react';

const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import { useSession } from 'next-auth/react';
import { Overlay } from '@/components/Overlay';
import { OverlayContext } from '@/components/OverlayContext';
import Image from 'next/image'
import { Sidebar } from '@/components/Sidebar/Sidebar';


interface UserPostBase {
  username: string;
  post_content: string;
}

function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [iconstuff, setIconstuff] = useState('');
  const { status } = useSession();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [postContent, setPostContent] = useState('');

  const handleError = (errorMessage: string) => {
    // Handle error using a proper error handling mechanism or library
    console.error(errorMessage);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) {
      handleError('No active session');
      return;
    }

    console.log('Trying to pass!'); // The authenticated user
    if (!session.user || !session.user.name) {
      handleError('User or username is not defined');
      return;
    }

    // Create an instance of UserPostBase
    const userPost: UserPostBase = {
      username: session.user.name, // replace with the actual username
      post_content: postContent,
    };

    console.log(userPost);

    try {
      const response = await fetch(`http://localhost:8000/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPost),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Data status:', data.status);
      if (data.status === 'success') {
        // Handle success (e.g., clear the textarea and close the overlay)
        setPostContent('');
        setIsOverlayOpen(false);
      } else {
        // Handle error
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 275);
      if (currentScrollY > 275) {
        setIconstuff('hi');
      } else {
        setIconstuff('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (status === 'authenticated' || status === 'loading') {
    return (
      <body className={`${font.className} antialiased sm:bg-gradient-to-br sm:from-sky-50 sm:via-slate-100 sm:to-indigo-100`}>
        <div className={`flex flex-col md:flex-row ${isOverlayOpen ? 'blur-sm' : ''}`}>
          <div className="hidden md:flex justify-center items-center flex-none md:flex-grow">

          <div className="flex flex-col items-end justify-center min-h-screen px-8 relative">
          <Sidebar />
          </div>

          </div>
          <div className="flex-grow basis-3/12 md:x-12">
            <div className="flex flex-row pt-0 md:pt-10 rounded-none md:rounded-t-3xl">
              <div className="flex border-l border-r shrink-0 shadow-inner min-h-screen flex-col flex-1 justify-between mx-auto z-0 bg-slate-50">
                <OverlayContext.Provider value={{ isOverlayOpen, setIsOverlayOpen }}>
                  {children}
                </OverlayContext.Provider>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center flex-none md:flex-grow">

          <div className="flex flex-col items-end justify-center min-h-screen px-8 relative">
          </div>

          </div>
        </div>
        <Overlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(!isOverlayOpen)}>
            <button className="absolute top-0 left-0 m-2" onClick={() => setIsOverlayOpen(!isOverlayOpen)}>
              X
            </button>
            <div className="flex items-start space-x-4">
              {/* ... */}
              <div className="min-w-0 flex-1">
                <form action="#" className="relative" onSubmit={handleSubmit}>
                  <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="comment" className="sr-only">
                      Add your comment
                    </label>
                    <textarea
                      rows={3}
                      name="comment"
                      id="comment"
                      className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Add your comment..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                    {/* ... */}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    {/* ... */}
                    <div className="flex-shrink-0">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Overlay>
      </body>
    );
  }

  return null;
}
export default RootLayout;