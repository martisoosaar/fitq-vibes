'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Trophy, Users, Calendar, Award, Medal, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PastChallenge {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  result_unit: string;
  start_date: string;
  end_date: string;
  participant_count: number;
  winner?: {
    user_name: string;
    result_value: number;
    formatted_result: string;
  };
}

export default function ChallengeArchivePage() {
  const [challenges, setChallenges] = useState<PastChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPastChallenges();
  }, []);

  const fetchPastChallenges = async () => {
    try {
      const response = await api.get('/challenges/past');
      // Handle paginated response
      setChallenges(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching past challenges:', error);
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-gray-600 to-gray-700',
      'from-slate-600 to-slate-700',
      'from-zinc-600 to-zinc-700',
      'from-neutral-600 to-neutral-700',
      'from-stone-600 to-stone-700',
    ];
    return gradients[index % gradients.length];
  };

  // Group challenges by month
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const monthYear = getMonthYear(challenge.end_date);
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(challenge);
    return acc;
  }, {} as Record<string, PastChallenge[]>);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Challenge Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse completed challenges and see past winners
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading past challenges...</div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Past Challenges
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No challenges have been completed yet.
            </p>
            <Link
              href="/challenges/active"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              View Active Challenges
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedChallenges).map(([monthYear, monthChallenges]) => (
              <div key={monthYear}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {monthYear}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthChallenges.map((challenge, index) => (
                    <Link
                      key={challenge.id}
                      href={`/challenges/${challenge.id}`}
                      className="group"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow opacity-95 hover:opacity-100">
                        {/* Challenge Image or Gradient */}
                        <div className={`relative h-48 bg-gradient-to-br ${getGradientClass(index)}`}>
                          {challenge.image_url ? (
                            <img
                              src={challenge.image_url}
                              alt={challenge.title}
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Trophy className="h-16 w-16 text-white opacity-30" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Completed
                            </span>
                          </div>
                          {challenge.winner && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <div className="flex items-center gap-2 text-white">
                                <Trophy className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-semibold">
                                  Winner: {challenge.winner.user_name}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Challenge Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {challenge.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {challenge.description}
                          </p>

                          {/* Challenge Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{challenge.participant_count} participants</span>
                              </div>
                            </div>

                            {challenge.winner && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Winning result:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {challenge.winner.formatted_result}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Challenge Type Badge */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {challenge.result_type === 'reps' ? 'Repetitions' : 'Time-based'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {challenge.scoring_type === 'higher_better' ? 'Higher wins' : 'Lower wins'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {challenges.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Challenges
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.reduce((sum, c) => sum + c.participant_count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Participants
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <Medal className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenges.filter(c => c.winner).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Winners Crowned
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(challenges.reduce((sum, c) => sum + c.participant_count, 0) / Math.max(challenges.length, 1))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Participants
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}