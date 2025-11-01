'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EthiopianPattern from '@/components/EthiopianPattern';
import { getCurrentEthiopianDate, formatEthiopianDate, toEthiopicNumeral } from '@/lib/ethiopian-calendar';

export default function Home() {
  const router = useRouter();
  const currentEthDate = getCurrentEthiopianDate();
  
  return (
    <main className="min-h-screen ethiopian-pattern relative overflow-hidden">
      {/* Background pattern */}
      <EthiopianPattern />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Ethiopian flag border */}
        <div className="ethiopian-border bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Ethiopian flag icon */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-ethiopian-gold shadow-xl animate-pulse-slow">
                  <div className="ethiopian-gradient w-full h-full"></div>
                </div>
                
                <div className="animate-slideInLeft">
                  <h1 className="text-4xl md:text-5xl font-bold text-ethiopian-dark-green">
                    <span className="font-ethiopic">መገናኛ</span> · Megenagna
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg">
                    The Meeting Place - Ethiopian Calendar Scheduler
                  </p>
                </div>
              </div>
              
              <div className="text-right animate-slideInRight">
                <div className="font-ethiopic text-ethiopian-green font-bold text-2xl">
                  {formatEthiopianDate(currentEthDate, true)}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-5xl md:text-6xl font-bold text-ethiopian-green mb-6">
              Your Team's Meeting Place
            </h2>
            <p className="text-2xl text-gray-700 mb-4">
              Schedule meetings using the Ethiopian calendar
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span className="font-ethiopic text-ethiopian-green font-semibold">መገናኛ</span> brings Ethiopian teams together. 
              Coordinate schedules with authentic Ethiopian calendar support and find times that work for everyone.
            </p>
          </div>
          
          {/* Main Action Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <Link href="/create">
              <div className="bg-white rounded-2xl shadow-2xl p-12 ethiopian-border cursor-pointer card-hover group animate-scaleUp">
                <div className="text-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-ethiopian-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-xl">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    Create New Meeting
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed mb-8">
                    Set up a new meeting poll. Choose dates and times, 
                    then share the link with your team to collect their availability.
                  </p>
                  <div className="inline-flex items-center text-ethiopian-green font-bold text-xl group-hover:gap-3 gap-2 transition-all">
                    Get Started
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-10 ethiopian-border max-w-5xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-3xl font-bold text-center mb-10 text-gray-900">
              Features
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Ethiopian Calendar</h4>
                <p className="text-gray-600">
                  Native support for the Ethiopian calendar with Ge'ez numerals and month names
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-yellow rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Team Collaboration</h4>
                <p className="text-gray-600">
                  Everyone marks their availability and see overlapping free times at a glance
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-ethiopian-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl mb-2 text-gray-900">Simple & Fast</h4>
                <p className="text-gray-600">
                  Intuitive drag-and-drop interface makes scheduling quick and effortless
                </p>
              </div>
            </div>
          </div>
          
          {/* How it Works Section */}
          <div className="mt-16 max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-10 text-gray-900">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '፩', title: 'Create', desc: 'Set up your meeting with dates and times' },
                { step: '፪', title: 'Share', desc: 'Send the link to your team members' },
                { step: '፫', title: 'Mark', desc: 'Everyone marks when they\'re available' },
                { step: '፬', title: 'Decide', desc: 'See the best times for everyone' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg text-center card-hover">
                  <div className="w-16 h-16 bg-gradient-to-br from-ethiopian-green to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-ethiopic text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gradient-to-r from-ethiopian-green via-ethiopian-dark-green to-ethiopian-green text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xl mb-2 font-semibold">
              For Great Meetings and Collaboration!
            </p>
            <p className="text-sm opacity-75">
              Made by Alpha prompting Cursor
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
