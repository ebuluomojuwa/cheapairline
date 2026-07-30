import React from 'react';

interface AmericanAirlinesLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'light-bg' | 'dark-bg';
  className?: string;
}

export const AmericanAirlinesLogo: React.FC<AmericanAirlinesLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'h-7 w-7', text: 'text-base', subtext: 'text-[9px]' },
    md: { icon: 'h-9 w-9', text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 'h-11 w-11', text: 'text-2xl', subtext: 'text-[11px]' },
    xl: { icon: 'h-14 w-14', text: 'text-3xl', subtext: 'text-[12px]' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official American Airlines Eagle Flight Symbol SVG */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center filter drop-shadow-sm`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* AA Blue Ribbon Gradient */}
            <linearGradient id="aaBlueGrad" x1="10" y1="10" x2="70" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0078D2" />
              <stop offset="100%" stopColor="#00458C" />
            </linearGradient>

            {/* AA Red Ribbon Gradient */}
            <linearGradient id="aaRedGrad" x1="50" y1="40" x2="110" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E31B23" />
              <stop offset="100%" stopColor="#B30C15" />
            </linearGradient>

            {/* Shimmer overlay */}
            <linearGradient id="aaShimmer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Left/Upper Blue Fin Ribbon */}
          <path
            d="M 28,14 
               C 34,14 48,22 58,34 
               L 40,68 
               C 32,54 22,34 16,24 
               C 14,20 18,14 28,14 Z"
            fill="url(#aaBlueGrad)"
          />
          {/* Main Blue Wing Stream */}
          <path
            d="M 58,34 
               C 66,44 72,56 74,68 
               L 44,98 
               C 36,92 28,82 24,72 
               L 40,68 Z"
            fill="url(#aaBlueGrad)"
          />

          {/* Central White Eagle Beak/Wing Gap (Stylized Flight Notch) */}
          <path
            d="M 52,48 L 74,68 L 54,80 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* Right/Lower Red Wing Ribbon */}
          <path
            d="M 74,68 
               C 84,54 98,40 108,36 
               C 112,35 114,39 110,45 
               C 100,60 84,84 72,102 
               C 66,110 58,110 52,104 
               L 44,98 Z"
            fill="url(#aaRedGrad)"
          />

          {/* Eagle Beak Outline Detail */}
          <path
            d="M 58,34 L 78,54 L 74,68 Z"
            fill="#FFFFFF"
          />

          {/* Metallic Silver Trim Overlay */}
          <path
            d="M 28,14 C 34,14 48,22 58,34 L 52,48 C 42,32 30,20 28,14 Z"
            fill="url(#aaShimmer)"
          />
        </svg>
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-black tracking-tight ${currentSize.text} ${
                variant === 'dark-bg' ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              American
            </span>
            <span
              className={`font-light tracking-wide ${currentSize.text} ${
                variant === 'dark-bg' ? 'text-sky-300' : 'text-sky-700'
              }`}
              style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
            >
              Airlines
            </span>
          </div>
          <span className={`tracking-wider font-semibold uppercase ${currentSize.subtext} ${
            variant === 'dark-bg' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Flagship® & Seat Hub
          </span>
        </div>
      )}
    </div>
  );
};
