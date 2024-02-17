import React, { useEffect } from 'react';
import Gradient from './Gradient.js'; 

const HomePage: React.FC = () => {
    useEffect(() => {
        const gradient = new Gradient();
        gradient.initGradient('#gradient-canvas');
    
        // Cleanup: remove the gradient instance when the component unmounts
        return () => {
        };
      }, []);
    
      return (
        <html>
          <head>
            <title>Aroop Biswal</title>
          </head>
          <style>
            {`
              body {
                margin: 0;
                padding: 0;
              }
    
              #gradient-canvas {
                --gradient-color-1: #6ec3f4;
                --gradient-color-2: #3a3aff;
                --gradient-color-3: #ff61ab;
                --gradient-color-4: #E63946;
              }

              .rotate-div {
                transform: rotate(-15deg); /* Rotate the div by -30 degrees */
                display: inline-block; /* Ensures the div takes only the necessary width */
                transform-origin: bottom left; /* Rotate around the top-left corner */
                width: 125vw;
            }
            `}
          </style>
          <body>
            <div className="relative">

            <canvas className="absolute inset-0 transform rounded-bl-3xl rounded-br-3xl rotate-{30} transform-gpu" id="gradient-canvas"></canvas>
            <div className="absolute .rotate-div inset-0 bg-white "></div>
              hi
            </div>
          </body>
        </html>
      );
    };

export default HomePage;