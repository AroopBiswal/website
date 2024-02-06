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
                width: 100vw;
                height: 100vh;
              }
            `}
          </style>
          <body>
            <canvas id="gradient-canvas"></canvas>
          </body>
        </html>
      );
    };

export default HomePage;