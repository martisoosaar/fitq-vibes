'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Activity, TrendingUp, Award, Dumbbell, ChevronRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [platformStats, setPlatformStats] = useState({
    total_kg_lifted: 0,
    total_exercises: 0,
    total_users: 0,
    total_workouts: 0
  });

  useEffect(() => {
    // Fetch real platform statistics
    fetch('http://localhost:8001/api/v2/public/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlatformStats(data.data);
        }
      })
      .catch(err => console.log('Failed to load stats'));
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8001/api/v2/auth/magic-link/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Check your email for the login link!');
        
        // In development, show the link for testing
        if (data.debug_link) {
          console.log('Magic link:', data.debug_link);
          // Auto-redirect in development for testing
          setTimeout(() => {
            window.location.href = data.debug_link;
          }, 2000);
        }
      } else {
        setError(data.message || 'Failed to send login link');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // Convert kg to tons and format
  const formatTons = (kg: number) => {
    const tons = kg / 1000;
    if (tons >= 1000000) return `${(tons / 1000000).toFixed(3)}M`;
    if (tons >= 1000) return `${Math.round(tons).toLocaleString()}`;
    return Math.round(tons).toLocaleString();
  };

  const stats = [
    { number: formatTons(platformStats.total_kg_lifted), label: "tons lifted" },
    { number: formatNumber(platformStats.total_workouts), label: "workouts logged" },
    { number: formatNumber(platformStats.total_users), label: "active users" }
  ];

  const features = [
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: "300+ Exercises",
      description: "Comprehensive database"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Visualize your gains"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Workout Plans",
      description: "Personalized programs"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Personal Records",
      description: "Track achievements"
    }
  ];

  if (showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="bg-gray-100 rounded-lg inline-block p-3 mb-4">
                <img
                  src="/assets/gymwolf-logo.png"
                  alt="Gymwolf"
                  className="h-10 w-auto"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Gymwolf</h2>
              <p className="text-gray-600 mt-2">Enter your email to get started</p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleMagicLink} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Login Link
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/assets/Gymwolf_video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="bg-white/90 backdrop-blur rounded-lg p-2">
            <img
              src="/assets/gymwolf-logo.png"
              alt="Gymwolf"
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={() => setShowLoginForm(true)}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition"
          >
            Log in
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              A better way to track your workouts
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium">
              And yes, it's free.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowLoginForm(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition inline-flex items-center mb-12"
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>

            {/* Features Grid - Mobile Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-white mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-white/80 mt-1">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-6 md:space-x-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold">{stat.number}</p>
                  <p className="text-xs md:text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}