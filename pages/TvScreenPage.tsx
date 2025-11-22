import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { House } from '../types';
import HouseIcon from '../components/HouseIcon';

const TvScreenPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const data = await supabase.getHouses();
        setHouses(data.sort((a, b) => b.points - a.points));
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchHouses();

    const subscription = supabase.on('houses', '*', () => fetchHouses());

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const rankColors: { [key: number]: string } = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-yellow-600 to-yellow-800',
    4: 'from-gray-500 to-gray-700',
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-3xl p-8 text-center">
        <h2 className="text-5xl font-bold mb-4 text-red-500">Error</h2>
        <p className="font-mono bg-gray-800 p-4 rounded-md">{error}</p>
      </div>
    );
  }

  if (houses.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white text-5xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 grid grid-cols-2 grid-rows-2 gap-8">
      {houses.map((house, index) => (
        <div key={house.id} className={`flex flex-col justify-center items-center rounded-2xl p-8 bg-gradient-to-br ${rankColors[index + 1]}`}>
          <div className="flex items-center space-x-8">
             <HouseIcon houseId={house.id} className="w-24 h-24" />
             <div>
                <h2 className={`text-8xl font-extrabold text-black mix-blend-screen bg-white p-2`}>{house.name}</h2>
             </div>
          </div>
          <p className="text-9xl font-bold mt-4 tracking-tighter">{house.points.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default TvScreenPage;