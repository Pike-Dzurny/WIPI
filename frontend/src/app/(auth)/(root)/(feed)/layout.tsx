"use client";

import { Roboto } from 'next/font/google';
import './../../../globals.css';


import { useRef, useEffect, useState, useContext } from 'react';

const font = Roboto({weight: ["100", "500", "300", "400", "700", "900"], subsets: ["latin"]})

import { useSession } from 'next-auth/react';
import { Overlay } from '@/components/Overlay';
import { OverlayContext } from '@/components/OverlayContext';
import { ProfilePicProvider, useProfilePic } from '@/components/ProfilePicContext';

import { usePostUpdate } from '@/components/PostUpdateContext';


import { Sidebar } from '@/components/Sidebar/Sidebar';
import React from 'react';



import { PFP } from '../../../../components/pfp';

import { QueryClient, QueryClientProvider, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import  ProfileCard  from '../../../../components/Profile/ProfileCard'; // Import RealPost at the top of your file



import axios from 'axios';

import { Dropdown } from '../../../../components/Dropdown/Dropdown';





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
  const [bio, setBio] = useState('');
  
  const context = useContext(OverlayContext);
  
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;  
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
  const { setProfilePicUrl } = useProfilePic();
  const fetchPfpUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
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

const fetchbio = async () => {
  try {
    const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/bio`);
    if (response.ok) {
      const data = await response.json();
      setBio(data.bio);
    } else {
      console.error('Failed to fetch bio');
    }
  } catch (error) {
    console.error('Failed to fetch bio:', error);
  }
}


  useEffect(() => {

  
    if (session?.user?.id) {
      fetchusername();
      fetchPfpUrl();
      fetchaccountname();
      fetchbio();
    }
  }, [session?.user?.id]);

  //const ProfilePicContext = React.createContext('');
  const { profilePicUrl, backgroundPicUrl, followerCount, followingCount } = useProfilePic();


  const queryClient = new QueryClient();


  if (status === 'authenticated' || status === 'loading') {
    return (
            <QueryClientProvider client={queryClient}>
              <OverlayContext.Provider value={{ isOverlayOpen, setIsOverlayOpen }}>
                <main className="w-full">
                    <div className="relative rounded-t-2xl">
                      <ProfileCard backgroundImage={backgroundPicUrl} profileImage={<PFP profilePictureUrl={profilePicUrl} />} isOverlayOpen={isOverlayOpen} setIsOverlayOpen={setIsOverlayOpen} followingCount={followingCount} followersCount={followerCount} bio={bio} name={username} id={session?.user?.id} />            
                    </div>
                    <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
                      <Dropdown />
                    </div>
                    {children}
                </main>
              </OverlayContext.Provider> 
            </QueryClientProvider>

    );
  }

  return null;
}
export default RootLayout;

