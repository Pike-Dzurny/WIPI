"use client";

import React, { useContext } from 'react';
import { useState } from 'react';

import clsx from 'clsx';
import { SidebarButton } from './SidebarButtons'; // Import SidebarButton component
import { usePathname } from 'next/navigation'


export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [currentPage, setCurrentPage] = useState('Settings');

  return (
    <>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <div className={clsx(
    "fixed top-1/2 transform -translate-y-1/2 translate-x-1/2 w-1/5 h-1/2 p-8 overflow-auto rounded shadow-lg hover:sha transition-colors border flex flex-col justify-between border-slate-300 bg-slate-200"
      )}>
    <div className="flex flex-col justify-between space-y-4 text-lg text-slate-600">
      <SidebarButton icon="home" name="Home" path="/" selected={pathname === '/'} />
      <SidebarButton icon="mail" name="Messages" path="/messages" selected={pathname === '/messages'} />
      <SidebarButton icon="person" name="Profile" path="/profile" selected={pathname === '/profile'} />
      <SidebarButton icon="local_fire_department" path="/trending" name="Trending" selected={pathname === 'Trending'} />
    </div>
      <div className="mt-auto">
        <hr className="border-neutral mb-4" />
        <SidebarButton icon="settings" name="Settings" path="/settings" selected={pathname === '/settings'} />
      </div>
    </div>
</>
  );
};