
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface ProfilePicContextType {
  profilePicUrl: string;
  setProfilePicUrl: React.Dispatch<React.SetStateAction<string>>;
  backgroundPicUrl: string;
  setBackgroundPicUrl: React.Dispatch<React.SetStateAction<string>>;
  followerCount: number;
  setFollowerCount: React.Dispatch<React.SetStateAction<number>>;
  followingCount: number;
  setFollowingCount: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context with initial values and types
const ProfilePicContext = createContext<ProfilePicContextType>({
  profilePicUrl: '',
  setProfilePicUrl: () => {},
  backgroundPicUrl: '',
  setBackgroundPicUrl: () => {},
  followerCount: 0,
  setFollowerCount: () => {},
  followingCount: 0,
  setFollowingCount: () => {},
});

// Custom hook for using this context
export const useProfilePic = () => useContext(ProfilePicContext);

// Type for the props of the provider
interface ProfilePicProviderProps {
  children: ReactNode;
}

export const ProfilePicProvider: React.FC<ProfilePicProviderProps> = ({ children }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [backgroundPicUrl, setBackgroundPicUrl] = useState<string>('');
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  
  return (
    <ProfilePicContext.Provider value={{ profilePicUrl, setProfilePicUrl, backgroundPicUrl, setBackgroundPicUrl, followerCount, setFollowerCount, followingCount, setFollowingCount }}>
      {children}
    </ProfilePicContext.Provider>
  );
};
