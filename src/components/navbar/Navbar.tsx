import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

interface NavbarProps {
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if the 'dark' class is on the root HTML element
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    setIsDarkMode((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm py-4 px-6 shadow-lg border-b border-gray-300/20 dark:border-gray-700/20 z-50">
      <ul className="flex space-x-8 text-gray-800 dark:text-gray-100 font-medium">
        <li>
          <a href="about">About me</a>
        </li>
        <li>
          <a href="experiences">Experiences</a>
        </li>
        <li>
          <a href="projects">Projects</a>
        </li>
      </ul>

      <button
        onClick={handleToggleDarkMode}
        className="p-2 rounded-full bg-gray-200/80 dark:bg-gray-600/80 transition-colors duration-300"
      >
        {isDarkMode ? (
          <FaSun className="text-yellow-400" />
        ) : (
          <FaMoon className="text-gray-800" />
        )}
      </button>
    </nav>
  );
};

export default Navbar;
