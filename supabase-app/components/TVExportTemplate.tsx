import React from 'react';
import { House } from '../types';
import HouseIcon from './HouseIcon';

interface TVExportTemplateProps {
    houses: House[];
}

type HousePalette = {
    bg: string;
    border: string;
    text: string;
    textMuted: string;
    iconRing: string;
    iconBg: string;
    swirl: string;
    pointsLabel: string;
    divider: string;
};

const HOUSE_PALETTE: Record<string, HousePalette> = {
    pukeko: {
        bg: 'linear-gradient(135deg, #4A1D8F 0%, #3A1573 100%)',
        border: '#6B3FB8',
        text: '#FFFFFF',
        textMuted: 'rgba(255,255,255,0.72)',
        iconRing: 'rgba(255,255,255,0.18)',
        iconBg: 'rgba(255,255,255,0.95)',
        swirl: 'rgba(255,255,255,0.07)',
        pointsLabel: 'rgba(255,255,255,0.7)',
        divider: 'rgba(255,255,255,0.18)',
    },
    kotuku: {
        bg: 'linear-gradient(135deg, #FFFFFF 0%, #F4F6F9 100%)',
        border: '#D5DBE3',
        text: '#0E1A36',
        textMuted: 'rgba(14,26,54,0.55)',
        iconRing: '#E7EBF1',
        iconBg: '#FFFFFF',
        swirl: 'rgba(14,26,54,0.05)',
        pointsLabel: '#8A95A8',
        divider: 'rgba(14,26,54,0.10)',
    },
    korimako: {
        bg: 'linear-gradient(135deg, #FCF4DA 0%, #F7E9B9 100%)',
        border: '#E7C764',
        text: '#3B2A0E',
        textMuted: 'rgba(59,42,14,0.6)',
        iconRing: '#F1DC93',
        iconBg: '#FBEEC3',
        swirl: 'rgba(120,90,20,0.08)',
        pointsLabel: '#A88431',
        divider: 'rgba(120,90,20,0.18)',
    },
    kereru: {
        bg: 'linear-gradient(135deg, #E3F4E8 0%, #CDE9D7 100%)',
        border: '#7BC195',
        text: '#0F3320',
        textMuted: 'rgba(15,51,32,0.6)',
        iconRing: '#B3DCC2',
        iconBg: '#D9ECDF',
        swirl: 'rgba(15,80,40,0.08)',
        pointsLabel: '#2F7A4A',
        divider: 'rgba(15,80,40,0.16)',
    },
};

const DEFAULT_PALETTE: HousePalette = {
    bg: 'linear-gradient(135deg, #F4F6F9 0%, #E7EBF1 100%)',
    border: '#CBD2DB',
    text: '#0E1A36',
    textMuted: 'rgba(14,26,54,0.55)',
    iconRing: '#E7EBF1',
    iconBg: '#FFFFFF',
    swirl: 'rgba(14,26,54,0.05)',
    pointsLabel: '#8A95A8',
    divider: 'rgba(14,26,54,0.10)',
};

const RIBBON_BY_RANK: Record<number, { fill: string; shadow: string; text: string }> = {
    1: { fill: 'linear-gradient(180deg, #F5C545 0%, #D9A227 100%)', shadow: '#9C7414', text: '#3D2A05' },
    2: { fill: 'linear-gradient(180deg, #D6DCE2 0%, #A9B3BD 100%)', shadow: '#6E7782', text: '#1F2A3A' },
    3: { fill: 'linear-gradient(180deg, #EBC15A 0%, #C99536 100%)', shadow: '#8A6017', text: '#3D2A05' },
};

const getRibbon = (rank: number, palette: HousePalette) =>
    RIBBON_BY_RANK[rank] ?? {
        fill: `linear-gradient(180deg, ${palette.border} 0%, ${palette.border} 100%)`,
        shadow: palette.border,
        text: palette.text,
    };

