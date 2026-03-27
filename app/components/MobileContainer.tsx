import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden border-x border-border bg-background shadow-2xl">
      {children}
    </div>
  );
};

export default MobileContainer;
