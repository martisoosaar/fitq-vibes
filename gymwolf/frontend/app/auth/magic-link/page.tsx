'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your login link...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid login link');
        return;
      }

      try {
        const response = await fetch('http://localhost:8001/api/v2/auth/magic-link/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Check if user is already authenticated
          if (response.status === 400) {
            // Token might be already used or invalid, check if user is logged in
            const existingToken = localStorage.getItem('token');
            const existingUser = localStorage.getItem('user');
            
            if (existingToken && existingUser) {
              setStatus('success');
              const user = JSON.parse(existingUser);
              const welcomeMessage = user?.name 
                ? `Welcome back to Gymwolf, ${user.name}!` 
                : 'Welcome back to Gymwolf!';
              setMessage(welcomeMessage);
              
              // Redirect to dashboard since already logged in
              setTimeout(() => {
                router.push('/dashboard');
              }, 1500);
              return;
            }
            
            // If not logged in, show the error message from API
            const errorMessage = data.message || 'Invalid or expired link. Please request a new login link.';
            throw new Error(errorMessage);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (data.success) {
          // Store token and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Update auth state
          setUser(data.user);
          
          setStatus('success');
          const welcomeMessage = data.user?.name 
            ? `Welcome to Gymwolf, ${data.user.name}!` 
            : 'Welcome to Gymwolf!';
          setMessage(welcomeMessage);
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired login link');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-lg text-gray-700 mb-2">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}