import React, { useState, useEffect } from 'react';
import { FileText, Search, Calendar, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Vote {
    id: string;
    date: string;
    title: string;
    result: string;
}

const VoteCard = ({ vote, onClick }: { vote: Vote; onClick: () => void }) => {
    const getResultIcon = (result: string) => {
        const r = result.toLowerCase();
        if (r.includes('priimta') || r.includes('pritarta')) return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (r.includes('nepriimta') || r.includes('atmesta')) return <XCircle className="w-5 h-5 text-red-500" />;
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="glass p-5 cursor-pointer hover:bg-white/5 transition-all group border-l-4 border-l-transparent hover:border-l-blue-500"
        >
            <div className="flex items-start gap-4">
                <div className="mt-1">{getResultIcon(vote.result)}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Calendar className="w-3 h-3" />
                        {vote.date}
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                            {vote.result}
                        </span>
                    </div>
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                        {vote.title}
                    </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors self-center" />
            </div>
        </motion.div>
    );
};

const VotesListView = () => {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/votes?limit=200`)
            .then(res => res.json())
            .then(data => {
                setVotes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load votes', err);
                setLoading(false);
            });
    }, []);

    const filtered = votes.filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleVoteClick = (id: string) => {
        window.location.hash = `#/votes/${id}`;
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <FileText className="w-7 h-7 text-purple-500" />
                    Parliamentary Votes
                </h2>
                <span className="text-sm text-gray-400">
                    {filtered.length} votes
                </span>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search votes by title..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="glass p-12 text-center text-gray-400">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    Loading votes...
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(vote => (
                        <VoteCard key={vote.id} vote={vote} onClick={() => handleVoteClick(vote.id)} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No votes found matching "{search}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VotesListView;
