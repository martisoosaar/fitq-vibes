'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trophy, Plus, Calendar, Users, Clock, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Challenge {
  id: number;
  title: string;
  description: string;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  start_date: string;
  end_date: string;
  is_active: boolean;
  results_count: number;
  status: 'upcoming' | 'active' | 'ended';
  created_by: number;
  creator?: {
    name: string;
  };
}

export default function AdminChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/admin/challenges');
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      await api.delete(`/admin/challenges/${id}`);
      setChallenges(challenges.filter(c => c.id !== id));
      alert('Challenge deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete challenge');
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/challenges/${id}`, {
        is_active: !currentStatus,
      });
      setChallenges(challenges.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
    } catch (error) {
      alert('Failed to update challenge status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
      case 'ended':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Ended</span>;
      default:
        return null;
    }
  };

  const getResultTypeIcon = (type: string, scoring: string) => {
    if (type === 'reps') {
      return scoring === 'higher_better' ? '📈' : '📉';
    } else {
      return scoring === 'lower_better' ? '⏱️' : '⏰';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage fitness challenges and competitions
          </p>
        </div>
        <Link
          href="/admin/challenges/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Challenge
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="grid gap-4">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  {getStatusBadge(challenge.status)}
                  {!challenge.is_active && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {challenge.description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{challenge.results_count || 0} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{getResultTypeIcon(challenge.result_type, challenge.scoring_type)}</span>
                    <span>
                      {challenge.result_type === 'reps' ? 'Repetitions' : 'Time'} - 
                      {challenge.scoring_type === 'higher_better' ? ' Higher is better' : ' Lower is better'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleActive(challenge.id, challenge.is_active)}
                  className={`p-2 rounded-lg ${
                    challenge.is_active
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={challenge.is_active ? 'Deactivate' : 'Activate'}
                >
                  {challenge.is_active ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </button>
                <Link
                  href={`/admin/challenges/${challenge.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                {challenge.results_count === 0 && (
                  <button
                    onClick={() => handleDelete(challenge.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'No challenges found. Create your first challenge!'
              : `No ${filter} challenges found.`}
          </p>
        </div>
      )}
    </div>
  );
}