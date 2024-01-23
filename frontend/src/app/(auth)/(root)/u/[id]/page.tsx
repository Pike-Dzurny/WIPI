"use client";

import { useSession } from "next-auth/react";

import { useRouter } from 'next/navigation'

import React, { useEffect, useState, useContext } from 'react';

import { QueryClient, useInfiniteQuery, useQueryClient } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '@/components/Post/RealPost'; 
import { OverlayContext } from '@/components/OverlayContext';
import axios from 'axios';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import { User, Post } from '@/components/Modules'
import { SkeletonPost } from '@/components/Skeletons'
import { useProfilePic } from "@/components/ProfilePicContext";
import { usePostUpdate } from "@/components/PostUpdateContext";
import ProfileCard from "@/components/Profile/ProfileCard";
import { PFP } from "@/components/pfp";


export default function Page({ params }: { params: { id: string } }) {

  const id = parseInt(params.id);

  const  queryClient = useQueryClient();



  const { newPostAdded, setNewPostAdded } = usePostUpdate();


  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const { data: session, status } = useSession();


  const fetchUserPosts = async ({ pageParam = 1 }) => {
    const userId = session?.user?.id;
    if (!userId) {
      console.log("Session ID is undefined.");
      return { pages: [], pageParams: [] };
    }
  
    const baseUrl = `http://localhost:8000/posts/${id}/user/`;
    const params = new URLSearchParams({
      page: pageParam.toString(),
      per_page: '10'
    }).toString();
    const url = baseUrl + "?" + params;
  
    const response = await axios.get(url);
    return response.data;
  };


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(`user${id}Posts`, fetchUserPosts, {
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
    enabled: !!session?.user?.id, // This will delay the query until the session ID is available
    staleTime: Infinity, // Adjust according to your needs
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours, for example
  });
  const lastPostRef = React.useRef<HTMLDivElement>(null)

  const {ref, entry} = useIntersection({
    threshold: 1,
  })

  useEffect(() => {
    if(entry?.isIntersecting) {
        fetchNextPage()
      }
    }, [entry, fetchNextPage]);

    const _posts = data?.pages.flatMap((page) => page)


  useEffect(() => {
    if (newPostAdded) {
      console.log("post refresh!");
      refetch();
      setNewPostAdded(false); // Reset the state
    }
  }, [newPostAdded, queryClient, setNewPostAdded]);



  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const fetchPfpUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${id}/pfp`);
      if (response.ok) {
        const data = await response.json();
        setProfilePictureUrl(data.url); // Use the URL of the response
        console.log('Got profile picture URL: ', data.url)
      } else {
        console.error('Failed to fetch profile picture URL');
      }
    } catch (error) {
      console.error('Failed to fetch profile picture URL:', error);
    }
  };

  const [backgroundImage, setBackgroundImage] = useState('');
  const fetchBackgroundUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${id}/pfp`);
      if (response.ok) {
        const data = await response.json();
        setBackgroundImage(data.url); // Use the URL of the response
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
    const response = await fetch(`http://localhost:8000/user/${id}/username`);
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
    const response = await fetch(`http://localhost:8000/user/${id}/accountname`);
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

const [bio, setBio] = useState('');

const fetchbio = async () => {
  try {
    const response = await fetch(`http://localhost:8000/user/${id}/bio`);
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

const [followingCount, setFollowingCount] = useState(0);
const[followerCount, setFollowerCount] = useState(0);

const fetchFollowingCount = async () => {
  fetch(`http://localhost:8000/user/${id}/follow_counts`)
  .then(response => response.json())
  .then(data => {
    setFollowingCount(data.followingCount);
    setFollowerCount(data.followersCount);
  });
}


  useEffect(() => {
    if (id) {
      fetchusername();
      fetchPfpUrl();
      fetchBackgroundUrl();
      fetchaccountname();
      fetchbio();
      fetchFollowingCount();
    }
  }, []);


  return (                
  
  <main className="w-full">
  <div className="relative rounded-t-2xl">
    <ProfileCard backgroundImage={backgroundImage} profileImage={<PFP profilePictureUrl={profilePictureUrl} />} isOverlayOpen={isOverlayOpen} setIsOverlayOpen={setIsOverlayOpen} followingCount={followingCount} followersCount={followerCount} bio={bio} name={username} id={id} />            
  </div>
  <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
    <Dropdown />
  </div>

            <div className='flex-col-reverse'>

            {data?.pages && data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page && Array.isArray(page) && page.map((post: Post, index: number) => {
                    const postElement = (
                      <div className="h-100" key={post.post.id} id={post.post.id}>
                        <RealPost postObject={post} id={session?.user.id ?? 0} />
                      </div>
                    );

                    // If it's the last post of the last page, attach the ref for intersection observer
                    if (i === data.pages.length - 1 && index === page.length - 1) {
                      console.log();
                      return <div ref={ref} key={post.id}>{postElement}</div>;
                    }

                    return postElement;
                  })}
                </React.Fragment>
              ))}
              {
}
              <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage} className="flex justify-center items-center w-full">
                {
                  isFetchingNextPage
                  ? <SkeletonPost count={4} />
                  : !hasNextPage
                  ? <SkeletonPost count={4} />
                  : ''
                }
              </button>
            </div>
            </main>


  );
}


