
import React from 'react';

interface HouseIconProps {
  houseId: string;
  className?: string;
}

const HouseIcon: React.FC<HouseIconProps> = ({ houseId, className }) => {
  const houseImageMap: { [key: string]: string } = {
    // Use the uploaded photos (filenames are as uploaded in public/images/)
    // Kereru
    kereru: '/images/Kereru Aotea Birds.png',
    kererū: '/images/Kereru Aotea Birds.png',
    keruru: '/images/Kereru Aotea Birds.png', // Keep existing just in case

    // Korimako
    korimako: '/images/Aotea Birds Korimako.png',
    kōrimako: '/images/Aotea Birds Korimako.png',

    // Kotuku
    kotuku: '/images/Aotea Birds Kotuku.png',
    kōtuku: '/images/Aotea Birds Kotuku.png',

    // Pukeko
    pukeko: '/images/Aotea Birds Pukeko.png',
    pūkeko: '/images/Aotea Birds Pukeko.png',
  };

  const src = houseImageMap[houseId];
  if (!src) return null;

  // Capitalize house name for alt text
  const houseName = houseId.charAt(0).toUpperCase() + houseId.slice(1);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt={`${houseName} house logo`}
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
};

export default HouseIcon;
