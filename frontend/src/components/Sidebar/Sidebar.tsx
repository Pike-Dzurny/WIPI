import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export const MainContent: React.FC = () => {
  // Your main content component goes here
  return <div className="flex-grow overflow-auto">Main Content</div>;
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const buttonInfo = [
    { name: 'Home', icon: 'home', route: '/' },
    { name: 'Explore', icon: 'search', route: '/explore' },
  ];

  return (
    <div className="flex flex-col justify-self-end">
      <nav>
        {buttonInfo.map((button, index) => (
          <a
            key={index}
            href={button.route}
            className={`flex items-center p-2 rounded-md ${
              pathname === button.route ? 'bg-gray-300' : 'hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-rounded text-2xl mr-4">{button.icon}</span>
            {button.name}
          </a>
        ))}
      </nav>
      <button
        onClick={() => console.log('Profile menu clicked')}
        className="mt-auto p-2"
      >
        <Image
          src={"/images/profile.png"}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        {/* User's name or additional details can go here */}
      </button>
    </div>
  );
};


