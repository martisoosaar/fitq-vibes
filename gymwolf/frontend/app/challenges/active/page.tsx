'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Trophy, Users, Calendar, Clock, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Challenge {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  result_unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participant_count: number;
  top_result?: {
    user_name: string;
    result_value: number;
    formatted_result: string;
  };
}

export default function ActiveChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveChallenges();
  }, []);

  const fetchActiveChallenges = async () => {
    try {
      const response = await api.get('/challenges/active');
      setChallenges(response.data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
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

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Ended';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-purple-600 to-blue-600',
      'from-green-600 to-teal-600',
      'from-orange-600 to-red-600',
      'from-pink-600 to-purple-600',
      'from-blue-600 to-indigo-600',
      'from-yellow-600 to-orange-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Active Challenges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join ongoing fitness challenges and compete with the community
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading challenges...</div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Challenges
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There are no active challenges at the moment. Check back later!
            </p>
            <Link
              href="/challenges/archive"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              View Past Challenges
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Challenge Image or Gradient */}
                  <div className={`relative h-48 bg-gradient-to-br ${getGradientClass(index)}`}>
                    {challenge.image_url ? (
                      <img
                        src={challenge.image_url}
                        alt={challenge.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {getDaysRemaining(challenge.end_date)}
                      </span>
                    </div>
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

                      {challenge.top_result && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Leading:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {challenge.top_result.formatted_result}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Challenge Type Badge */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
        )}

        {/* Info Section */}
        {challenges.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">How to Participate</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">1. Choose a Challenge</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Browse active challenges and pick one that matches your fitness goals
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">2. Complete the Task</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Follow the challenge rules and give it your best effort
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">3. Submit Your Result</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Enter your result before the deadline to compete for prizes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}