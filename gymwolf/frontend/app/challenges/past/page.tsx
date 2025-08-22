'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { Trophy, Calendar, Users, Medal, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Challenge {
  id: number;
  title: string;
  description: string;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  start_date: string;
  end_date: string;
  winner?: {
    user: string;
    result: string;
  };
  total_participants: number;
}

export default function PastChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchChallenges();
  }, [currentPage]);

  const fetchChallenges = async () => {
    try {
      const response = await api.get(`/challenges/past?page=${currentPage}`);
      setChallenges(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching past challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.getFullYear() === endDate.getFullYear()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Past Challenges</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse completed challenges and their winners
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading challenges...</div>
          </div>
        ) : (
          <>
            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Challenge Header */}
                  <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
                    <div className="flex items-start justify-between">
                      <Trophy className="h-6 w-6" />
                      <span className="text-xs bg-black/20 px-2 py-1 rounded">
                        Completed
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mt-2">{challenge.title}</h3>
                  </div>

                  {/* Challenge Body */}
                  <div className="p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {challenge.description}
                    </p>

                    {/* Winner */}
                    {challenge.winner && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Medal className="h-5 w-5 text-yellow-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Winner</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {challenge.winner.user}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {challenge.winner.result}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(challenge.start_date, challenge.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{challenge.total_participants} participants</span>
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      <span className="text-sm font-medium">View Results</span>
                      <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {challenges.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No past challenges found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}