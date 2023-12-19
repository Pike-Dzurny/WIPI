"use client";
import React, { useState } from 'react';



const AboutPage = () => {

  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validImageTypes.includes(fileType)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
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
        const response = await fetch(`http://localhost:8000/user/7/pfp`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        setMessage('Upload successful');
        console.log('Upload successful');
      } catch (error) {
        setMessage(`Upload failed: ${error.message}`);
      }
    }
  };

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
              <div className='flex flex-col basis-2/3 bg-slate-50 rounded-l-lg p-4 shadow-inner'>
                <div className='mb-4'>
                <input id="fileInput" type="file" onChange={handleFileChange} />
                {preview && <img src={preview} width={80} height={80} className='rounded-full' alt="Preview" />}
                {message && <p>{message}</p>}
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
          <div className='flex flex-col justify-center items-center'>
            asfsdf
          </div>      
        </div>
      </main>
    </div>
  );
};

export default AboutPage;