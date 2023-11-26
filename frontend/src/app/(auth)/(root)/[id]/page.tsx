
import { Dropdown } from '../../../../components/Dropdown/Dropdown';
import { PFP } from '../../../../components/pfp';

import React, { useEffect, useState } from 'react';

import { QueryClient, useInfiniteQuery } from 'react-query';
import { useIntersection } from '@mantine/hooks';
import { RealPost } from '../../../../components/Post/RealPost'; // Import RealPost at the top of your file

import axios from 'axios';

import { QueryFunctionContext } from 'react-query';

export default function Page({ params }: { params: { id: string } }) {
    return (
        <div className='w-full'>
        <div className="relative rounded-t-2xl">
          <div className="relative flex flex-col justify-center items-center bg-sky-50 border border-sky-200 backdrop-blur-xl p-20 rounded-3xl w-5/6">  
            <div className='absolute -left-4 transform hover:scale-110 transition-transform'>
              
            </div>
            <button className="absolute -bottom-4 -right-4 bg-blue-500 border-blue-300 hover:bg-blue-400 hover:shadow-sm shadow-lg  text-white rounded-full py-4 px-6 text-2xl">+</button>
        </div>
          </div>
          <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
              <Dropdown />
          </div>

        </div>
        
    )
  }