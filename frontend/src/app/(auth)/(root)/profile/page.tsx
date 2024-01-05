"use client";

import { useSession } from "next-auth/react";

import { useRouter } from 'next/navigation'

import React, { useEffect, useState, useContext } from 'react';
import { PFP } from '../../../../components/pfp';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '../../../../components/Post/RealPost'; // Import RealPost at the top of your file
import  ProfileCard  from '../../../../components/Profile/ProfileCard'; // Import RealPost at the top of your file

import { OverlayContext } from '../../../../components/OverlayContext';


import axios from 'axios';

import { Dropdown } from '../../../../components/Dropdown/Dropdown';

import { User, Post } from '../../../../components/Modules'
import { SkeletonPost } from '../../../../components/Skeletons'
import { useProfilePic } from "@/components/ProfilePicContext";





export default function Home() {


  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [sessionID, setSessionID] = useState<number | undefined>(undefined);


  const fetchPosts = async ({ pageParam = 1 }) => {
    const userId = session?.user?.id;
    if (!userId) {
      console.log("Session ID is undefined.");
      return { pages: [], pageParams: [] };
    }
  
    console.log("Fetching posts for user ID:", userId);
    const baseUrl = `http://localhost:8000/posts/${userId}/user/`;
    const params = new URLSearchParams({
      page: pageParam.toString(),
      per_page: '10'
    }).toString();
    const url = baseUrl + "?" + params;
  
    const response = await axios.get(url);
    return response.data;
  };


  const queryClient = new QueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery('profiletab', fetchPosts, {
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
    //console.log("Current session:", session);
    if (session?.user?.id) {
      //console.log("Setting session ID:", session.user.id);
      setSessionID(session.user.id);
    } else {
      console.log("Session ID not available.");
    }
  }, [session]);

  useEffect(() => {
    if (sessionID !== undefined) {
      queryClient.refetchQueries('posts');
    }
  }, [sessionID, queryClient]);
  const { profilePicUrl } = useProfilePic();

  return (
    <div>

          <main className="w-full">
              
            <div className="relative rounded-t-2xl">
            <ProfileCard backgroundImage="" profileImage={<PFP profilePictureUrl={profilePicUrl} />} isOverlayOpen={isOverlayOpen} setIsOverlayOpen={setIsOverlayOpen} />            </div>

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
        </div>


  );
}


