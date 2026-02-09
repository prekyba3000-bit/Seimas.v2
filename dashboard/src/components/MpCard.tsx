import React, { useState } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Party colors from Figma design tokens
const PARTY_COLORS: Record<string, string> = {
  'Tėvynės sąjunga': 'var(--party-tevynes-sajunga)',
  'LSDP': 'var(--status-danger)',
  'Liberalų sąjūdis': 'var(--status-warning)',
  'Demokratų sąjunga': 'var(--status-success)',
  'Laisvės partija': 'var(--primary-500)',
  'Lietuvos valstiečių ir žaliųjų sąjunga': 'var(--status-success)',
  'Darbo partija': 'var(--status-info)',
  'Nemuno aušra': 'var(--status-danger)',
};

interface MpCardProps {
  name?: string;
  party?: string;
  avatarUrl?: string;
  onClick?: () => void;
  mp?: {
    id: string;
    name?: string;
    display_name?: string;
    party?: string;
    current_party?: string;
    photo_url?: string;
    is_active?: boolean;
  };
}

export function MpCard({
  name,
  party,
  avatarUrl,
  onClick,
  mp,
}: MpCardProps) {
  // Extract values from mp object if provided, otherwise use direct props
  const displayName = name || mp?.display_name || mp?.name || 'Unknown';
  const displayParty = party || mp?.current_party || mp?.party || 'Unknown Party';
  const photoUrl = avatarUrl || mp?.photo_url;
  
  const [isHovered, setIsHovered] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const partyColor = PARTY_COLORS[displayParty] || 'var(--text-secondary)'; // Default to secondary text color
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border"
      style={{
        backgroundColor: 'var(--background-surface)',
        borderColor: 'var(--glass-border)',
        boxShadow: isHovered
          ? '0 4px 12px rgba(59, 130, 246, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Avatar with Party Indicator */}
      <div className="relative">
        {!photoFailed && photoUrl ? (
          <div
            className="w-14 h-14 rounded-full border-2 overflow-hidden transition-all duration-200 flex items-center justify-center"
            style={{
              borderColor: isHovered ? partyColor : 'transparent',
              boxShadow: isHovered ? `0 0 0 3px ${partyColor}40` : 'none',
            }}
          >
            <img
              src={photoUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={() => setPhotoFailed(true)}
            />
          </div>
        ) : (
          <Avatar
            className="w-14 h-14 transition-all duration-200"
            style={{
              boxShadow: isHovered ? `0 0 0 3px ${partyColor}40` : 'none',
              backgroundColor: 'var(--background-elevated)',
            }}
          >
            <AvatarFallback
              className="text-sm transition-colors"
              style={{
                backgroundColor: 'var(--background-elevated)',
                color: 'var(--text-primary)',
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        {/* Party Color Indicator */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: partyColor,
            borderColor: 'var(--background-surface)',
          }}
        />
      </div>

      {/* Text Container */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold transition-colors duration-200 truncate"
          style={{
            color: isHovered ? partyColor : 'var(--text-primary)',
          }}
        >
          {displayName}
        </h3>
        <div
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">{displayParty}</span>
        </div>
      </div>

      {/* ChevronRight Icon */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
        style={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'var(--glass-background)',
        }}
      >
        <ChevronRight
          className="w-4 h-4 transition-all duration-200"
          style={{
            color: isHovered ? partyColor : 'var(--text-tertiary)',
          }}
        />
      </div>
    </div>
  );
}
