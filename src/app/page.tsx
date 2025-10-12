'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Custom cursor follower effect */}
      <div
        className="fixed pointer-events-none z-[100] w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] transition-all duration-[3000ms] ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      {/* Floating nav */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-6 py-3 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PT</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  ENTERPRISE SUITE
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
              <Link href="/signup">
                <Button className="text-sm px-6 py-2.5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero - Asymmetric split design */}
      <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Custom grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(to right, rgb(59, 130, 246) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(59, 130, 246) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-8">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Live & Production Ready</span>
              </div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-[0.95]">
                <span className="block text-gray-900 dark:text-white mb-2">Ship Faster.</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Deliver Better.</span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-xl">
                Next-generation project management for teams who refuse to compromise.
                <span className="block mt-3 font-semibold text-gray-900 dark:text-white">Kanban boards meet enterprise agile.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-10 py-6 shadow-2xl shadow-blue-500/30 group">
                    Start Building
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <a href="https://www.paypal.com/donate" target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" className="text-lg px-10 py-6 border-2 group">
                    Support Us
                    <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-8">
                {[
                  { label: 'Zero Cost', value: '100%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Uptime', value: '99.9%', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { label: 'Response', value: '<100ms', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                      </svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive bento grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <Card className="col-span-2 p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative">
                  <svg className="w-12 h-12 mb-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">Task Boards</h3>
                  <p className="text-blue-100">Drag-and-drop Kanban with unlimited customization</p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Time Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Built-in timer & analytics</p>
              </Card>

              <Card className="p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Sprint Planning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full agile scrum suite</p>
              </Card>

              <Card className="col-span-2 p-6 bg-gray-900 dark:bg-gray-800 text-white border-0 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold mb-1">256-bit</div>
                    <div className="text-gray-400">AES Encryption</div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
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
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Two Engines. One Platform.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Switch seamlessly between personal productivity and enterprise agile management
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Board - Detailed */}
            <div className="group">
              <Card className="p-12 h-full border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
                      FOR EVERYONE
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Personal Boards</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Your personal command center for tasks, projects, and goals</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
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
              <Card className="p-12 h-full border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
                      FOR TEAMS
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Agile Scrum</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Enterprise-grade sprint management and team coordination</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
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

      {/* Technology Stack - Unique marquee style */}
      <div id="technology" className="py-32 px-6 bg-gray-900 dark:bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold mb-6 border border-blue-500/30">
              TECH STACK
            </div>
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              Built on Modern Infrastructure
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade architecture for performance, security, and scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Lightning',
                subtitle: 'Fast',
                desc: 'Blazing performance that never slows you down',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Real-Time',
                subtitle: 'Updates',
                desc: 'Changes sync instantly across all your devices',
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Encrypted',
                subtitle: 'Security',
                desc: 'Your data is protected with enterprise-grade encryption',
                color: 'from-green-500 to-emerald-500'
              },
              {
                title: 'Always',
                subtitle: 'Available',
                desc: 'Reliable infrastructure that works when you do',
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

          {/* Additional capabilities in a unique layout */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Instant Response', desc: 'No loading spinners. No waiting. Just work.' },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'Private & Secure', desc: 'Your projects stay yours. Period.' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Auto-Save Everything', desc: 'Never lose work. Changes save as you type.' }
            ].map((cap, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
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

      {/* Showcase - Full bleed with parallax */}
      <div id="showcase" className="py-32 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6">
              PRODUCT SHOWCASE
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              See It In Action
            </h2>
          </div>

          <div className="space-y-32">
            {[
              {
                title: 'Kanban Boards',
                desc: 'Drag, drop, organize. Your workflow, your way.',
                gradient: 'from-blue-500 via-indigo-500 to-purple-500',
                align: 'left'
              },
              {
                title: 'Sprint Dashboard',
                desc: 'Real-time velocity, burndown, and team insights.',
                gradient: 'from-purple-500 via-pink-500 to-rose-500',
                align: 'right'
              },
              {
                title: 'Task Deep Dive',
                desc: 'Everything about a task in one beautiful view.',
                gradient: 'from-green-500 via-emerald-500 to-cyan-500',
                align: 'left'
              }
            ].map((showcase, i) => (
              <div key={i} className={`flex ${showcase.align === 'right' ? 'flex-row-reverse' : ''} items-center gap-16`}>
                <div className="flex-1">
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{showcase.title}</h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{showcase.desc}</p>
                  <Link href="/signup">
                    <Button className="group">
                      Try It Now
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="relative group">
                    <div className={`absolute -inset-4 bg-gradient-to-r ${showcase.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                    <div className={`relative aspect-video rounded-2xl bg-gradient-to-br ${showcase.gradient} flex items-center justify-center text-white shadow-2xl`}>
                      <svg className="w-32 h-32 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials - Cards grid */}
      <div id="testimonials" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-semibold mb-6">
              WALL OF LOVE
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Loved by Teams Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Switched our entire team from Jira. Never looking back. The speed difference alone is worth it.",
                author: "Alex Chen",
                role: "Engineering Lead",
                company: "TechCorp",
                avatar: "from-blue-400 to-blue-600"
              },
              {
                quote: "Finally, a PM tool that doesn't feel like homework. My productivity has genuinely doubled.",
                author: "Sarah Johnson",
                role: "Product Manager",
                company: "StartupXYZ",
                avatar: "from-purple-400 to-pink-600"
              },
              {
                quote: "The scrum features are ridiculously good. Sprint planning takes us 30 minutes instead of 2 hours.",
                author: "Mike Rodriguez",
                role: "Scrum Master",
                company: "AgileTeam",
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
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} at {testimonial.company}</div>
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

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
            Ready to Ship Faster?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 leading-relaxed">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">PT</span>
              </div>
              <div>
                <div className="font-bold text-white">{APP_NAME}</div>
                <div className="text-xs text-gray-500">Enterprise Project Management</div>
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
