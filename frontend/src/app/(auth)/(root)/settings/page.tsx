"use client";
import clsx from 'clsx';


import { OverlayContext } from '@/components/OverlayContext';
import { signOut, useSession } from 'next-auth/react';
import React, { useState, useEffect, useContext, useRef } from 'react';
import Image from 'next/image';
import { hashPassword } from '@/components/hashPassword';



export default function AboutPage() {

  const [ProfilePictureURL, setProfilePictureURL] = useState<string | undefined>(undefined);
  const [pfpmessage, setPFPMessage] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [usernamemessage, setUsernameMessage] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [emailmessage, setEmailMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSuccessful, setIsSuccessful] = useState(false);


  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const [sessionID, setSessionID] = useState<number | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');


  const [passwordMessage, setPasswordMessage] = useState('');

  const [accountPassword, setAccountPassword] = React.useState("");


  const handlePasswordChange = async () => {  
    const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/passwordchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      setPasswordMessage(data.message);
      setIsSuccessful(true);
    } else {
      setPasswordMessage(data.detail);
      setIsSuccessful(false);
    }
  };



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
          setPFPMessage('File size exceeds 1 MB. Please select a smaller file.');
        }
      } else {
        setPFPMessage('Invalid file type. Please select a JPEG, PNG, or WEBP file.');
      }
    }
  };

  const handleUpload = async () => {

    // Profile Picture
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
          return;
        }
        setPFPMessage('Upload successful');
        console.log('Upload successful');
        fetchPfpUrl();
      } catch (error: any) {
        setPFPMessage(`Upload failed: ${error.message}`);
        return;
      }
    }

    // Username
    console.log("Username:", username);
    if (username) {
      const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        throw new Error('Failed to update username');
      }
    }

    // Email
    if (email) {
      const formData = new FormData();
      formData.append('email', email);
      try {
        const response = await fetch(`http://localhost:8000/user/${session?.user?.id}/email`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        setEmailMessage('Upload successful');
        console.log('Upload successful');
      } catch (error: any) {
        setEmailMessage(`Upload failed: ${error.message}`);
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

  const handleAccountDeletion = async () => {
    if (!session?.user?.id) {
      console.error('User ID is not available');
      return;
    }
  
    const formData = new FormData();
    formData.append('password', accountPassword);
  
    const response = await fetch(`http://localhost:8000/users/${session.user.id}/delete`, {
      method: 'DELETE',
      body: formData,
    });
  
    if (response.ok) {
      console.log('Account deletion successful');
      signOut()
    } else {
      console.error('Account deletion failed');
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
                    {pfpmessage && <b className='text-red-500'>{pfpmessage}</b>}
                </div>
                <div className='mb-4'>
                  <p>Change User Name</p>
                  <input type="text" placeholder="New User Name" value={username} onChange={(e) => setUsername(e.target.value)} />
                  {usernamemessage && <b className='text-red-500'>{usernamemessage}</b>}
                </div>
                <div className='mb-4'>
                  <p>Change Email Address</p>
                  <input type="email" placeholder="New Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className=''>
                  <button className='bg-sky-500 text-white rounded-lg p-2' onClick={handleUpload}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <hr className=''/>
          {/* Change Password */}
          <div className='flex flex-col pl-12 pt-12 pb-12'>
            <div className='flex flex-row'>
              <div className='flex flex-col basis-1/3 py-4'>
                <p>Password Managment</p>
                <p className='text-sm text-sky-900'>Edit your password</p>
              </div>
              <div className='flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4 shadow-inner'>
                <div className=''>
                  <p className='mb-4'>Change Password</p>
                  <input className='mb-4' type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  <p/>
                  <input className='' type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className=''>
                  <div className={clsx('flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4', {
                    'border-green-500': isSuccessful,
                    'border-red-500': !isSuccessful,
                  })}>
                  {passwordMessage && <>{passwordMessage}</>}
                  </div>
                  <button className='bg-sky-500 text-white rounded-lg p-2' onClick={handlePasswordChange}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
          <hr className=''/>
          {/* Delete Account/Log out Account Management */}
          <div className='flex flex-col pl-12 pt-12 pb-12'>
            <div className='flex flex-row'>
              <div className='flex flex-col basis-1/3 py-4'>
                <p>Account Managment</p>
                <p className='text-sm text-sky-900'>Delete your account</p>
              </div>
              <div className='flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4 shadow-inner'>
                <div className='mb-4'>
                  <p className=''>Delete your account</p>
                  <p className='text-red-400'>This will permanently delete your account.</p>
                  <input className='my-4' type="text" placeholder="Password" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} />
                  <p/>
                </div>
                <div className=''>
                  <button className='bg-red-500 text-white rounded-lg p-2 hover:bg-red-400' onClick={handleAccountDeletion}>Delete Account</button>
                </div>
              </div>
            </div>
          </div>      
        </div>
      </main>
    </div>
  );
};

