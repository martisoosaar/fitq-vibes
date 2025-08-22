'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Trophy, Users, Calendar, Award, Star, Medal, Target, Clock, ChevronLeft, Send, Maximize2, X, Video, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/dateFormatter';

interface ChallengeResult {
  id: number;
  rank: number;
  user_id: number;
  user_name: string;
  result_value: number;
  formatted_result: string;
  created_at: string;
  verified: boolean;
  video_proof_url?: string;
  notes?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  rules: string | null;
  prizes: string | null;
  image_url: string | null;
  video_url: string | null;
  result_type: 'reps' | 'time';
  scoring_type: 'higher_better' | 'lower_better';
  result_unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_locked: boolean;
  participant_count: number;
  results: ChallengeResult[];
  user_result?: {
    result_value: number;
    formatted_result: string;
    rank: number;
  };
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnterResult, setShowEnterResult] = useState(false);
  const [resultValue, setResultValue] = useState('');
  const [videoProofUrl, setVideoProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoUser, setCurrentVideoUser] = useState<{name: string; result: string} | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (params?.id) {
      fetchChallenge();
    }
  }, [params?.id]);

  const fetchChallenge = async () => {
    try {
      const response = await api.get(`/challenges/${params.id}`);
      const data = response.data;
      
      // Transform the API response to match our interface
      const challengeData: Challenge = {
        ...data.challenge,
        participant_count: data.total_participants || 0,
        results: data.leaderboard?.map((item: any) => ({
          id: item.user.id,
          rank: item.rank,
          user_id: item.user.id,
          user_name: item.user.name,
          result_value: item.numeric_value,
          formatted_result: item.result,
          created_at: item.created_at || item.submitted_at, // Use created_at if available
          verified: item.is_verified,
          video_proof_url: item.video_proof_url,
          notes: item.notes,
        })) || [],
        user_result: data.user_result ? {
          result_value: data.user_result.numeric_value,
          formatted_result: data.user_result.result_value,
          rank: data.user_result.rank || 0,
        } : undefined,
      };
      
      setChallenge(challengeData);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      router.push('/challenges/active');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!resultValue.trim() || !challenge) return;
    
    setIsSubmitting(true);
    try {
      // API expects result_value as string
      const submitValue = challenge.result_type === 'time' 
        ? convertTimeToSeconds(resultValue).toString()
        : resultValue;
      
      // Convert YouTube URL to embed format if provided
      let embedUrl = videoProofUrl;
      if (videoProofUrl && videoProofUrl.includes('youtube.com/watch')) {
        const videoId = videoProofUrl.match(/v=([^&]+)/)?.[1];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (videoProofUrl && videoProofUrl.includes('youtu.be/')) {
        const videoId = videoProofUrl.split('youtu.be/')[1]?.split(/[?#]/)[0];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      await api.post(`/challenges/${challenge.id}/submit`, {
        result_value: submitValue,
        video_proof_url: embedUrl || null,
        notes: notes || null
      });
      
      // Show success toast
      setToastMessage('Result submitted successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      
      setResultValue('');
      setVideoProofUrl('');
      setNotes('');
      setShowEnterResult(false);
      fetchChallenge(); // Refresh to show the new result
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertTimeToSeconds = (timeStr: string): number => {
    // Handle formats like "2:30" or "150"
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseFloat(timeStr);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  const getChallengeStatus = () => {
    if (!challenge) return null;
    
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    
    if (now < start) {
      return { text: 'Upcoming', color: 'bg-blue-500' };
    } else if (now > end || challenge.is_locked) {
      return { text: 'Completed', color: 'bg-gray-500' };
    } else if (challenge.is_active) {
      return { text: getDaysRemaining(challenge.end_date), color: 'bg-green-500' };
    } else {
      return { text: 'Inactive', color: 'bg-red-500' };
    }
  };

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

  const canSubmitResult = () => {
    if (!challenge) return false;
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    return challenge.is_active && !challenge.is_locked && now >= start && now <= end && !challenge.user_result;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-gray-500 dark:text-gray-400">Loading challenge...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const status = getChallengeStatus();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/challenges/active"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Challenges
        </Link>

        {/* Challenge Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <h1 className="text-3xl font-bold">{challenge.title}</h1>
            </div>
            {status && (
              <span className={`${status.color} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                {status.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{challenge.participant_count} participants</span>
            </div>
          </div>
        </div>

        {/* User's Result */}
        {challenge.user_result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your Result
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {challenge.user_result.formatted_result}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  #{challenge.user_result.rank}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Rank
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Challenge Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Box */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Video or Promotional Image */}
              {challenge.video_url ? (
                <div className="relative aspect-video bg-black group cursor-pointer" onClick={() => {
                  setCurrentVideoUrl(challenge.video_url!);
                  setCurrentVideoUser(null); // No user for challenge's own video
                  setShowVideoModal(true);
                }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={challenge.video_url}
                    title={`${challenge.title} Tutorial`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full pointer-events-none"
                  ></iframe>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-4 transition-all">
                      <Maximize2 className="h-8 w-8 text-white group-hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-64 bg-gradient-to-br from-purple-500 to-blue-600">
                  {challenge.image_url ? (
                    <img
                      src={challenge.image_url}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white z-10 relative">
                        <Target className="h-16 w-16 mx-auto mb-4 opacity-80" />
                        <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
                        <p className="text-lg opacity-90">
                          {challenge.result_type === 'reps' ? 'Repetition Challenge' : 'Time Challenge'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Challenge Description */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Challenge Description</h3>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{challenge.description}</p>
                  
                  {challenge.rules && (
                    <>
                      <h4 className="font-semibold mt-6 mb-3">Rules:</h4>
                      <div className="whitespace-pre-wrap">{challenge.rules}</div>
                    </>
                  )}

                  {challenge.prizes && (
                    <>
                      <h4 className="font-semibold mt-6 mb-3">Prizes:</h4>
                      <div className="whitespace-pre-wrap">{challenge.prizes}</div>
                    </>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2">Scoring Information:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Result Type: <strong>{challenge.result_type === 'reps' ? 'Repetitions' : 'Time'}</strong></li>
                      <li>• Unit: <strong>{challenge.result_unit}</strong></li>
                      <li>• Scoring: <strong>{challenge.scoring_type === 'higher_better' ? 'Higher is better' : 'Lower is better'}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canSubmitResult() && (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowEnterResult(!showEnterResult)}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="h-5 w-5" />
                  Enter Your Result
                </button>
              </div>
            )}

            {/* Enter Result Form */}
            {showEnterResult && canSubmitResult() && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Submit Your Result</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {challenge.result_type === 'reps' ? `Number of ${challenge.result_unit}` : `Time (in ${challenge.result_unit})`}
                    </label>
                    <input
                      type="text"
                      value={resultValue}
                      onChange={(e) => setResultValue(e.target.value)}
                      placeholder={challenge.result_type === 'reps' ? 'e.g., 45' : 'e.g., 2:30 or 150'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                    {challenge.result_type === 'time' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter time as MM:SS (e.g., 2:30) or total seconds (e.g., 150)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Video Proof URL (optional)
                    </label>
                    <input
                      type="url"
                      value={videoProofUrl}
                      onChange={(e) => setVideoProofUrl(e.target.value)}
                      placeholder="YouTube, Vimeo, or direct link"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Share a video of your attempt (YouTube links will be converted automatically)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Share your experience, tips, or thoughts about this challenge..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmitResult}
                      disabled={isSubmitting || !resultValue.trim()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit Result'}
                    </button>
                    <button
                      onClick={() => {
                        setShowEnterResult(false);
                        setResultValue('');
                        setVideoProofUrl('');
                        setNotes('');
                      }}
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

              {challenge.results.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No results yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Be the first to submit!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {challenge.results.slice(0, 10).map((result) => (
                    <div
                      key={result.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        result.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8">{getRankIcon(result.rank)}</div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {result.user_name}
                            {result.verified && (
                              <Star className="h-4 w-4 text-green-500" title="Verified" />
                            )}
                            {result.video_proof_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentVideoUrl(result.video_proof_url!);
                                  setCurrentVideoUser({
                                    name: result.user_name,
                                    result: result.formatted_result
                                  });
                                  setShowVideoModal(true);
                                }}
                                className="hover:text-blue-500"
                                title="View video proof"
                              >
                                <Video className="h-4 w-4" />
                              </button>
                            )}
                            {result.notes && (
                              <MessageSquare className="h-4 w-4 text-gray-400" title={result.notes} />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(result.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {result.formatted_result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {challenge.results.length > 10 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing top 10 of {challenge.results.length} results
                  </span>
                </div>
              )}
            </div>

            {/* Stats Box */}
            {challenge.results.length > 0 && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                <h4 className="font-bold text-lg mb-4">Challenge Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="opacity-90">Best Result:</span>
                    <span className="font-bold">{challenge.results[0]?.formatted_result}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Attempts:</span>
                    <span className="font-bold">{challenge.participant_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Status:</span>
                    <span className="font-bold">{status?.text}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Comments Section */}
        {challenge && challenge.results.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Participant Comments
            </h3>
            <div className="space-y-4">
              {challenge.results
                .filter(result => result.notes)
                .map((result) => (
                  <div key={result.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {result.user_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {formatDate(result.created_at)}
                      </span>
                      {result.rank <= 3 && getRankIcon(result.rank)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {result.notes}
                    </p>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Result: {result.formatted_result}
                    </div>
                  </div>
                ))}
              {challenge.results.filter(r => r.notes).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No comments yet. Be the first to share your experience!
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 hover:text-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {showVideoModal && currentVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90">
          <button
            onClick={() => {
              setShowVideoModal(false);
              setCurrentVideoUrl('');
              setCurrentVideoUser(null);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="w-full max-w-6xl">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={currentVideoUrl}
                title="Challenge Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">
                {challenge?.title}
                {currentVideoUser && (
                  <span className="text-lg ml-2">
                    • {currentVideoUser.name} - {currentVideoUser.result}
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setCurrentVideoUrl('');
                  setCurrentVideoUser(null);
                }}
                className="mt-2 px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}