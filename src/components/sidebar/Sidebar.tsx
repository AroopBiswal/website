import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-20 h-screen bg-gray-800 dark:bg-gray-700 text-white flex flex-col items-center py-4">
      <div className="text-lg font-bold mb-4">Aroop</div>
      <ul className="space-y-4 text-sm">
        <li>
          <a href="https://github.com/AroopBiswal" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/aroopbiswal/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
