"use client";

import Image from 'next/image';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import  differenceInYears  from 'date-fns/differenceInYears';
import  parseISO  from 'date-fns/parseISO';
import  differenceInMinutes  from 'date-fns/differenceInMinutes';
import  differenceInHours  from 'date-fns/differenceInHours';
import  differenceInDays  from 'date-fns/differenceInDays';
import  differenceInMonths  from 'date-fns/differenceInMonths';import Link from 'next/link';
import { formatCount } from '../formatCount';

import { User, Post } from '../Modules'

interface RealPostProps {
  postObject: Post;
  className?: string;
  id: number;
}

export const RealPost: React.FC<RealPostProps> = ({ postObject, className, id }) => {
  const [hasLiked, setHasLiked] = useState(postObject.post.user_has_liked);
  const [hasCommented, setHasCommented] = useState(postObject.post.user_has_commented);
  const [isChangeCircle, setIsChangeCircle] = useState(false);
  let post = postObject.post;
  const [likes_count, setLikesCount] = useState(post.likes_count);
  const [comment_count, setCommentCount] = useState(post.comments_count);
  const [copySuccess, setCopySuccess] = useState('');
  const [showPopup, setShowPopup] = useState(false);




  const someUserId = post.user_poster_id;

  //console.log(id);

  const handleCopyClick = async () => {
    const textToCopy = `http://localhost:3000/p/${post.id}`; // Replace with the actual link
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess('Link copied!');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 6000); // Hide the popup after 3 seconds
    } catch (err) {
      setCopySuccess('Failed to copy text');
    }
  };
  

  useEffect(() => {
    setHasLiked(postObject.post.user_has_liked);
  }, [postObject.post.user_has_liked]);

  useEffect(() => {
    setHasCommented(postObject.post.user_has_commented);
  }, [postObject.post.user_has_commented]);

  function toggleLike() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${post.id}/toggle_like/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        setHasLiked((prevIsFavorite: boolean) => !prevIsFavorite);
        setLikesCount((prevCount: number) => prevCount + (hasLiked ? -1 : 1));
      } else {
        // Handle error
      }
    });
  }
  


  let paddingClass = 'pr-2 pb-2 pl-2';

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

  const [showPFPPopup, setShowPFPPopup] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | undefined>();
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleMouseEnter = () => {
    console.log(someUserId);
    console.log(id);
    console.log("Mouse enter");
    if(id === someUserId) return;
    clearTimeout(timeoutId.current); // Clear any existing timeout to prevent the popup from hiding
    setShowPFPPopup(true);

    console.log(someUserId);

    fetch(`http://localhost:8000/user/${someUserId}/background`)
    .then(response => {
      console.log(response);
      return response.json();
    })
    .then(data => setBackgroundUrl(data.url));


    fetch(`http://localhost:8000/user/${id}/is_following/${someUserId}`)
    .then(response => response.json())
    .then(data => setIsFollowing(data.is_following));
    
  };
  
  const handleMouseLeave = () => {
    if(id === someUserId) return;
    timeoutId.current = setTimeout(() => {
      setShowPFPPopup(false); // Corrected state name here
    }, 50);
  };
  

  const followUser = () => {
    console.log("Follow user");
    fetch(`http://localhost:8000/user/${id}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(someUserId),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setIsFollowing(true); // Update the isFollowing state variable
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <Link href={`/p/${post.id}`}>
    <div className='hover:bg-slate-50 px-8 pt-4'>
      <div className={clsx(paddingClass, "pb-2 grid grid-cols-[auto,1fr] items-start  text-slate-700", className, " ")}>

        <div className="p-1 pr-2 flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image className="rounded-full h-12 w-12 shadow-sm" src={post.user.profile_picture} alt="Author" height={512} width={512} />
          {(showPFPPopup && (id !== someUserId)) && (
            <div className="absolute bg-white p-4 rounded-2xl shadow-xl w-64 h-auto transform -translate-y-2/3 z-50 border border-slate-100 flex flex-col">
            <div className="relative h-32 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}>
                  <Image className="absolute bottom-0 left-0 ml-4 mb-4 rounded-full border-4 border-white" src={post.user.profile_picture} alt="Author" height={64} width={64} />
                <div className="absolute bottom-0 right-0 mr-4 mb-4 text-white text-sm">
                  <p>Followers: {post.user.followers}</p>
                  <p>Following: {post.user.following}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-bold">{post.user.account_name}</p>
                <p>{post.user.bio}</p>
                {isFollowing ? (
                  <button disabled className="follow-button">Following</button>
                ) : (
                  <button onClick={followUser} className="follow-button">Follow</button>
                )}
              </div>
            </div>
          )}
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
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center">
                  <span 
                    className={`material-symbols-sharp rounded-full p-2 ${hasLiked ? 'text-red-500' : 'text-slate-500'} hover:text-red-500 hover:bg-gray-200`} 
                    style={hasLiked ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24", padding: '10px'} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24", padding: '10px'}}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLike();
                    }}
                  >
                    favorite
                  </span>
                <p className="font-light" style={{ width: '10px', textAlign: 'right' }}>{formatCount(likes_count)}</p>            
              </div>
              <div className="flex items-center">
                <span 
                  className={`material-symbols-sharp rounded-full p-2 ${hasCommented ? 'text-sky-500' : 'text-slate-500'} hover:text-sky-500 hover:bg-gray-200`} 
                  style={hasCommented ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24", padding: '10px'} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24", padding: '10px'}}
                  onClick={() => setHasCommented(!hasCommented)}
                >
                  chat_bubble
                </span>
                <p className="font-light" style={{ width: '10px', textAlign: 'right' }}>{formatCount(comment_count)}</p>
              </div>
              <span 
                className={`material-symbols-sharp rounded-full p-2 ${isChangeCircle ? 'text-lime-400' : 'text-slate-500'} hover:text-lime-600 hover:bg-gray-200`} 
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
    {showPopup && (
        <div className="flex flex-row fixed bottom-0 bg-violet-400 border-2 border-violet-500 bg-opacity-90 rounded-full text-white px-4 left-1/2 transform -translate-x-1/2 mb-20 md:mb-4 select-none">
          <div className='p-2'>
            {copySuccess}
          </div>
        </div>
      )}

  </Link>
  );
};


