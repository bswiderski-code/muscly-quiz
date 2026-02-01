import React from 'react';

type Props = {
  children: React.ReactNode;
  params: Promise<{ funnel: string; locale: string }>;
};

export default async function FunnelLayout({ children }: Props) {
  return (
    <div>
      {children}
    </div>
  );
}
