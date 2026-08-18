import React from 'react';

interface AmericanAirlinesLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark-bg' | 'light-bg' | 'icon-only';
  className?: string;
  showText?: boolean;
}

export const AmericanAirlinesLogo: React.FC<AmericanAirlinesLogoProps> = ({
  size = 'md',
  variant = 'light-bg',
  className = '',
  showText = true,
}) => {
  const sizeMap = {
    sm: { icon: 'h-6 sm:h-7 w-auto', text: 'text-sm sm:text-base', subtext: 'text-[8px] sm:text-[9px]' },
    md: { icon: 'h-8 sm:h-9 w-auto', text: 'text-base sm:text-lg', subtext: 'text-[9px] sm:text-[10px]' },
    lg: { icon: 'h-10 sm:h-12 w-auto', text: 'text-xl sm:text-2xl', subtext: 'text-[10px] sm:text-[11px]' },
    xl: { icon: 'h-14 sm:h-16 w-auto', text: 'text-2xl sm:text-3xl', subtext: 'text-[11px] sm:text-[12px]' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official American Airlines 100th Centennial Anniversary Logo SVG */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 flex items-center justify-center filter drop-shadow-sm`}>
        <svg
          viewBox="0 0 440 200"
          className="h-full w-auto max-h-full"
          style={{ aspectRatio: '440/200' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Silver Metallic Gradients for "100" */}
            <linearGradient id="aa100SilverStem" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#E2E7ED" />
              <stop offset="60%" stopColor="#B0B9C6" />
              <stop offset="100%" stopColor="#808B9B" />
            </linearGradient>

            <linearGradient id="aa100SilverBevel" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#697586" />
              <stop offset="50%" stopColor="#A2ACB9" />
              <stop offset="100%" stopColor="#E9EEF4" />
            </linearGradient>

            <linearGradient id="aa100SilverRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#D9E0E8" />
              <stop offset="70%" stopColor="#9BA6B5" />
              <stop offset="100%" stopColor="#727E8F" />
            </linearGradient>

            {/* AA Iconic Blue Upper Wing Ribbon */}
            <linearGradient id="aa100BlueWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A9E0" />
              <stop offset="45%" stopColor="#0078D2" />
              <stop offset="100%" stopColor="#004C97" />
            </linearGradient>

            {/* AA Iconic Red Lower Wing Ribbon */}
            <linearGradient id="aa100RedWing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ED1C24" />
              <stop offset="60%" stopColor="#C41230" />
              <stop offset="100%" stopColor="#8A001A" />
            </linearGradient>

            {/* Eagle Head & Beak Shading */}
            <linearGradient id="aa100EagleBeak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E1E6EB" />
              <stop offset="100%" stopColor="#BDC6D1" />
            </linearGradient>
          </defs>

          {/* ==================== "1" DIGIT ==================== */}
          {/* Beveled Upper Hook */}
          <path
            d="M 12 65 L 52 2 L 62 2 L 32 60 C 28 67 22 68 12 65 Z"
            fill="url(#aa100SilverBevel)"
          />
          {/* Main Pillar of 1 */}
          <path
            d="M 50 4 C 50 4 58 4 60 4 L 60 196 L 16 196 L 16 70 L 44 26 C 48 18 50 10 50 4 Z"
            fill="url(#aa100SilverStem)"
          />

          {/* ==================== FIRST "0" DIGIT ==================== */}
          <path
            d="M 160 4 C 214 4 252 46 252 100 C 252 154 214 196 160 196 C 106 196 68 154 68 100 C 68 46 106 4 160 4 Z M 160 38 C 126 38 102 66 102 100 C 102 134 126 162 160 162 C 194 162 218 134 218 100 C 218 66 194 38 160 38 Z"
            fill="url(#aa100SilverRing)"
          />

          {/* ==================== SECOND "0" DIGIT ==================== */}
          <path
            d="M 336 4 C 390 4 428 46 428 100 C 428 154 390 196 336 196 C 282 196 244 154 244 100 C 244 46 282 4 336 4 Z M 336 38 C 302 38 278 66 278 100 C 278 134 302 162 336 162 C 370 162 394 134 394 100 C 394 66 370 38 336 38 Z"
            fill="url(#aa100SilverRing)"
          />

          {/* ==================== AA FLIGHT SYMBOL / EAGLE RIBBON ==================== */}
          {/* 1. AA Blue Upper Wing Flight Ribbon */}
          <path
            d="M 218 100 L 186 2 L 236 2 L 288 78 C 264 78 240 86 218 100 Z"
            fill="url(#aa100BlueWing)"
          />

          {/* 2. Eagle Head / Beak White & Silver Notch */}
          <path
            d="M 288 78 C 262 82 248 100 248 128 C 268 98 296 98 334 98 L 336 102 C 300 102 278 108 266 138 L 248 128 C 248 106 264 86 288 78 Z"
            fill="url(#aa100EagleBeak)"
          />

          {/* 3. Eagle Feather Top White Highlight */}
          <path
            d="M 286 78 C 260 84 250 102 248 126 C 256 108 274 94 304 92 L 334 98 C 316 92 298 84 286 78 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* 4. AA Red Lower Wing Flight Ribbon */}
          <path
            d="M 270 134 C 288 108 308 120 324 144 L 384 196 L 334 196 L 270 134 Z"
            fill="url(#aa100RedWing)"
          />

          {/* 5. Red Wing Vibrant Front Edge */}
          <path
            d="M 270 134 C 292 112 316 130 334 154 L 366 196 L 334 196 L 270 134 Z"
            fill="#ED1C24"
          />

          {/* ==================== "SM" SERVICE MARK ==================== */}
          <text 
            x="426" 
            y="194" 
            fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif" 
            fontSize="12" 
            fontWeight="bold" 
            fill="#808B9B"
            textAnchor="start"
          >SM</text>
        </svg>
      </div>

      {variant !== 'icon-only' && showText && (
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
            100 Years • Flagship® Hub
          </span>
        </div>
      )}
    </div>
  );
};
