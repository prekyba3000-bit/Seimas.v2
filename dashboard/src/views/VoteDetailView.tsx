import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, Circle, Minus, UserX, Search, PieChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface VoteDetail {
    id: string;
    date: string;
    title: string;
    description: string;
    url: string;
    result_type: string;
    stats: Record<string, number>;
    party_stats: Record<string, Record<string, number>>;
    votes: {
        name: string;
        party: string;
        choice: string;
    }[];
}

const getChoiceIcon = (choice: string) => {
    switch (choice.toLowerCase()) {
        case 'už': return <ThumbsUp className="w-4 h-4" style={{ color: 'var(--status-success)' }} />;
        case 'prieš': return <ThumbsDown className="w-4 h-4" style={{ color: 'var(--status-danger)' }} />;
        case 'susilaikė': return <Minus className="w-4 h-4" style={{ color: 'var(--status-warning)' }} />;
        default: return <UserX className="w-4 h-4 text-gray-500" />;
    }
};

const getChoiceColor = (choice: string): React.CSSProperties => {
    switch (choice.toLowerCase()) {
        case 'už': return { backgroundColor: 'var(--status-success)' };
        case 'prieš': return { backgroundColor: 'var(--status-danger)' };
        case 'susilaikė': return { backgroundColor: 'var(--status-warning)' };
        default: return { backgroundColor: 'var(--color-text-ghost, #666666)' };
    }
};

const VoteDetailView = ({ voteId }: { voteId: string }) => {
    const [vote, setVote] = useState<VoteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/votes/${voteId}`)
            .then(res => res.json())
            .then(data => {
                setVote(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load vote details', err);
                setLoading(false);
            });
    }, [voteId]);

    if (loading) return (
        <Card className="p-20 flex flex-col items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-4" />
            Loading vote details...
        </Card>
    );

    if (!vote) return (
        <Card className="p-20 text-center text-gray-400">Vote not found</Card>
    );

    const filteredVotes = vote.votes.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.party.toLowerCase().includes(search.toLowerCase())
    );

    const totalVotes = Object.values(vote.stats).reduce((a, b) => a + b, 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <Button variant="ghost" className="pl-0 gap-2 text-gray-400 hover:text-white" onClick={() => window.location.hash = '#/votes'}>
                <ArrowLeft className="w-4 h-4" />
                Back to Votes
            </Button>

            {/* Header */}
            <Card className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <h1 className="text-2xl font-bold text-white leading-tight">{vote.title}</h1>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => window.open(vote.url, '_blank')}
                    >
                        Source
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                        <Calendar className="w-4 h-4" />
                        {vote.date}
                    </span>
                    <span className="px-3 py-1 rounded-full font-medium" style={{ backgroundColor: vote.result_type.toLowerCase().includes('priimta') ? 'var(--status-success-muted, rgba(34, 197, 94, 0.1))' : 'rgba(239, 68, 68, 0.1)', color: vote.result_type.toLowerCase().includes('priimta') ? 'var(--status-success)' : 'var(--status-danger)' }}>
                        {vote.result_type}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                        <PieChart className="w-4 h-4" />
                        {totalVotes} votes cast
                    </span>
                </div>
                {vote.description && (
                    <p className="text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-6">
                        {vote.description}
                    </p>
                )}
            </Card>

            {/* Stats Bar */}
            <Card className="p-8">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-6">Voting Breakdown</h3>

                {/* Visual Bar */}
                <div className="flex h-12 rounded-xl overflow-hidden bg-gray-900 shadow-inner mb-6 relative">
                    {Object.entries(vote.stats).map(([choice, count]) => {
                        const width = (count / totalVotes) * 100;
                        if (width === 0) return null;
                        return (
                            <div
                                key={choice}
                                className="h-full transition-all duration-1000 relative group flex items-center justify-center"
                                style={{ width: `${width}%`, ...getChoiceColor(choice) }}
                                title={`${choice}: ${count}`}
                            >
                                {width > 10 && <span className="text-xs font-bold text-black/50 drop-shadow-sm">{Math.round(width)}%</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 justify-center">
                    {Object.entries(vote.stats).map(([choice, count]) => (
                        <div key={choice} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-white/5 border border-white/5 min-w-[120px]">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={getChoiceColor(choice)} />
                            <span className="text-gray-400 capitalize">{choice}</span>
                            <span className="font-bold text-white ml-auto">{count}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Individual Votes */}
            <Card className="p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-white/5 gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserX className="w-5 h-5 text-blue-400" />
                        Individual Votes
                    </h3>
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search MP or party..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
                    {filteredVotes.map((v, i) => (
                        <div key={i} className="py-3 px-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                    {v.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{v.name}</div>
                                    <div className="text-xs text-gray-500">{v.party}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 w-32 justify-center">
                                {getChoiceIcon(v.choice)}
                                <span className="text-sm font-medium">{v.choice}</span>
                            </div>
                        </div>
                    ))}
                    {filteredVotes.length === 0 && (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <Search className="w-8 h-8 opacity-20 mb-2" />
                            No matches found
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-white/5 bg-white/[0.02] text-center text-xs text-gray-500">
                    Showing {filteredVotes.length} records
                </div>
            </Card>
        </motion.div>
    );
};

export default VoteDetailView;
