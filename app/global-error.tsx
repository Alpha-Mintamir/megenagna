'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Error
            </h1>
            <p className="text-gray-600 mb-8">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="bg-ethiopian-green text-white px-8 py-4 rounded-xl font-bold hover:bg-ethiopian-dark-green transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

