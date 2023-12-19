"use client";
import React, { useEffect } from 'react';



const AboutPage = () => {

  return (
    <div>
      <main className="w-full">
        <div className='flex flex-col'>
          <div className='flex flex-col pl-12 pt-12 pb-12'>
            <div className='flex flex-row'>
              <div className='flex flex-col basis-1/3 py-4'>
                <p>Account Information</p>
                <p className='text-sm text-sky-900'>Edit your account details and appearance</p>
              </div>
              <div className='flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4'>
                <div className='mb-4'>
                  <p>Upload Picture</p>
                  <input type="file" accept="image/*" />
                </div>
                <div className='mb-4'>
                  <p>Change User Name</p>
                  <input type="text" placeholder="New User Name" />
                </div>
                <div className='mb-4'>
                  <p>Change Email Address</p>
                  <input type="email" placeholder="New Email Address" />
                </div>
                <div className=''>
                  <button className='bg-sky-500 text-white rounded-full p-2'>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <hr className=''/>
          <div className='flex flex-col justify-center items-center'>
            asfsdf
          </div>      
        </div>
      </main>
    </div>
  );
};

export default AboutPage;