"use client";
import React, { useEffect } from 'react';
import clsx from 'clsx';
import { themeChange } from 'theme-change'

import { Dropdown } from '../../../../components/Dropdown/Dropdown';
import { PFP } from '../../../../components/pfp';


const AboutPage = () => {

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])
  

  return (
    <div className='w-full'>
    <div className="relative rounded-t-2xl">
    <div className="absolute inset-0 z-0 rounded-2xl" style={{backgroundImage: "url('/../static/trees.jpg')", backgroundSize: 'cover'}}></div>
    <div className="flex pl-4 pr-4 pb-16 pt-16 justify-center rounded-t-2xl backdrop-blur-xl z-10">
      <div className="relative flex flex-col justify-center items-center bg-sky-50 border border-sky-200 backdrop-blur-xl p-20 rounded-3xl w-5/6">  
        <div className='absolute -left-4 transform hover:scale-110 transition-transform'>
          <PFP/>
        </div>
        <button className="absolute -bottom-4 -right-4 bg-blue-500 border-blue-300 hover:bg-blue-400 hover:shadow-sm shadow-lg  text-white rounded-full py-4 px-6 text-2xl">+</button>
      </div>
    </div>
  </div>
            <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
              <Dropdown />
            </div>
    </div>
  );
};

export default AboutPage;