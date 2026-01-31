import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown, Circle, Minus, UserX, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

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
        case 'už': return <ThumbsUp className="w-4 h-4 text-green-500" />;
        case 'prieš': return <ThumbsDown className="w-4 h-4 text-red-500" />;
        case 'susilaikė': return <Minus className="w-4 h-4 text-yellow-500" />;
        default: return <UserX className="w-4 h-4 text-gray-500" />;
    }
};

const getChoiceColor = (choice: string) => {
    switch (choice.toLowerCase()) {
        case 'už': return 'bg-green-500';
        case 'prieš': return 'bg-red-500';
        case 'susilaikė': return 'bg-yellow-500';
        default: return 'bg-gray-700';
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
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
    );

    if (!vote) return (
        <div className="text-center p-12 text-gray-400">Vote not found</div>
    );

    const filteredVotes = vote.votes.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.party.toLowerCase().includes(search.toLowerCase())
    );

    const totalVotes = Object.values(vote.stats).reduce((a, b) => a + b, 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => window.location.hash = '#/votes'}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Votes
            </button>

            {/* Header */}
            <div className="glass p-6 rounded-2xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-white">{vote.title}</h1>
                    <a
                        href={vote.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="View on LRS website"
                    >
                        <ExternalLink className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                    </a>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{vote.date}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                        {vote.result_type}
                    </span>
                    <span>{totalVotes} votes cast</span>
                </div>
                {vote.description && (
                    <p className="text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-4">
                        {vote.description}
                    </p>
                )}
            </div>

            {/* Stats Bar */}
            <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Overall Result</h3>
                <div className="flex h-8 rounded-full overflow-hidden bg-gray-800">
                    {Object.entries(vote.stats).map(([choice, count]) => (
                        <div
                            key={choice}
                            className={`${getChoiceColor(choice)} h-full transition-all duration-500`}
                            style={{ width: `${(count / totalVotes) * 100}%` }}
                            title={`${choice}: ${count}`}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {Object.entries(vote.stats).map(([choice, count]) => (
                        <div key={choice} className="flex items-center gap-2 text-sm">
                            <div className={`w-3 h-3 rounded-full ${getChoiceColor(choice)}`} />
                            <span className="text-gray-300">{choice}:</span>
                            <span className="font-bold text-white">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Individual Votes */}
            <div className="glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Individual Votes</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search MP or party..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredVotes.map((v, i) => (
                        <div key={i} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded transition-colors">
                            <div>
                                <div className="font-medium text-white">{v.name}</div>
                                <div className="text-xs text-gray-500">{v.party}</div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5 w-28 justify-center">
                                {getChoiceIcon(v.choice)}
                                <span className="text-sm">{v.choice}</span>
                            </div>
                        </div>
                    ))}
                    {filteredVotes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No matches found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoteDetailView;
