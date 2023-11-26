"use client";


import React, { useEffect, useState } from 'react';
import { PFP } from '../../../components/pfp';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '../../../components/Post/RealPost'; // Import RealPost at the top of your file



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
            <div className="absolute inset-0 z-0 rounded-2xl" style={{backgroundImage: "url('/../static/trees.jpg')", backgroundSize: 'cover'}}></div>
            <div className="flex pl-4 pr-4 pb-16 pt-16 justify-center rounded-t-2xl backdrop-blur-xl z-10">
              <div className="relative flex flex-col justify-center items-center bg-sky-50 border border-sky-200 backdrop-blur-xl p-20 rounded-3xl w-5/6">  
                <div className='absolute -left-4 transform hover:scale-110 transition-transform'>
                  <PFP/>
                </div>
                <button className="absolute -bottom-4 -right-4 bg-blue-500 border-blue-300 hover:bg-blue-400 hover:shadow-sm shadow-lg  text-white rounded-full py-4 px-6 text-2xl">+</button>
              </div>
            </div>
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
                      return <div ref={ref}>{postElement}</div>;
                    }

                    return postElement;
                  })}
                </React.Fragment>
              ))}
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

