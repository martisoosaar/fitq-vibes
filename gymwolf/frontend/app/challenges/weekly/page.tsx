'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Trophy, Users, Calendar, Award, Star, Medal, Target, Clock } from 'lucide-react';

interface UserResult {
  id: number;
  rank: number;
  name: string;
  avatar: string;
  result: string;
  submittedAt: string;
  verified: boolean;
}

export default function WeeklyChallengeePage() {
  const [showEnterResult, setShowEnterResult] = useState(false);
  const [userResult, setUserResult] = useState('');

  // Dummy data for results
  const dummyResults: UserResult[] = [
    {
      id: 1,
      rank: 1,
      name: 'John Smith',
      avatar: '👨',
      result: '52 reps',
      submittedAt: '2 hours ago',
      verified: true,
    },
    {
      id: 2,
      rank: 2,
      name: 'Emma Wilson',
      avatar: '👩',
      result: '48 reps',
      submittedAt: '5 hours ago',
      verified: true,
    },
    {
      id: 3,
      rank: 3,
      name: 'Mike Johnson',
      avatar: '🧑',
      result: '45 reps',
      submittedAt: '1 day ago',
      verified: true,
    },
    {
      id: 4,
      rank: 4,
      name: 'Sarah Davis',
      avatar: '👱‍♀️',
      result: '43 reps',
      submittedAt: '1 day ago',
      verified: false,
    },
    {
      id: 5,
      rank: 5,
      name: 'Tom Brown',
      avatar: '👨‍🦱',
      result: '40 reps',
      submittedAt: '2 days ago',
      verified: true,
    },
    {
      id: 6,
      rank: 6,
      name: 'Lisa Anderson',
      avatar: '👩‍🦰',
      result: '38 reps',
      submittedAt: '2 days ago',
      verified: false,
    },
    {
      id: 7,
      rank: 7,
      name: 'Chris Martinez',
      avatar: '🧔',
      result: '35 reps',
      submittedAt: '3 days ago',
      verified: true,
    },
    {
      id: 8,
      rank: 8,
      name: 'Amy Chen',
      avatar: '👩‍🦱',
      result: '33 reps',
      submittedAt: '3 days ago',
      verified: true,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-gray-600 dark:text-gray-400 font-medium">#{rank}</span>;
    }
  };

  const handleSubmitResult = () => {
    if (userResult.trim()) {
      alert(`Result submitted: ${userResult}`);
      setUserResult('');
      setShowEnterResult(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Challenge Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Weekly Challenge</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Week 3 - January 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>4 days remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>128 participants</span>
            </div>
          </div>
        </div>

        {/* Challenge Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Challenge Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Promotional Image */}
              <div className="relative h-64 bg-gradient-to-br from-purple-500 to-blue-600">
                {/* If there's an uploaded image, show it; otherwise show the default gradient */}
                <div className="absolute inset-0">
                  {/* This would be replaced with actual challenge.image_url when using real data */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white z-10 relative">
                      <Target className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <h2 className="text-2xl font-bold mb-2">Push-Up Challenge</h2>
                      <p className="text-lg opacity-90">Maximum Push-Ups in 2 Minutes</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold z-20">
                  🏆 Prize Pool: $500
                </div>
              </div>

              {/* Challenge Description */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Challenge Description</h3>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p>Test your endurance and strength in this week&apos;s push-up challenge! Your goal is to complete as many proper form push-ups as possible within 2 minutes.</p>
                  
                  <h4 className="font-semibold mt-4">Rules:</h4>
                  <ul>
                    <li>Standard push-ups only (no knee push-ups)</li>
                    <li>Full range of motion required (chest to floor, arms fully extended)</li>
                    <li>2-minute time limit</li>
                    <li>Rest is allowed but timer continues</li>
                    <li>Video submission required for verification</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Prizes:</h4>
                  <ul>
                    <li>🥇 1st Place: $250 + 3 months premium</li>
                    <li>🥈 2nd Place: $150 + 2 months premium</li>
                    <li>🥉 3rd Place: $100 + 1 month premium</li>
                    <li>Top 10: Special achievement badge</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tutorial Video</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/41N6bKO-NVI"
                  title="Challenge Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowEnterResult(!showEnterResult)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Award className="h-5 w-5" />
                Enter Your Result
              </button>
              <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                View Full Rules
              </button>
            </div>

            {/* Enter Result Form */}
            {showEnterResult && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Submit Your Result</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Push-ups
                    </label>
                    <input
                      type="text"
                      value={userResult}
                      onChange={(e) => setUserResult(e.target.value)}
                      placeholder="e.g., 45 reps"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Link (optional for now)
                    </label>
                    <input
                      type="url"
                      placeholder="YouTube, Vimeo, or direct link"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmitResult}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Submit Result
                    </button>
                    <button
                      onClick={() => setShowEnterResult(false)}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results/Leaderboard */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h3>
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>

              <div className="space-y-3">
                {dummyResults.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800' 
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8">{getRankIcon(user.rank)}</div>
                      <div className="text-2xl">{user.avatar}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {user.name}
                          {user.verified && (
                            <Star className="h-4 w-4 text-green-500" title="Verified" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.submittedAt}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {user.result}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                View All 128 Participants →
              </button>
            </div>

            {/* Stats Box */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
              <h4 className="font-bold text-lg mb-4">Challenge Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="opacity-90">Average Result:</span>
                  <span className="font-bold">31 reps</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Best Result:</span>
                  <span className="font-bold">52 reps</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Total Attempts:</span>
                  <span className="font-bold">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Countries:</span>
                  <span className="font-bold">24</span>
                </div>
              </div>
            </div>

            {/* Previous Winners */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Previous Winners</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Week 2</span>
                  <span className="font-medium">Alex Turner - 185kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Week 1</span>
                  <span className="font-medium">Maria Garcia - 5:23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}