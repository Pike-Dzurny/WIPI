// Skeletons.tsx
export const SkeletonPost = ({ count = 1 }) => {
    const skeletons = Array.from({ length: count }, (_, index) => (
      <div key={count} className='hover:bg-slate-100 pt-4  w-full'>
        <div className="px-8 mt-4 animate-pulse">
            <div className="pb-4 grid grid-cols-[auto,1fr] items-start text-slate-700 gap-x-4">
            <div className="p-1 pr-2 flex items-center">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            </div>
            <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/12"></div>
                <div className="h-4 bg-gray-300 rounded w-2/6"></div>
                <div className="flex justify-between space-x-4">
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
            </div>
            </div>
        </div>
        <hr className="border-slate-300 border-1" />
      </div>

    ));
  
    return <div className="h-100 w-full">{skeletons}</div>;
  };

  