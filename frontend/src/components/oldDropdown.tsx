"use client";

import React, { useState, useContext } from 'react';
import clsx from 'clsx';


export const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
  };

  const handleNavigateToProfile = () => {
    // Handle navigation to profile here
  };

  return (

    <div className="relative inline-block text-left">
      <div>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={clsx(
          "inline-flex justify-center w-full rounded-md border shadow-sm px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-border-primary",
          {
            'border-gray-300 bg-white text-gray-700': theme === 'light',
            'border-border-primary bg-gray-800 text-white': theme !== 'light'
          }
        )}>
          Options
        </button>
      </div>

      {isOpen && (
        <div className={clsx(
          "origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1",
          {
            'bg-white text-gray-700': theme === 'light',
            'bg-gray-800 text-white': theme !== 'light'
          }
        )} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <button onClick={handleNavigateToProfile} className={clsx(
        "block w-full text-left px-4 py-2 text-sm",
        {
            'hover:bg-gray-700': theme !== 'light'
        }
        )} role="menuitem">Home Profile</button>
        <button onClick={toggleTheme} className={clsx(
        "block w-full text-left px-4 py-2 text-sm",
        {
            'hover:bg-gray-700': theme !== 'light'
        }
        )} role="menuitem">{theme === 'dark' ? 'Bright Mode' : 'Dark Mode'}</button>
        <button onClick={handleLogout} className={clsx(
        "block w-full text-left px-4 py-2 text-sm",
        {
            'hover:bg-gray-700': theme !== 'light'
        }
        )} role="menuitem">Logout</button> 
           </div>
            )}
    </div>

  );
};