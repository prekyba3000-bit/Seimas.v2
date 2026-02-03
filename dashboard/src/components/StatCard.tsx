import { StatCardProps } from '../types';
import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    delay?: number;
}

export const StatCard = ({ title, value, icon: Icon, trend, delay = 0 }: StatCardProps) => (
    <Card
        glow
        className="flex flex-col gap-2 relative overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-500/10 transition-colors" />

        <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-blue-500" />
            </div>
            {trend && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+{trend}%</span>}
        </div>
        <div className="relative z-10">
            <span className="text-sm text-gray-400 block mb-1">{title}</span>
            <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        </div>
    </Card>
);
