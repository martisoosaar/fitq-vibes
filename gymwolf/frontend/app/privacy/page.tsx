'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import api from '@/lib/api';

interface Document {
  id: number;
  slug: string;
  title: string;
  content: string;
  version: string;
  updated_at: string;
}

export default function PrivacyPolicyPage() {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await api.get('/documents/privacy');
      setDocument(response.data);
    } catch (error) {
      console.error('Error fetching privacy document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : document ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {document.title}
              </h1>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Version {document.version} • Last updated: {formatDate(document.updated_at)}
              </div>
              
              <div 
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Privacy Policy document not found.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}