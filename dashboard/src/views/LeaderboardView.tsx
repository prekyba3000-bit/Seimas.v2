import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_URL } from '../config';
import { Card } from '../components/Card';

type SortKey = 'rank' | 'name' | 'party' | 'level' | 'xp' | 'STR' | 'WIS' | 'CHA' | 'INT' | 'STA';
type SortDirection = 'asc' | 'desc';

interface HeroRow {
  mp: {
    id: string;
    name: string;
    party?: string;
    photo?: string;
  };
  level: number;
  xp: number;
  attributes: {
    STR: number;
    WIS: number;
    CHA: number;
    INT: number;
    STA: number;
  };
  forensic_breakdown?: {
    benford?: { status?: string; penalty?: number };
    chrono?: { status?: string; penalty?: number };
    vote_geometry?: { status?: string; penalty?: number };
    phantom_network?: { status?: string; penalty?: number };
    total_forensic_adjustment?: number;
  };
}

const DEFAULT_PHOTO =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231f2937" width="100" height="100"/><text x="50" y="58" text-anchor="middle" fill="%239ca3af" font-size="34">MP</text></svg>';

const LeaderboardView = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<HeroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getIntDotClass = (adjustment: number) => {
    if (adjustment === 0) return 'bg-green-400';
    if (adjustment >= -20) return 'bg-yellow-400';
    if (adjustment >= -40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getIntegrityTooltip = (row: HeroRow) => {
    const adjustment = row.forensic_breakdown?.total_forensic_adjustment ?? 0;
    if (adjustment >= 0) {
      return 'No forensic penalty applied.';
    }

    const engines: Array<{ label: string; penalty?: number }> = [
      { label: "Benford's Law", penalty: row.forensic_breakdown?.benford?.penalty },
      { label: 'Chrono-Forensics', penalty: row.forensic_breakdown?.chrono?.penalty },
      { label: 'Vote Geometry', penalty: row.forensic_breakdown?.vote_geometry?.penalty },
      { label: 'Phantom Network', penalty: row.forensic_breakdown?.phantom_network?.penalty },
    ];
    const topEngine = engines.sort((a, b) => (a.penalty ?? 0) - (b.penalty ?? 0))[0];
    const reason = topEngine?.penalty && topEngine.penalty < 0 ? topEngine.label : 'forensic signals';
    return `Integrity reduced by ${Math.abs(adjustment)} pts due to ${reason}.`;
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v2/heroes/leaderboard`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: HeroRow[]) => {
        setRows(data || []);
        setLoading(false);
      })
      .catch(() => {
        setRows([]);
        setLoading(false);
      });
  }, []);

  const sorted = useMemo(() => {
    const ranked = rows.map((row, i) => ({ ...row, rank: i + 1 }));
    const getValue = (row: HeroRow & { rank: number }, key: SortKey) => {
      if (key === 'rank') return row.rank;
      if (key === 'name') return row.mp.name || '';
      if (key === 'party') return row.mp.party || '';
      if (key === 'level') return row.level;
      if (key === 'xp') return row.xp;
      return row.attributes[key];
    };

    return [...ranked].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const cmp = Number(av) - Number(bv);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'name' || key === 'party' ? 'asc' : 'desc');
  };

  const SortHeader = ({ label, keyName }: { label: string; keyName: SortKey }) => (
    <button
      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gray-400 hover:text-white"
      onClick={() => toggleSort(keyName)}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  if (loading) {
    return (
      <Card className="p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mb-4" />
        Loading hero leaderboard...
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-yellow-400" />
        <div>
          <h2 className="text-3xl font-bold">Hero Leaderboard</h2>
          <p className="text-sm text-gray-400">Ranked by level and experience</p>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4"><SortHeader label="Rank" keyName="rank" /></th>
              <th className="text-left p-4"><SortHeader label="MP" keyName="name" /></th>
              <th className="text-left p-4"><SortHeader label="Party" keyName="party" /></th>
              <th className="text-right p-4"><SortHeader label="Level" keyName="level" /></th>
              <th className="text-right p-4"><SortHeader label="XP" keyName="xp" /></th>
              <th className="text-right p-4"><SortHeader label="STR" keyName="STR" /></th>
              <th className="text-right p-4"><SortHeader label="WIS" keyName="WIS" /></th>
              <th className="text-right p-4"><SortHeader label="CHA" keyName="CHA" /></th>
              <th className="text-right p-4"><SortHeader label="INT" keyName="INT" /></th>
              <th className="text-right p-4"><SortHeader label="STA" keyName="STA" /></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.mp.id}
                className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer"
                onClick={() => navigate(`/dashboard/mps/${row.mp.id}`)}
              >
                <td className="p-4 font-bold text-yellow-300">#{row.rank}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={row.mp.photo || DEFAULT_PHOTO}
                      alt={row.mp.name}
                      className="w-9 h-9 rounded-lg object-cover bg-gray-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_PHOTO;
                      }}
                    />
                    <span className="font-medium">{row.mp.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-300">{row.mp.party || 'Independent'}</td>
                <td className="p-4 text-right font-semibold">{row.level}</td>
                <td className="p-4 text-right font-semibold">{row.xp.toLocaleString()}</td>
                <td className="p-4 text-right">{row.attributes.STR.toFixed(1)}</td>
                <td className="p-4 text-right">{row.attributes.WIS.toFixed(1)}</td>
                <td className="p-4 text-right">{row.attributes.CHA.toFixed(1)}</td>
                <td className="p-4 text-right">
                  <div
                    className="inline-flex items-center justify-end gap-2"
                    title={getIntegrityTooltip(row)}
                  >
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${getIntDotClass(
                        row.forensic_breakdown?.total_forensic_adjustment ?? 0
                      )}`}
                    />
                    {row.attributes.INT.toFixed(1)}
                  </div>
                </td>
                <td className="p-4 text-right">{row.attributes.STA.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default LeaderboardView;
