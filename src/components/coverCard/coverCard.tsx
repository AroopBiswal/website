import React, { useEffect } from 'react';
import Gradient from '../Gradient.js'; 
import './coverCard.scss';

interface CoverCardProps {
  image: string;
  title: string;
  subTitle: string;
  text: string;
  link: string;
}

const CoverCard = ({
  image,
  title,
  subTitle,
  text,
  link
}: CoverCardProps) => {
  useEffect(() => {
    const gradient = new Gradient();
    gradient.initGradient('#gradient-canvas');

    // Cleanup: remove the gradient instance when the component unmounts
    return () => {
    };
  }, []);
  return (
    <html>
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
    <div className="coverCard" style={{
      backgroundImage: `url(${image})`,
    }}>
      <h2 className="coverCard__title">
        <span
          className="coverCard__title_transparent"
          style={{
            backgroundImage: `url(${image})`,
          }}
          dangerouslySetInnerHTML={{__html: title}}
        />
      </h2>
      <div className="coverCard__title-shadow">
        <span
          className="coverCard__title-shadow_white"
          dangerouslySetInnerHTML={{__html: title}}
        />
      </div>
      <div className="coverCard__content">
        <div className="container">
          <h3 className="coverCard__subTitle">{subTitle}</h3>
          <p className="coverCard__text">{text}</p>
          <a href={link} className="coverCard__link">More details</a>
        </div>
      </div>
    </div>
    <canvas 
      className="z-0 transform rounded-bl-3xl rounded-br-3xl rotate-{30} transform-gpu" 
      id="gradient-canvas">
    </canvas>
    
    </html>
  )
};

export default CoverCard;