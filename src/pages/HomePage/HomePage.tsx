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
