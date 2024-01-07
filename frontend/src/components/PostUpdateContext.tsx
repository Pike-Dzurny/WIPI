import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

interface PostUpdateContextType {
  newPostAdded: boolean;
  setNewPostAdded: Dispatch<SetStateAction<boolean>>;
}

const PostUpdateContext = createContext<PostUpdateContextType>({
  newPostAdded: false,
  setNewPostAdded: () => {},
});

interface PostUpdateProviderProps {
  children: ReactNode;
}

export const PostUpdateProvider: React.FC<PostUpdateProviderProps> = ({ children }) => {
  const [newPostAdded, setNewPostAdded] = useState(false);

  return (
    <PostUpdateContext.Provider value={{ newPostAdded, setNewPostAdded }}>
      {children}
    </PostUpdateContext.Provider>
  );
};

export const usePostUpdate = () => useContext(PostUpdateContext);