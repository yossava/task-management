'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors scroll-smooth">
                Home
              </a>
              <a href="#product" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors scroll-smooth">
                Product
              </a>
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors scroll-smooth">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors scroll-smooth">
                Pricing
              </a>
              <a href="#faq" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors scroll-smooth">
                FAQ
              </a>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
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

              {/* Sign In Link */}
              <Link href="/signin" className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign In
              </Link>

              {/* CTA Button */}
              <Link href="/boards" className="hidden sm:block">
                <Button size="sm" className="shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30">
                  Get Started
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width */}
      <div className="w-full">
        <div className="text-center py-24 md:py-40 relative overflow-hidden">
        {/* Enhanced animated background with gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/30 to-blue-600/20 dark:from-blue-600/20 dark:to-blue-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-purple-600/20 dark:from-purple-600/20 dark:to-purple-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/30 to-indigo-600/20 dark:from-indigo-600/20 dark:to-indigo-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge with animation */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span>The modern way to manage projects</span>
          </div>

          {/* Main Headline with stagger animation */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tight">
            <span className="block text-gray-900 dark:text-white animate-fade-in-up">
              Organize work, amplify
            </span>
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              productivity
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {APP_NAME} brings all your tasks, teammates, and tools together.
            Keep everything in one place—even if your team isn't.
          </p>

          {/* CTA Buttons with enhanced animations */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/boards">
              <Button
                size="lg"
                className="text-base sm:text-lg px-8 py-4 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Get started for free
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="text-base sm:text-lg px-8 py-4 hover:-translate-y-0.5 transition-all duration-300 group border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch demo
            </Button>
          </div>

          {/* Social Proof with enhanced styling */}
          <div className="text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="mb-5 font-medium">Trusted by teams at</p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
              {['Acme Corp', 'TechStart', 'DesignHub', 'BuildCo', 'DataFlow'].map((company, idx) => (
                <div
                  key={company}
                  className="px-4 py-2 text-gray-400 dark:text-gray-500 font-semibold tracking-wide hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 opacity-70 hover:opacity-100"
                  style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Product Preview Section with Container */}
      <div id="product" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative group">
          {/* Decorative animated elements */}
          <div className="absolute -top-8 -left-8 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-purple-600/10 dark:from-purple-600/15 dark:to-purple-800/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-600/10 dark:from-blue-600/15 dark:to-blue-800/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />

          <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-3xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 group-hover:scale-[1.01]">
            <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 sm:p-10 md:p-16">
              {/* Browser chrome mockup */}
              <div className="bg-white dark:bg-gray-950 rounded-t-xl border border-gray-200 dark:border-gray-700 p-3 mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 ml-2 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                    podotask.app/boards
                  </div>
                </div>
              </div>

              {/* Product mockup */}
              <div className="aspect-video bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-b-xl shadow-2xl flex items-center justify-center text-white overflow-hidden relative">
                {/* Floating elements animation */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-20 h-16 bg-white/40 rounded-lg animate-float" style={{ animationDelay: '0s', animationDuration: '3s' }} />
                  <div className="absolute top-20 right-16 w-24 h-20 bg-white/30 rounded-lg animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
                  <div className="absolute bottom-16 left-20 w-16 h-14 bg-white/35 rounded-lg animate-float" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
                  <div className="absolute bottom-20 right-10 w-20 h-16 bg-white/40 rounded-lg animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
                </div>

                <div className="relative text-center z-10">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 opacity-90 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-lg sm:text-xl font-semibold opacity-90 mb-2">Interactive Board View</p>
                  <p className="text-xs sm:text-sm opacity-75 px-4">Drag & drop tasks, customize workflows, collaborate in real-time</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Stats Section - Enhanced with animated counters - Full Width */}
      <div className="w-full py-24 px-4 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:via-gray-900/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {[
            { number: 2000000, suffix: '+', label: 'Active users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', gradient: 'from-blue-500 to-blue-600' },
            { number: 50000, suffix: '+', label: 'Organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', gradient: 'from-purple-500 to-purple-600' },
            { number: 99.9, suffix: '%', label: 'Uptime', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', gradient: 'from-indigo-500 to-indigo-600' },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white mb-6 shadow-lg shadow-${stat.gradient.split('-')[1]}-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <AnimatedCounter end={stat.number} suffix={stat.suffix} duration={2500} />
              <div className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section - Enhanced - Full Width with Container */}
      <div id="features" className="w-full py-24 px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to stay productive
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Powerful features designed to help your team collaborate seamlessly and deliver projects faster than ever
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="p-8 sm:p-10 hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 group relative overflow-hidden" hover>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Visual Board Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                Organize projects with intuitive boards. Drag, drop, and customize your workflow exactly how you want it.
              </p>
            </div>
          </Card>

          <Card className="p-8 sm:p-10 hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900 group relative overflow-hidden" hover>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Real-time Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                Work together seamlessly with your team. See updates instantly and stay in sync across all devices.
              </p>
            </div>
          </Card>

          <Card className="p-8 sm:p-10 hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 dark:border-gray-800 hover:border-pink-200 dark:hover:border-pink-900 group relative overflow-hidden" hover>
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                Powerful Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                Track progress with detailed insights. Make data-driven decisions to optimize your team's performance.
              </p>
            </div>
          </Card>
        </div>

        {/* Additional Features Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            { icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', title: 'Comments & Discussions', desc: 'Built-in threaded comments for seamless team communication', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
            { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Custom Templates', desc: 'Pre-built templates to get started quickly and efficiently', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
            { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Advanced Security', desc: 'Enterprise-grade security and compliance features', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Smart Automation', desc: 'Automate repetitive tasks and boost productivity', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-5 p-6 sm:p-7 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 group">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Testimonial Section - Enhanced - Full Width */}
      <div className="w-full py-24 px-4 my-28">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 rounded-3xl px-4 sm:px-8 py-16 border border-blue-100 dark:border-gray-700 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Star rating */}
          <div className="flex justify-center mb-8 gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-10 leading-relaxed px-4">
            <span className="text-blue-600 dark:text-blue-400 text-5xl leading-none">"</span>
            {APP_NAME} transformed how our team works. We're more organized, productive, and actually enjoy our project management process now.
            <span className="text-blue-600 dark:text-blue-400 text-5xl leading-none">"</span>
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg text-gray-900 dark:text-white">Sarah Chen</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Product Manager at TechCorp</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Verified User</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Final CTA Section - Enhanced - Full Width */}
      <div className="w-full py-28 px-4 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Ready to transform your workflow?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of teams already using {APP_NAME} to stay organized and ship faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/boards">
              <Button
                size="lg"
                className="text-base sm:text-lg px-10 py-5 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-1 transition-all duration-300 group"
              >
                Start for free
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="text-base sm:text-lg px-10 py-5 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:-translate-y-1 transition-all duration-300"
            >
              Schedule a demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section - Full Width */}
      <div id="pricing" className="w-full py-24 px-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your team. Always know what you'll pay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Perfect for individuals and small teams getting started</p>
              <ul className="space-y-4 mb-8">
                {['Up to 10 boards', 'Unlimited tasks', 'Basic analytics', 'Mobile apps', '5GB storage'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/boards">
                <Button variant="secondary" className="w-full">Get started</Button>
              </Link>
            </Card>

            {/* Pro Plan - Featured */}
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-blue-500 dark:border-blue-600 relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$12</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">/user/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">For growing teams that need more power</p>
              <ul className="space-y-4 mb-8">
                {['Unlimited boards', 'Unlimited tasks', 'Advanced analytics', 'Priority support', '100GB storage', 'Custom templates', 'Team collaboration'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/boards">
                <Button className="w-full">Start free trial</Button>
              </Link>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">Custom</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">For large organizations with advanced needs</p>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'Unlimited storage', 'Advanced security', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">Contact sales</Button>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section - Full Width */}
      <div id="faq" className="w-full py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently asked questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about {APP_NAME}
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How does the free plan work?',
                a: 'Our free plan gives you access to all core features with a limit of 10 boards. You can upgrade anytime to unlock unlimited boards and advanced features.'
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time. Your account will remain active until the end of your billing period.'
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use bank-level encryption and security measures to protect your data. We\'re also GDPR and SOC 2 compliant.'
              },
              {
                q: 'Do you offer educational discounts?',
                a: 'Yes! We offer special pricing for educational institutions and students. Contact our sales team for more information.'
              },
              {
                q: 'Can I import data from other tools?',
                a: 'Yes, we support importing from popular project management tools like Trello, Asana, and Jira. Our team can help with the migration.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and offer invoice billing for annual Enterprise plans.'
              }
            ].map((faq, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Still have questions?</p>
            <Button variant="secondary">Contact support</Button>
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="w-full bg-gray-900 dark:bg-black text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">PT</span>
                </div>
                <span className="text-xl font-bold text-white">{APP_NAME}</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-sm">
                The modern project management tool that helps teams stay organized and ship faster.
              </p>
              <div className="flex items-center gap-4">
                {['twitter', 'github', 'linkedin', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                    aria-label={social}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Templates', 'Integrations', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {['About us', 'Careers', 'Blog', 'Press', 'Partners', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                {['Documentation', 'Help center', 'API reference', 'Community', 'Status', 'Security'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
