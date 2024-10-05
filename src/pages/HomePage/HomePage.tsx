import React, { useState, useEffect } from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [backgroundColor, setBackgroundColor] = useState<string>('rgb(159, 231, 252)'); // Initial color #9FE7FC

  useEffect(() => {
    const startColor: [number, number, number] = [159, 231, 252]; // RGB for #9FE7FC
    const endColor: [number, number, number] = [0, 0, 50]; // RGB for a dark night blue

    const handleScroll = (): void => {
      const scrollPercentage: number = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const colorInterpolation: [number, number, number] = startColor.map((startComponent, index) => {
        return startComponent + (endColor[index] - startComponent) * scrollPercentage;
      }) as [number, number, number];

      setBackgroundColor(`rgb(${colorInterpolation[0]}, ${colorInterpolation[1]}, ${colorInterpolation[2]})`);

      const sun = document.getElementById('sun');
      const moon = document.getElementById('moon');
      if (sun) {
        sun.style.transform = `translateX(-${scrollPercentage * 100}vw)`;
      }
      if (moon) {
        moon.style.transform = `translateX(-${(1 - scrollPercentage) * 100}vw)`;
      }
      const clouds = document.querySelectorAll('.cloud');
      clouds.forEach((cloud, index) => {
        cloud.style.transform = `translateX(${(index % 2 === 0 ? -1 : 1) * scrollPercentage * 100}vw)`;
      });
    };

    window.addEventListener('scroll', handleScroll);

    return (): void => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: backgroundColor }} className="w-full min-h-screen flex flex-col justify-center">
      <div className="sky">
        <div id="sun" className="sun"></div>
        <div id="moon" className="moon"></div>
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
      </div>
      <div className="h-screen"></div>
      <div className="h-screen"></div>
      <div className="h-screen"></div>
      <div className="h-screen"></div>
      <div className="h-screen"></div>
    </div>
  );
};

export default HomePage;
