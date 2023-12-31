import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { profile } from 'console';
import { useProfilePic } from '../ProfilePicContext';


interface SidebarProps {
  //profilePictureUrl: String;
  username: String; 
  accountName: String;
}



export const Sidebar: React.FC<SidebarProps> = ({ username, accountName }) => {

  const { profilePicUrl, setProfilePicUrl } = useProfilePic();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

    const [userStatus, setUserStatus] = useState('online');


    const pathname = usePathname();
    const buttonInfo = [
      { name: 'home', icon: 'home', route: '/' },
      { name: 'profile', icon: 'account_box', route: '/profile' },
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




    function signOutOfApp(): React.MouseEventHandler<HTMLSpanElement> | undefined {
      return () => {
        signOut();
      };
    }

    return (
      <div className="flex flex-col justify-self-end z-50 w-full">
        <div>
          {buttonInfo.map((button, index) => (
            <Link
              key={index}
              href={button.route}
              className={`flex items-center p-2 rounded-full mt-2 w-full ${pathname === button.route ? 'hover:bg-slate-200' : ' hover:bg-slate-200 '}`}
            >
              <div className='flex flex-row w-full'>
                <div className='basis-1/2'>
                  {button.name}
                </div>
                <div className='flex basis-1/2 justify-end justify-items-end'>
                  <span
                  className={`material-symbols-outlined text-2xl justify-end text-sky-900
                  ${pathname === button.route ? 'filled-icon ' : ''}`}
                  style={{
                    fontVariationSettings: pathname === button.route
                      ? " 'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"
                      : " 'FILL' 0, 'wght' 500, 'GRAD' -25, 'opsz' 48"
                  }}
                  >
                  {button.icon}
                  </span>
                </div>
              </div>

            </Link>

          ))}
        </div>
        <button
          onClick={() => console.log('Profile menu clicked')}
          className="mt-auto p-2"
        >
        </button>
        <hr className="border-slate-300 border-1" />
        <div className='bg-white  w-30 h-12 rounded-full shadow border-black mt-4 flex items-center group'>
          <div className="relative cursor-pointer" onClick={toggleMenu}>
            {/* Profile picture */}
            {profilePicUrl &&
            <Image
              src={profilePicUrl}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full" />
            }
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white group-hover:animate-ping ${userStatus === 'online' ? 'bg-green-500' :
              userStatus === 'offline' ? 'bg-gray-400' :
                userStatus === 'dnd' ? 'bg-red-500' :
                  'bg-gray-500' // default color
              }`}></div>
            <div className={`hidden group-hover:block absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${userStatus === 'online' ? 'bg-green-500' :
              userStatus === 'offline' ? 'bg-gray-400' :
                userStatus === 'dnd' ? 'bg-red-500' :
                  'bg-gray-500' // default color
              }`}></div>
            {showMenu && (
              <div className="absolute bg-white p-4 rounded-lg shadow-lg z-30 w-30 md:w-80 mt-2">
                {/* Menu content here */}
                <div className='flex flex-col'>
                  <div className='flex flex-row items-center mb-2 hover:bg-slate-100 p-2 rounded-lg group' onClick={setOnline}>
                    <div className='w-4 h-4 bg-green-500 rounded-full border-2 border-white group-hover:border-slate-100 mr-2'></div>
                    <p className='w-max'>Online</p>
                  </div>
                  <hr className='border-gray-300 border-1' />
                  <div className="flex flex-col">
                    <div className='flex flex-col items-start my-2 hover:bg-slate-100 p-2 rounded-lg group' onClick={setDND}>
                      <div className='flex flex-row items-center'>
                        <div className='w-4 h-4 bg-red-500 rounded-full border-2 border-white group-hover:border-slate-100 mr-2'></div>
                        <p className='w-max'>Do Not Disturb</p>
                      </div>
                      <div className='flex flex-row items-center'>
                        <div className='w-4 invisible h-4 bg-red-500 rounded-full border-2 border-white group-hover:border-slate-100 mr-2'></div>
                        <p className='w-max text-light text-sm text-slate-700'>Disables notifications from appearing</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className='flex flex-col items-start hover:bg-slate-100 p-2 rounded-lg group' onClick={setOffline}>
                      <div className='flex flex-row items-center'>
                        <div className='w-4 h-4 bg-slate-400 rounded-full border-2 border-white group-hover:border-slate-100 mr-2'></div>
                        <p className='w-max'>Offline</p>
                      </div>
                      <div className='flex flex-row items-center'>
                        <div className='w-4 invisible h-4 bg-red-500 rounded-full border-2 border-white group-hover:border-slate-100 mr-2'></div>
                        <p className='w-max text-light text-sm text-slate-700'>Makes you appear offline</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className='flex w-full'>
            <div className='flex flex-col ml-1 leading-snug justify-start line-clamp-1'>
              <p className='font-semibold lowercase'>{username}</p>
              <div>
                <p className='text-sm font-normal font-mono lowercase'>@{accountName}</p>
              </div>
            </div>
            <div className='flex flex-grow items-center justify-end'>
              <span
                className="material-symbols-outlined text-sky-900 rounded-full hover:bg-slate-200 mr-2 p-1 select-none cursor-pointer"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 24" }}
                onClick={signOutOfApp()}
              >
                logout
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  };




