import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { House } from '../types';
import HouseIcon from '../components/HouseIcon';

const TvScreenPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    return () => supabase.removeSubscription(subscription);
  }, []);

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // Listen for fullscreen change (ESC key)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Error</h2>
        <p className="font-mono bg-gray-800 p-4 rounded-md">{error}</p>
      </div>
    );
  }

  if (houses.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white text-3xl">Loading...</div>;
  }

  // Dynamic classes based on state
  const containerClass = isFullScreen
    ? "fixed inset-0 z-[9999] bg-black p-4 md:p-8"
    : "min-h-[calc(100vh-4rem)] bg-black p-4 md:p-8";

  return (
    <div className={containerClass}>
      {/* Controls (hidden in fullscreen unless hovered, or maybe just a small trigger) */}
      <div className="absolute top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullScreen}
          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm"
          title="Toggle Full Screen"
        >
          {isFullScreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Responsive Grid: 1 col mobile, 2 cols landscape/tablet, 4 cols wide screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 h-full">
        {houses.map((house, index) => (
          <div
            key={house.id}
            className={`
              relative flex flex-col justify-center items-center 
              rounded-2xl p-6 shadow-2xl 
              ${house.color} 
              transition-all duration-500 ease-in-out
              ${index === 0 ? 'ring-4 ring-yellow-400 scale-[1.02] z-10' : 'opacity-90'}
            `}
          >
            {/* Rank Badge */}
            <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md text-white w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold border border-white/20">
              #{index + 1}
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <HouseIcon houseId={house.id} className="w-20 h-20 md:w-24 md:h-24 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-wide drop-shadow-md text-center uppercase break-words w-full">
                {house.name}
              </h2>
            </div>

            <div className="mt-6 bg-black/20 px-6 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-6xl md:text-7xl font-bold text-white tracking-tighter tabular-nums drop-shadow-xl">
                {house.points.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TvScreenPage;