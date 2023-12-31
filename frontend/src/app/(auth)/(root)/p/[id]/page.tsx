"use client";

import { Dropdown } from '../../../../../components/Dropdown/Dropdown';
import { useRouter } from 'next/navigation'

import clsx from 'clsx';


import { PFP } from '../../../../../components/pfp';


import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { parseISO, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProfilePic } from '@/components/ProfilePicContext';

import Image from 'next/image'

// Define the type for a comment
type Comment = {
  user_poster_id: number;
  user_display_name: string;
  content: string;
  likes_count: number;
  date_of_post: string;
  id: number;
  reply_to: number | null;
  replies: Comment[];
  hasChildren: boolean;
  profile_picture: string;
};

type Post = {
  user_poster_id: number;
  user_display_name: string;
  content: string;
  likes_count: number;
  date_of_post: string;
  id: number;
  reply_to: number | null;
  replies: Comment[];
};

interface UserPostBase {
  user_poster_id: Number;
  post_content: string;
  reply_to: number;
}


export default function Page({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>({
    user_poster_id: 0,
    user_display_name: '',
    content: '',
    likes_count: 0,
    date_of_post: '',
    id: 0,
    reply_to: null,
    replies: [],
  });  
  const colors = ['indigo-500', 'red-500', 'blue-500', 'lime-500', 'purple-500'];
  const { status } = useSession();
  const { data: session } = useSession();
  const [postContent, setPostContent] = useState('');



  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatBubble, setIsChatBubble] = useState(false);
  const [isChangeCircle, setIsChangeCircle] = useState(false);

  const { profilePicUrl } = useProfilePic();


  


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

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const handleReplyClick = (commentId: number) => {
    setActiveReplyId(commentId);
  };

  const handleReplySubmit = (replyContent: string, replyToId: number) => {
    console.log("Reply Content:", replyContent);
    console.log("Replying to Comment ID:", replyToId);
    // Add your logic to submit the reply
    setActiveReplyId(null); // Reset the active reply ID after submitting
  };

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Fetch the post and its comments when the component mounts
  useEffect(() => {
    axios.get(`http://localhost:8000/posts/${params.id}/comments`)
      .then(response => {
        console.log(response.data); // Log to check the response structure
        setPost(response.data);
      })
      .catch(error => console.error(error));
  }, [params.id]);

  const loadMoreComments = async (commentId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/posts/${commentId}/comments`);
      if (response.status === 200 && response.data && Array.isArray(response.data.replies)) {
        const newComments = response.data.replies.map((comment: { hasChildren: any; }) => ({
          ...comment,
          hasChildren: comment.hasChildren // Assuming the API provides this information
        }));
  
        setPost(prevState => {
          if (prevState) {
            const updatedReplies = addCommentsToTree(prevState.replies, commentId, newComments, false);
            return { ...prevState, replies: updatedReplies };
          }
          return null;
        });
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  };
  
  const addCommentsToTree = (comments: Comment[], parentId: number, newComments: Comment[], updateHasChildren: boolean): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { 
          ...comment, 
          replies: [...(comment.replies ?? []), ...newComments],
          hasChildren: updateHasChildren ? false : comment.hasChildren
        };
      } else if (comment.replies) {
        return { 
          ...comment, 
          replies: addCommentsToTree(comment.replies, parentId, newComments, updateHasChildren) 
        };
      } else {
        return comment;
      }
    });
  };
  
  
  

  // Recursive function to render a comment and its replies
  const renderComment = (comment: Comment, depth = 0) => (
    <div 
      key={comment.id} 
      className={clsx(
        'pt-2 pl-2 border-l', 
        { 'ml-[20px]': depth > 0},
        { 'bg-white': depth % 2 === 0, 'bg-slate-50': depth % 2 !== 0 },
        { [`border-${colors[depth % colors.length]}`]: depth > 0 }
      )}
    >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <img className="inline-block h-10 w-10 rounded-full" src={comment.profile_picture} alt="Profile" />
      </div>
      <div className="flex-1 min-w-0">
        <div className='flex flex-col'>
          <div className='flex flex-row gap-x-1'>
            <p className='font-medium'>{comment.user_display_name}</p>
            <div className='' title={comment.date_of_post}>{formatRelativeTime(comment.date_of_post)}</div>
          </div>

            <div className='border-l border-t border-b p-2 rounded-l-lg overflow-hidden overflow-wrap break-words'>
            <p className='hyphens-auto'>{comment.content}</p>
            </div>
        </div>
        <button className="font-mono" onClick={() => handleReplyClick(comment.id)}>Reply</button>
      </div>
      </div>
      {activeReplyId === comment.id && (
        <div className="p-4 transition">
          {/* Flex container for PFP and the form */}
          <div className="flex items-start space-x-4">
            {/* PFP Column */}
            <div className="flex-shrink-0">
              <img className="inline-block h-10 w-10 rounded-full" src={`http://localhost:8000/user/${comment.id}/pfp`} alt="Profile" />
            </div>

            {/* Form Column */}
            <div className="flex-1 min-w-0">
              <form action="#" className="h-[v30]">
                {/* Textarea container */}
                <div className="overflow-hidden rounded-lg shadow-sm ring-0 ring-gray-300 border outline-none focus-within:ring-indigo-600">
                  <textarea name="reply" id="reply" className="block w-full resize-none border-0 bg-transparent outline-none py-1.5 px-2 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-0" 
                  placeholder="Write a reply..."></textarea>
                </div>

                {/* Button Container */}
                <div className="flex justify-end py-2">
                  <button type="submit" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onClick={() => handleSubmit(comment.id)}>Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>

      )}
      {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      
    {/* Load More Comments Button */}
    {comment.hasChildren && (
      <button 
        className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
        onClick={() => loadMoreComments(comment.id)}>
        Load More Comments
      </button> )}

    </div>
  );
  

