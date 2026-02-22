import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield, Crosshair, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { api, DashboardStats, ActivityItem } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { AbsenteeismCard } from '../components/AbsenteeismCard';

export const DashboardView = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([api.getStats(), api.getActivity()])
            .then(([statsData, activityData]) => {
                setStats(statsData);
                setActivity(activityData);
            })
            .catch(err => {
                console.error("Dashboard fetch failed", err);
                setError("Failed to load dashboard data. The server may be waking up — try again in a moment.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }} />
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border rounded-xl flex items-center gap-3" style={{ borderColor: 'var(--status-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)' }}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background text-primary flex flex-col gap-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="ASSETS" value={stats?.total_mps ?? '—'} icon={Users} delay={0.1} />
                <StatCard title="INTEL RECORDS" value={stats?.historical_votes ?? '—'} icon={Activity} trend="12" delay={0.2} />
                <StatCard title="ACCURACY" value={stats?.accuracy ?? '—'} icon={Crosshair} delay={0.3} />
                <StatCard title="INDIVIDUAL VOTES" value={stats?.individual_votes ?? '—'} icon={Shield} delay={0.4} />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h2 className="text-decree text-lg mb-6 flex items-center gap-3 text-primary">
                        <Activity className="w-5 h-5" />
                        ACTIVITY BRIEFING
                    </h2>
                    <div className="space-y-2">
                        {activity.length > 0 ? activity.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-surface/5 transition-colors rounded-sm group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#111111] rounded-sm flex items-center justify-center text-xs font-terminal ring-1 ring-border group-hover:ring-border transition-all text-primary">
                                        SN
                                    </div>
                                        <div className="flex flex-col">
                                        <span className="font-medium text-[#EEEEEE] group-hover:text-secondary transition-colors">{item.name}</span>
                                        <span className="text-xs text-ghost font-terminal">{item.action}: {item.context}</span>
                                    </div>
                                </div>
                                <span className="text-xs text-primary bg-surface/10 px-2 py-1 rounded-sm border border-border font-terminal">{item.time}</span>
                            </motion.div>
                        )) : (
                            <p className="text-ghost text-sm py-4 text-center font-terminal uppercase tracking-widest">No recent activity</p>
                        )}
                    </div>
                </Card>

                <Card className="flex flex-col gap-6">
                    <h2 className="text-decree text-lg text-primary flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        SYSTEM STATUS
                    </h2>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-terminal">
                                <span className="text-ghost uppercase tracking-widest">Data Sync</span>
                                <span className="text-secondary">85%</span>
                            </div>
                            <div className="h-2 w-full bg-[#111111] rounded-sm overflow-hidden">
                                    <motion.div
                                    className="h-full bg-gradient-to-r from-secondary to-primary relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                >
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                                </motion.div>
                            </div>
                        </div>
                                <div className="p-4 bg-[#111111] rounded-sm border border-border font-terminal text-xs text-ghost leading-relaxed">
                            <span className="text-[#22c55e]">➜</span> Engine: <span className="text-[#22c55e]">ONLINE</span><br />
                            <span className="text-secondary">➜</span> Ingestion: <span className="text-secondary">ACTIVE</span><br />
                            <span className="text-[#3b82f6]">➜</span> Database: <span className="text-[#3b82f6]">CONNECTED</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Absenteeism Intelligence Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <AbsenteeismCard />
            </motion.div>
        </motion.div>
    );
};
