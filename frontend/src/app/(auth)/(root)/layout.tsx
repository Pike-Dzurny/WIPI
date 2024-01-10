"use client";

import { Roboto } from 'next/font/google';

import { useRef, useEffect, useState } from 'react';

const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import { useSession } from 'next-auth/react';
import { Overlay } from '@/components/Overlay';
import { OverlayContext } from '@/components/OverlayContext';
import { ProfilePicProvider, useProfilePic } from '@/components/ProfilePicContext';

import { usePostUpdate } from '@/components/PostUpdateContext';


import { Sidebar } from '@/components/Sidebar/Sidebar';
import React from 'react';



// import { PFP } from '../../../../components/pfp';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
// import { RealPost } from '../../../../components/Post/RealPost'; // Import RealPost at the top of your file
// import  ProfileCard  from '../../../../components/Profile/ProfileCard'; // Import RealPost at the top of your file



import axios from 'axios';

// import { Dropdown } from '../../../../components/Dropdown/Dropdown';

// import { User, Post } from '../../../../components/Modules'
// import { SkeletonPost } from '../../../../components/Skeletons'



interface UserPostBase {
  user_poster_id: Number;
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

  const { setNewPostAdded } = usePostUpdate();


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) {
      console.log('No active session');
      return;
    }

    console.log('Trying to pass!'); // The authenticated user
    if (!session.user || !session.user.name) {
      console.log('User or username is not defined');
      return;
    }

    // Create an instance of UserPostBase
    const userPost: UserPostBase = {
      user_poster_id: session.user.id, // replace with the actual username
      post_content: postContent,
    };

    console.log(userPost);
    console.log('Trying to post!'); // The authenticated user
    try {
      console.log('Trying to wait for response!'); // The authenticated user
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
      console.log('Trying to wait for data pt 2!'); // The authenticated user
      console.log(response.status);

      console.log(response);
      const data = await response.json();
      if (data.status === 'success') {
        console.log('it worked!')
        // Handle success (e.g., clear the textarea and close the overlay)
        setNewPostAdded(true); // Update the context to indicate a new post was added
        setPostContent('');
        setIsOverlayOpen(false);
      } else {
        console.log('it didnt work!')
        // Handle error
        console.error('Failed to create post');
      console.log('Post creation status:', data.status);
      // Handle post creation success
    } 
    }
    catch (error) {
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


  const [pfpUrl, setPfpUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPfpUrl = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
        if (response.ok) {
          const data = await response.json();
          setPfpUrl(data.url);
        } else {
          console.error('Failed to fetch profile picture URL');
        }
      } catch (error) {
        console.error('Failed to fetch profile picture URL:', error);
      }
    };

    if (session?.user?.id) {
      fetchPfpUrl();
    }
  }, [session?.user?.id]);

  //const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const { setProfilePicUrl, setBackgroundPicUrl } = useProfilePic();
  const fetchPfpUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
      const background_response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
      if (response.ok) {
        const data = await response.json();
        setProfilePicUrl(data.url); // Use the URL of the response
        console.log('Got profile picture URL: ', data.url)
      } else {
        console.error('Failed to fetch profile picture URL');
      }
    } catch (error) {
      console.error('Failed to fetch profile picture URL:', error);
    }
  };

const fetchBackgroundPicUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/background`);
      if (response.ok) {
        const data = await response.json();
        setBackgroundPicUrl(data.url); // Use the URL of the response
        console.log('Got background picture URL: ', data.url)
      } else {
        console.error('Failed to fetch background picture URL');
      }
    } catch (error) {
      console.error('Failed to fetch background picture URL:', error);
    }
  }


const [username, setName] = useState('');
const fetchusername = async () => {
  try {
    const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/username`);
    if (response.ok) {
      const data = await response.json();
      setName(data.username);
    } else {
      console.error('Failed to fetch username');
    }
  } catch (error) {
    console.error('Failed to fetch username:', error);
  }
}

const [accountName, setaccountName] = useState('');
const fetchaccountname = async () => {
  try {
    const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/accountname`);
    if (response.ok) {
      const data = await response.json();
      setaccountName(data.accountname);
    } else {
      console.error('Failed to fetch username');
    }
  } catch (error) {
    console.error('Failed to fetch username:', error);
  }
}


  useEffect(() => {

  
    if (session?.user?.id) {
      fetchusername();
      fetchPfpUrl();
      fetchBackgroundPicUrl();
      fetchaccountname();
    }
  }, [session?.user?.id]);

  //const ProfilePicContext = React.createContext('');
  const { profilePicUrl } = useProfilePic();



  const [followings, setFollowings] = useState(0);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    console.log("Fetching follow counts for user ID: ", session?.user?.id);
    if (!session?.user?.id) {
      return;
    }
    fetch(`http://localhost:8000/user/${session?.user?.id}/follow_counts`)
      .then(response => response.json())
      .then(data => {
        setFollowings(data.followingCount);
        setFollowers(data.followersCount);
      });
  }, [session?.user?.id]);


  if (status === 'authenticated' || status === 'loading') {
    return (
      <body className={`${font.className} antialiased sm:bg-gradient-to-br sm:from-sky-50 sm:via-slate-100 sm:to-indigo-100`}>
        <div className={`flex flex-col md:flex-row ${isOverlayOpen ? 'blur-sm' : ''}`}>
          <div className="hidden md:block md:flex-grow z-20">
            <div className="flex flex-row h-screen fixed w-1/4 p-4">
              <div className='basis-1/2' />
              <div className='flex basis-1/2 items-center justify-center justify-items-center'>
                <Sidebar username={username} accountName={accountName}  />
              </div>
            </div>
          </div>
          <div className='md:hidden block backdrop-blur-sm	fixed bottom-0 w-screen h-14 z-20 border-t border-slate-100 border-2'>
            {//<MobileSidebar id={Number(session?.user?.id)} name={String(session?.user?.name)} pfp={pfpUrl} />}
  }
          </div>
          <div className="flex-grow basis-1/5">
            <div className="flex flex-row pt-0 md:pt-10 rounded-none md:rounded-t-3xl">
              <div className="flex md:rounded-t-xl md:border-l md:border-r shrink-0 shadow-sm min-h-screen flex-col flex-1 justify-between mx-auto z-0 bg-white">
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

