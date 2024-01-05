/* eslint-disable */
"use client";

import React, { useContext } from 'react';
import { useState } from 'react';

import clsx from 'clsx';
import { DropdownButton } from './DropdownButtons'; // Import SidebarButton component
import { usePathname } from 'next/navigation'


export const Dropdown: React.FC = () => {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('Settings');

  return (
    <>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" />
    <div className="flex justify-around items-center">
      <div className="flex flex-col justify-center items-center"/>
      <DropdownButton icon="person" name="Profile" path="/profile" selected={pathname === '/profile'} />
      <DropdownButton icon="home" name="Home" path="/" selected={pathname === '/'} />
      <DropdownButton icon="hub" name="Trending" path="/trending" selected={pathname === '/trending'} />
      <div className="flex flex-col justify-center items-center"/>
    </div>
    </>
  );
};