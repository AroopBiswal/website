import React, { useState } from 'react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

const CoverTile: React.FC = () => {
  const [showSubText, setShowSubText] = useState(false);
  const [hideMainCursor, setHideMainCursor] = useState(false);
  const [hideSubCursor, setHideSubCursor] = useState(false);

  const [mainText] = useTypewriter({
    words: ["Hello, I'm Aroop!"],
    loop: 1, // Type once
    onLoopDone: () => {
      setHideMainCursor(true);
      setShowSubText(true);
    },
    typeSpeed: 50,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

  const [subText] = useTypewriter({
    words: ["I'm a software engineer at "],
    loop: 1,
    onLoopDone: () => setHideSubCursor(true),
    typeSpeed: 50,
    deleteSpeed: 50,
    delaySpeed: 1000,
  });

  const metaLink = (
    <a
      href="https://about.meta.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-black dark:text-white hover:underline"
    >
      Meta
    </a>
  );

  return (
      <div className="relative h-screen flex flex-col justify-start bg-lightBg dark:bg-darkBg overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-lightBg dark:to-darkBg"
          style={{ zIndex: 5 }}
        ></div>

        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="blur" x="0" y="0">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
          </defs>
          <g filter="url(#blur)">
            <circle cx="200" cy="300" r="250" fill="rgba(236, 72, 153, 0.5)">
              <animate
                attributeName="cx"
                values="200; 250; 200"
                dur="10s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="300; 350; 300"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="500" cy="500" r="300" fill="rgba(139, 92, 246, 0.5)">
              <animate
                attributeName="cx"
                values="500; 550; 500"
                dur="12s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="500; 450; 500"
                dur="9s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="800" cy="700" r="220" fill="rgba(59, 130, 246, 0.5)">
              <animate
                attributeName="cx"
                values="800; 750; 800"
                dur="14s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="700; 800; 600; 700"
                dur="11s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>

        <div className="relative z-10 h-1/6"></div>
        <div className="relative w-full z-10 text-center">
          <h1 className="text-5xl font-bold text-dark dark:text-white">
            {mainText}
            {!hideMainCursor && <Cursor cursorColor="white" />}
          </h1>

          {showSubText && (
            <p className="mt-4 text-2xl text-dark dark:text-gray-300">
              {subText}
              {!hideSubCursor && <Cursor cursorColor="white" />}
              {hideSubCursor && metaLink}
            </p>
          )}
        </div>
      </div>

  );
};

export default CoverTile;
