import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';


interface SidebarProps {
  // Define your prop types here
  id: Number;
  name: String; 
}



export const MobileSidebar: React.FC<SidebarProps> = ({ id, name }) => {

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  useEffect(() => {
    // Fetch the profile picture URL when the component mounts
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`http://localhost:8000/user/1/pfp`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Parse the JSON in the response
        setProfilePictureUrl(data.url); // Set the image URL from the response data
        console.log('Profile picture URL:', data.url);
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        // Handle errors, e.g., set a default image
      }
    };
  
    fetchProfilePicture();
  }, []); // Empty dependency array to run only once when the component mounts

    const [userStatus, setUserStatus] = useState('online');


    const pathname = usePathname();
    const buttonInfo = [
      { name: 'home', icon: 'home', route: '/' },
      { name: 'profile', icon: 'person', route: '/profile' },
      { name: 'messages', icon: 'mail', route: '/messages' },
      { name: 'settings', icon: 'settings', route: '/settings' },
    ];

    function setDND(): void {
      setUserStatus('dnd');
    }
    function setOnline(): void {
      setUserStatus('online');
    }

    function setOffline(): void {
      setUserStatus('offline');
    }




    return (
      <div className="flex flex-row justify-around z-20 items-center h-full">
        <span
        className={`material-symbols-outlined text-2xl justify-end text-sky-900
        ${pathname === '/' ? 'filled-icon ' : ''}`}
        style={{
          fontVariationSettings: pathname === '/'
            ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
            : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
        }}
        >
        home
        </span>
        <span
        className={`material-symbols-outlined text-2xl justify-end text-sky-900
        ${pathname === '/profile' ? 'filled-icon ' : ''}`}
        style={{
          fontVariationSettings: pathname === '/profile'
            ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
            : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
        }}
        >
        person
        </span>
        <div className='flex flex-col justify-center items-center fixed bottom-0 left-0 w-full h-20'>
        <Image
              src={profilePictureUrl}
              alt="Profile"
              width={70}
              height={70}
              className="rounded-full shadow-xl" />
        </div>

        <span
        className={`hidden material-symbols-outlined text-2xl justify-end text-sky-900
        ${pathname === '/mail' ? 'filled-icon ' : ''}`}
        style={{
          fontVariationSettings: pathname === '/mail'
            ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
            : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
        }}
        >
        mail
        </span>
        <span
        className={`material-symbols-outlined text-2xl justify-end text-sky-900
        ${pathname === '/mail' ? 'filled-icon ' : ''}`}
        style={{
          fontVariationSettings: pathname === '/mail'
            ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
            : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
        }}
        >
        mail
        </span>
        <span
        className={`material-symbols-outlined text-2xl justify-end text-sky-900
        ${pathname === '/settings' ? 'filled-icon ' : ''}`}
        style={{
          fontVariationSettings: pathname === '/settings'
            ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
            : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
        }}
        >
        settings
        </span>
      </div>
    );
  };


