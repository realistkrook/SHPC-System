
import React from 'react';

interface HouseIconProps {
  houseId: string;
  className?: string;
}

const HouseIcon: React.FC<HouseIconProps> = ({ houseId, className }) => {
  const houseImageMap: { [key: string]: string } = {
    // Use the uploaded photos (filenames are as uploaded in public/images/)
    keruru: '/images/Kereru Aotea Birds.jpg',
    korimako: '/images/Aotea Birds Korimako.jpg',
    kotuku: '/images/Aotea Birds Kotuku.jpg',
    // 'raukawa' was replaced by 'pukeko'
    pukeko: '/images/Aotea Birds Pukeko.jpg',
  };

  const src = houseImageMap[houseId];
  if (!src) return null;

  // Capitalize house name for alt text
  const houseName = houseId.charAt(0).toUpperCase() + houseId.slice(1);

  return <img src={src} alt={`${houseName} house logo`} className={className} />;
};

export default HouseIcon;
