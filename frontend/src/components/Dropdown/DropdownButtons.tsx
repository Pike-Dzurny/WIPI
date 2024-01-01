import Link from 'next/link';
import { useState } from 'react';

type SidebarButtonProps = {
  icon: string;
  name: string;
  path: string;
  selected: boolean;
};

export const DropdownButton = ({ icon, name, path = '/', selected }: SidebarButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div className={`rounded-full hover:bg-slate-200`}>
      <Link className={`flex flex-row items-center justify-center pl-4 pr-4 border-b-2 ${selected ? 'border-blue-500 hover:border-blue-300' : 'border-transparent'}`} href={path} passHref>
        <span 
            title={name} 
            className={`mb-2 mt-2 text-sky-900 material-symbols-sharp transition-transform duration-100 ease-in-out ${isClicked ? 'transform scale-90' : 'transform scale-100'}`} 
            style={selected ? {fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"} : {}}
            onMouseDown={() => setIsClicked(true)}
            onMouseUp={() => setIsClicked(false)}
          >
            {icon}
        </span>
      </Link>
    </div>
  );
};