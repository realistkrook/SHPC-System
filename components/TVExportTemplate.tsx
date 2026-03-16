import React from 'react';
import { House } from '../types';
import { clsx } from 'clsx';
import HouseIcon from './HouseIcon';

interface TVExportTemplateProps {
    houses: House[];
}

// Rendered off-screen at exactly 1080x1920
export const TVExportTemplate = React.forwardRef<HTMLDivElement, TVExportTemplateProps>(
    ({ houses }, ref) => {
        // Sort houses by points descending
        const sortedHouses = [...houses].sort((a, b) => b.points - a.points);

        return (
            <div
                ref={ref}
                style={{ width: '1080px', height: '1920px' }}
                className="bg-black text-white flex flex-col font-sans overflow-hidden"
            >
                {/* Header - Brutalist & Clean */}
                <div className="pt-24 pb-12 px-16 text-center z-10 bg-black flex flex-col items-center justify-center">
                    <h1 className="text-[110px] font-black uppercase tracking-tighter leading-none mb-6">
                        Aotea House Leaderboard
                    </h1>
                    <p className="text-[45px] text-gray-400 font-bold tracking-widest uppercase border-y-4 border-gray-800 py-4 px-12 inline-block">
                        Current Standings
                    </p>
                </div>

                {/* Dynamic brutalist layout based on houses */}
                <div className="flex-1 flex flex-col w-full h-full pb-16 px-16 gap-10">
                    {sortedHouses.map((house, index) => {
                        // Check if house color is naturally bright
                        const isLightColor = ['bg-white', 'bg-yellow-500', 'bg-yellow-400'].some(c => house.color.includes(c));

                        return (
                            <div
                                key={house.id}
                                className={clsx(
                                    "flex-1 flex items-center justify-between rounded-[48px] border-8 transition-none",
                                    house.color,
                                    index === 0 ? "border-white shadow-[0_0_120px_rgba(255,255,255,0.4)] relative overflow-hidden" : "border-black/20 opacity-95",
                                    "pl-8 pr-16"
                                )}
                            >
                                {/* Subtle shine effect on the leader */}
                                {index === 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-1/2"></div>
                                )}

                                <div className="flex items-center gap-6 z-10 flex-1 min-w-0">
                                    <div className={clsx("w-40 h-40 rounded-full flex items-center justify-center border-4 shrink-0", isLightColor ? "bg-black/10 border-black/20" : "bg-white/20 border-white/20 backdrop-blur-md")}>
                                        <HouseIcon houseId={house.id} className="w-32 h-32" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={clsx("text-4xl font-bold opacity-80 uppercase tracking-widest mb-1 whitespace-nowrap", isLightColor ? "text-slate-900" : "text-white")}>
                                            Rank #{index + 1}
                                        </span>
                                        <h2 className={clsx("text-[80px] uppercase font-black tracking-tighter leading-none whitespace-nowrap", isLightColor ? "text-slate-900" : "text-white")}>
                                            {house.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="z-10 flex flex-col justify-center items-end shrink-0 pl-6">
                                    <span className={clsx("text-[120px] font-black tabular-nums tracking-tighter leading-none mb-2", isLightColor ? "text-slate-900" : "text-white")}>
                                        {house.points.toLocaleString()}
                                    </span>
                                    <span className={clsx("text-3xl font-bold uppercase tracking-widest opacity-80", isLightColor ? "text-slate-900" : "text-white")}>
                                        Points
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

TVExportTemplate.displayName = 'TVExportTemplate';
