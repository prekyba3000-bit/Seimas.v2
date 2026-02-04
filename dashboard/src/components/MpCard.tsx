import React, { useState } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Party colors from Political Parties token collection
const PARTY_COLORS: Record<string, string> = {
  'Tėvynės sąjunga': '#3b82f6', // Blue 500
  'LSDP': '#ef4444', // Red 500
  'Liberalų sąjūdis': '#f59e0b', // Amber 500
  'Demokratų sąjunga': '#10b981', // Emerald 500
  'Laisvės partija': '#8b5cf6', // Violet 500
  'Lietuvos valstiečių ir žaliųjų sąjunga': '#22c55e', // Green 500
  'Darbo partija': '#06b6d4', // Cyan 500
  'Nemuno aušra': '#ec4899', // Pink 500
};

interface MpCardProps {
  name?: string;
  party?: string;
  avatarUrl?: string;
  onClick?: () => void;
}

export function MpCard({
  name = 'Andrius Kubilius',
  party = 'Tėvynės sąjunga',
  avatarUrl,
  onClick,
}: MpCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const partyColor = PARTY_COLORS[party] || '#6b7280'; // Default to gray-500
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl cursor-pointer transition-all duration-200"
      style={{
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Avatar with Party Indicator */}
      <div className="relative">
        <Avatar
          className="w-14 h-14 transition-all duration-200"
          style={{
            boxShadow: isHovered ? `0 0 0 3px ${partyColor}40` : 'none',
          }}
        >
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-gray-700 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Party Color Indicator */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800"
          style={{ backgroundColor: partyColor }}
        />
      </div>

      {/* Text Container */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-white transition-colors duration-200 truncate"
          style={{
            color: isHovered ? partyColor : 'white',
          }}
        >
          {name}
        </h3>
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">{party}</span>
        </div>
      </div>

      {/* ChevronRight Icon */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
        style={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <ChevronRight
          className="w-4 h-4 transition-all duration-200"
          style={{
            color: isHovered ? partyColor : '#9ca3af',
          }}
        />
      </div>
    </div>
  );
}
