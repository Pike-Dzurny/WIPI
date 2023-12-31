import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface ProfilePicContextType {
  profilePicUrl: string;
  setProfilePicUrl: React.Dispatch<React.SetStateAction<string>>;
}

// Create the context with initial values and types
const ProfilePicContext = createContext<ProfilePicContextType>({
  profilePicUrl: '',
  setProfilePicUrl: () => {},
});

// Custom hook for using this context
export const useProfilePic = () => useContext(ProfilePicContext);

// Type for the props of the provider
interface ProfilePicProviderProps {
  children: ReactNode;
}

export const ProfilePicProvider: React.FC<ProfilePicProviderProps> = ({ children }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');

  console.log("ProfilePicProvider: profilePicUrl:", profilePicUrl);
  return (
    <ProfilePicContext.Provider value={{ profilePicUrl, setProfilePicUrl }}>
      {children}
    </ProfilePicContext.Provider>
  );
};
