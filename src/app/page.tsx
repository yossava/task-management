'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

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

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
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
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#capabilities" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Capabilities
              </a>
              <a href="#screenshots" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Screenshots
              </a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Reviews
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
              <Link href="/signup" className="hidden sm:block">
                <Button size="sm" className="shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
        <div className="text-center py-24 md:py-32 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/15 to-blue-600/10 dark:from-blue-600/10 dark:to-blue-800/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/4 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/15 to-indigo-600/10 dark:from-indigo-600/10 dark:to-indigo-800/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-purple-400/10 to-transparent dark:from-purple-600/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-semibold mb-8 shadow-lg shadow-blue-500/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-blue-700 dark:text-blue-300">Enterprise-Grade Project Management Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tight">
              <span className="block text-gray-900 dark:text-white">
                Project Management
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Powerful task boards and agile sprint management designed for modern teams.
              <span className="block mt-2 font-medium text-gray-900 dark:text-white">Built for scale. Free to start.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-lg px-12 py-6 shadow-2xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 group text-white"
                >
                  Start Free Today
                  <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <a
                href="https://www.paypal.com/donate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-12 py-6 hover:-translate-y-1 transition-all duration-300 group border-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                  Support Development
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                <span className="font-medium">Cloud-Based</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="font-medium">Team Collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full py-20 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '99.9%', label: 'Uptime SLA', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { value: '24/7', label: 'Support Available', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
              { value: '< 100ms', label: 'Response Time', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { value: '256-bit', label: 'AES Encryption', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Main Product Offerings */}
      <div id="features" className="w-full py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Two Powerful Solutions
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From personal productivity to enterprise agile management
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Boards */}
            <Card className="p-10 hover:shadow-2xl transition-all duration-500 border-2 border-blue-200 dark:border-blue-900 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Boards</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">For Individuals & Small Teams</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Intuitive Kanban-style task management with powerful features. Perfect for freelancers, students, and small teams managing personal projects and daily workflows.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    'Unlimited boards, lists & tasks',
                    'Advanced subtask management',
                    'Built-in time tracking & analytics',
                    'Recurring tasks & reminders',
                    'Custom tags & priority levels',
                    'File attachments & comments',
                    'Dark mode & customization',
                    'Offline mode support'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Scrum for PMs */}
            <Card className="p-10 hover:shadow-2xl transition-all duration-500 border-2 border-indigo-200 dark:border-indigo-900 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Agile Scrum</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold">For Project Managers & Teams</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  Complete agile project management suite with advanced scrum methodologies. Built for scaling teams, product managers, and agile practitioners.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    'Sprint planning & management',
                    'Product backlog & grooming',
                    'Story points & velocity tracking',
                    'Burndown & burnup charts',
                    'Daily standup tracking',
                    'Sprint retrospectives',
                    'Epic & story management',
                    'Team capacity planning'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Capabilities Section - Technical Features */}
      <div id="capabilities" className="w-full py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Enterprise-Ready Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built with modern technologies for performance, security, and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                title: 'Lightning Fast',
                description: 'Sub-100ms response times with optimized caching and CDN delivery worldwide'
              },
              {
                icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                title: 'Bank-Level Security',
                description: '256-bit AES encryption, SOC 2 compliance, and regular security audits'
              },
              {
                icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
                title: 'Real-Time Sync',
                description: 'Instant updates across all devices with WebSocket connections'
              },
              {
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                title: 'Advanced Analytics',
                description: 'Comprehensive dashboards with productivity insights and team metrics'
              },
              {
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                title: 'Smart Scheduling',
                description: 'AI-powered task scheduling and deadline optimization'
              },
              {
                icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
                title: 'Mobile Optimized',
                description: 'Native-like experience on iOS and Android with PWA support'
              },
              {
                icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
                title: 'Team Collaboration',
                description: 'Comments, mentions, file sharing, and real-time notifications'
              },
              {
                icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
                title: 'API & Integrations',
                description: 'RESTful API and webhooks for custom integrations and automation'
              },
              {
                icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
                title: 'Cloud Infrastructure',
                description: 'Hosted on enterprise-grade cloud with auto-scaling and 99.9% uptime'
              }
            ].map((capability, i) => (
              <Card key={i} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={capability.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{capability.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{capability.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshots Section */}
      <div id="screenshots" className="w-full py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              See {APP_NAME} in Action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Beautifully designed interfaces that make project management effortless
            </p>
          </div>

          <div className="space-y-20">
            {/* Screenshot 1 - Boards */}
            <div className="group">
              <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-500 hover:shadow-2xl">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12">
                  {/* Browser chrome */}
                  <div className="bg-white dark:bg-gray-950 rounded-t-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                        <div className="w-3.5 h-3.5 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer" />
                      </div>
                      <div className="flex-1 ml-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        https://podotask.app/boards
                      </div>
                    </div>
                  </div>
                  {/* Screenshot placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-b-2xl flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative text-center px-8">
                      <svg className="w-32 h-32 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      <h3 className="text-3xl font-bold mb-3">Kanban Board View</h3>
                      <p className="text-lg opacity-90 max-w-2xl mx-auto">Visual workflow management with drag-and-drop simplicity. Customize columns, set limits, and track progress in real-time.</p>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Intuitive Visual Management</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Organize your work with powerful drag-and-drop boards that adapt to your workflow</p>
              </div>
            </div>

            {/* Screenshot 2 - Task Detail */}
            <div className="group">
              <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-500 hover:shadow-2xl">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12">
                  <div className="bg-white dark:bg-gray-950 rounded-t-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 ml-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        https://podotask.app/boards/task/detail
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-b-2xl flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative text-center px-8">
                      <svg className="w-32 h-32 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-3xl font-bold mb-3">Comprehensive Task Details</h3>
                      <p className="text-lg opacity-90 max-w-2xl mx-auto">Rich task editor with subtasks, time tracking, comments, file attachments, and activity history all in one place.</p>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Everything You Need</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Manage every aspect of your tasks with powerful details and collaboration features</p>
              </div>
            </div>

            {/* Screenshot 3 - Scrum Board */}
            <div className="group">
              <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-500 hover:shadow-2xl">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12">
                  <div className="bg-white dark:bg-gray-950 rounded-t-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
                        <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 ml-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        https://podotask.app/scrum/sprint
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-b-2xl flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative text-center px-8">
                      <svg className="w-32 h-32 mx-auto mb-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-3xl font-bold mb-3">Agile Sprint Management</h3>
                      <p className="text-lg opacity-90 max-w-2xl mx-auto">Professional scrum board with story points, velocity tracking, burndown charts, and complete sprint lifecycle management.</p>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Enterprise Agile Management</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Complete scrum toolkit for scaling teams and complex projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="w-full py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of users managing their projects with {APP_NAME}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Alex Thompson',
                role: 'Senior Software Engineer',
                company: 'Tech Startup',
                text: 'The most intuitive project management tool I\'ve used. Clean interface, powerful features, and it just works. Perfect for managing my development sprints.',
                rating: 5,
                avatar: 'from-blue-400 to-blue-600'
              },
              {
                name: 'Maria Garcia',
                role: 'Product Manager',
                company: 'SaaS Company',
                text: 'Scrum features are incredibly robust. Sprint planning, velocity tracking, and burndown charts have transformed how our team delivers. Highly recommended!',
                rating: 5,
                avatar: 'from-purple-400 to-pink-600'
              },
              {
                name: 'James Chen',
                role: 'Freelance Designer',
                company: 'Independent',
                text: 'Love the simplicity and clean design. Perfect for organizing my client projects and creative workflows. Time tracking feature is a game-changer.',
                rating: 5,
                avatar: 'from-green-400 to-emerald-600'
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-800">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatar} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full py-32 px-4 text-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-8 leading-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join professionals worldwide who trust {APP_NAME} for their project management.
            <span className="block mt-2 font-semibold">Start free. No credit card required.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-xl px-16 py-7 bg-white hover:bg-gray-50 text-blue-600 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 group font-bold"
              >
                Get Started Free
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-blue-100 text-sm">
            ✓ Full access to all features  ✓ No time limit  ✓ Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 dark:bg-black text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">PT</span>
                </div>
                <span className="text-2xl font-bold text-white">{APP_NAME}</span>
              </Link>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Enterprise-grade project management platform designed for modern teams.
                Combining powerful Kanban boards with advanced agile scrum methodologies.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#capabilities" className="text-gray-400 hover:text-white transition-colors">Capabilities</a></li>
                <li><a href="#screenshots" className="text-gray-400 hover:text-white transition-colors">Screenshots</a></li>
                <li><a href="/scrum/wiki" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="mailto:support@podotask.com" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">❤️ Donate</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              Designed & Developed by <span className="text-gray-400 font-medium">Yoss</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
