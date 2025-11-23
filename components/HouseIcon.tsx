
import React from 'react';

interface HouseIconProps {
  houseId: string;
  className?: string;
}

const HouseIcon: React.FC<HouseIconProps> = ({ houseId, className }) => {
  const houseImageMap: { [key: string]: string } = {
    // Use the uploaded photos (filenames are as uploaded in public/images/)
    keruru: '/images/Kereru Aotea Birds.png',
    korimako: '/images/Aotea Birds Korimako.png',
    kotuku: '/images/Aotea Birds Kotuku.png',
    // 'raukawa' was replaced by 'pukeko'
    pukeko: '/images/Aotea Birds Pukeko.png',
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
