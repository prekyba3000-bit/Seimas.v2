import React, { useState, useEffect } from 'react';
import { Users, GitCompare, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from './config';

// MP Selector Combobox
const MpSelector = ({ mps, selected, onSelect, placeholder }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = mps.filter(mp =>
        mp.name.toLowerCase().includes(search.toLowerCase()) ||
        mp.party?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedMp = mps.find(m => m.id === selected);

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="glass p-3 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-white/10 transition-colors"
            >
                {selectedMp ? (
                    <>
                        <img src={selectedMp.photo} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-700" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{selectedMp.name}</span>
                            <span className="text-xs text-gray-400">{selectedMp.party}</span>
                        </div>
                    </>
                ) : (
                    <span className="text-gray-400 text-sm">{placeholder}</span>
                )}
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 mt-2 w-full glass rounded-xl shadow-xl max-h-60 overflow-auto"
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full p-3 bg-transparent border-b border-white/10 text-sm focus:outline-none"
                            autoFocus
                        />
                        {filtered.map(mp => (
                            <div
                                key={mp.id}
                                onClick={() => { onSelect(mp.id); setOpen(false); setSearch(''); }}
                                className="p-3 flex items-center gap-3 hover:bg-white/10 cursor-pointer"
                            >
                                <img src={mp.photo} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-700" />
                                <div className="flex flex-col">
                                    <span className="text-sm">{mp.name}</span>
                                    <span className="text-xs text-gray-400">{mp.party}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Alignment Score Display
const AlignmentScore = ({ score, label }) => {
    const percentage = Math.round(score * 100);
    const color = percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="flex flex-col items-center gap-1">
            <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
};

// Main Comparison View
const ComparisonView = () => {
    const [mps, setMps] = useState([]);
    const [selected, setSelected] = useState([null, null]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch MP list on mount
    useEffect(() => {
        fetch(`${API_URL}/api/mps`)
            .then(res => res.json())
            .then(data => setMps(data))
            .catch(err => console.error('Failed to load MPs', err));
    }, []);

    // Fetch comparison when both MPs selected
    useEffect(() => {
        if (selected[0] && selected[1] && selected[0] !== selected[1]) {
            setLoading(true);
            setError(null);
            fetch(`${API_URL}/api/mps/compare?ids=${selected[0]},${selected[1]}`)
                .then(res => {
                    if (!res.ok) throw new Error('Comparison failed');
                    return res.json();
                })
                .then(data => {
                    setComparison(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        } else {
            setComparison(null);
        }
    }, [selected]);

    const updateSelected = (index, value) => {
        const newSelected = [...selected];
        newSelected[index] = value;
        setSelected(newSelected);
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 max-w-5xl mx-auto flex flex-col gap-8 bg-[#0a0a0c] text-white">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <GitCompare className="w-8 h-8 text-blue-500" />
                    MP Compare
                </h1>
                <p className="text-gray-400">Compare voting records between representatives</p>
            </header>

            {/* Selector Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MpSelector
                    mps={mps.filter(m => m.id !== selected[1])}
                    selected={selected[0]}
                    onSelect={v => updateSelected(0, v)}
                    placeholder="Select first MP..."
                />
                <MpSelector
                    mps={mps.filter(m => m.id !== selected[0])}
                    selected={selected[1]}
                    onSelect={v => updateSelected(1, v)}
                    placeholder="Select second MP..."
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="glass p-8 text-center text-gray-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    Computing alignment...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="glass p-4 border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Results */}
            {comparison && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-6"
                >
                    {/* Alignment Score */}
                    <div className="glass p-8 text-center">
                        <h2 className="text-sm text-gray-400 mb-4">Voting Alignment</h2>
                        <AlignmentScore
                            score={comparison.alignment_matrix[0][1]}
                            label="agreement on shared votes"
                        />
                    </div>

                    {/* MP Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {comparison.mps.map(mp => (
                            <div key={mp.id} className="glass p-4 flex items-center gap-4">
                                <img src={mp.photo} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-700" />
                                <div>
                                    <div className="font-medium">{mp.name}</div>
                                    <div className="text-xs text-gray-400">{mp.party}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divergent Votes */}
                    {comparison.divergent_votes.length > 0 && (
                        <div className="glass p-6">
                            <h3 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Recent Divergent Votes
                            </h3>
                            <div className="space-y-3">
                                {comparison.divergent_votes.slice(0, 5).map(vote => (
                                    <div key={vote.vote_id} className="p-3 bg-white/5 rounded-lg">
                                        <div className="text-sm mb-2">{vote.title}</div>
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{vote.date}</span>
                                            <div className="flex gap-4">
                                                {comparison.mps.map(mp => (
                                                    <span key={mp.id} className={
                                                        vote.votes[mp.id] === 'Už' ? 'text-green-400' :
                                                            vote.votes[mp.id] === 'Prieš' ? 'text-red-400' :
                                                                'text-yellow-400'
                                                    }>
                                                        {mp.name.split(' ')[1]}: {vote.votes[mp.id]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Empty State */}
            {!comparison && !loading && !error && (
                <div className="glass p-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select two MPs above to compare their voting records</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonView;
