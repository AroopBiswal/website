import React, { useState } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import Navbar from './components/navbar/Navbar';
import CoverPage from './components/covertile/CoverTile';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-lightBg dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar toggleDarkMode={toggleDarkMode} />
        <CoverPage />
      </div>
    </div>
  );
}

export default App;
