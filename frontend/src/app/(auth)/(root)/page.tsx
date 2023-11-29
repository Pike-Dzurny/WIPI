"use client";


import React, { useEffect, useState } from 'react';
import { PFP } from '../../../components/pfp';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '../../../components/Post/RealPost'; // Import RealPost at the top of your file
import  ProfileCard  from '../../../components/Profile/ProfileCard'; // Import RealPost at the top of your file



import axios from 'axios';

import { Dropdown } from '../../../components/Dropdown/Dropdown';

import { QueryFunctionContext } from 'react-query';

const fetchPosts = async ({ pageParam = 1 }: QueryFunctionContext<'posts', number>) => {
  const url = `http://localhost:8000/posts?page=${pageParam}&per_page=6`;
  const response = await axios.get(url);
  
  return response.data;
};



export default function Home() {


  const queryClient = new QueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery('posts', fetchPosts, {
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
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
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  interface User {
    id: number;
    account_name: string;
  }
  
  interface Post {
    user_poster_id: number;
    content: string;
    date_of_post: string;
    id: number;
    user: User;
  }
  
  

  return (
    <div>

          <main className="w-full">
              
            <div className="relative rounded-t-2xl">
              <ProfileCard backgroundImage="" profileImage={<PFP />} />
            </div>

            <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
              <Dropdown />
            </div>

            <div className='flex-col-reverse'>

            {data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                  {page.map((post: Post, index: number) => {
                    const postElement = (
                      <div className="h-100" key={post.id}>
                        <RealPost post={post} />
                      </div>
                    );

                    // If it's the last post of the last page, attach the ref for intersection observer
                    if (i === data.pages.length - 1 && index === page.length - 1) {
                      return <div ref={ref} key={post.id}>{postElement}</div>;
                    }

                    return postElement;
                  })}
                </React.Fragment>
              ))}
              {//<PostList data={data} ref={ref} />}
}
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="flex justify-center items-center w-full">
                {
                  isFetchingNextPage
                  ? <div className="loading-circle justify-center align-middle"></div>
                  : (data?.pages.length ?? 0) < 6
                  ? <div className="loading-circle justify-center"></div>
                  : 'Nothing more to load'
                }
              </button>
            </div>
          </main>
        </div>


  );
}

