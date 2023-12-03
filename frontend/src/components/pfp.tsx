"use client";
import Image from 'next/image'
import React, { useContext } from 'react';
import clsx from 'clsx';

export const PFP: React.FC = () => {

  return (
    <div className="p-16 relative">
      <div className={clsx(
        "rounded-full max-w-sm max-h-sm absolute top-0 left-0 right-0 bottom-0 m-auto blur-lg",)}>
        <Image
          src={`http://api:8000/user/${0}/profile_picture`} // Source of the image
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
          src={`http://api:8000/user/${0}/profile_picture`} // Source of the image
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