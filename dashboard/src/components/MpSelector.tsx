import React from 'react';
import { Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface MpData {
  name: string;
  party: string;
  avatarUrl?: string;
}

type MpSelectorState = 'empty' | 'populated';

interface MpSelectorProps {
  mp?: MpData;
  state?: MpSelectorState;
  placeholder?: string;
  onClick?: () => void;
}

export function MpSelector({
  mp,
  state,
  placeholder = 'Select MP...',
  onClick,
}: MpSelectorProps) {
  const currentState = state || (mp ? 'populated' : 'empty');
  const isPopulated = currentState === 'populated' && mp;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      className={`
        w-full h-[72px] rounded-xl transition-all duration-200
        flex items-center gap-4 px-6
        ${
          isPopulated
            ? 'bg-blue-500/10 border-2 border-blue-500 hover:bg-blue-500/15'
            : 'bg-white/5 border-2 border-white/5 hover:bg-white/10 hover:border-white/10'
        }
      `}
      onClick={onClick}
    >
      {isPopulated ? (
        <>
          {/* Avatar */}
          <Avatar className="w-10 h-10">
            <AvatarImage src={mp.avatarUrl} alt={mp.name} />
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials(mp.name)}
            </AvatarFallback>
          </Avatar>

          {/* MP Info */}
          <div className="flex-1 text-left min-w-0">
            <div className="font-bold text-white truncate">{mp.name}</div>
            <div className="text-sm text-gray-400 truncate">{mp.party}</div>
          </div>

          {/* Check Icon */}
          <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
        </>
      ) : (
        <>
          {/* Empty State Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800">
            <Users className="w-5 h-5 text-gray-500" />
          </div>

          {/* Placeholder Text */}
          <div className="flex-1 text-left">
            <div className="text-gray-500">{placeholder}</div>
          </div>
        </>
      )}
    </button>
  );
}
