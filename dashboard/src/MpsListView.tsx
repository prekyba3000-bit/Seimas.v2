import React, { useState, useEffect } from 'react';
import { Users, Search, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from './config';

// Party color mapping
const PARTY_COLORS: Record<string, string> = {
    'Tėvynės sąjunga': 'bg-blue-500',
    'Lietuvos socialdemokratų partija': 'bg-red-500',
    'Liberalų sąjūdis': 'bg-yellow-500',
    'Demokratų sąjunga „Vardan Lietuvos"': 'bg-green-500',
    'Lietuvos valstiečių ir žaliųjų sąjunga': 'bg-emerald-600',
    'Laisvės partija': 'bg-pink-500',
    'Darbo partija': 'bg-orange-500',
    'default': 'bg-gray-500'
};

const getPartyColor = (party: string) => PARTY_COLORS[party] || PARTY_COLORS.default;

// MP Card Component
const MpCard = ({ mp, onClick }: { mp: any; onClick: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="glass p-4 cursor-pointer hover:bg-white/10 transition-all group"
    >
        <div className="flex items-center gap-4">
            <div className="relative">
                <img
                    src={mp.photo}
                    alt={mp.name}
                    className="w-14 h-14 rounded-full object-cover bg-gray-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%239CA3AF" font-size="40">MP</text></svg>'; }}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getPartyColor(mp.party)} border-2 border-[#0a0a0c]`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{mp.name}</div>
                <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {mp.party || 'Unknown'}
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
        </div>
    </motion.div>
);

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
        window.location.hash = `#/mps/${mpId}`;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Users className="w-7 h-7 text-blue-500" />
                    Members of Parliament
                </h2>
                <span className="text-sm text-gray-400">
                    {filtered.length} of {mps.length} MPs
                </span>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 glass rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                {/* Party Filter */}
                <select
                    value={partyFilter || ''}
                    onChange={e => setPartyFilter(e.target.value || null)}
                    className="glass px-4 py-3 rounded-xl text-sm focus:outline-none cursor-pointer min-w-[200px]"
                >
                    <option value="">All Parties</option>
                    {parties.map(party => (
                        <option key={party} value={party}>{party}</option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="glass p-12 text-center text-gray-400">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    Loading MPs...
                </div>
            )}

            {/* MPs Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(mp => (
                        <MpCard
                            key={mp.id}
                            mp={mp}
                            onClick={() => handleMpClick(mp.id)}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <div className="glass p-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No MPs found matching your criteria</p>
                </div>
            )}
        </div>
    );
};

export default MpsListView;
