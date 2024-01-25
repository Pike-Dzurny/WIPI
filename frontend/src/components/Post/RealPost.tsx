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

import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';
import { useProfilePic } from "@/components/ProfilePicContext";


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

  const queryClient = useQueryClient();

  const { followingCount, setFollowingCount } = useProfilePic();





  const someUserId = post.user_poster_id;

  //console.log(id);

  const handleCopyClick = async () => {
    const textToCopy = `${process.env.NEXT_PUBLIC_FRONTED_URL}/p/${post.id}`; // Replace with the actual link
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
  const [popupFollowers, setPopupFollowers] = useState(0);
  const [popupFollowing, setPopupFollowing] = useState(0);


  const handleMouseEnter = () => {
    if(id === someUserId) return;
    clearTimeout(timeoutId.current); // Clear any existing timeout to prevent the popup from hiding
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/is_following/${someUserId}`)
    .then(response => response.json())
    .then(data => setIsFollowing(data.is_following));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${someUserId}/background`)
    .then(response => {
      console.log(response);
      return response.json();
    })
    .then(data => setBackgroundUrl(data.url));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${someUserId}/follow_counts`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setPopupFollowers(data.followersCount);
      setPopupFollowing(data.followingCount);
    })
    .catch(error => console.error('Error:', error));

    setShowPFPPopup(true);

    console.log(someUserId);





    
  };
  
  const handleMouseLeave = () => {
    if(id === someUserId) return;
    timeoutId.current = setTimeout(() => {
      setShowPFPPopup(false); // Corrected state name here
    }, 50);
  };
  

  const followUser = () => {
    console.log("Follow user " + someUserId + " from user " + id + "");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/follow/${someUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setIsFollowing(true); // Update the isFollowing state variable
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    queryClient.invalidateQueries('posts');
    setPopupFollowers(popupFollowers+1);
    setFollowingCount(followingCount+1);

  }

  const unfollowUser = () => {
    console.log("Follow user " + someUserId + " from user " + id + "");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/unfollow/${someUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setIsFollowing(false); // Update the isFollowing state variable
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    setFollowingCount(followingCount-1);


    queryClient.invalidateQueries('posts');
  }

  return (
    <Link href={`/p/${post.id}`}>
    <div className='hover:bg-slate-50 px-8 pt-4'>
      <div className={clsx(paddingClass, "pb-2 grid grid-cols-[auto,1fr] items-start  text-slate-700", className, " ")}>

        <div className="p-1 pr-2 flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => { e.preventDefault(); // Prevents default link navigation
          e.stopPropagation(); // Stops event from propagating to parent Link component}
          }}>
          <Link href={`/u/${post.user_poster_id}`}>
          <Image className="rounded-full h-12 w-12 shadow-sm"  src={post.user.profile_picture} alt="Author" height={512} width={512} />
          </Link>
          {(showPFPPopup && (id !== someUserId)) && (
            <div className="absolute bg-white rounded-2xl shadow-xl w-64 h-auto transform -translate-y-2/3 z-50 flex flex-col cursor-default">
            <Link href={`/u/${post.user_poster_id}`}>
            <div className="relative h-32 bg-cover bg-center rounded-t-2xl" style={{ backgroundImage: `url(${backgroundUrl})`, backdropFilter: 'blur(90px)' }}>                  
            <Image className="absolute bottom-0 left-0 ml-4 mb-4 rounded-full w-20 h-20" src={post.user.profile_picture} alt="Author" height={512} width={512} />
              <div className="absolute bottom-0 left-0 right-0 text-white flex items-center justify-center  w-full">
                <div className="flex px-2 flex-row divide-x divide-indigo-400 items-center justify-center bg-indigo-300 border-indigo-400 border-t rounded-t-xl">
                <p className="mr-2">{popupFollowers}</p>
                <p className="pl-2">{popupFollowing}</p>
                </div>
              </div>
            </div>
            </Link>
            <div className="m-4">
              <p className="font-bold">{post.user.account_name}</p>
              <p>{post.user.bio}</p>
              {isFollowing ? (
                <button 
                  onClick={(e) => {e.preventDefault(); e.stopPropagation(); unfollowUser();}} 
                  className="border px-4 py-2 rounded-full w-28 h-10 relative hover:border-red-500 hover:text-red-500 group"
                >
                  <span className="absolute inset-0 flex items-center justify-center group-hover:opacity-0">Following</span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">Unfollow</span>
                </button>
              ) : (
              <button onClick={(e) => {e.preventDefault(); e.stopPropagation(); followUser();}} className="bg-indigo-100 rounded-full px-4 py-2 w-28 h-10 hover:bg-indigo-200">Follow</button>                )}
            </div>
          </div>
          )}
        </div>
        
        <div className="flex flex-col justify-between overflow-hidden">
          <div>
            <div className='flex flex-row justify-between'>
              <div className='flex flex-row justify-start items-center'>
                <div className="font-medium">{post.user.account_name}</div>
                {post.reply_to && (
                  <a className="ml-1 text-sm text-slate-500 font-light font-mono italic items-center" href={`${process.env.NEXT_PUBLIC_FRONTED_URL}/p/${post.reply_to}`}>→ #{post.reply_to}</a>
                )}
              </div>
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


