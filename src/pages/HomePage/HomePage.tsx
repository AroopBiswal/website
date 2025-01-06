import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar/Navbar';
import CoverTile from '../../components/covertile/CoverTile';
import About from '../../components/about/About';

const HomePage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div
      className={`flex ${
        darkMode ? 'dark' : ''
      } bg-lightBg dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300`}
    >



      <div className="flex-1">
        <Navbar toggleDarkMode={toggleDarkMode} />
        <div id="cover-tile">
          <CoverTile />
        </div>
        <div id="about">
          <About />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
