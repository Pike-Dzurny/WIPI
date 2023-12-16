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
    <div className="fixed top-1/2 transform -translate-y-1/2 translate-x-1/2 w-1/5 h-1/2 p-8 overflow-auto  transition-colors flex flex-col">
            <button
            type="button"
            className="rounded-full bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
            Messages
            </button>
            <button
            type="button"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
            Messages
            </button>
            <button
            type="button"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
            Messages
            </button>
    </div>
  );
};