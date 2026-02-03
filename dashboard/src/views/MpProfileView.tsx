import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Vote, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// Stat Card for profile
const ProfileStat = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <Card className="flex items-center gap-3 p-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</div>
            <div className="font-bold text-lg">{value}</div>
        </div>
    </Card>
);

// Vote Choice Badge
const VoteBadge = ({ choice }: { choice: string }) => {
    const colors: Record<string, string> = {
        'Už': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Prieš': 'bg-red-500/10 text-red-400 border-red-500/20',
        'Susilaikė': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        'Nedalyvavo': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${colors[choice] || colors['Nedalyvavo']}`}>
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
            <Card className="p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
                Loading profile data...
            </Card>
        );
    }

    if (!mp) {
        return (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-400 mb-4">MP not found</p>
                <Button variant="ghost" onClick={() => window.location.hash = '#/mps'}>← Back to list</Button>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Back Button */}
            <div>
                <Button variant="ghost" className="pl-0 gap-2 text-gray-400 hover:text-white" onClick={() => window.location.hash = '#/mps'}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to MPs
                </Button>
            </div>

            {/* Profile Header */}
            <Card className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative group">
                    <img
                        src={mp.photo}
                        alt={mp.name}
                        className="w-32 h-32 rounded-2xl object-cover bg-gray-800 shadow-2xl ring-4 ring-black/40 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%239CA3AF" font-size="40">MP</text></svg>'; }}
                    />
                    {mp.active && (
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
                            ACTIVE
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left flex flex-col h-full justify-center">
                    <h1 className="text-3xl font-bold mb-2">{mp.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            {mp.party || 'Independent'}
                        </div>
                        {mp.seimas_id && (
                            <div className="text-sm">ID: <span className="font-mono text-gray-500">{mp.seimas_id}</span></div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button
                        variant="secondary"
                        icon={ExternalLink}
                        onClick={() => window.open(`https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=seimo_narys&p_asm_id=${mp.seimas_id || ''}`, '_blank')}
                    >
                        Official Profile
                    </Button>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ProfileStat label="Total Votes" value={mp.vote_count?.toString() || '—'} icon={Vote} />
                <ProfileStat label="Attendance" value={mp.attendance ? `${mp.attendance}%` : '—'} icon={TrendingUp} />
                <ProfileStat label="Party Loyalty" value={mp.loyalty ? `${mp.loyalty}%` : '—'} icon={Building2} />
                <ProfileStat label="Term Start" value={mp.term_start || '—'} icon={Calendar} />
            </div>

            {/* Recent Votes */}
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Vote className="w-5 h-5 text-purple-400" />
                        Recent Voting Record
                    </h2>
                </div>

                {votes.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {votes.slice(0, 10).map((vote: any, i: number) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/5 transition-colors gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate pr-4 text-gray-200">{vote.title}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {vote.date}
                                    </div>
                                </div>
                                <div className="self-end sm:self-center">
                                    <VoteBadge choice={vote.choice} />
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-white/[0.02] text-center">
                            <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/votes'}>View All History</Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No voting records available for this term.
                    </div>
                )}
            </Card>

            {/* Compare CTA */}
            <Card className="p-8 text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <h3 className="text-xl font-bold mb-2">Compare Performance</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
                    Analyze how {mp.name} compares with other members of parliament in terms of attendance, loyalty, and voting patterns.
                </p>
                <Button variant="primary" size="lg" onClick={() => window.location.hash = '#/compare'}>
                    Compare MPs
                </Button>
            </Card>
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

        // eslint-disable-next-line
        setLoading(true);
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
