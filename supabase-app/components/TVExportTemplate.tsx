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
        bg: 'linear-gradient(135deg, #A8D9B8 0%, #6DB484 100%)',
        border: '#3C7C53',
        text: '#082817',
        textMuted: 'rgba(8,40,23,0.66)',
        iconRing: '#BFE0CB',
        iconBg: '#E3F0E8',
        swirl: 'rgba(8,60,30,0.18)',
        pointsLabel: '#1B5A35',
        divider: 'rgba(8,40,23,0.22)',
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

type RibbonStyle = { stopA: string; stopB: string; highlight: string; shadow: string; text: string };

const RIBBON_BY_RANK: Record<number, RibbonStyle> = {
    1: { stopA: '#FFE08A', stopB: '#C68A1A', highlight: '#FFF1B8', shadow: 'rgba(120,80,8,0.55)', text: '#3D2A05' },
    2: { stopA: '#EEF1F4', stopB: '#9CA8B3', highlight: '#FFFFFF', shadow: 'rgba(60,70,82,0.5)', text: '#1F2A3A' },
    3: { stopA: '#F3CE6E', stopB: '#A8761F', highlight: '#FBE6A8', shadow: 'rgba(110,72,12,0.5)', text: '#3D2A05' },
};

const getRibbon = (rank: number, palette: HousePalette): RibbonStyle =>
    RIBBON_BY_RANK[rank] ?? {
        stopA: palette.border,
        stopB: palette.border,
        highlight: 'rgba(255,255,255,0.6)',
        shadow: 'rgba(0,0,0,0.3)',
        text: palette.text,
    };

// Page-background generic spiral (kept for the corners of the page)
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

// Kōwhaiwhai-inspired Māori pattern — flowing koru spirals with bulb terminations
const KowhaiwhaiPattern: React.FC<{ color: string; style?: React.CSSProperties }> = ({ color, style }) => (
    <svg
        viewBox="0 0 520 360"
        fill="none"
        style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
        {/* Large koru spiral */}
        <path
            d="M 40 200
               C 40 110, 110 40, 210 40
               C 310 40, 380 110, 380 200
               C 380 258, 340 300, 280 300
               C 240 300, 210 270, 210 230
               C 210 205, 230 185, 255 185
               C 270 185, 280 195, 280 208"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
        />
        <circle cx="280" cy="208" r="9" fill={color} />

        {/* Secondary tight koru */}
        <path
            d="M 380 100
               C 380 78, 398 60, 422 60
               C 446 60, 464 78, 464 102
               C 464 118, 452 130, 436 130
               C 426 130, 418 122, 418 112"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
        />
        <circle cx="418" cy="112" r="6" fill={color} />

        {/* Connecting flourish */}
        <path
            d="M 60 320
               C 110 280, 170 280, 210 310"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
        />

        {/* Pātiki (diamond) accents */}
        <path d="M 440 220 L 460 240 L 440 260 L 420 240 Z" stroke={color} strokeWidth="6" fill="none" strokeLinejoin="round" />
        <circle cx="440" cy="240" r="3" fill={color} />
    </svg>
);