// Decorative swirl flourish used in card backgrounds and page background
const Swirl: React.FC<{ color: string; style?: React.CSSProperties }> = ({ color, style }) => (
    <svg
        viewBox="0 0 400 400"
        fill="none"
        style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
        <path
            d="M40 200 C 40 110, 110 40, 200 40 C 290 40, 360 110, 360 200 C 360 260, 320 310, 260 310 C 220 310, 190 280, 190 240 C 190 215, 210 195, 235 195"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
        />
        <path
            d="M120 320 C 160 280, 220 280, 260 320"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
        />
    </svg>
);

// Top ornament — a stylised Aotea/Māori-inspired motif
const HeaderOrnament: React.FC = () => (
    <svg width="92" height="64" viewBox="0 0 92 64" fill="none">
        <path
            d="M46 4 C 30 4, 18 18, 18 34 C 18 46, 28 56, 40 56 C 48 56, 54 50, 54 42 C 54 36, 50 32, 44 32"
            stroke="#15235A"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
        />
        <path
            d="M46 4 C 62 4, 74 18, 74 34 C 74 46, 64 56, 52 56 C 44 56, 38 50, 38 42 C 38 36, 42 32, 48 32"
            stroke="#15235A"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
        />
        <circle cx="46" cy="34" r="3.5" fill="#15235A" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="#64748B" strokeWidth="1.8" />
        <path d="M3 10 H 21" stroke="#64748B" strokeWidth="1.8" />
        <path d="M8 3 V 7 M16 3 V 7" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const Ribbon: React.FC<{ rank: number; palette: HousePalette }> = ({ rank, palette }) => {
    const ribbon = getRibbon(rank, palette);
    const gradientStops = ribbon.fill.match(/#[0-9A-F]{6}/gi);
    const stopA = gradientStops?.[0] ?? palette.border;
    const stopB = gradientStops?.[1] ?? gradientStops?.[0] ?? palette.border;
    return (
        <div
            style={{
                position: 'absolute',
                top: -4,
                left: 40,
                width: 72,
                height: 108,
                filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.18))`,
                zIndex: 20,
            }}
        >
            <svg viewBox="0 0 72 108" width="72" height="108">
                <defs>
                    <linearGradient id={`ribbon-${rank}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stopA} />
                        <stop offset="100%" stopColor={stopB} />
                    </linearGradient>
                </defs>
                <path
                    d="M0 0 H 72 V 100 L 36 78 L 0 100 Z"
                    fill={`url(#ribbon-${rank})`}
                />
            </svg>
            <span
                style={{
                    position: 'absolute',
                    top: 14,
                    left: 0,
                    width: 72,
                    textAlign: 'center',
                    color: ribbon.text,
                    fontWeight: 900,
                    fontSize: 42,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    fontFamily: 'Montserrat, sans-serif',
                }}
            >
                {rank}
            </span>
        </div>
    );
};

// Rendered off-screen at exactly 1080x1920
export const TVExportTemplate = React.forwardRef<HTMLDivElement, TVExportTemplateProps>(
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
                style={{
                    width: '1080px',
                    height: '1920px',
                    background: 'linear-gradient(180deg, #F2F4F8 0%, #E9EDF3 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#0E1A36',
                }}
                className="flex flex-col"
            >
                {/* Page-background ornamental swirls */}
                <Swirl color="rgba(21,35,90,0.045)" style={{ top: -40, left: -80, width: 520, height: 520 }} />
                <Swirl color="rgba(21,35,90,0.045)" style={{ bottom: -60, right: -100, width: 560, height: 560, transform: 'rotate(180deg)' }} />

                {/* Header */}
                <div
                    style={{
                        paddingTop: 80,
                        paddingLeft: 48,
                        paddingRight: 48,
                        paddingBottom: 28,
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <HeaderOrnament />
                    </div>
                    <h1
                        style={{
                            fontSize: 102,
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 0.94,
                            margin: 0,
                            textTransform: 'uppercase',
                            color: '#15235A',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Aotea Whānau
                        <br />
                        Leaderboard
                    </h1>

                    {/* Diamond divider */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 18,
                            marginTop: 28,
                            marginBottom: 14,
                        }}
                    >
                        <div style={{ width: 160, height: 2, background: '#1E2D63', opacity: 0.35 }} />
                        <div
                            style={{
                                width: 14,
                                height: 14,
                                background: '#1E2D63',
                                opacity: 0.7,
                                transform: 'rotate(45deg)',
                            }}
                        />
                        <div style={{ width: 160, height: 2, background: '#1E2D63', opacity: 0.35 }} />
                    </div>
                    <p
                        style={{
                            fontSize: 34,
                            color: '#4B5778',
                            fontWeight: 700,
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            margin: 0,
                        }}
                    >
                        Current Standings
                    </p>
                </div>

                {/* Cards */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 28,
                        padding: '12px 56px 32px 56px',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {sortedHouses.map((house, index) => {
                        const palette = HOUSE_PALETTE[house.id.toLowerCase()] ?? DEFAULT_PALETTE;
                        const rank = index + 1;
                        const isLeader = rank === 1;

                        return (
                            <div
                                key={house.id}
                                style={{
                                    flex: 1,
                                    background: palette.bg,
                                    border: `4px solid ${palette.border}`,
                                    borderRadius: 40,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: 132,
                                    paddingRight: 40,
                                    boxShadow: isLeader
                                        ? `0 18px 48px ${palette.border}55, 0 0 0 1px rgba(255,255,255,0.4) inset`
                                        : `0 10px 28px rgba(14,26,54,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset`,
                                }}
                            >
                                {/* Decorative swirls on the right */}
                                <Swirl
                                    color={palette.swirl}
                                    style={{
                                        right: -120,
                                        top: -80,
                                        width: 480,
                                        height: 480,
                                    }}
                                />

                                <Ribbon rank={rank} palette={palette} />

                                {/* Icon */}
                                <div
                                    style={{
                                        width: 144,
                                        height: 144,
                                        borderRadius: 999,
                                        background: palette.iconBg,
                                        border: `7px solid ${palette.iconRing}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 10px 24px rgba(14,26,54,0.12)',
                                        zIndex: 10,
                                        marginRight: 28,
                                    }}
                                >
                                    <HouseIcon houseId={house.id} className="w-28 h-28" />
                                </div>

                                {/* Name */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minWidth: 0,
                                        flex: 1,
                                        zIndex: 10,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: palette.textMuted,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3em',
                                            marginBottom: 4,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Rank #{rank}
                                    </span>
                                    <h2
                                        style={{
                                            fontSize: 68,
                                            fontWeight: 900,
                                            color: palette.text,
                                            textTransform: 'uppercase',
                                            letterSpacing: '-0.035em',
                                            lineHeight: 0.95,
                                            margin: 0,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {house.name}
                                    </h2>
                                </div>

                                {/* Vertical divider */}
                                <div
                                    style={{
                                        width: 2,
                                        alignSelf: 'stretch',
                                        marginTop: 36,
                                        marginBottom: 36,
                                        background: palette.divider,
                                        marginLeft: 24,
                                        marginRight: 32,
                                        zIndex: 10,
                                    }}
                                />

                                {/* Points */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        zIndex: 10,
                                        width: 230,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 102,
                                            fontWeight: 900,
                                            color: palette.text,
                                            letterSpacing: '-0.05em',
                                            lineHeight: 0.92,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {house.points.toLocaleString()}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: palette.pointsLabel,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.32em',
                                            marginTop: 4,
                                        }}
                                    >
                                        Points
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer pill */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        paddingBottom: 48,
                        paddingTop: 4,
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 14,
                            padding: '16px 32px',
                            background: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(14,26,54,0.08)',
                            borderRadius: 999,
                            boxShadow: '0 4px 14px rgba(14,26,54,0.06)',
                        }}
                    >
                        <CalendarIcon />
                        <span
                            style={{
                                fontSize: 24,
                                color: '#475569',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                            }}
                        >
                            Last updated {exportDate}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

TVExportTemplate.displayName = 'TVExportTemplate';
