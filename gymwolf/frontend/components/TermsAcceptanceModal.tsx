'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { AlertTriangle } from 'lucide-react';

interface TermsAcceptanceModalProps {
  onAccept: () => void;
}

export default function TermsAcceptanceModal({ onAccept }: TermsAcceptanceModalProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!acceptTerms || !acceptPrivacy) {
      setError('You must accept both Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/terms/accept', {
        accept_terms: acceptTerms,
        accept_privacy: acceptPrivacy,
      });

      if (response.data.success) {
        onAccept();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save your acceptance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attention!</h2>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We've updated our Terms of Service and Privacy Policy. Please review and accept them to continue using Gymwolf.
          </p>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Terms of Service */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Terms of Service
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  By using Gymwolf, you agree to our terms including:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Providing accurate account information</li>
                  <li>Responsible use of the service</li>
                  <li>Respecting intellectual property rights</li>
                  <li>Understanding our medical disclaimer</li>
                  <li>Account deletion and data retention policies</li>
                </ul>
                <Link 
                  href="/terms" 
                  target="_blank"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read full Terms of Service →
                </Link>
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and accept the Terms of Service
                </span>
              </label>
            </div>

            {/* Privacy Policy */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Privacy Policy
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Our Privacy Policy explains how we handle your data:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>What personal and fitness data we collect</li>
                  <li>How we use and protect your information</li>
                  <li>Your GDPR rights and data portability</li>
                  <li>Data breach notification procedures</li>
                  <li>Special handling of health/fitness data</li>
                </ul>
                <Link 
                  href="/privacy" 
                  target="_blank"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read full Privacy Policy →
                </Link>
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and accept the Privacy Policy
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end">
            <button
              onClick={handleAccept}
              disabled={isSubmitting || !acceptTerms || !acceptPrivacy}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Accept and Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}