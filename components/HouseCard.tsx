
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
    1: 'border-yellow-400/50 shadow-yellow-400/20 bg-yellow-900/20',
    2: 'border-gray-400/50 shadow-gray-400/20 bg-gray-800/40',
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
        "relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.02]",
        isTop3 ? rankColors[rank] : "border-gray-700/30 bg-gray-800/30 shadow-lg",
        "flex flex-col"
      )}
    >
      {/* Background Gradient Blob */}
      <div className={cn(
        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none",
        house.color.replace('bg-', 'bg-') // Ensure we use the bg color
      )} />

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={cn(
                "text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                isTop3 ? "bg-white/10 text-white" : "bg-gray-700/50 text-gray-400"
              )}>
                {rankText[rank]}
              </span>
            </div>
            <h2 className={cn("text-4xl font-black tracking-tight mt-2", house.textColor)}>
              {house.name}
            </h2>
          </div>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="drop-shadow-2xl"
          >
            <HouseIcon houseId={house.id} className="w-20 h-20" />
          </motion.div>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-6xl font-black text-white tracking-tighter">
              {house.points.toLocaleString()}
            </span>
            <span className="text-lg text-gray-400 font-medium uppercase tracking-wide">points</span>
          </div>

          <div className="relative h-3 w-full bg-gray-700/30 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]", house.color)}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HouseCard;
