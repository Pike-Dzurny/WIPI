"use client";
import { OverlayContext } from '@/components/OverlayContext';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';



export default function AboutPage() {

  const [ProfilePictureURL, setProfilePictureURL] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);

  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const [sessionID, setSessionID] = useState<number | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Current session:", session);
    if (session?.user?.id) {
      console.log("Setting session ID:", session.user.id);
      setSessionID(session.user.id);
    } else {
      console.log("Session ID not available.");
    }
  }, [session]);

  const fetchPfpUrl = async () => {
    try {
      // Use session.user.id to fetch the profile picture URL
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`);
      if (response.ok) {
        const data = await response.json();
        setProfilePictureURL(data.url); // Use the URL of the response
        console.log('Got profile picture URL: ', data.url)
      } else {
        console.error('Failed to fetch profile picture URL');
      }
    } catch (error) {
      console.error('Failed to fetch profile picture URL:', error);
    }
  };

  useEffect(() => {

  
    if (session?.user?.id) {
      fetchPfpUrl();
    }
  }, [session?.user?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validImageTypes.includes(fileType)) {
        // Check file size, 1 MB = 1000000 bytes
        if (file.size <= 1000000) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePictureURL(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setMessage('File size exceeds 1 MB. Please select a smaller file.');
        }
      } else {
        setMessage('Invalid file type. Please select a JPEG, PNG, or WEBP file.');
      }
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/pfp`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        setMessage('Upload successful');
        console.log('Upload successful');
        fetchPfpUrl();
      } catch (error: any) {
        setMessage(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => file,
        [Symbol.iterator]: function* () {
          let index = 0;
          while (index < this.length) {
            yield this[index++];
          }
        },
      } as any as FileList;
      handleFileChange({ target: { files: fileList } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div>
      <main className="w-full">
        <div className='flex flex-col'>
          {/* Account Info */}
          <div className='flex flex-col pl-12 pt-12 pb-12'>
            <div className='flex flex-row'>
              <div className='flex flex-col basis-1/3 py-4'>
                <p>Account Information</p>
                <p className='text-sm text-sky-900'>Edit your account details and appearance</p>
              </div>
              <div className='flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4 shadow-inner'>
              <div className='mb-4 flex-col'>
                    {ProfilePictureURL && (
                      <Image 
                        src={ProfilePictureURL} 
                        width={80} 
                        height={80} 
                        className='rounded-full cursor-pointer hover:bg-gray-700/90' 
                        alt="Preview" 
                        onClick={handleImageClick}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      />
                    )}
                    <input 
                      id="fileInput" 
                      type="file" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden" // Hide the input
                    />
                    {message && <b className='text-red-500'>{message}</b>}
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
                  <button className='bg-sky-500 text-white rounded-lg p-2' onClick={handleUpload}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <hr className=''/>
          {/* Change Password */}
          <div className='flex flex-col justify-center items-center'>
            asfsdf
          </div>
          <hr className=''/>
          {/* Delete Account/Log out Account Management */}
          <div className='flex flex-col justify-center items-center'>
            asfsdf
          </div>          
        </div>
      </main>
    </div>
  );
};

