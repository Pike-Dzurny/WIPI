"use client";

import { Dropdown } from '../../../../components/Dropdown/Dropdown';
import { useRouter } from 'next/navigation'

import { PFP } from '../../../../components/pfp';

import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { parseISO, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import Link from 'next/link';

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

  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatBubble, setIsChatBubble] = useState(false);
  const [isChangeCircle, setIsChangeCircle] = useState(false);


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
        <div className="flex pl-4 pr-4 rounded-t-2xl">
          <div className="relative flex flex-row rounded-3xl">
          {post && (
          <>
            {/* Profile Picture Column */}
            <div className="flex flex-col justify-start items-center mr-4">
              <img className="rounded-full h-12 w-12 shadow-sm mb-4" src={`http://localhost:8000/user/${post.user_poster_id}/profile_picture`} alt="Author" />
            </div>

            {/* Content and Buttons Column */}
            <div className="flex flex-col justify-start">
              <div className="mb-4">
                <div className="font-medium">{post.user_poster_id}</div>
                <p className="hyphens-auto">{post.content}</p>
              </div>
              <div className="flex">
                {/* Favorite Icon */}
                <span className={`material-symbols-sharp ${isFavorite ? 'text-red-500' : 'text-slate-500'} hover:text-red-500 rounded-full p-2`}
                      onClick={() => setIsFavorite(!isFavorite)}>
                  favorite
                </span>

                {/* Chat Bubble Icon */}
                <span className={`material-symbols-sharp ${isChatBubble ? 'text-sky-500' : 'text-slate-500'} hover:text-sky-500 rounded-full p-2`}
                      onClick={() => setIsChatBubble(!isChatBubble)}>
                  chat_bubble
                </span>

                {/* Change Circle Icon */}
                <span className={`material-symbols-sharp ${isChangeCircle ? 'text-lime-400' : 'text-slate-500'} hover:text-lime-600 rounded-full p-2`}
                      onClick={() => setIsChangeCircle(!isChangeCircle)}>
                  change_circle
                </span>

                {/* Share Icon */}
                <span className="material-symbols-sharp text-slate-500 hover:text-amber-600 rounded-full p-2"
                      >
                  ios_share
                </span>
              </div>
            </div>
          </>
        )}   </div>
        </div>
        <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" />
        <div className="flex justify-around items-center">
              <div className={`rounded-full hover:bg-slate-200`}>
            <Link className={`flex flex-row items-center justify-center pl-4 pr-4 border-b-2 border-blue-500 hover:border-blue-300`} href={`/#${params.id}`} passHref>
              <span title="arrow_back" className="mb-2 mt-2 text-sky-900  material-symbols-sharp"   style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48" }}>
              arrow_back
              </span>
            </Link>
          </div>
        </div>
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