import Link from 'next/link';

type SidebarButtonProps = {
  icon: string;
  name: string;
  path: string;
  selected: boolean;
};

export const SidebarButton = ({ icon, name, path = '/', selected }: SidebarButtonProps) => {

  return (
    <Link href={path} passHref>
      <div className={'flex items-center mb-4 rounded p-2 transition-colors hover:bg-slate-100'}>
        <span className="material-symbols-sharp" style={selected ? {fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' -25, 'opsz' 48"} : {}}>
          {icon}
        </span>
        {name}
      </div>
    </Link>
  );
};