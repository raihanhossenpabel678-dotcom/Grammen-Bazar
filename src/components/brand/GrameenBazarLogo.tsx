import React from 'react';

interface GrameenBazarLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GrameenBazarLogo: React.FC<GrameenBazarLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const BasketIcon = (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconDimensions} shrink-0 drop-shadow-2xs`}
    >
      {/* Background circular arch */}
      <path
        d="M 40 140 A 85 85 0 1 1 200 140"
        stroke="#D5DCD4"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Sprout Leaves behind top-right */}
      <path
        d="M 148 95 Q 165 55 190 40 Q 185 70 170 85 Z"
        fill="#5EA842"
        stroke="#2E621C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M 148 95 Q 170 65 190 40"
        stroke="#2E621C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 152 92 Q 185 82 202 98 Q 178 115 156 102 Z"
        fill="#72BA4D"
        stroke="#2E621C"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M 152 92 Q 180 96 202 98"
        stroke="#2E621C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Sprout Stem */}
      <path
        d="M 146 110 Q 148 90 152 75"
        stroke="#2E621C"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Basket Handle Arc */}
      <path
        d="M 68 120 C 68 65 172 65 172 120"
        stroke="#9B5927"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 72 120 C 72 72 168 72 168 120"
        stroke="#D89255"
        strokeWidth="3.5"
      />

      {/* Green Salad / Lettuce Leaves inside basket */}
      <path
        d="M 65 118 C 60 98 75 80 92 84 C 98 72 115 72 122 84 C 132 80 145 92 140 108 C 138 120 115 125 75 125 Z"
        fill="#4D963F"
        stroke="#295E20"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Leaf ribs */}
      <path d="M 85 105 Q 92 90 98 94" stroke="#71B960" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 112 108 Q 116 88 124 92" stroke="#71B960" strokeWidth="2.5" strokeLinecap="round" />

      {/* Burlap Grain Sack inside basket */}
      <path
        d="M 132 105 C 132 95 158 92 166 102 C 172 108 174 122 170 128 C 158 132 136 130 132 122 Z"
        fill="#D4A76A"
        stroke="#7A4E23"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Grain filling top */}
      <ellipse cx="152" cy="98" rx="14" ry="6" fill="#F0C775" stroke="#7A4E23" strokeWidth="2.5" />
      {/* Sack tie string */}
      <path d="M 142 104 Q 152 107 162 104" stroke="#5E3816" strokeWidth="3" strokeLinecap="round" />

      {/* Fresh Red Tomato */}
      <ellipse
        cx="116"
        cy="114"
        rx="17"
        ry="15"
        fill="#E4422B"
        stroke="#7D1D12"
        strokeWidth="3.5"
      />
      {/* Tomato Highlight */}
      <path
        d="M 108 108 Q 113 105 116 106"
        stroke="#FF9585"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tomato Star Leaf / Calyx */}
      <path
        d="M 116 102 L 112 96 M 116 102 L 122 97 M 116 102 L 109 104 M 116 102 L 123 104 M 116 102 L 116 94"
        stroke="#2E6B20"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Main Woven Basket Body */}
      {/* Basket Rim */}
      <rect
        x="60"
        y="118"
        width="120"
        height="12"
        rx="6"
        fill="#C97B3C"
        stroke="#753C12"
        strokeWidth="4"
      />
      {/* Basket Lower Tapered Body */}
      <path
        d="M 64 128 L 78 172 C 82 178 95 182 120 182 C 145 182 158 178 162 172 L 176 128 Z"
        fill="#E8A366"
        stroke="#753C12"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Wicker Weave Lattice Pattern */}
      {/* Horizontal ribs */}
      <path d="M 68 142 Q 120 148 172 142" stroke="#753C12" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 72 156 Q 120 162 168 156" stroke="#753C12" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 76 170 Q 120 176 164 170" stroke="#753C12" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Vertical slats */}
      <path d="M 88 128 L 92 180" stroke="#8C4918" strokeWidth="3" />
      <path d="M 104 128 L 106 182" stroke="#8C4918" strokeWidth="3" />
      <path d="M 120 128 L 120 182" stroke="#8C4918" strokeWidth="3" />
      <path d="M 136 128 L 134 182" stroke="#8C4918" strokeWidth="3" />
      <path d="M 152 128 L 148 180" stroke="#8C4918" strokeWidth="3" />

      {/* Base shadow accent */}
      <path d="M 70 186 C 90 189 150 189 170 186" stroke="#C18758" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{BasketIcon}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {BasketIcon}
        <div className="mt-2 flex flex-col items-center">
          <span className="text-2xl font-black tracking-tight text-[#234938] font-sans leading-none">
            Grameen
          </span>
          <span className="text-2xl font-black tracking-tight text-[#BC6123] font-sans leading-tight">
            Bazar
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-[#476353] mt-0.5">
            Fresh | Local | Digital
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal layout for Header / Navbar
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {BasketIcon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#234938] font-sans">
            Grameen
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#BC6123] font-sans">
            Bazar
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#4e6b5b] tracking-wider mt-0.5 whitespace-nowrap">
          Fresh | Local | Digital · ১০০% খাঁটি
        </span>
      </div>
    </div>
  );
};
