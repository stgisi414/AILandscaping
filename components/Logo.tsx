
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
      <path
        d="M12 2L2 12h3v8h14v-8h3L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#a3ccab"
      />
      <path
        d="M12 12c0-5 6-5 6 0C18 16 9 17 9 20"
        stroke="#f8f9fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-bold text-xl text-[#22573b]">AI Landscaping</span>
  </div>
);

export default Logo;
