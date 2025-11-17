'use client';

import { useEffect, useState } from 'react';
import { getCurrentEthiopianDate, formatEthiopianDate } from '@/lib/ethiopian-calendar';

export default function MobileBlock() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentEthDate = getCurrentEthiopianDate();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Check if screen width is less than 768px (tablet breakpoint)
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted || !isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-ethiopian-green via-ethiopian-dark-green to-ethiopian-green z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center ethiopian-border">
        {/* Ethiopian Flag Icon */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-ethiopian-gold shadow-xl mx-auto mb-6 animate-pulse-slow">
          <div className="ethiopian-gradient w-full h-full"></div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-ethiopian-dark-green mb-4">
          <span className="font-ethiopic">መገናኛ</span> · Megenagna
        </h1>

        {/* Date */}
        <div className="mb-6">
          <div className="font-ethiopic text-ethiopian-green font-bold text-xl mb-1">
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

        {/* Message */}
        <div className="space-y-4 mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Please Use a Larger Device
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            For the best experience, please access <span className="font-ethiopic text-ethiopian-green font-semibold">መገናኛ</span> on a tablet or desktop computer.
          </p>
          <div className="bg-ethiopian-yellow/20 border-2 border-ethiopian-yellow rounded-xl p-4 mt-6">
            <p className="text-gray-800 font-semibold">
              📅 Mobile Support Coming Soon!
            </p>
            <p className="text-sm text-gray-700 mt-2">
              We're working hard to bring you the full mobile experience. Stay tuned!
            </p>
          </div>
        </div>

        {/* Device Icons */}
        <div className="flex items-center justify-center gap-6 text-4xl mb-6">
          <div className="text-center">
            <div>💻</div>
            <div className="text-xs text-gray-600 mt-1">Desktop</div>
          </div>
          <div className="text-center">
            <div>📱</div>
            <div className="text-xs text-gray-600 mt-1">Tablet</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          Made by Alpha prompting Cursor
        </div>
      </div>
    </div>
  );
}

