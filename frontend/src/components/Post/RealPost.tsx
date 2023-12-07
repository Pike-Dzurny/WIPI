"use client";

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { differenceInYears } from 'date-fns/differenceInYears';
import { parseISO } from 'date-fns/parseISO';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';
import { differenceInHours } from 'date-fns/differenceInHours';
import { differenceInDays } from 'date-fns/differenceInDays';
import { differenceInMonths } from 'date-fns/differenceInMonths';import Link from 'next/link';



interface User {
  account_name: string;
  bio: string | null;
  display_name: string;
  profile_picture: string | null;
}

interface Post {
  date_of_post: string;
  likes_count: number;
  id: number;
  content: string;
  user_poster_id: number;
  user: User;
}


interface RealPostProps {
  postObject: Post;
  className?: string;
  id: number;
}

export const RealPost: React.FC<RealPostProps> = ({ postObject, className, id }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatBubble, setIsChatBubble] = useState(false);
  const [isChangeCircle, setIsChangeCircle] = useState(false);
  let post = postObject.post;
  const [likes_count, setLikesCount] = useState(post.likes_count);
  const [copySuccess, setCopySuccess] = useState('');


  const someUserId = id;

  console.log(id);

  const handleCopyClick = async () => {
    const textToCopy = `http://localhost:3000/${post.id}`; // Replace with the actual link
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess('Link copied!');
    } catch (err) {
      setCopySuccess('Failed to copy text');
    }
  };
  

  useEffect(() => {
    // Fetch the likes count
    //fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${post.id}/likes_count`)
    //  .then(response => response.json())
    //  .then(data => setLikesCount(data.likes_count));
  
    // Check if the user has liked the post
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${post.id}/is_liked_by/${someUserId}`)
      .then(response => response.json())
      .then(data => setIsFavorite(data.isLiked));
  }, [post.id]);

  function toggleLike() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${post.id}/toggle_like/${someUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        setIsFavorite(prevIsFavorite => !prevIsFavorite);
        setLikesCount(prevCount => prevCount + (isFavorite ? -1 : 1));
      } else {
      }
    });
  }

  function formatLikesCount(count: number) {
    if (count === 0) {
      return '';
    } else if (count <= 999) {
      return count;
    } else if (count <= 9999) {
      return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      return Math.floor(count / 1000) + 'k';
    }
  }

  let paddingClass = 'pr-4 pb-2 pl-2';

  if (post.content.length > 50) paddingClass = 'pr-4 pb-2 pl-2';
  if (post.content.length > 100) paddingClass = 'pr-4 pb-4 pl-2';

  const date = parseISO(post.date_of_post);
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
  return (
    <Link href={`/${post.id}`}>
    <div className='hover:bg-slate-100 px-8 pt-4'>
      <div className={clsx(paddingClass, "pb-2 grid grid-cols-[auto,1fr] items-start  text-slate-700", className, " ")}>

        <div className="p-1 pr-2 flex items-center">
          <img className="rounded-full h-12 w-12 shadow-sm" src={`http://localhost:8000/user/${post.user_poster_id}/profile_picture`} alt="Author" />
        </div>
        
        <div className="flex flex-col justify-between overflow-hidden">
          <div>
            <div className='flex flex-row justify-between'>
              <div className="font-medium">{post.user.account_name}</div>
              <div className="ml-2 text-right font-light" title={date.toString()}>{relativeTime}</div>
            </div>
            <div className="overflow-hidden overflow-wrap break-words pb-2">
              <p className="hyphens-auto">{post.content}</p>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex items-center">
                <span 
                  className={`material-symbols-sharp ${isFavorite ? 'text-red-500' : 'text-slate-500'} hover:text-red-500 hover:bg-gray-200 rounded-full p-2`} 
                  style={isFavorite ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24", padding: '10px'} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24", padding: '10px'}}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike();
                  }}
                >
                  favorite
                </span>
                <p className="font-light" style={{ width: '10px', textAlign: 'right' }}>{formatLikesCount(likes_count)}</p>            </div>
            <span 
              className={`material-symbols-sharp ${isChatBubble ? 'text-sky-500' : 'text-slate-500'} hover:text-sky-500 hover:bg-gray-200 rounded-full p-2`} 
              style={isChatBubble ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24"} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24"}}
              onClick={() => setIsChatBubble(!isChatBubble)}
            >
              chat_bubble
            </span>
            <span 
              className={`material-symbols-sharp ${isChangeCircle ? 'text-lime-400' : 'text-slate-500'} hover:text-lime-600 hover:bg-gray-200 rounded-full p-2`} 
              style={isChangeCircle ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24"} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24"}}
              onClick={() => setIsChangeCircle(!isChangeCircle)}
            >
              change_circle
            </span>
            <span 
              className="material-symbols-sharp text-slate-500 hover:text-amber-600 hover:bg-gray-200 rounded-full p-2" 
              style={true ? {fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' -25, 'opsz' 24"} : {}}
              onClick={
                (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyClick()
                }
                
                }
            >
              ios_share
            </span>
        </div>

      </div>
        </div>



    </div>
    <hr className="border-slate-300 border-1" />

  </Link>
  );
};