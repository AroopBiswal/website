import React, { useState } from 'react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const CoverTile: React.FC = () => {
  const [showSubText, setShowSubText] = useState(false);
  const [hideMainCursor, setHideMainCursor] = useState(false);
  const [hideSubCursor, setHideSubCursor] = useState(false);

  // Main Text Typewriter Hook
  const [mainText] = useTypewriter({
    words: ["Hello, I'm Aroop"],
    loop: 1, // Type once
    onLoopDone: () => {
      setHideMainCursor(true);
      setShowSubText(true);
    },
    typeSpeed: 50,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

  // Subtext Typewriter Hook
  const [subText] = useTypewriter({
    words: ["I'm a software engineer!"],
    loop: 1,
    onLoopDone: () => setHideSubCursor(true),
    typeSpeed: 50,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

  return (
    <div className="h-screen flex flex-col justify-start bg-lightBg dark:bg-darkBg transition-colors duration-300">
      <div className="h-1/6">

      </div>
      <div className="text-center">
        {/* Main Text */}
        <h1 className="text-5xl font-bold">
          {mainText}
          {!hideMainCursor && <Cursor cursorColor="black" />}
        </h1>

        {/* Subtext */}
        {showSubText && (
          <p className="mt-4 text-lg">
            {subText}
            {!hideSubCursor && <Cursor cursorColor="black" />}
          </p>
        )}
      </div>
    </div>
  );
};

export default CoverTile;
