import React, { useState, useEffect } from 'react';
import { Users, Search, Building2, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MpCard } from '../components/MpCard';

// Main MPs List View
const MpsListView = () => {
    const [mps, setMps] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [partyFilter, setPartyFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/mps`)
            .then(res => res.json())
            .then(data => {
                setMps(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load MPs', err);
                setLoading(false);
            });
    }, []);

    // Get unique parties for filter
    const parties = [...new Set(mps.map(m => m.party).filter(Boolean))].sort();

    // Filter MPs
    const filtered = mps.filter(mp => {
        const matchesSearch = mp.name.toLowerCase().includes(search.toLowerCase());
        const matchesParty = !partyFilter || mp.party === partyFilter;
        return matchesSearch && matchesParty;
    });

    const handleMpClick = (mpId: string) => {
        // eslint-disable-next-line
        window.location.href = `#/mps/${mpId}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                        Seimas Members
                    </h2>
                    <p className="text-gray-400">Current term representatives</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-lg text-sm font-medium border border-white/5">
                    <span className="text-white">{filtered.length}</span>
                    <span className="text-gray-500 ml-1">members</span>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 bg-white/5">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                {/* Party Filter */}
                <div className="relative min-w-[250px] group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                        <Filter className="w-4 h-4" />
                    </div>
                    <select
                        value={partyFilter || ''}
                        onChange={e => setPartyFilter(e.target.value || null)}
                        className="w-full pl-11 pr-8 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer appearance-none text-gray-300"
                    >
                        <option value="">All Parties</option>
                        {parties.map(party => (
                            <option key={party} value={party}>{party}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {loading ? (
                <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-4" />
                    Loading MP roster...
                </div>
            ) : (
                <>
                    {/* MPs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(mp => (
                            <MpCard
                                key={mp.id}
                                mp={mp}
                                onClick={() => handleMpClick(mp.id)}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filtered.length === 0 && (
                        <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                            <Users className="w-12 h-12 opacity-20" />
                            <p>No MPs found matching criteria</p>
                            <Button variant="ghost" onClick={() => { setSearch(''); setPartyFilter(null); }}>Clear Filters</Button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default MpsListView;
