import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-20 h-full bg-white transition-all duration-300 py-2 pl-1 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col items-start h-full">
          <div className="flex-grow">
            {['Icon 1', 'Icon 2', 'Icon 3'].map((icon, index) => (
              <button
                key={index}
                className={`flex items-center justify-center w-14 h-14 mb-2 rounded-full bg-gray-200 transition-width duration-300 ${
                  isOpen ? 'justify-start pl-4 w-full' : ''
                }`}
                onClick={() => console.log(`Clicked ${icon}`)}
              >
                <span>{icon}</span>
                {isOpen && (
                  <span
                    className="ml-4 opacity-0 transition-opacity duration-300 delay-300"
                    style={{ transitionDelay: `${isOpen ? '300ms' : '0ms'}` }}
                  >
                    
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
