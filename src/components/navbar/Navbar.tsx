import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

interface NavbarProps {
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode }) => {
  return (
    <nav className="flex justify-between items-center bg-white dark:bg-gray-800 py-4 px-6 shadow-md">
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
        onClick={toggleDarkMode}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300"
      >
        {document.documentElement.classList.contains('dark') ? (
          <FaSun className="text-yellow-400" />
        ) : (
          <FaMoon className="text-gray-800" />
        )}
      </button>
    </nav>
  );
};

export default Navbar;
