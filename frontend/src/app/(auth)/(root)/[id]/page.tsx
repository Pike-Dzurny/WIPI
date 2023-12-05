
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
      <div className="flex pl-4 pr-4 pb-16 pt-16 justify-center rounded-t-2xl">
        <div className="relative flex flex-col justify-center items-center p-20 rounded-3xl w-5/6">
          asdfasdf  
        </div>
      </div>
      <div className='backdrop-blur-sm border-slate-300 border-b border-t sticky top-0 z-10'>
          <Dropdown />
      </div>

        </div>
        </div>
        
    )
  }