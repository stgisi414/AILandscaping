import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2">
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#22573b]"
    >
      <rect width="24" height="24" rx="12" fill="white"/>
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 10c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4zM12 4v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 7.5a4.5 4.5 0 0 1 5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
    <span className="font-bold text-xl text-[#22573b]">AI Landscaping</span>
  </div>
);

export default Logo;