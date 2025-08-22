'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FileText, Edit, Clock, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: number;
  slug: string;
  title: string;
  version: string;
  updated_at: string;
  updated_by: {
    id: number;
    name: string;
  } | null;
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/admin/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentIcon = (slug: string) => {
    switch (slug) {
      case 'terms':
        return '📜';
      case 'privacy':
        return '🔒';
      default:
        return '📄';
    }
  };

  const getDocumentDescription = (slug: string) => {
    switch (slug) {
      case 'terms':
        return 'Terms of Service - Legal agreement for service usage';
      case 'privacy':
        return 'Privacy Policy - Data collection and protection practices';
      default:
        return 'Legal document';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage legal documents and policies
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 dark:text-yellow-500 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              Important: Document Updates
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              When you update a document, all users will be required to re-accept it. 
              Previous versions are automatically archived for legal compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Link href={`/admin/documents/${doc.id}`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDocumentIcon(doc.slug)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getDocumentDescription(doc.slug)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>Version {doc.version}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(doc.updated_at)}</span>
                      </div>
                      {doc.updated_by && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Last edited by {doc.updated_by.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Edit className="h-5 w-5" />
                      <span className="font-medium">Edit</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        </div>
      )}
    </div>
  );
}