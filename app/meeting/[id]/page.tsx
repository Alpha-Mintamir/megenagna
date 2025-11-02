"use client";

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

// Import the actual component with SSR completely disabled
const MeetingPageClient = dynamic(
  () => import('./MeetingPageClient'),
  { 
    ssr: false, // Completely disable SSR to prevent hydration issues
  }
);

interface PageProps {
  params: { id: string };
}

export default function MeetingPage({ params }: PageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure we're after initial paint
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    }
  }, []);

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center ethiopian-pattern" suppressHydrationWarning>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return <MeetingPageClient meetingId={params.id} />;
}
