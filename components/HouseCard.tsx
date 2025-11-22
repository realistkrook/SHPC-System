
import React from 'react';
import { House } from '../types';
import HouseIcon from './HouseIcon';

interface HouseCardProps {
  house: House;
  rank: number;
  maxPoints: number;
}

const HouseCard: React.FC<HouseCardProps> = ({ house, rank, maxPoints }) => {
  const percentage = maxPoints > 0 ? (house.points / maxPoints) * 100 : 0;

  const rankColors: { [key: number]: string } = {
    1: 'border-yellow-400 shadow-yellow-400/50',
    2: 'border-gray-400 shadow-gray-400/50',
    3: 'border-yellow-600 shadow-yellow-600/50',
    4: 'border-gray-600 shadow-gray-600/50',
  };

  const rankText: { [key: number]: string } = {
    1: '1st', 2: '2nd', 3: '3rd', 4: '4th'
  };

  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border-4 ${rankColors[rank] || 'border-gray-700'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className={`text-3xl lg:text-4xl font-extrabold ${house.textColor}`}>{house.name}</h2>
            <p className="text-gray-400 text-lg font-semibold">{rankText[rank]}</p>
          </div>
          <HouseIcon houseId={house.id} className="w-20 h-20 lg:w-24 lg:h-24 mx-auto" />
        </div>
        <div className="mt-6 text-center">
          <p className="text-6xl lg:text-7xl font-bold text-white tracking-tight">{house.points.toLocaleString()}</p>
          <p className="text-gray-400 font-medium">points</p>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className={`${house.color} h-4 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
