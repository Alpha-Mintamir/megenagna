"use client";

import dynamic from 'next/dynamic';

// Completely disable SSR and static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Import with no SSR
const MeetingPageClient = dynamic(
  () => import('./MeetingPageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
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
