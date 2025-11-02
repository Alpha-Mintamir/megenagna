"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Import the actual component
const MeetingPageClient = dynamic(
  () => import('./MeetingPageClient'),
  { 
    ssr: false, // Completely disable SSR to prevent hydration issues
    loading: () => (
      <div className="min-h-screen flex items-center justify-center ethiopian-pattern">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading meeting...</p>
        </div>
      </div>
    )
  }
);

interface PageProps {
  params: { id: string };
}

export default function MeetingPage({ params }: PageProps) {
  return <MeetingPageClient meetingId={params.id} />;
}