// Aotea school logo, recolored from white → navy via a CSS filter chain.
// brightness(0) flattens to black (preserving alpha), then invert+sepia+saturate+hue-rotate
// shifts the colour to #15235A (Aotea navy). Filter generated for the specific target color.
const AoteaMark: React.FC<{ size?: number }> = ({ size = 78 }) => (
    <img
        src="/images/aoteawhitelogo.png"
        alt="Aotea College"
        style={{
            width: size,
            height: size,
            objectFit: 'contain',
            filter:
                'brightness(0) saturate(100%) invert(11%) sepia(63%) saturate(2400%) hue-rotate(220deg) brightness(86%) contrast(96%)',
        }}
    />
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
    const isLeader = rank === 1;
    const W = isLeader ? 84 : 72;
    const H = isLeader ? 124 : 108;
    const NOTCH = isLeader ? 26 : 22;
    const fontSize = isLeader ? 50 : 42;
    const top = isLeader ? -6 : -4;
    const left = isLeader ? 32 : 40;
    const gid = `ribbon-${rank}`;
    const hid = `ribbon-hl-${rank}`;
    return (
        <div
            style={{
                position: 'absolute',
                top,
                left,
                width: W,
                height: H,
                filter: `drop-shadow(0 ${isLeader ? 8 : 4}px ${isLeader ? 14 : 6}px ${ribbon.shadow})`,
                zIndex: 30,
            }}
        >
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ribbon.stopA} />
                        <stop offset="55%" stopColor={ribbon.stopB} />
                        <stop offset="100%" stopColor={ribbon.stopB} />
                    </linearGradient>
                    <linearGradient id={hid} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={ribbon.highlight} stopOpacity="0.85" />
                        <stop offset="100%" stopColor={ribbon.highlight} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Base ribbon shape */}
                <path
                    d={`M0 0 H ${W} V ${H - 8} L ${W / 2} ${H - NOTCH - 8} L 0 ${H - 8} Z`}
                    fill={`url(#${gid})`}
                />

                {/* Inner highlight stripe on the left edge */}
                <path
                    d={`M0 0 H 14 V ${H - 8 - 6} L 7 ${H - NOTCH - 8 - 3} L 0 ${H - 8 - 6} Z`}
                    fill={`url(#${hid})`}
                />

                {/* Subtle bottom-edge shadow inside the notch for depth */}
                <path
                    d={`M0 ${H - 8} L ${W / 2} ${H - NOTCH - 8} L ${W} ${H - 8} L ${W / 2} ${H - NOTCH - 8 + 4} Z`}
                    fill={ribbon.stopB}
                    opacity="0.35"
                />

                {/* Subtle inner stroke for definition */}
                <path
                    d={`M2 0 H ${W - 2} V ${H - 10} L ${W / 2} ${H - NOTCH - 10} L 2 ${H - 10} Z`}
                    stroke="rgba(0,0,0,0.10)"
                    strokeWidth="1"
                    fill="none"
                />
            </svg>

            {/* Leader sparkle accent */}
            {isLeader && (
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    style={{ position: 'absolute', top: -10, right: -10 }}
                >
                    <path
                        d="M11 1 L13 9 L21 11 L13 13 L11 21 L9 13 L1 11 L9 9 Z"
                        fill="#FFE890"
                        stroke="#C68A1A"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                </svg>
            )}

            <span
                style={{
                    position: 'absolute',
                    top: isLeader ? 18 : 14,
                    left: 0,
                    width: W,
                    textAlign: 'center',
                    color: ribbon.text,
                    fontWeight: 900,
                    fontSize,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    fontFamily: 'Montserrat, sans-serif',
                    textShadow: isLeader ? '0 1px 0 rgba(255,255,255,0.4)' : 'none',
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
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                        <AoteaMark size={84} color="#15235A" />
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
                                    paddingLeft: 52,
                                    paddingRight: 32,
                                    boxShadow: isLeader
                                        ? `0 18px 48px ${palette.border}55, 0 0 0 1px rgba(255,255,255,0.4) inset`
                                        : `0 10px 28px rgba(14,26,54,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset`,
                                }}
                            >
                                {/* Kowhaiwhai pattern on the right */}
                                <KowhaiwhaiPattern
                                    color={palette.swirl}
                                    style={{
                                        right: -60,
                                        top: -40,
                                        width: 520,
                                        height: 360,
                                    }}
                                />

                                <Ribbon rank={rank} palette={palette} />

                                {/* Icon — sits as far left as the ribbon allows */}
                                <div
                                    style={{
                                        width: 140,
                                        height: 140,
                                        borderRadius: 999,
                                        background: palette.iconBg,
                                        border: `7px solid ${palette.iconRing}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 10px 24px rgba(14,26,54,0.12)',
                                        zIndex: 10,
                                        marginRight: 24,
                                    }}
                                >
                                    <HouseIcon houseId={house.id} className="w-28 h-28" />
                                </div>

                                {/* House name (no rank label — the ribbon shows the rank) */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        minWidth: 0,
                                        flex: 1,
                                        zIndex: 10,
                                    }}
                                >
                                    <h2
                                        style={{
                                            fontSize: 88,
                                            fontWeight: 900,
                                            color: palette.text,
                                            textTransform: 'uppercase',
                                            letterSpacing: '-0.045em',
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
                                        marginLeft: 20,
                                        marginRight: 28,
                                        zIndex: 10,
                                    }}
                                />

                                {/* Points — wide enough for 4 digits */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        zIndex: 10,
                                        width: 220,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 88,
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
                                            fontSize: 24,
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
