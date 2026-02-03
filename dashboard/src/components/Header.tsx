import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import { LayoutDashboard, Users, FileText, GitCompare } from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    key: string;
}

interface HeaderProps {
    view: string;
}

const navItems: NavItem[] = [
    { href: '#/', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { href: '#/mps', label: 'MPs', icon: Users, key: 'mps-list' },
    { href: '#/votes', label: 'Votes', icon: FileText, key: 'votes-list' },
    { href: '#/compare', label: 'Compare', icon: GitCompare, key: 'compare' },
];

export const Header = ({ view }: HeaderProps) => {
    return (
        <header className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
            >
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <a href="#/" className="hover:text-blue-400 transition-colors text-gradient">Skaidrus Seimas</a>
                    <span className="text-blue-500 text-xs bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">v.2</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">Transparency & Intelligence Dashboard</p>
            </motion.div>

            <motion.nav
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 items-center flex-wrap"
            >
                {navItems.map(({ href, label, icon: Icon, key }) => {
                    const isActive = view === key ||
                        (view === 'mp-profile' && key === 'mps-list') ||
                        (view === 'vote-detail' && key === 'votes-list');

                    return (
                        <a
                            key={key}
                            href={href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300",
                                isActive
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </a>
                    );
                })}
                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs ml-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live
                </div>
            </motion.nav>
        </header>
    );
};
