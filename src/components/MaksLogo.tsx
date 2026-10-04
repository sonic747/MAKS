import React from 'react';

interface MaksLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MaksLogo: React.FC<MaksLogoProps> = ({ className = '', size = 'md' }) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-12' : 'h-8';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 280 100"
        className={`${heightClass} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Aerodynamic Speed Curves swooping over S */}
        <path
          d="M 175 28 C 210 10, 245 15, 262 38"
          stroke="#F5C200"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 195 24 C 225 14, 252 20, 264 36"
          stroke="#F5C200"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 215 20 C 235 15, 255 22, 264 33"
          stroke="#FFD54F"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Squash Ball with 3D gradient and Double Yellow Dots */}
        <g transform="translate(242, 25)">
          {/* Ball sphere */}
          <circle cx="15" cy="15" r="13" fill="#EAECEF" />
          <circle cx="13" cy="13" r="13" fill="url(#ballGlow)" />
          {/* Subtle 3D shadow */}
          <circle cx="15" cy="15" r="12.5" stroke="#B0B5BA" strokeWidth="1" />
          {/* Double Yellow Dots */}
          <circle cx="12" cy="13" r="2.2" fill="#F5C200" />
          <circle cx="18" cy="15" r="2.2" fill="#F5C200" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="maksGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F0F2F5" />
            <stop offset="100%" stopColor="#D5D9E0" />
          </linearGradient>
          <radialGradient id="ballGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E2E5E9" />
            <stop offset="100%" stopColor="#9AA0A6" />
          </radialGradient>
        </defs>

        {/* Main MAKS lettering - Custom Stylized Italic Angular Text */}
        <g fontStyle="italic" fontWeight="900" fontFamily="'Chivo', 'Arial Black', sans-serif">
          {/* M */}
          <path
            d="M 22 75 L 35 30 L 48 30 L 59 55 L 70 30 L 83 30 L 70 75 L 57 75 L 61 50 L 51 72 L 44 72 L 34 50 L 29 75 Z"
            fill="url(#maksGradient)"
          />
          {/* A */}
          <path
            d="M 85 75 L 102 30 L 118 30 L 132 75 L 118 75 L 115 62 L 98 62 L 95 75 Z M 102 51 L 112 51 L 109 40 Z"
            fill="url(#maksGradient)"
          />
          {/* K */}
          <path
            d="M 132 75 L 145 30 L 159 30 L 151 50 L 168 30 L 186 30 L 163 54 L 179 75 L 162 75 L 150 58 L 145 75 Z"
            fill="url(#maksGradient)"
          />
          {/* S */}
          <path
            d="M 183 71 C 185 75, 193 77, 203 76 C 216 75, 225 68, 227 60 C 229 53, 224 49, 212 46 C 200 44, 197 42, 198 38 C 199 34, 205 32, 212 32 C 219 32, 225 34, 227 38 L 238 34 C 235 28, 225 25, 214 25 C 200 25, 187 32, 185 41 C 183 48, 188 53, 200 56 C 211 58, 214 60, 213 65 C 212 70, 205 72, 197 72 C 188 72, 182 68, 180 64 Z"
            fill="url(#maksGradient)"
          />
        </g>

        {/* Subtitle Bar: Yellow line - SQUASH CLUB - Yellow line */}
        <line x1="16" y1="88" x2="52" y2="88" stroke="#F5C200" strokeWidth="3" strokeLinecap="round" />
        <text
          x="138"
          y="93"
          fill="#FFFFFF"
          fontFamily="'Chivo', sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="17"
          letterSpacing="2.5"
          textAnchor="middle"
        >
          SQUASH CLUB
        </text>
        <line x1="225" y1="88" x2="260" y2="88" stroke="#F5C200" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
