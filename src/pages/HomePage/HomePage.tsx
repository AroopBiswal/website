import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CoverPage from '../../components/covertile/CoverTile';

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

      <Sidebar />


      <div className="ml-20 flex-1">
        <Navbar toggleDarkMode={toggleDarkMode} />
        <CoverPage />
      </div>
    </div>
  );
};

export default HomePage;
