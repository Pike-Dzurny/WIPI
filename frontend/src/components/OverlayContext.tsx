import React from 'react';

interface OverlayContextProps {
  isOverlayOpen: boolean;
  setIsOverlayOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OverlayContext = React.createContext<OverlayContextProps | undefined>(undefined);