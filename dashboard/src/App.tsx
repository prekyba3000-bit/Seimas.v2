import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserMinus, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

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

const App = () => {
    const [stats, setStats] = useState({
        total_mps: '...',
        historical_votes: '...',
        accuracy: '...',
        active_rebels: '...'
    });
    const [activity, setActivity] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Stats
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Stats fetch failed", err));

        // Fetch Activity
        fetch('/api/activity')
            .then(res => res.json())
            .then(data => setActivity(data))
            .catch(err => console.error("Activity fetch failed", err));
    }, []);

    return (
        <div className="min-h-screen p-8 lg:p-12 max-w-7xl mx-auto flex flex-col gap-12 bg-[#0a0a0c] text-white">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        Skaidrus Seimas <span className="text-blue-500 text-sm bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">v.2</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Historical Transparency & MP Intelligence Dashboard</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Orchestra Live
                    </div>
                </div>
            </header>

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
        </div>
    );
};

export default App;
