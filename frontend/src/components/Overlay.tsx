import React, { ReactNode } from 'react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="overlay fixed h-screen w-screen bg-black/50 z-40 justify-center items-center" onClick={onClose}>
<div className="overlay-container w-1/2 h-min bg-white rounded-xl z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-10" onClick={e => e.stopPropagation()}>        
{children}
      </div>
    </div>
  );
};