const handleSubmit = async (postID: number) => {
  //event.preventDefault();
  if (!session) {
    console.log('No active session');
    return;
  }

  console.log('Trying to pass!'); // The authenticated user
  if (!session.user || !session.user.name) {
    console.log('User or username is not defined');
    return;
  }

  // Create an instance of UserPostBase
  const userPost: UserPostBase = {
    user_poster_id: session.user.id, // replace with the actual username
    post_content: postContent,
    reply_to: postID,
  };

  console.log(userPost);

  try {
    console.log('Trying to wait for response!'); // The authenticated user
    const response = await fetch(`http://localhost:8000/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPost),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('Trying to wait for data pt 2!'); // The authenticated user
    console.log(response.status);

    console.log(response);
    const data = await response.json();
    if (data.status === 'success') {
      console.log('it worked!')
      // Handle success (e.g., clear the textarea and close the overlay)
      setPostContent('');
    } else {
      console.log('it didnt work!')
      // Handle error
      console.error('Failed to create post');
    console.log('Post creation status:', data.status);
    // Handle post creation success
  } 
  }
   catch (error) {
        console.error('An error occurred:', error);
      }
    };


  return (
    <div className='w-full'>
      <div className="relative rounded-t-2xl">
        <div className="flex pl-4 pr-4 rounded-t-2xl">
          <div className="relative flex flex-row rounded-3xl p-4">
          {post && (
          <>
            {/* Profile Picture Column */}
            <div className="flex flex-col justify-start items-center mr-4 flex-shrink-0">
              <img className="rounded-full h-12 w-12 shadow-sm mb-4" src={`http://localhost:8000/user/${post.user_poster_id}/profile_picture`} alt="Author" />
            </div>

            {/* Content and Buttons Column */}
            <div className="flex flex-col justify-start flex-grow">
              <div className="mb-4">
                <div className="font-medium">{post.user_display_name}</div>
                <div className=''>
                  <p className="hyphens-auto break-all">{post.content}</p>
                </div>
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
            <button className={`flex flex-row items-center justify-center pl-4 pr-4 border-b-2 border-blue-500 hover:border-blue-300`} onClick={() => router.back()}>
              <span title="arrow_back" className="mb-2 mt-2 text-sky-900  material-symbols-sharp"   style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48" }}>
              arrow_back
              </span>
            </button>
          </div>
        </div>
        </div>
        {/* Reply box */}
        <div className="p-8 border-b">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {profilePicUrl && 
              <Image height={256} width={256} className="inline-block h-10 w-10 rounded-full" src={profilePicUrl} alt=""/>
              }
            </div>
            <div className="min-w-0 flex-1">
              <form action="#" className="relative">
                <div className="overflow-hidden rounded-lg shadow-sm ring-0 ring-gray-300 border outline-none focus-within:ring-indigo-600">
                  <label className="sr-only">Add your comment</label>
                  <textarea name="comment" id="comment" className="block w-full resize-none border-0 bg-transparent outline-none py-1.5 px-2 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-0" 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Reply"></textarea>

                  <div className="py-2 px-4" aria-hidden="true">
                    <div className="py-px">
                      <div className="h-9 px-8"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                  <div className="flex items-center space-x-5">
                    <div className="flex items-center">
                      <button type="button" className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">Attach a file</span>
                      </button>
                    </div>
                    <div className="flex items-center">
                      <div>
            
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                  {post &&
                    <button 
                      type="submit" 
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
                      onClick={async (event) => {
                        event.preventDefault();
                        await handleSubmit(post.id);
                      }}
                    >
                      Post
                    </button>     
                  }            
                   </div>
                </div>
              </form>
            </div>
          </div>

        </div>
        <div>
        </div>
        <div>
        {post && post.replies.map((comment, index) => (
          <div key={comment.id}>
            {renderComment(comment)}
            {index < post.replies.length - 1 && <hr />}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

