'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Floating nav */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-6 py-3 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img src="/podo-logo.png" alt="PodoTask Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  GET THINGS DONE
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1">
              {['Features', 'Technology', 'Showcase', 'Testimonials'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link href="/signin" className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                Sign In
              </Link>
              <Link href="/boards" className="hidden sm:block">
                <Button className="text-sm px-6 py-2.5">
                  My Boards
                </Button>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 mx-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-2 space-y-1">
              {['Features', 'Technology', 'Showcase', 'Testimonials'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {item}
                </a>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <Link
                href="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all md:hidden"
              >
                Sign In
              </Link>
              <Link
                href="/boards"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all sm:hidden"
              >
                My Boards
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero - Asymmetric split design */}
      <div className="min-h-screen pt-28 sm:pt-28 lg:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Custom grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <h1 className="text-[2.75rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1] xl:text-7xl 2xl:text-8xl font-black mb-5 sm:mb-6 lg:mb-8">
                <span className="block text-gray-900 dark:text-white mb-1.5 sm:mb-2">Get Organized.</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Stay Focused.</span>
              </h1>

              <p className="text-[0.95rem] leading-relaxed sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 mb-5 sm:mb-6 lg:mb-12 max-w-xl">
                Powerful project management for solo creators and agile teams alike.
                <span className="block mt-2 sm:mt-3 font-semibold text-gray-900 dark:text-white">Personal boards. Team sprints. One platform.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 group">
                    Start Building
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 border-2 group">
                    Support Us
                    <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </a>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:gap-8">
                {[
                  { label: 'Unlimited', value: 'Everything', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
                  { label: 'Active Users', value: '1,000+', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { label: 'Free Forever', value: '100%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive bento grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {/* Hero feature card */}
              <Card className="col-span-2 p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white border-0 relative overflow-hidden group hover:scale-[1.02] transition-all">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48 group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl translate-y-32 -translate-x-32" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black mb-3">Unified Workspace</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">Everything you need to manage projects—boards, tasks, sprints, and team collaboration in one beautiful interface.</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                    <span>Explore Features</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* Time tracking card */}
              <Card className="p-8 hover:shadow-2xl transition-all hover:-translate-y-2 group border-2 border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Time Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Track every minute with built-in timers and detailed analytics</p>
              </Card>

              {/* Sprint planning card */}
              <Card className="p-8 hover:shadow-2xl transition-all hover:-translate-y-2 group border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Agile Sprints</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Complete scrum suite with velocity tracking and burndown charts</p>
              </Card>

              {/* Security badge */}
              <Card className="col-span-2 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-white border-0 hover:shadow-2xl transition-all relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">256-bit</span>
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Encryption</span>
                    </div>
                    <div className="text-gray-400 font-medium">Bank-grade security for your data</div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center border border-gray-600">
                      <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features - Split screen diagonal design */}
      <div id="features" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
              DUAL POWER MODE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Two Engines. One Platform.
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Switch seamlessly between personal productivity and enterprise agile management
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Board - Detailed */}
            <div className="group">
              <Card className="p-6 sm:p-8 lg:p-12 h-full border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="flex items-start gap-4 mb-6 sm:mb-8">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 sm:mb-4">
                      FOR EVERYONE
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">Personal Boards</h3>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Your personal command center for tasks, projects, and goals</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Unlimited Everything', desc: 'Boards, lists, tasks, and subtasks without limits', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
                    { title: 'Smart Organization', desc: 'Tags, priorities, due dates, and custom workflows', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                    { title: 'Time Mastery', desc: 'Built-in tracking, estimates, and productivity analytics', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { title: 'Rich Collaboration', desc: 'Comments, attachments, mentions, and activity feeds', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Scrum - Detailed */}
            <div className="group">
              <Card className="p-6 sm:p-8 lg:p-12 h-full border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="flex items-start gap-4 mb-6 sm:mb-8">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 sm:mb-4">
                      FOR TEAMS
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3">Agile Scrum</h3>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Enterprise-grade sprint management and team coordination</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Sprint Command Center', desc: 'Planning, execution, review, and retrospectives in one place', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                    { title: 'Velocity Intelligence', desc: 'Story points, burndown charts, and predictive analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                    { title: 'Backlog Grooming', desc: 'Prioritize epics, stories, and tasks with team voting', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                    { title: 'Team Insights', desc: 'Capacity planning, workload distribution, and bottleneck detection', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us - Feature Benefits */}
      <div id="technology" className="py-32 px-6 bg-gray-900 dark:bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20 px-4">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold mb-6 border border-blue-500/30">
              WHY CHOOSE US
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for individuals and teams who want to get more done
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Drag & Drop',
                subtitle: 'Boards',
                desc: 'Intuitive kanban boards that feel natural to use',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Real-Time',
                subtitle: 'Collaboration',
                desc: 'Work together seamlessly with live updates',
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Time',
                subtitle: 'Tracking',
                desc: 'Built-in timers and productivity analytics',
                color: 'from-green-500 to-emerald-500'
              },
              {
                title: 'Full',
                subtitle: 'Scrum Suite',
                desc: 'Complete agile tools for sprint management',
                color: 'from-orange-500 to-red-500'
              }
            ].map((tech, i) => (
              <div key={i} className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 transition-all hover:scale-105 hover:border-gray-600">
                  <div className={`text-4xl font-black mb-2 bg-gradient-to-r ${tech.color} bg-clip-text text-transparent`}>
                    {tech.title}
                  </div>
                  <div className="text-lg font-bold text-white mb-3">{tech.subtitle}</div>
                  <div className="text-sm text-gray-400">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Benefits */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4', title: 'Unlimited Everything', desc: 'No limits on boards, tasks, or team members. Ever.' },
              { icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', title: 'Smart Organization', desc: 'Tags, priorities, filters, and custom workflows.' },
              { icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', title: 'Rich Collaboration', desc: 'Comments, mentions, attachments, and activity feeds.' }
            ].map((cap, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-all group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cap.icon} />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-1">{cap.title}</div>
                  <div className="text-sm text-gray-400">{cap.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Showcase - Real Product Screenshots */}
      <div id="showcase" className="py-32 px-6 bg-white dark:bg-gray-950 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:from-transparent dark:via-blue-950/10 dark:to-transparent" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20 px-4">
            <div className="inline-block px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6">
              PRODUCT SHOWCASE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              See the Difference
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real screenshots from a production application. No mockups, no prototypes—just a fully functional enterprise platform.
            </p>
          </div>

          <div className="space-y-24">
            {/* Boards - Personal Kanban */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
                  PERSONAL PRODUCTIVITY
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Boards That Work Like You Think
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Create unlimited boards for any project. Drag-and-drop simplicity meets enterprise power—tasks, subtasks, priorities, time tracking, and rich collaboration tools all in one place.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited boards, lists, and tasks',
                    'Real-time sync across all devices',
                    'Rich task details with subtasks & comments',
                    'Time estimates and progress tracking'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Get Started Free
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/boards</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-boards.png"
                    alt="Personal Boards - Kanban task management"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Template Gallery */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/boards</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-template-gallery.png"
                    alt="Pre-built templates for instant productivity"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold mb-4">
                  QUICK START
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Start in Seconds with Templates
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Don't start from scratch. Choose from expertly designed templates for marketing campaigns, product launches, development sprints, and more.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Pre-configured workflows for common use cases',
                    'Customizable to fit your exact needs',
                    'Industry best practices built-in',
                    'One-click setup, immediate productivity'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group border-2">
                    Explore Templates
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Scrum Overview */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
                  ENTERPRISE AGILE
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Command Center for Agile Teams
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Get complete visibility into your sprints, epics, and team performance. Real-time dashboards that show velocity trends, burndown charts, and capacity planning at a glance.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Sprint health and velocity tracking',
                    'Epic progress with story breakdown',
                    'Team capacity and workload distribution',
                    'Predictive completion analytics'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Start Sprint Planning
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/scrum</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-scrum-overview.png"
                    alt="Scrum dashboard with sprint metrics and analytics"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Scrum Backlog */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/scrum/backlog</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-scrum-backlog.png"
                    alt="Product backlog with story prioritization"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold mb-4">
                  BACKLOG MANAGEMENT
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Prioritize What Matters Most
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Organize user stories, epics, and tasks with drag-and-drop prioritization. Story points, acceptance criteria, and team assignments—all the context your team needs to execute.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Visual epic and story hierarchy',
                    'Story point estimation and voting',
                    'Acceptance criteria checklists',
                    'Sprint assignment and planning'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group border-2">
                    Build Your Backlog
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Scrum Board */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-4">
                  SPRINT EXECUTION
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Watch Your Sprint Come to Life
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Visualize sprint progress with a dedicated scrum board. Move stories through workflow states, track blockers, and keep your entire team aligned on what's in flight.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Real-time story movement tracking',
                    'Visual workflow state management',
                    'Blocker identification and resolution',
                    'Sprint commitment vs. actual progress'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Start Your Sprint
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/scrum/board</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-scrum-board.png"
                    alt="Sprint board with story workflow visualization"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Sprint Planning */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/scrum/planning</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-scrum-planning.png"
                    alt="Sprint planning with capacity management"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold mb-4">
                  PLANNING & FORECASTING
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Plan Sprints with Confidence
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Build realistic sprint plans based on team capacity and historical velocity. See future projections, manage multiple sprints, and make data-driven commitments.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Capacity-based sprint planning',
                    'Historical velocity analysis',
                    'Multi-sprint roadmap view',
                    'Team workload balancing'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="group border-2">
                    Plan Your Next Sprint
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Calendar View */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-xs font-bold mb-4">
                  TIME VISUALIZATION
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  See Your Timeline at a Glance
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Visualize all your tasks and deadlines in a beautiful calendar view. Drag and drop to reschedule, see monthly patterns, and never miss a deadline.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Monthly, weekly, and daily calendar views',
                    'Drag-and-drop task rescheduling',
                    'Color-coded priorities and projects',
                    'Due date notifications and reminders'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button size="lg" className="group">
                    Try Calendar View
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Safari-style browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-center mx-4">
                      <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-md w-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">podotask.com/boards/calendar</span>
                      </div>
                    </div>
                  </div>
                  <img
                    src="/showcase-boards-calendar.png"
                    alt="Calendar view with task scheduling and deadlines"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA after showcase */}
          <div className="mt-32 text-center">
            <div className="inline-block p-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              <div className="bg-white dark:bg-gray-950 rounded-[20px] px-12 py-16">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
                  Ready to Get More Done?
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                  Join teams who've switched from Jira, Asana, and Monday.com to get more done with less complexity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-10 py-6 group">
                      Start Building Free
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="secondary" className="text-lg px-10 py-6 border-2">
                      Sign In
                    </Button>
                  </Link>
                </div>
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  ✓ No credit card  ✓ Full features  ✓ Unlimited everything
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials - Cards grid */}
      <div id="testimonials" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 px-4">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold mb-6">
              WALL OF LOVE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Loved by Teams Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I was using Trello and Notion together before this. Now I just use this for everything. So much simpler.",
                author: "Jessica Martinez",
                role: "Freelance Designer",
                company: "Self-employed",
                avatar: "from-blue-400 to-blue-600"
              },
              {
                quote: "Best free project tool I've found. The boards are perfect for tracking my side projects and client work.",
                author: "David Park",
                role: "Web Developer",
                company: "Freelancer",
                avatar: "from-purple-400 to-pink-600"
              },
              {
                quote: "My small team switched from Monday.com to save money. Honestly surprised how good the free version is.",
                author: "Emma Thompson",
                role: "Marketing Manager",
                company: "Small Business",
                avatar: "from-green-400 to-emerald-600"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-8 hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-800">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.avatar} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA - Bold and direct */}
      <div className="py-32 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="max-w-4xl mx-auto text-center relative px-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-tight">
            Ready to Ship Faster?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-10 sm:mb-12 leading-relaxed">
            Join thousands of teams building better products with {APP_NAME}.
            <span className="block mt-2 font-bold text-white">Start free. Scale forever.</span>
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-xl px-16 py-8 bg-white hover:bg-gray-50 text-blue-600 shadow-2xl hover:scale-105 transition-all font-black">
              Start Building Now →
            </Button>
          </Link>
          <p className="mt-8 text-blue-100 text-sm font-medium">
            ✓ No credit card required  ✓ Full feature access  ✓ Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer - Minimal and clean */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <img src="/podo-logo.png" alt="PodoTask Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-white">{APP_NAME}</div>
                <div className="text-xs text-gray-500">Get Things Done</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#technology" className="hover:text-white transition-colors">Technology</a>
              <a href="/scrum/wiki" className="hover:text-white transition-colors">Docs</a>
              <a href="mailto:support@podotask.com" className="hover:text-white transition-colors">Contact</a>
              <a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Donate ❤️
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm space-y-2">
            <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="text-xs text-gray-600">
              Designed & Developed by <span className="text-gray-400 font-medium">Yoss</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
