import React, { useState, useEffect } from 'react';
import { Users, Activity, Globe, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';

export const DashboardView = () => {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total MPs" value={stats.total_mps} icon={Users} delay={0.1} />
                <StatCard title="Historical Votes" value={stats.historical_votes} icon={Activity} trend="12.4" delay={0.2} />
                <StatCard title="Accuracy Rating" value={stats.accuracy} icon={Globe} delay={0.3} />
                <StatCard title="Active Rebels" value={stats.active_rebels} icon={UserMinus} delay={0.4} />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Recent Activity Briefing
                    </h2>
                    <div className="space-y-4">
                        {activity.length > 0 ? activity.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-xl group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all">MP</div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.action}: {item.context}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{item.time}</span>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm italic py-4 text-center">Loading briefing data...</p>
                        )}
                    </div>
                </Card>

                <Card className="flex flex-col gap-6">
                    <h2 className="text-xl font-semibold mb-2">System Health</h2>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Data Backfill</span>
                                <span className="text-blue-400 font-mono">85%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500 relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                                </motion.div>
                            </div>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 font-mono text-xs text-gray-400 leading-relaxed shadow-inner">
                            <span className="text-green-400">➜</span> Engine Status: <span className="text-green-400">OK</span><br />
                            <span className="text-yellow-400">➜</span> Ingestion: <span className="text-yellow-400">In-Progress</span><br />
                            <span className="text-blue-400">➜</span> Taskade: <span className="text-blue-400">Synchronized</span>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};
