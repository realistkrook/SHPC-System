import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { House } from '../types';
import HouseIcon from '../components/HouseIcon';
import { clsx } from 'clsx';

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

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Error</h2>
        <p className="font-mono bg-slate-900 p-4 rounded-md border border-red-500/20">{error}</p>
      </div>
    );
  }

  if (houses.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white text-3xl font-light tracking-widest uppercase">Loading...</div>;
  }

  // Dynamic classes based on state
  const containerClass = isFullScreen
    ? "fixed inset-0 z-[9999] bg-slate-950 p-4 md:p-8 flex flex-col"
    : "min-h-[calc(100vh-4rem)] bg-slate-950 p-4 md:p-8 flex flex-col";

  return (
    <div ref={containerRef} className={containerClass}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleFullScreen}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors shadow-lg border border-white/10"
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 h-full">
        {houses.map((house, index) => (
          <div
            key={house.id}
            className={clsx(
              "relative flex flex-col justify-center items-center rounded-3xl p-8 shadow-2xl transition-all duration-500 ease-in-out overflow-hidden",
              house.color,
              index === 0 ? 'ring-4 ring-aotea-gold scale-[1.02] z-10 shadow-glow-gold' : 'opacity-90 hover:opacity-100'
            )}
          >
            {/* Background Gradient Blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Rank Badge */}
            <div className={clsx(
              "absolute top-6 left-6 w-16 h-16 flex items-center justify-center rounded-full text-2xl font-black border backdrop-blur-md shadow-lg z-20",
              index === 0 ? "bg-aotea-gold text-slate-900 border-white/50" : "bg-black/30 text-white border-white/20"
            )}>
              #{index + 1}
            </div>

            {/* Dynamic content styling based on background brightness */}
            {(() => {
              const isLight = ['bg-white', 'bg-yellow-500', 'bg-yellow-400'].some(c => house.color.includes(c));
              const textColor = isLight ? "text-slate-900" : "text-white";
              const iconBg = isLight ? "bg-black/10 shadow-xl" : "bg-white/20 shadow-inner";

              return (
                <>
                  <div className="flex flex-col items-center space-y-6 relative z-10 w-full">
                    <div className={clsx("p-6 rounded-full backdrop-blur-md", iconBg)}>
                      <HouseIcon houseId={house.id} className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
                    </div>
                    <h2 className={clsx("text-4xl md:text-5xl lg:text-6xl font-black tracking-wide drop-shadow-md text-center uppercase break-words w-full leading-none", textColor)}>
                      {house.name}
                    </h2>
                  </div>

                  <div className="mt-8 bg-black/20 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10 relative z-10">
                    <p className={clsx("text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter tabular-nums drop-shadow-xl leading-none", textColor)}>
                      {house.points.toLocaleString()}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TvScreenPage;