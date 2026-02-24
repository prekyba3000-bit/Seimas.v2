import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import HeroCard from '../components/HeroCard';

interface HeroResponse {
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
  attributes: {
    STR: number;
    WIS: number;
    CHA: number;
    INT: number;
    STA: number;
  };
  artifacts: Array<{ name: string; rarity: string }>;
  forensic_breakdown: {
    base_risk_score: number;
    base_risk_penalty: number;
    benford: { status: string; p_value?: number | null; penalty: number; explanation: string };
    chrono: { status: string; worst_zscore?: number | null; penalty: number; explanation: string };
    vote_geometry: { status: string; max_deviation_sigma?: number | null; penalty: number; explanation: string };
    phantom_network: {
      status: string;
      procurement_links: number;
      closest_hop_count?: number | null;
      debtor_links: number;
      penalty: number;
      explanation: string;
    };
    loyalty_bonus: {
      status: string;
      independent_voting_days_pct: number;
      bonus: number;
      explanation: string;
    };
    total_forensic_adjustment: number;
    final_integrity_score: number;
  };
}

interface MpProfileLayoutProps {
  hero: HeroResponse | null;
  loading?: boolean;
  error?: string | null;
}

export const MpProfileLayout = ({ hero, loading = false, error = null }: MpProfileLayoutProps) => {
  if (loading) {
    return (
      <Card className="p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mb-4" />
        Loading hero profile...
      </Card>
    );
  }

  if (!hero || error) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-400 mb-4">{error || 'MP not found'}</p>
        <Button variant="ghost" onClick={() => (window.location.hash = '#/dashboard/mps')}>
          Back to list
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          className="pl-0 gap-2 text-gray-400 hover:text-white"
          onClick={() => (window.location.hash = '#/dashboard/mps')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to MPs
        </Button>
      </div>
      <HeroCard hero={hero} />
    </div>
  );
};

const MpProfileView = ({ mpId }: { mpId: string }) => {
  const [hero, setHero] = useState<HeroResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mpId) return;

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/v2/heroes/${mpId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'MP not found' : 'Failed to load hero profile');
        }
        return res.json();
      })
      .then((payload: HeroResponse) => {
        setHero(payload);
        setLoading(false);
      })
      .catch((err: Error) => {
        setHero(null);
        setError(err.message);
        setLoading(false);
      });
  }, [mpId]);

  return <MpProfileLayout hero={hero} loading={loading} error={error} />;
};

export default MpProfileView;
