import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const button_names = ['Messages', 'Profile', 'Settings'];

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-20 h-full bg-slate-50 shadow-sm transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col items-start h-full">
          <div className="flex-grow">
            {['chat_bubble', 'favorite', 'settings'].map((icon, index) => (
              <button
                key={index}
                className={`group flex items-center w-14 h-14 mb-2 px-4 rounded-full bg-gray-200 ${
                  isOpen ? 'w-full' : ''
                } transition-width duration-300`}
                onClick={() => console.log(`Clicked ${icon}`)}
              >
                <span className="material-symbols-sharp flex-shrink-0">{icon}</span>
                {isOpen && (
                  <span
                    className="ml-4 flex-grow transition-opacity duration-300 delay-300"
                    style={{ transitionDelay: `${isOpen ? '300ms' : '0ms'}` }}
                  >
                    {button_names[index]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 mb-4"
          >
            <span className="text-xl">{isOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-25"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
