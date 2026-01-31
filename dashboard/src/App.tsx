import React, { useState, useEffect } from 'react';
import MpProfileView from './MpProfileView';
import VotesListView from './VotesListView';
import VoteDetailView from './VoteDetailView';
import { LayoutDashboard, Users, FileText, GitCompare, UserMinus, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import ComparisonView from './ComparisonView';
import MpsListView from './MpsListView';
import { API_URL } from './config';

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glass-glow p-6 flex flex-col gap-2"
    >
        <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/10 rounded-xl">
                <Icon className="w-6 h-6 text-blue-500" />
            </div>
            {trend && <span className="text-xs text-green-400">+{trend}%</span>}
        </div>
        <span className="text-sm text-gray-400 mt-2">{title}</span>
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
    </motion.div>
);

// Dashboard View Component
const DashboardView = () => {
    const [stats, setStats] = useState({
        total_mps: '...',
        historical_votes: '...',
        accuracy: '...',
        active_rebels: '...'
    });
    const [activity, setActivity] = useState<any[]>([]);



    useEffect(() => {
        fetch(`${API_URL}/api/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Stats fetch failed", err));

        fetch(`${API_URL}/api/activity`)
            .then(res => res.json())
            .then(data => setActivity(data))
            .catch(err => console.error("Activity fetch failed", err));
    }, []);

    return (
        <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total MPs" value={stats.total_mps} icon={Users} />
                <StatCard title="Historical Votes" value={stats.historical_votes} icon={Activity} trend="12.4" />
                <StatCard title="Accuracy Rating" value={stats.accuracy} icon={Globe} />
                <StatCard title="Active Rebels" value={stats.active_rebels} icon={UserMinus} />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8">
                    <h2 className="text-xl font-semibold mb-6">Recent Activity Briefing</h2>
                    <div className="space-y-4">
                        {activity.length > 0 ? activity.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold">MP</div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.action}: {item.context}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{item.time}</span>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm italic">Loading briefing data...</p>
                        )}
                    </div>
                </div>

                <div className="glass p-8">
                    <h2 className="text-xl font-semibold mb-6">System Health</h2>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Data Backfill</span>
                                <span className="text-blue-500">85%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                {">"} Engine Status: OK<br />
                                {">"} Ingestion: In-Progress<br />
                                {">"} Taskade: Synchronized
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Route helper
const parseRoute = (hash: string) => {
    if (hash.startsWith('#/mps/')) {
        const id = hash.replace('#/mps/', '');
        return { view: 'mp-profile', id };
    }
    if (hash === '#/mps') return { view: 'mps-list' };

    if (hash.startsWith('#/votes/')) {
        const id = hash.replace('#/votes/', '');
        return { view: 'vote-detail', id };
    }
    if (hash === '#/votes') return { view: 'votes-list' };

    if (hash === '#/compare') return { view: 'compare' };
    return { view: 'dashboard' };
};

// Main App with Routing
const App = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash || '#/');
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const { view, id } = parseRoute(route);

    // Navigation state
    const navItems = [
        { href: '#/', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
        { href: '#/mps', label: 'MPs', icon: Users, key: 'mps-list' },
        { href: '#/votes', label: 'Votes', icon: FileText, key: 'votes-list' },
        { href: '#/compare', label: 'Compare', icon: GitCompare, key: 'compare' },
    ];

    return (
        <div className="min-h-screen p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-12 bg-[#0a0a0c] text-white">
            {/* Header */}
            <header className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <a href="#/" className="hover:text-blue-400 transition-colors">Skaidrus Seimas</a>
                        <span className="text-blue-500 text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">v.2</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Historical Transparency & MP Intelligence Dashboard</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Navigation */}
                    {navItems.map(({ href, label, icon: Icon, key }) => (
                        <a
                            key={key}
                            href={href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${view === key ||
                                (view === 'mp-profile' && key === 'mps-list') ||
                                (view === 'vote-detail' && key === 'votes-list')
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </a>
                    ))}
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Live
                    </div>
                </div>
            </header>

            {/* Route Content */}
            {view === 'compare' && <ComparisonView />}
            {view === 'mps-list' && <MpsListView />}
            {view === 'mp-profile' && id && <MpProfileView mpId={id} />}
            {view === 'votes-list' && <VotesListView />}
            {view === 'vote-detail' && id && <VoteDetailView voteId={id} />}
            {view === 'dashboard' && <DashboardView />}
        </div>
    );
};

export default App;
