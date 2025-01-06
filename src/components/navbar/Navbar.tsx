import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Link } from 'react-scroll';


interface NavbarProps {
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm py-4 px-6 shadow-lg border-b border-gray-300/20 dark:border-gray-700/20 z-50">
      <ul className="flex space-x-8 text-gray-800 dark:text-gray-100 font-medium">
      <li>
        <Link
          to="cover-tile"
          smooth={true}
          duration={500}
          className="hover:underline cursor-pointer"
        >
          Aroop
        </Link>
      </li>
      <li>
        <Link
          to="about"
          smooth={true}
          duration={500}
          className="hover:underline cursor-pointer"
        >
          About
        </Link>
      </li>
      <li>
        <Link
          to="experiences"
          smooth={true}
          duration={500}
          className="hover:underline cursor-pointer"
        >
          Experiences
        </Link>
      </li>
      <li>
        <Link
          to="projects"
          smooth={true}
          duration={500}
          className="hover:underline cursor-pointer"
        >
          Projects
        </Link>
      </li>

      </ul>

      <button
        onClick={handleToggleDarkMode}
        className="p-2 rounded-full bg-gray-200/80 dark:bg-gray-600/80 transition-colors duration-300"
        aria-label="Toggle Dark Mode"
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
