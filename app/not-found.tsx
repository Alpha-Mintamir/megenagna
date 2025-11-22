import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen ethiopian-pattern flex items-center justify-center px-4">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full ethiopian-border">
        <div className="text-6xl md:text-8xl font-bold text-ethiopian-green mb-4 font-ethiopic">
          ፬፻፬
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-ethiopian-green to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}

