import React, { useContext } from 'react';
import './ProfileCard.css'; // make sure to import your CSS file
import { OverlayContext } from '../OverlayContext';

interface ProfileCardProps {
  backgroundImage: string;
  profileImage: JSX.Element;
  isOverlayOpen: boolean;
  setIsOverlayOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ backgroundImage, profileImage }) => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('OverlayContext is undefined, make sure you are using the OverlayContext.Provider');
  }
  const { isOverlayOpen, setIsOverlayOpen } = context;
  const [isClicked, setIsClicked] = React.useState(false);


  const handleClick = () => {
    setIsOverlayOpen(true);
  };

  return (  
  <div>
    <div className="absolute inset-0 z-0 rounded-2xl" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover'}}></div>
    <div className="flex pl-4 pr-4 pb-16 pt-16 justify-center rounded-t-2xl z-10">
      <div className="relative flex flex-col justify-center items-center bg-sky-50 border border-sky-200 p-20 rounded-3xl w-5/6">  
        <div className='absolute -left-4 transform hover:scale-110 transition-transform'>
          {profileImage}
        </div>
        <div className={`profile-card`} />
          <button onClick={handleClick} className="absolute -bottom-4 -right-4 bg-blue-500 border-blue-300 hover:bg-blue-400 hover:shadow-sm shadow-lg  text-white rounded-full py-4 px-6 text-2xl">+</button>
       </div>
    </div>
  </div>
  );
};
export default ProfileCard;