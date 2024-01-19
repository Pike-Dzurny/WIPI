import React from 'react';
import Image from 'next/image';
import { Post } from './Modules';
import Link from 'next/link';

type PostComponentProps = {
  post: Post;
  toggleLike: () => void;
  hasLiked: boolean;
  likesCount: number;
  handleCopyClick: () => void;
  formatRelativeTime: (dateString: string) => string;
  setIsChangeCircle: (value: boolean) => void;
  isChangeCircle: boolean;
  openComment: boolean;
  setOpenComment: (value: boolean) => void;
  parent: boolean;
  hasParent: boolean;
};

const PostComponent: React.FC<PostComponentProps> = ({
  post,
  toggleLike,
  hasLiked,
  likesCount,
  handleCopyClick,
  formatRelativeTime,
  setIsChangeCircle,
  isChangeCircle,
  openComment,
  setOpenComment,
  parent,
  hasParent,
}) => {
  console.log(hasParent);
  return (
    <>
    {post && post.user_display_name && (
    <>
        {/* Profile Picture Column */}
        <div className="relative flex flex-col justify-start items-center mr-4 flex-shrink-0">
          {/* Line going up if there's a parent */}
          {/* {hasParent && !parent && (
            <div className="absolute left-1/2 top-0 w-px h-1/2 bg-slate-200 -translate-y-32"></div>
          )} */}
          {/* Line going down if there are replies */}
          {parent && (
            <div className="absolute bottom-0 left-1/2 w-px h-full bg-slate-200 translate-y-14"></div> 
          )}
          {/* Profile Picture */}
          {post && post.profile_picture && (
            <Image width={256} height={256} className="rounded-full h-14 w-14 shadow-sm mb-4 z-10" src={post.profile_picture} alt="Author" />
          )}
        </div>

      {/* Content and Buttons Column */}
      <div className="flex flex-col w-full">
        {/* Content */}
        <div className="flex flex-col justify-between overflow-hidden">
          <div>
            {/* Author and Date */}
            <div className='flex flex-row justify-between'>
              <p className='font-medium'>{post.user_display_name}</p>
              <div className='' title={post.date_of_post}>{formatRelativeTime(post.date_of_post)}</div>
            </div>
            {/* Post Content */}
            <div className="overflow-hidden overflow-wrap break-words">
              <p className="hyphens-auto break-all">{post.content}</p>
              <p className='text-sm text-slate-500 font-light font-mono  italic'>#{post.id}</p>

            </div>
          </div>
        </div>

        {/* Buttons */}
        {!parent && (
        <div className="flex w-full justify-between items-center">
          {/* Like Button */}
          <div className='select-none flex flex-row items-center'>
          <span className={`cursor-pointer material-symbols-sharp rounded-full p-2 ${hasLiked ? 'text-red-500' : 'text-slate-500'} hover:text-red-500 hover:bg-gray-200`}
            style={hasLiked ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24", padding: '10px'} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24", padding: '10px'}}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike();
            }}>
            favorite
          </span>
            <p className="font-light" style={{ width: '10px', textAlign: 'right' }}>{likesCount}</p>
          </div>

          {/* Comment Button */}
          <span className={`cursor-pointer select-none material-symbols-sharp rounded-full p-2 ${openComment ? 'text-sky-500' : 'text-slate-500'} hover:text-sky-500 hover:bg-gray-200`}
            style={openComment ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24", padding: '10px'} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24", padding: '10px'}}
            onClick={() => setOpenComment(!openComment)}>
            chat_bubble
          </span>

          {/* Change Circle Button */}
          <span className={`cursor-pointer select-none material-symbols-sharp rounded-full p-2 ${isChangeCircle ? 'text-lime-400' : 'text-slate-500'} hover:text-lime-600 hover:bg-gray-200`}
            style={isChangeCircle ? {fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' -25, 'opsz' 24"} : {fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' -25, 'opsz' 24"}}
            onClick={() => setIsChangeCircle(!isChangeCircle)}>
            change_circle
          </span>

          {/* Share Button */}
          <span className="cursor-pointer select-none material-symbols-sharp text-slate-500 hover:text-amber-600 hover:bg-gray-200 rounded-full p-2" 
            style={{fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' -25, 'opsz' 24"}}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyClick();
            }}>
            ios_share
          </span>
        </div>
        )}
        {parent && (
            <Link className="flex w-full justify-between items-center text-sm font-mono text-slate-400 font-light hover:underline hover:text-slate-600" href={`http://localhost:3000/p/${post.id}`}>
            Link
            </Link>
                    )}
      </div>
    </>
    )   }
    </>

  );
};

export default PostComponent;
