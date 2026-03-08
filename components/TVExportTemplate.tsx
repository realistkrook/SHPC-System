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
                style={{ width: '1080px', height: '1920px', position: 'absolute', left: '-9999px', top: '-9999px' }}
                className="bg-black text-white flex flex-col font-sans overflow-hidden"
            >
                {/* Header - Brutalist & Clean */}
                <div className="pt-24 pb-12 px-16 text-center z-10 bg-black flex flex-col items-center justify-center">
                    <h1 className="text-[110px] font-black uppercase tracking-tighter leading-none mb-6">
                        Aotea Leaderboard
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
                                    "px-16"
                                )}
                            >
                                {/* Subtle shine effect on the leader */}
                                {index === 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-1/2"></div>
                                )}

                                <div className="flex items-center gap-16 z-10 w-[65%]">
                                    <div className={clsx("w-56 h-56 rounded-full flex items-center justify-center border-4", isLightColor ? "bg-black/10 border-black/20" : "bg-white/20 border-white/20 backdrop-blur-md shrink-0")}>
                                        <HouseIcon houseId={house.id} className="w-36 h-36" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={clsx("text-5xl font-bold opacity-80 uppercase tracking-widest mb-2", isLightColor ? "text-slate-900" : "text-white")}>
                                            Rank #{index + 1}
                                        </span>
                                        <h2 className={clsx("text-[120px] uppercase font-black tracking-tighter leading-[0.85] truncate max-w-[500px]", isLightColor ? "text-slate-900" : "text-white")}>
                                            {house.name}
                                        </h2>
                                    </div>
                                </div>

                                <div className="z-10 flex flex-col justify-end items-end w-[35%] py-8">
                                    <span className={clsx("text-[150px] font-black tabular-nums tracking-tighter leading-none mb-4", isLightColor ? "text-slate-900" : "text-white")}>
                                        {house.points.toLocaleString()}
                                    </span>
                                    <span className={clsx("text-4xl font-bold uppercase tracking-widest opacity-80", isLightColor ? "text-slate-900" : "text-white")}>
                                        Points
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="h-40 bg-zinc-950 flex flex-col items-center justify-center border-t-[12px] border-zinc-900 mt-auto">
                    <p className="text-5xl text-zinc-600 font-bold uppercase tracking-widest">
                        Generated {new Date().toLocaleDateString('en-NZ')}
                    </p>
                </div>
            </div>
        );
    }
);

TVExportTemplate.displayName = 'TVExportTemplate';
