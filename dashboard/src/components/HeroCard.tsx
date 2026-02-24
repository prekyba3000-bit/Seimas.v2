import React from 'react';
import { ChevronDown, Shield, Sparkles, Star, Swords, Trophy } from 'lucide-react';
import { Card } from './Card';
import { RadarAttributeChart } from './RadarAttributeChart';

interface HeroAttributes {
  STR: number;
  WIS: number;
  CHA: number;
  INT: number;
  STA: number;
}

interface HeroArtifact {
  name: string;
  rarity: string;
}

interface HeroProfile {
  mp: {
    id: string;
    name: string;
    party?: string;
    photo?: string;
    active?: boolean;
    seimas_id?: string | number;
  };
  level: number;
  xp: number;
  xp_current_level: number;
  xp_next_level: number;
  alignment: string;
  attributes: HeroAttributes;
  artifacts: HeroArtifact[];
  forensic_breakdown: {
    base_risk_score: number;
    base_risk_penalty: number;
    benford: ForensicEntry & { p_value?: number | null };
    chrono: ForensicEntry & { worst_zscore?: number | null };
    vote_geometry: ForensicEntry & { max_deviation_sigma?: number | null };
    phantom_network: ForensicEntry & {
      procurement_links?: number;
      closest_hop_count?: number | null;
      debtor_links?: number;
    };
    loyalty_bonus: {
      status: ForensicStatus;
      independent_voting_days_pct: number;
      bonus: number;
      explanation: string;
    };
    total_forensic_adjustment: number;
    final_integrity_score: number;
  };
}

type ForensicStatus = 'clean' | 'warning' | 'flagged' | 'critical' | 'unavailable';

interface ForensicEntry {
  status: ForensicStatus;
  penalty: number;
  explanation: string;
}

const rarityClass: Record<string, string> = {
  Epic: 'text-purple-300 border-purple-500/40 bg-purple-500/10',
  Rare: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
  Cursed: 'text-red-300 border-red-500/40 bg-red-500/10',
};

const statusBadgeClass: Record<ForensicStatus, string> = {
  clean: 'bg-green-500/10 text-green-300 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  flagged: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-300 border-red-500/30',
  unavailable: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
};

const formatXp = (value: number) => value.toLocaleString();

export default function HeroCard({ hero }: { hero: HeroProfile }) {
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const nextLevelGap = Math.max(hero.xp_next_level - hero.xp_current_level, 1);
  const progressRaw = ((hero.xp - hero.xp_current_level) / nextLevelGap) * 100;
  const progress = Math.max(0, Math.min(100, progressRaw));

  const radarData = [
    { label: 'STR', value: hero.attributes.STR },
    { label: 'WIS', value: hero.attributes.WIS },
    { label: 'CHA', value: hero.attributes.CHA },
    { label: 'INT', value: hero.attributes.INT },
    { label: 'STA', value: hero.attributes.STA },
  ];

  const fallbackPhoto =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231f2937" width="100" height="100"/><text x="50" y="58" text-anchor="middle" fill="%239ca3af" font-size="34">MP</text></svg>';

  const forensicRows: Array<{
    key: string;
    label: string;
    data: ForensicEntry;
  }> = [
    { key: 'benford', label: "Benford's Law Analysis", data: hero.forensic_breakdown.benford },
    { key: 'chrono', label: 'Chrono-Forensics', data: hero.forensic_breakdown.chrono },
    { key: 'vote_geometry', label: 'Vote Geometry', data: hero.forensic_breakdown.vote_geometry },
    { key: 'phantom_network', label: 'Phantom Network', data: hero.forensic_breakdown.phantom_network },
  ];

  const adjustment = hero.forensic_breakdown.total_forensic_adjustment;

  const pointsLabel = (points: number) => {
    if (points > 0) return `+${points} pts`;
    if (points < 0) return `${points} pts`;
    return '0 pts';
  };

  return (
    <Card className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <img
          src={hero.mp.photo || fallbackPhoto}
          alt={hero.mp.name}
          className="w-28 h-28 rounded-2xl object-cover bg-white/5 ring-2 ring-cyan-500/30"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackPhoto;
          }}
        />

        <div className="flex-1">
          <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80 mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Hero Profile
          </div>
          <h1 className="text-3xl font-black">{hero.mp.name}</h1>
          <div className="text-sm text-gray-400 mt-1">{hero.mp.party || 'Independent'}</div>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-sm">
            <Shield className="w-4 h-4" />
            {hero.alignment}
          </div>
        </div>

        <div className="md:text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Level</div>
          <div className="text-5xl font-black text-cyan-300 leading-none">{hero.level}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="p-6 bg-white/[0.02] border-white/10">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-gray-400 mb-5">
            <Swords className="w-4 h-4" />
            Attributes
          </div>
          <div className="flex justify-center">
            <RadarAttributeChart data={radarData} size={320} color="#22d3ee" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-white/[0.02] border-white/10">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-gray-400 mb-4">
              <Star className="w-4 h-4" />
              Experience
            </div>
            <div className="text-2xl font-bold mb-2">{formatXp(hero.xp)} XP</div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatXp(hero.xp_current_level)} XP</span>
              <span>{formatXp(hero.xp_next_level)} XP</span>
            </div>
          </Card>

          <Card className="p-6 bg-white/[0.02] border-white/10">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-gray-400 mb-4">
              <Trophy className="w-4 h-4" />
              Artifacts
            </div>
            {hero.artifacts.length ? (
              <div className="space-y-3">
                {hero.artifacts.map((artifact, index) => (
                  <div
                    key={`${artifact.name}-${index}`}
                    className={`rounded-lg px-3 py-2 border ${
                      rarityClass[artifact.rarity] || 'text-gray-200 border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{artifact.name}</div>
                    <div className="text-xs uppercase tracking-wider opacity-80">{artifact.rarity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No artifacts unlocked yet.</p>
            )}
          </Card>
        </div>
      </div>

      <Card className="p-6 bg-white/[0.02] border-white/10">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setShowBreakdown((prev) => !prev)}
        >
          <div>
            <div className="text-sm uppercase tracking-[0.15em] text-gray-400">Score Transparency</div>
            <div className="text-lg font-semibold mt-1">Why this score?</div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
        </button>

        {showBreakdown && (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Base Risk Penalty</span>
                <span className="font-semibold text-red-300">
                  {pointsLabel(hero.forensic_breakdown.base_risk_penalty)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Base risk score: {hero.forensic_breakdown.base_risk_score}
              </div>
            </div>

            {forensicRows.map((row) => (
              <div key={row.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{row.label}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs border uppercase tracking-wider ${statusBadgeClass[row.data.status]}`}
                    >
                      {row.data.status}
                    </span>
                    <span className="text-sm font-semibold">{pointsLabel(row.data.penalty)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{row.data.explanation}</p>
              </div>
            ))}

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Loyalty Bonus</span>
                <span className="text-sm font-semibold text-green-300">
                  {pointsLabel(hero.forensic_breakdown.loyalty_bonus.bonus)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{hero.forensic_breakdown.loyalty_bonus.explanation}</p>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Total Forensic Adjustment</span>
                <span className="font-bold">{pointsLabel(adjustment)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Final Integrity Score</span>
                <span className="font-bold text-cyan-300">{hero.forensic_breakdown.final_integrity_score}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </Card>
  );
}
