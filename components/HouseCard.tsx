
import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { House } from '../types';
import HouseIcon from './HouseIcon';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HouseCardProps {
  house: House;
  rank: number;
  maxPoints: number;
}

const HouseCard: React.FC<HouseCardProps> = ({ house, rank, maxPoints }) => {
  const percentage = maxPoints > 0 ? (house.points / maxPoints) * 100 : 0;

  const rankColors: { [key: number]: string } = {
    1: 'border-aotea-gold/50 shadow-glow-gold bg-aotea-gold/10',
    2: 'border-slate-400/50 shadow-slate-400/20 bg-slate-800/40',
    3: 'border-amber-700/50 shadow-amber-700/20 bg-amber-900/20',
  };

  const rankText: { [key: number]: string } = {
    1: '1st Place', 2: '2nd Place', 3: '3rd Place', 4: '4th Place'
  };

  const isTop3 = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.02] group",
        isTop3 ? rankColors[rank] : "border-slate-700/30 bg-slate-800/30 shadow-lg",
        "flex flex-col h-full"
      )}
    >
      {/* Background Gradient Blob */}
      <div className={cn(
        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-30",
        house.color.replace('bg-', 'bg-') // Ensure we use the bg color
      )} />

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm",
                isTop3 ? "bg-white/10 text-white border border-white/10" : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
              )}>
                {rankText[rank]}
              </span>
            </div>
            <h2 className={cn("text-3xl sm:text-4xl font-black tracking-tight mt-1 truncate", house.textColor)}>
              {house.name}
            </h2>
          </div>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="drop-shadow-2xl flex-shrink-0"
          >
            <HouseIcon houseId={house.id} className="w-20 h-20 sm:w-24 sm:h-24" />
          </motion.div>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter tabular-nums">
              {house.points.toLocaleString()}
            </span>
            <span className="text-sm sm:text-base text-slate-400 font-medium uppercase tracking-wide">points</span>
          </div>

          <div className="relative h-4 w-full bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden", house.color)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HouseCard;
