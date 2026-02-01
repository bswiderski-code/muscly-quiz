import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type Props = {
  children: ReactNode;
  params: Promise<{ funnel: string; locale: string }>;
};

export default async function ResultLayout({ children }: Props) {
  return (
    <div>
      {children}
    </div>
  );
}
