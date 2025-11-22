import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { House } from '../types';
import HouseCard from '../components/HouseCard';

const PublicLeaderboardPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await supabase.getHouses();
        setHouses(data.sort((a, b) => b.points - a.points));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();

    const subscription = supabase.on('houses', 'UPDATE', (payload) => {
      setHouses(currentHouses => {
        const updatedHouses = currentHouses.map(h => 
          // @ts-ignore: Cast payload.new to access 'id', as the inferred type can be an empty object.
          h.id === payload.new.id ? { ...h, ...payload.new } : h
        );
        return updatedHouses.sort((a, b) => b.points - a.points);
      });
    });

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-xl">Loading Leaderboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 p-6 bg-red-800/50 text-red-300 rounded-lg max-w-3xl mx-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-3 text-white">Error Loading Leaderboard</h2>
        <p className="font-mono text-sm bg-gray-900 p-3 rounded mb-4">{error}</p>
        <p className="text-gray-400">
          This could be a database connection issue. Please ensure the 'houses' table exists and has the correct RLS permissions in your Supabase project.
        </p>
      </div>
    );
  }
  
  const maxPoints = Math.max(...houses.map(h => h.points), 1);

  return (
    <div className="p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">House Points Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {houses.map((house, index) => (
          <HouseCard key={house.id} house={house} rank={index + 1} maxPoints={maxPoints} />
        ))}
      </div>
    </div>
  );
};

export default PublicLeaderboardPage;