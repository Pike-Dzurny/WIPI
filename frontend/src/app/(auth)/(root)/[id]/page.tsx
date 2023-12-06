"use client";

import { Dropdown } from '../../../../components/Dropdown/Dropdown';
import { PFP } from '../../../../components/pfp';

import React, { useEffect, useState } from 'react';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '../../../../components/Post/RealPost'; // Import RealPost at the top of your file

import axios from 'axios';

import { parseISO, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

// Define the type for a comment
type Comment = {
  user_poster_id: number;
  content: string;
  likes_count: number;
  date_of_post: string;
  id: number;
  reply_to: number | null;
  replies: Comment[];
};

type Post = {
  user_poster_id: number;
  content: string;
  likes_count: number;
  date_of_post: string;
  id: number;
  reply_to: number | null;
  comments: Comment[];
};

export default function Page({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const colors = ['black', 'red', 'blue', 'green', 'purple'];

  const formatRelativeTime = (dateString: string) => {
    const date = parseISO(dateString);
    let relativeTime = '';
    
    const minutes = differenceInMinutes(new Date(), date);
    const hours = differenceInHours(new Date(), date);
    const days = differenceInDays(new Date(), date);
    const months = differenceInMonths(new Date(), date);
    const years = differenceInYears(new Date(), date);
    
    if (minutes < 60) {
      relativeTime = `${minutes}m`;
    } else if (hours < 24) {
      relativeTime = `${hours}h`;
    } else if (days < 30) {
      relativeTime = `${days}d`;
    } else if (months < 12) {
      relativeTime = `${months}mo`;
    } else {
      relativeTime = `${years}y`;
    }
  
    return relativeTime;
  };


  // Fetch the post and its comments when the component mounts
  useEffect(() => {
    if (!post) {
      axios.get(`http://localhost:8000/posts/${params.id}/post_comments`)
        .then(response => setPost(response.data))
        .catch(error => console.error(error));
    }
    console.log(post);
  }, [params.id, post]);

  // Recursive function to render a comment and its replies
// Recursive function to render a comment and its replies
// Recursive function to render a comment and its replies
// Recursive function to render a comment and its replies
const renderComment = (comment: Comment, depth = 0) => (
  <div key={comment.id} style={{ marginLeft: `${depth * 20}px`, paddingLeft: '10px', borderLeft: depth > 0 ? `1px solid ${colors[depth % colors.length]}` : 'none' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{comment.user_poster_id}</span>
        <p>{comment.content}</p>
      </div>
      <div>{formatRelativeTime(comment.date_of_post)}</div>
    </div>
    {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
  </div>
);

  return (
    <div className='w-full'>
      <div className="relative rounded-t-2xl">
        <div className="flex pl-4 pr-4 pb-16 pt-16 justify-center rounded-t-2xl">
          <div className="relative flex flex-col justify-center items-center p-20 rounded-3xl w-5/6">
            {post && <p>{post.user_poster_id}: {post.content}</p>}
          </div>
        </div>
        <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
          <Dropdown />
        </div>
        <div>
        {post && post.comments.map((comment, index) => (
          <div key={comment.id}>
            {renderComment(comment)}
            {index < post.comments.length - 1 && <hr />}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}