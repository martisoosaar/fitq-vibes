'use client';

import Navigation from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}