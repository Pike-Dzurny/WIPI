"use client";
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';

export const PFP: React.FC = () => {

  const { data: session, status } = useSession();
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const fetchPfpUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
      if (response.ok) {
        const data = await response.json();
        setProfilePictureUrl(data.url); // Use the URL of the response
        console.log('Got profile picture URL: ', data.url)
      } else {
        console.error('Failed to fetch profile picture URL');
      }
    } catch (error) {
      console.error('Failed to fetch profile picture URL:', error);
    }
  };

  useEffect(() => {

  
    if (session?.user?.id) {
      fetchPfpUrl();
    }
  }, [session?.user?.id]);

  return (
    <div className="p-16 relative">
      <div className={clsx(
        "rounded-full max-w-sm max-h-sm absolute top-0 left-0 right-0 bottom-0 m-auto blur-lg",)}>
        <Image
          src={profilePictureUrl} // Source of the image
          alt="User's profile picture" // Alt text
          width={200} // Width of the image
          height={200} // Height of the image
          className="rounded-full" // Makes the image circular
          priority={true}
        />
      </div>
      <div className={clsx(
        "rounded-full max-w-sm max-h-sm absolute top-0 left-0 right-0 bottom-0 m-auto",
      )}>
        <Image
          src={profilePictureUrl} // Source of the image
          alt="User's profile picture" // Alt text
          width={200} // Width of the image
          height={200} // Height of the image
          className="rounded-full" // Makes the image circular
          priority={true}
        />
      </div>
    </div>
  );
};