import React from 'react';
import { House } from '../types';
import { clsx } from 'clsx';
import HouseIcon from './HouseIcon';

interface IGExportTemplateProps {
    houses: House[];
}

// Rendered off-screen at exactly 1080x1080 (Instagram post)
export const IGExportTemplate = React.forwardRef<HTMLDivElement, IGExportTemplateProps>(
    ({ houses }, ref) => {
        const sortedHouses = [...houses].sort((a, b) => b.points - a.points);
        const exportDate = new Date().toLocaleDateString('en-NZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return (
            <div
                ref={ref}
                style={{ width: '1080px', height: '1080px' }}
                className="bg-white text-slate-950 flex flex-col font-sans overflow-hidden"
            >
                {/* Header */}
                <div className="pt-12 pb-6 px-12 text-center bg-white flex flex-col items-center justify-center">
                    <h1 className="text-[64px] font-black uppercase tracking-tighter leading-none mb-3">
                        Aotea Whānau Leaderboard
                    </h1>
                    <p className="text-[28px] text-slate-600 font-bold tracking-widest uppercase border-y-4 border-slate-200 py-2 px-8 inline-block">
                        Current Standings
                    </p>
                </div>

                {/* 2×2 Grid */}
                <div className="flex-1 grid grid-cols-2 grid-rows-2 px-10 pb-4 gap-6">
                    {sortedHouses.map((house, index) => {
                        const isLightColor = ['bg-white', 'bg-yellow-500', 'bg-yellow-400'].some(c => house.color.includes(c));

                        return (
                            <div
                                key={house.id}
                                className={clsx(
                                    "flex flex-col items-center justify-center rounded-[36px] border-6 relative overflow-hidden",
                                    house.color,
                                    index === 0 ? "border-slate-950 shadow-[0_0_80px_rgba(15,23,42,0.12)]" : "border-black/20 opacity-95"
                                )}
                            >
                                {/* Shine on leader */}
                                {index === 0 && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/25 to-transparent"></div>
                                )}

                                {/* Rank badge */}
                                <span className={clsx(
                                    "text-[22px] font-bold uppercase tracking-widest opacity-70 mb-2 z-10",
                                    isLightColor ? "text-slate-900" : "text-white"
                                )}>
                                    Rank #{index + 1}
                                </span>

                                {/* Icon */}
                                <div className={clsx(
                                    "w-28 h-28 rounded-full flex items-center justify-center border-4 mb-3 z-10",
                                    isLightColor ? "bg-black/10 border-black/20" : "bg-white/20 border-white/20 backdrop-blur-md"
                                )}>
                                    <HouseIcon houseId={house.id} className="w-22 h-22" />
                                </div>

                                {/* Name */}
                                <h2 className={clsx(
                                    "text-[46px] uppercase font-black tracking-tighter leading-none mb-2 z-10",
                                    isLightColor ? "text-slate-900" : "text-white"
                                )}>
                                    {house.name}
                                </h2>

                                {/* Points */}
                                <div className="flex flex-col items-center z-10">
                                    <span className={clsx(
                                        "text-[72px] font-black tabular-nums tracking-tighter leading-none",
                                        isLightColor ? "text-slate-900" : "text-white"
                                    )}>
                                        {house.points.toLocaleString()}
                                    </span>
                                    <span className={clsx(
                                        "text-[20px] font-bold uppercase tracking-widest opacity-70",
                                        isLightColor ? "text-slate-900" : "text-white"
                                    )}>
                                        Points
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-12 pb-8 pt-1 text-center">
                    <span className="text-[18px] text-slate-500 font-medium tracking-wide">
                        Last updated {exportDate}
                    </span>
                </div>
            </div>
        );
    }
);

IGExportTemplate.displayName = 'IGExportTemplate';
