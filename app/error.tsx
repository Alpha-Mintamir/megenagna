'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen ethiopian-pattern flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full ethiopian-border">
        <div className="text-6xl md:text-8xl font-bold text-ethiopian-red mb-4">
          ⚠️
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-ethiopian-green to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

