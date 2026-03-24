import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-[480px] min-h-screen bg-background border-x border-[#18181B] shadow-2xl flex flex-col relative overflow-hidden">
      {children}
    </div>
  );
};

export default MobileContainer;
