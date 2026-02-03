import React from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { MP } from '../types';

// Party color mapping
export const PARTY_COLORS: Record<string, string> = {
    'Tėvynės sąjunga': 'bg-blue-500',
    'Lietuvos socialdemokratų partija': 'bg-red-500',
    'Liberalų sąjūdis': 'bg-yellow-500',
    'Demokratų sąjunga „Vardan Lietuvos"': 'bg-green-500',
    'Lietuvos valstiečių ir žaliųjų sąjunga': 'bg-emerald-600',
    'Laisvės partija': 'bg-pink-500',
    'Darbo partija': 'bg-orange-500',
    'default': 'bg-gray-500'
};

export const getPartyColor = (party: string) => PARTY_COLORS[party] || PARTY_COLORS.default;

interface MpCardProps {
    mp: MP;
    onClick?: () => void;
}

export const MpCard = ({ mp, onClick }: MpCardProps) => (
    <Card
        hover
        onClick={onClick}
        className="cursor-pointer group p-4 flex items-center gap-4"
    >
        <div className="relative">
            <img
                src={mp.photo}
                alt={mp.name}
                className="w-14 h-14 rounded-full object-cover bg-gray-800 ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%239CA3AF" font-size="40">MP</text></svg>'; }}
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getPartyColor(mp.party)} border-2 border-[#1a1a1e] shadow-sm`} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{mp.name}</div>
            <div className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3" />
                {mp.party || 'Unknown'}
            </div>
        </div>
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-blue-500/10 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
        </div>
    </Card>
);
