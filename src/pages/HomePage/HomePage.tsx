import React from 'react';


const HomePage: React.FC = () => {
    return (
      <div className="min-h-screen bg-[#1e2124] text-black p-4 flex items-center justify-center">
        This is the home page.
        <div className="relative w-full max-w-lg">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-lavaMotion"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-lavaMotion animation-delay-20000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-lavaMotion animation-delay-7000"></div>
        </div>
      </div>
    );
  };

export default HomePage;