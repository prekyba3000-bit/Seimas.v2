import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Vote, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from './config';

// Stat Card for profile
const ProfileStat = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <div className="glass p-4 flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-semibold">{value}</div>
        </div>
    </div>
);

// Vote Choice Badge
const VoteBadge = ({ choice }: { choice: string }) => {
    const colors: Record<string, string> = {
        'Už': 'bg-green-500/20 text-green-400',
        'Prieš': 'bg-red-500/20 text-red-400',
        'Susilaikė': 'bg-yellow-500/20 text-yellow-400',
        'Nedalyvavo': 'bg-gray-500/20 text-gray-400'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs ${colors[choice] || colors['Nedalyvavo']}`}>
            {choice}
        </span>
    );
};

interface MpProfileLayoutProps {
    mp: any;
    votes: any[];
    loading?: boolean;
}

// Pure Presentational Component
export const MpProfileLayout = ({ mp, votes, loading = false }: MpProfileLayoutProps) => {
    if (loading) {
        return (
            <div className="glass p-12 text-center text-gray-400">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                Loading profile...
            </div>
        );
    }

    if (!mp) {
        return (
            <div className="glass p-12 text-center">
                <p className="text-gray-400 mb-4">MP not found</p>
                <a href="#/mps" className="text-blue-500 hover:underline">← Back to list</a>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
        >
            {/* Back Button */}
            <a
                href="#/mps"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to MPs
            </a>

            {/* Profile Header */}
            <div className="glass p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                <img
                    src={mp.photo}
                    alt={mp.name}
                    className="w-24 h-24 rounded-2xl object-cover bg-gray-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%239CA3AF" font-size="40">MP</text></svg>'; }}
                />
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold">{mp.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mt-1">
                        <Building2 className="w-4 h-4" />
                        {mp.party || 'Independent'}
                    </div>
                    {mp.active && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                            Active Member
                        </span>
                    )}
                </div>
                <a
                    href={`https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=seimo_narys&p_asm_id=${mp.seimas_id || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-lg text-sm transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Official Profile
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ProfileStat label="Total Votes" value={mp.vote_count?.toString() || '—'} icon={Vote} />
                <ProfileStat label="Attendance" value={mp.attendance ? `${mp.attendance}%` : '—'} icon={TrendingUp} />
                <ProfileStat label="Party Loyalty" value={mp.loyalty ? `${mp.loyalty}%` : '—'} icon={Building2} />
                <ProfileStat label="Term Start" value={mp.term_start || '—'} icon={Calendar} />
            </div>

            {/* Recent Votes */}
            <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Votes</h2>
                {votes.length > 0 ? (
                    <div className="space-y-3">
                        {votes.slice(0, 10).map((vote: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm truncate">{vote.title}</div>
                                    <div className="text-xs text-gray-500">{vote.date}</div>
                                </div>
                                <VoteBadge choice={vote.choice} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No voting records available</p>
                )}
            </div>

            {/* Compare CTA */}
            <div className="glass p-6 text-center">
                <p className="text-gray-400 text-sm mb-3">Want to compare this MP with others?</p>
                <a
                    href="#/compare"
                    className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                    Compare MPs
                </a>
            </div>
        </motion.div>
    );
};

// Container Component (Data Fetching)
const MpProfileView = ({ mpId }: { mpId: string }) => {
    const [mp, setMp] = useState<any>(null);
    const [votes, setVotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!mpId) return;

        Promise.all([
            fetch(`${API_URL}/api/mps/${mpId}`).then(r => r.ok ? r.json() : null),
            fetch(`${API_URL}/api/mps/${mpId}/votes`).then(r => r.ok ? r.json() : [])
        ])
            .then(([mpData, votesData]) => {
                setMp(mpData);
                setVotes(votesData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load MP', err);
                setLoading(false);
            });
    }, [mpId]);

    return <MpProfileLayout mp={mp} votes={votes} loading={loading} />;
};

export default MpProfileView;
