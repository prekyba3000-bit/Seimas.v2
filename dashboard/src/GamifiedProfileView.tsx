import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Radio, Cpu, Lock, Crosshair, Terminal, ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// --- TYPES ---
interface MP {
    id: string;
    name: string;
    photo: string;
    party: string;
    stats: {
        attendance: number;
        loyalty: number;
        votes_participated: number;
    };
    recent_votes: any[];
}

// --- ASSETS & STYLES ---
const COLORS = {
    obsidian: '#050505',
    slate: '#1C2331',
    gold: '#C5A059',
    blue: '#2D9CDB',
    red: '#EB5757',
    termGreen: '#4AF626'
};

const FONTS = {
    header: '"Cinzel", serif',
    data: '"Share Tech Mono", monospace',
    code: '"Fira Code", monospace'
};

// --- COMPONENTS ---

const RadarChart = ({ stats }: { stats: number[] }) => {
    // Simple pentagon SVG implementation
    const points = stats.map((val, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (val / 100) * 50;
        return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(' ');

    return (
        <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_10px_rgba(45,156,219,0.3)]">
                {/* Grid */}
                {[20, 40, 60, 80, 100].map(r => (
                    <circle key={r} cx="50" cy="50" r={r / 2} fill="none" stroke={COLORS.blue} strokeOpacity="0.1" />
                ))}
                {/* Data */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    points={points}
                    fill={COLORS.blue}
                    stroke={COLORS.blue}
                    strokeWidth="1"
                />
            </svg>
            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] text-blue-300 font-mono tracking-widest">STRATEGY</div>
            <div className="absolute top-[30%] right-0 translate-x-4 text-[10px] text-blue-300 font-mono tracking-widest">INTEGRITY</div>
            <div className="absolute bottom-[10%] right-0 translate-x-2 text-[10px] text-blue-300 font-mono tracking-widest">FUNDING</div>
            <div className="absolute bottom-[10%] left-0 -translate-x-2 text-[10px] text-blue-300 font-mono tracking-widest">ORATORY</div>
            <div className="absolute top-[30%] left-0 -translate-x-6 text-[10px] text-blue-300 font-mono tracking-widest">POPULARITY</div>

        </div>
    );
};

const SkillNode = ({ label, active, locked }: { label: string, active?: boolean, locked?: boolean }) => (
    <div className={`relative flex flex-col items-center group ${locked ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
        <div className={`
            w-12 h-12 border-2 rotate-45 flex items-center justify-center transition-all duration-500
            ${active ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(197,160,89,0.4)]' : 'border-gray-700 bg-gray-900'}
        `}>
            {locked ? <Lock className="w-4 h-4 -rotate-45 text-gray-500" /> : <Cpu className={`w-5 h-5 -rotate-45 ${active ? 'text-amber-400' : 'text-gray-500'}`} />}
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-wider text-center font-mono text-gray-400 w-24">
            {label}
        </div>
        {/* Connection Lines simulation */}
        {!locked && <div className="absolute top-1/2 left-full w-8 h-[2px] bg-gray-800 -z-10" />}
    </div>
);

const QuestItem = ({ title, progress, reward }: { title: string, progress: number, reward: string }) => (
    <div className="relative p-3 bg-slate-900/50 border-l-2 border-l-blue-500 mb-2 overflow-hidden group hover:bg-slate-800/80 transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-mono text-blue-300 uppercase">{title}</span>
            <span className="text-[10px] font-mono text-amber-500">{reward}</span>
        </div>
        <div className="w-full h-1 bg-gray-800 mt-1 relative">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-500 shadow-[0_0_8px_rgba(45,156,219,0.6)]"
            />
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
);

// --- MAIN VIEW ---

const GamifiedProfileView = ({ mpId }: { mpId: string }) => {
    const [mp, setMp] = useState<MP | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/mps/${mpId}`)
            .then(res => res.json())
            .then(data => {
                setMp(data);
                setLoading(false);
            });
    }, [mpId]);

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-amber-500 font-mono animate-pulse">INITIALIZING NEURAL LINK...</div>;
    if (!mp) return <div>Data Corrupted.</div>;

    // Mock RPG Stats derived from real data
    const hp = mp.stats.attendance; // Attendance = Health
    const mana = mp.stats.loyalty; // Loyalty = Trust/Mana
    const xp = mp.stats.votes_participated;
    const level = Math.floor(xp / 100) + 1;

    // Mock Radar Stats (Deterministic pseudo-random based on ID)
    const idNum = parseInt(mp.id.replace(/\D/g, '') || '0', 10);
    const radarStats = [
        (idNum % 40) + 60, // Strategy
        mp.stats.attendance, // Integrity
        (idNum * 3 % 40) + 50, // Funding
        (idNum * 7 % 30) + 70, // Oratory
        mp.stats.loyalty // Popularity
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 overflow-hidden relative selection:bg-amber-500/30">
            {/* Ambient Background VFX */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* --- TOP BAR (COMMANDER) --- */}
            <header className="flex justify-between items-center p-4 border-b border-gray-800/50 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.location.hash = '#/mps'} className="hover:text-amber-400 transition-colors">
                        <ChevronLeft />
                    </button>
                    <div className="w-10 h-10 border border-amber-500/30 flex items-center justify-center rotate-45">
                        <Shield className="w-6 h-6 text-amber-500 -rotate-45" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[0.2em] text-white" style={{ fontFamily: FONTS.header }}>
                            {mp.party.split(' ')[0]} FACTION
                        </h1>
                        <div className="text-[10px] font-mono text-amber-500/70 flex gap-4">
                            <span>ALIGNMENT: LAWFUL NEUTRAL</span>
                            <span>SECTOR: 12-ALPHA</span>
                        </div>
                    </div>
                </div>

                {/* Global Ticker */}
                <div className="hidden md:flex gap-8 font-mono text-xs">
                    <div className="flex items-center gap-2 text-termGreen">
                        <Activity className="w-4 h-4" />
                        NAT. SENTIMENT: +0.4% ▲
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                        <Radio className="w-4 h-4 animate-pulse" />
                        NETWAY STATUS: ONLINE
                    </div>
                    <div className="text-red-500 font-bold animate-pulse">
                        RESET: 312D 14H
                    </div>
                </div>
            </header>

            <main className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-80px)]">

                {/* --- LEFT COL: HERO SECTOR (25%) --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Portrait */}
                    <div className="relative aspect-[3/4] border-2 border-gray-800 bg-[#0a0a0c] overflow-hidden group">
                        {/* Holographic Effect Overlay */}
                        <div className="absolute inset-0 z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />
                        <div className="absolute inset-0 z-20 opacity-20 bg-gradient-to-t from-blue-500/20 to-transparent animate-pulse" />

                        <img
                            src={mp.photo}
                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            style={{ filter: 'contrast(1.2) brightness(0.9)' }}
                        />

                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
                            <div className="text-amber-500 text-xs font-mono tracking-widest mb-1">LVL {level} OPERATIVE</div>
                            <div className="text-2xl text-white font-bold uppercase tracking-wider" style={{ fontFamily: FONTS.header }}>
                                {mp.name.split(' ').pop()}
                            </div>
                        </div>

                        {/* Rank Insignia */}
                        <div className="absolute top-4 right-4 z-30 drop-shadow-[0_0_8px_rgba(197,160,89,0.8)]">
                            <Shield className="w-8 h-8 text-amber-500 fill-amber-500/20" />
                        </div>
                    </div>

                    {/* Vitals Panel */}
                    <div className="bg-slate-900/50 p-4 border border-gray-800 backdrop-blur-sm relative overflow-hidden">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 p-1">
                            <div className="w-2 h-2 bg-amber-500" />
                        </div>

                        <div className="space-y-4 font-mono text-xs">
                            <div>
                                <div className="flex justify-between mb-1 text-red-400">
                                    <span>HP (POLITICAL CAPITAL)</span>
                                    <span>{hp}%</span>
                                </div>
                                <div className="h-1.5 bg-red-900/30 w-full">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${hp}%` }}
                                        className="h-full bg-red-500 shadow-[0_0_8px_rgba(235,87,87,0.6)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1 text-blue-400">
                                    <span>MP (PUBLIC TRUST)</span>
                                    <span>{mana}%</span>
                                </div>
                                <div className="h-1.5 bg-blue-900/30 w-full">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${mana}%` }}
                                        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(45,156,219,0.6)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1 text-amber-400">
                                    <span>XP (VOTES)</span>
                                    <span>{xp} / {level * 100}</span>
                                </div>
                                <div className="h-1.5 bg-amber-900/30 w-full">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${(xp % 100)}%` }}
                                        className="h-full bg-amber-500 shadow-[0_0_8px_rgba(197,160,89,0.6)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CENTER: TACTICAL DASHBOARD (50%) --- */}
                <div className="lg:col-span-2 flex flex-col gap-6 relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 border border-gray-800/30 bg-[rgba(28,35,49,0.3)] backdrop-blur-sm -z-10" />
                    <div className="absolute -inset-[1px] border border-transparent border-t-amber-500/20 border-b-amber-500/20 pointer-events-none" />

                    {/* Top Section: Radar & Skills */}
                    <div className="grid grid-cols-2 gap-6 p-6 flex-1">
                        <div className="flex flex-col items-center justify-center border-r border-gray-800/50">
                            <h3 className="text-amber-500 font-mono text-sm tracking-[0.2em] mb-4">ATTRIBUTE MATRIX</h3>
                            <RadarChart stats={radarStats} />
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <h3 className="text-amber-500 font-mono text-sm tracking-[0.2em] mb-8">POLICY SYNERGY</h3>
                            <div className="flex gap-8 relative">
                                <SkillNode label="Green Energy" active />
                                <SkillNode label="Tax Reform" locked />
                                <SkillNode label="Defense Logic" active />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Active Quests */}
                    <div className="p-6 border-t border-gray-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold tracking-widest text-sm" style={{ fontFamily: FONTS.header }}>ACTIVE DIRECTIVES</h3>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-mono text-green-500">LIVE FEED</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {mp.recent_votes.slice(0, 3).map((vote, i) => (
                                <QuestItem
                                    key={i}
                                    title={vote.title}
                                    progress={Math.random() * 80 + 20}
                                    reward={`+${Math.floor(Math.random() * 50)} REP`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COL: INTEL FEED (25%) --- */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900/80 border border-gray-700 h-full p-4 flex flex-col font-mono text-xs overflow-hidden">
                        <h3 className="text-blue-400 mb-4 flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            COMMS_LOG
                        </h3>
                        <div className="space-y-3 flex-1 overflow-y-auto text-gray-400 custom-scrollbar opacity-80">
                            <div className="text-gray-500 border-l-2 border-gray-700 pl-2">
                                [SYSTEM]: Connection established to LRS_MAIN.
                            </div>
                            <div className="text-amber-500/80 border-l-2 border-amber-500/50 pl-2">
                                [ALERT]: New legislation proposed by Opposition.
                            </div>
                            <div className="text-gray-500 border-l-2 border-gray-700 pl-2">
                                [{mp.name.split(' ')[0].toUpperCase()}]: Vote cast "Už" on Project XIV.
                            </div>
                            <div className="text-blue-400 border-l-2 border-blue-500 pl-2">
                                [ANALYTICS]: Public trust increasing (+0.2%).
                            </div>
                            <div className="text-gray-500 border-l-2 border-gray-700 pl-2">
                                [SYSTEM]: Backup routine initiated.
                            </div>
                        </div>

                        {/* Inventory / Items */}
                        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-2">
                            <div className="aspect-square border border-gray-600 bg-gray-900/50 flex items-center justify-center hover:border-amber-500 transition-colors group cursor-not-allowed">
                                <Lock className="w-6 h-6 text-gray-700 group-hover:text-amber-500" />
                            </div>
                            <div className="aspect-square border border-gray-600 bg-gray-900/50 flex items-center justify-center hover:border-blue-500 transition-colors group cursor-pointer group relative">
                                <Zap className="w-6 h-6 text-blue-500" />
                                <div className="absolute bottom-1 right-1 text-[8px] text-blue-300">VETO</div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default GamifiedProfileView;
