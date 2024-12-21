import React from 'react';

const CoverTile: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Hello, I'm Aroop</h1>
        <p className="mt-4 text-lg">I'm a software engineer!</p>
      </div>
    </div>
  );
};

export default CoverTile;
