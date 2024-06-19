import React from 'react';
import CoverCard from '../../components/coverCard/coverCard';   

export const HomePage: React.FC = () => {
  return (
    <CoverCard
    title="African<br />forest"
    image="/background.jpg"
    subTitle="African forest tour"
    text={`An amazing history, stunning nature, and a high level of
    development make the country unique on the African continent.
    Two oceans, savannah, mountains, desert, rainforest and the
    rythms of African drums.`}
    link="#"
  />
  );
}

export default HomePage;


// IDEA: Have the top of the page be like the morning, with a light blue sky
// and as you scroll down, the sky gets darker and darker until it's night time
// with a dark blue sky. The text should be white and the background should have
// stars.