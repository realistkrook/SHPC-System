
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseService';
import { House } from '../types';
import HouseCard from '../components/HouseCard';
import { Skeleton } from '../components/Skeleton';

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
          h.id === (payload.new as any).id ? { ...h, ...payload.new } : h
        );
        return updatedHouses.sort((a, b) => b.points - a.points);
      });
    });

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  const maxPoints = Math.max(...houses.map(h => h.points), 1);

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-red-900/20 border border-red-500/30 backdrop-blur-md text-red-200 rounded-2xl max-w-2xl mx-auto shadow-xl">
          <h2 className="text-3xl font-bold mb-4 text-white">Unable to Load Leaderboard</h2>
          <p className="font-mono text-sm bg-black/30 p-4 rounded-lg mb-6 border border-red-500/20">{error}</p>
          <p className="text-red-300/80">
            Please check your connection or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-200 drop-shadow-sm mb-4">
          House Leaderboard
        </h1>
        <p className="text-slate-200 text-lg md:text-xl font-medium tracking-wide uppercase">
          Aotea College House Competition
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-3xl p-6 border border-slate-700/30 h-[400px] flex flex-col">
              <div className="flex justify-between mb-8">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-32 bg-slate-700/50" />
                  <Skeleton className="h-4 w-16 bg-slate-700/50" />
                </div>
                <Skeleton className="h-20 w-20 rounded-full bg-slate-700/50" />
              </div>
              <div className="mt-auto space-y-4">
                <Skeleton className="h-16 w-48 mx-auto bg-slate-700/50" />
                <Skeleton className="h-4 w-full rounded-full bg-slate-700/50" />
              </div>
            </div>
          ))
        ) : (
          houses.map((house, index) => (
            <HouseCard key={house.id} house={house} rank={index + 1} maxPoints={maxPoints} />
          ))
        )}
      </div>

      <div className="mt-16 text-center pb-8 opacity-75 hover:opacity-100 transition-opacity duration-300">
        <a href="https://opside.tech" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
          <img
            src="/images/Opside Powered By 1200x300.png"
            alt="Powered by Opside"
            className="h-12 mx-auto object-contain"
            draggable={false}
          />
        </a>
      </div>
    </div>
  );
};

export default PublicLeaderboardPage;