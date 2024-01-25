import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { OverlayContext } from '../OverlayContext';
import Link from 'next/link';

interface ProfileCardProps {
  backgroundImage: string;
  profileImage: JSX.Element;
  isOverlayOpen: boolean;
  setIsOverlayOpen: React.Dispatch<React.SetStateAction<boolean>>;
  followingCount: number;
  followersCount: number;
  name: string;
  bio: string;
  id: number | undefined;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ backgroundImage, profileImage, followingCount, followersCount, bio, name, id }) => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    setIsOverlayOpen(true);
  };

  console.log("profilecard", bio);

  return (  
  <div className="relative">
    <div className="relative md:rounded-t-xl w-full h-4/6 overflow-hidden">
      <Image src={backgroundImage} width={100} height={100} alt="Background Image" className="w-full max-h-72" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg"></div> {/* Adjust the blur and color as needed */}
    </div>

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex flex-row justify-center items-center bg-indigo-50 border border-indigo-200 p-20 rounded-3xl w-5/6">  
      <div className='flex flex-col items-center justify-center absolute'>
        <div className='font-bold'>{name}</div>
        <div className='italic'>{bio}</div>
      </div>
        <div className='absolute -left-4 transform hover:scale-110 transition-transform'>
          {profileImage}
        </div>
        <div className='absolute bottom-0 flex flex-row justify-between border-t border-l border-r rounded-t-lg border-indigo-200 bg-indigo-50'>
            <Link 
            className='border-r border-indigo-200 p-2 cursor-pointer'
            href={`${process.env.NEXT_PUBLIC_FRONTED_URL}/following/${id}`}>
            Following: {followingCount}
            </Link>
            <Link 
              className='p-2 cursor-pointer'
              href={`${process.env.NEXT_PUBLIC_FRONTED_URL}/followers/${id}`}>
              Followers: {followersCount}
            </Link>        
        </div>
        <div className={`profile-card`} />
          <button onClick={handleClick} className="absolute -bottom-4 -right-4 bg-indigo-500 border-indigo-300 hover:bg-indigo-400 hover:shadow-sm shadow-lg  text-white rounded-full py-4 px-6 text-2xl">+</button>
       </div>
    </div>
  </div>
  );
};
export default ProfileCard;