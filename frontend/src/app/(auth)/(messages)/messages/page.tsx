"use client";

import React from 'react';
import { useInfiniteQuery } from 'react-query';
import axios from 'axios';


const fetchPosts = async ({ pageParam = null }) => {
  const url = pageParam ? `http://localhost:8000/posts?page=1&per_page=6&id=${pageParam}` : 'http://localhost:8000/posts?page=1&per_page=6';
  const response = await axios.get(url);
  return response.data;
};

type Post = {
  post_content: string;
  date_of_post: string;
  liked_by: number[];
  poster_uid: number;
  id: number;
  title: string;
  content: string;
  body: string;
  author: string;
};

const Posts = () => {

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery('posts', fetchPosts, {
    getNextPageParam: (lastPage, pages) => {
      return lastPage.LastEvaluatedKey?.id;
    },
  });
  
  console.log(data);

  return (
    <div>
    <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
      {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'Nothing more to load'}
    </button>
  </div>
  );
};

export default Posts;