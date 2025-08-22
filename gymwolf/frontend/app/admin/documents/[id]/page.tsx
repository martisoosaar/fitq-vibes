'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { ArrowLeft, Save, History, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Dynamically import the editor to avoid SSR issues
const DocumentEditor = dynamic(() => import('@/components/DocumentEditor'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-gray-500">Loading editor...</div>,
});

interface Document {
  id: number;
  slug: string;
  title: string;
  content: string;
  version: string;
  updated_at: string;
  updated_by: {
    id: number;
    name: string;
  } | null;
  history?: DocumentHistory[];
}

interface DocumentHistory {
  id: number;
  version: string;
  change_summary: string | null;
  created_at: string;
  updated_by: {
    id: number;
    name: string;
  } | null;
}

export default function AdminDocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  useEffect(() => {
    if (document) {
      const contentChanged = editedContent !== document.content;
      const titleChanged = editedTitle !== document.title;
      setHasChanges(contentChanged || titleChanged);
    }
  }, [editedContent, editedTitle, document]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/admin/documents/${documentId}/history`);
      setDocument(response.data);
      setEditedContent(response.data.content);
      setEditedTitle(response.data.title);
    } catch (error) {
      console.error('Error fetching document:', error);
      alert('Failed to load document');
      router.push('/admin/documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert('No changes to save');
      return;
    }

    if (!changeSummary.trim()) {
      alert('Please provide a summary of your changes');
      return;
    }

    const confirmSave = window.confirm(
      'Saving this document will require all users to re-accept it. Are you sure you want to continue?'
    );

    if (!confirmSave) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put(`/admin/documents/${documentId}`, {
        title: editedTitle,
        content: editedContent,
        change_summary: changeSummary,
      });

      if (response.data.success) {
        alert('Document saved successfully');
        setDocument(response.data.document);
        setChangeSummary('');
        setHasChanges(false);
        // Refresh to get updated history
        fetchDocument();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Document not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/documents"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none px-1"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Version {document.version} • Last updated {formatDate(document.updated_at)}
              {document.updated_by && ` by ${document.updated_by.name}`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            History
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Warning */}
      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                You have unsaved changes
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Saving will create version {parseFloat(document.version) + 0.1} and require all users to re-accept this document.
              </p>
              {hasChanges && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Change Summary (required)
                  </label>
                  <input
                    type="text"
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="Briefly describe what was changed..."
                    className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && document.history && document.history.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Version History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {document.history.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-700 rounded p-3 text-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Version {item.version}
                    </span>
                    {item.change_summary && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {item.change_summary}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-gray-500 dark:text-gray-400 text-xs">
                    <div>{formatDate(item.created_at)}</div>
                    {item.updated_by && (
                      <div>by {item.updated_by.name}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <DocumentEditor
          content={editedContent}
          onChange={setEditedContent}
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Preview</h3>
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: editedContent }}
        />
      </div>
    </div>
  );
}