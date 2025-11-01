'use client';

export default function EthiopianPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Main decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Ethiopian Cross Pattern */}
            <pattern id="ethiopian-cross" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <g className="text-ethiopian-green">
                {/* Main cross */}
                <path
                  d="M60 15 L60 105 M15 60 L105 60"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Inner cross */}
                <rect x="45" y="45" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="60" cy="60" r="6" fill="currentColor" />
                <circle cx="60" cy="30" r="4" fill="currentColor" />
                <circle cx="60" cy="90" r="4" fill="currentColor" />
                <circle cx="30" cy="60" r="4" fill="currentColor" />
                <circle cx="90" cy="60" r="4" fill="currentColor" />
                
                {/* Corner ornaments */}
                <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="90" cy="30" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="30" cy="90" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="90" cy="90" r="2" fill="currentColor" opacity="0.6" />
              </g>
            </pattern>
            
            {/* Coffee bean pattern (Ethiopian coffee culture) */}
            <pattern id="coffee-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <ellipse cx="40" cy="40" rx="8" ry="12" fill="currentColor" opacity="0.3" />
              <path d="M 40 35 Q 45 40 40 45" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#ethiopian-cross)" />
        </svg>
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 opacity-10">
        <svg viewBox="0 0 100 100" className="text-ethiopian-yellow">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="currentColor" />
        </svg>
      </div>
      
      <div className="absolute bottom-20 right-20 w-24 h-24 opacity-10 animate-float">
        <svg viewBox="0 0 100 100" className="text-ethiopian-red">
          <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
      
      <div className="absolute top-1/3 right-1/4 w-16 h-16 opacity-10" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 100 100" className="text-ethiopian-gold">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)" />
          <circle cx="50" cy="50" r="8" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

