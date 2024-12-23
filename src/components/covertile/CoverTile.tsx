import React, { useState } from 'react';
import { Typewriter } from 'react-simple-typewriter';

const CoverTile: React.FC = () => {
  const [showSubText, setShowSubText] = useState(false); // Control when to show the second line

  return (
    <div className="h-screen flex items-center justify-center bg-lightBg dark:bg-darkBg transition-colors duration-300">
      <div className="text-center">
        {/* Main Text */}
        <h1 className="text-5xl font-bold">
          <Typewriter
            words={["Hello, I'm Aroop"]}
            loop={1} // Type once
            cursor
            cursorStyle="|"
            typeSpeed={50} // Typing speed
            deleteSpeed={50}
            delaySpeed={1000}
            onLoopDone={() => setShowSubText(true)}
          />
        </h1>

        {/* Subtext */}
        {showSubText && (
          <p className="mt-4 text-lg">
            <Typewriter
              words={["I'm a software engineer!"]}
              loop={1} // Type once
              cursor
              cursorStyle="|"
              typeSpeed={100}
              deleteSpeed={50}
              delaySpeed={500}
            />
          </p>
        )}
      </div>
    </div>
  );
};

export default CoverTile;
