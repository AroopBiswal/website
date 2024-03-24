import Gradient from './Gradient.js'; 
import React, { useState, useEffect } from 'react';

import './HomePage.css';

const HomePage: React.FC  = () => {
    const [backgroundColor, setBackgroundColor] = useState<string>('rgb(159, 231, 252)'); // Initial color #9FE7F
    useEffect(() => {
      const startColor: [number, number, number] = [159, 231, 252]; // RGB for #9FE7FC
      const endColor: [number, number, number] = [77, 106, 240]; // RGB for #4D6AA1
  
      const handleScroll = (): void => {
        const scrollPercentage: number = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        const colorInterpolation: [number, number, number] = startColor.map((startComponent, index) => {
          return startComponent + (endColor[index] - startComponent) * scrollPercentage;
        }) as [number, number, number];
  
        setBackgroundColor(`rgb(${colorInterpolation[0]}, ${colorInterpolation[1]}, ${colorInterpolation[2]})`);
      };
  
      window.addEventListener('scroll', handleScroll);
  
      return (): void => window.removeEventListener('scroll', handleScroll);
    }, []);
    // useEffect(() => {
    //     const gradient = new Gradient();
    //     gradient.initGradient('#gradient-canvas');
    
    //     // Cleanup: remove the gradient instance when the component unmounts
    //     return () => {
    //     };
    //   }, []);
    
    return (
      <div style={{ backgroundColor: backgroundColor }} className="w-full min-h-screen flex flex-col justify-center">
        <div className="rainbow-text p-4 text-center">
          Hi! I'm Aroop Biswal
        </div>
        {/* Additional content to make the page scrollable */}
        <div className="h-screen"></div>
      </div>
    );
    };

export default HomePage;


// IDEA: Have the top of the page be like the morning, with a light blue sky
// and as you scroll down, the sky gets darker and darker until it's night time
// with a dark blue sky. The text should be white and the background should have
// stars.