'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import TermsAcceptanceModal from './TermsAcceptanceModal';

export default function TermsChecker({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  // Pages that don't require terms acceptance
  const exemptPages = ['/login', '/register', '/terms', '/privacy', '/auth/'];
  
  // Only exempt root page exactly, not all pages starting with /
  const isExemptPage = exemptPages.some(page => pathname?.startsWith(page)) || pathname === '/';

  useEffect(() => {
    const checkTerms = async () => {
      // Skip if on exempt page
      if (isExemptPage) {
        setHasChecked(true);
        return;
      }

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setHasChecked(true);
        return;
      }

      setIsAuthenticated(true);

      try {
        const response = await api.get('/terms/check');
        const { terms_accepted, privacy_accepted } = response.data;
        
        // Show modal if either terms or privacy are not accepted
        if (!terms_accepted || !privacy_accepted) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking terms acceptance:', error);
      } finally {
        setHasChecked(true);
      }
    };

    checkTerms();
  }, [pathname]);

  const handleAccept = () => {
    setShowModal(false);
    // Reload to ensure all components get updated user data
    window.location.reload();
  };

  // Don't render children until we've checked
  if (!hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showModal && isAuthenticated && (
        <TermsAcceptanceModal 
          onAccept={handleAccept}
        />
      )}
    </>
  );
}