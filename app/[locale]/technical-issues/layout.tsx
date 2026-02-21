import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical issues | Musclepals',
  robots: { index: false, follow: false },
};

export default function TechnicalIssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
