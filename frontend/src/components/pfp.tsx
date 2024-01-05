"use client";
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  profilePictureUrl: string;
}

export const PFP: React.FC<SidebarProps>  = ({ profilePictureUrl }) => {


  

  return (
    <div className="p-16 relative">
      <div className={clsx(
        "rounded-full max-w-sm max-h-sm absolute top-0 left-0 right-0 bottom-0 m-auto blur-lg",)}>
        {profilePictureUrl && 
        <Image
          src={profilePictureUrl} // Source of the image
          alt="User's profile picture" // Alt text
          width={200} // Width of the image
          height={200} // Height of the image
          className="rounded-full" // Makes the image circular
          priority={true}
        />
      }
      </div>
      <div className={clsx(
        "rounded-full max-w-sm max-h-sm absolute top-0 left-0 right-0 bottom-0 m-auto",
      )}>
        {profilePictureUrl &&
        <Image
          src={profilePictureUrl} // Source of the image
          alt="User's profile picture" // Alt text
          width={200} // Width of the image
          height={200} // Height of the image
          className="rounded-full" // Makes the image circular
          priority={true}
        />
      }
      </div>
    </div>
  );
};