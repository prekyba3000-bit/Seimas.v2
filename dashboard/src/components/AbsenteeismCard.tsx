import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface AbsenteeRecord {
  rank: number;
  name: string;
  photo_url?: string;
  days_present?: number;
  total_days?: number;
  votes_cast?: number;
  total_possible?: number;
  participation_pct: number;
}

interface AbsenteeismData {
  title: string;
  description: string;
  generated_at: string;
  absentees: AbsenteeRecord[];
}

export const AbsenteeismCard: React.FC = () => {
  const [data, setData] = useState<AbsenteeismData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/absenteeism.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-lg border p-6 transition-colors"
        style={{
          backgroundColor: 'var(--background-surface)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <div className="animate-pulse">
          <div
            className="h-6 rounded w-1/3 mb-4"
            style={{ backgroundColor: 'var(--background-elevated)' }}
          ></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded"
                style={{ backgroundColor: 'var(--background-elevated)' }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="rounded-lg border p-6 transition-colors"
        style={{
          backgroundColor: 'var(--background-surface)',
          borderColor: 'var(--status-danger)',
          borderOpacity: '0.2',
        }}
      >
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--status-danger)' }}>
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {error || 'No data available'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-6 transition-colors"
      style={{
        backgroundColor: 'var(--background-surface)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--primary-500)' }}>
            {data.title}
          </h2>
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--status-danger)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {data.description}
        </p>
      </div>

      <div className="space-y-4">
        {data.absentees.map((record) => (
          <div
            key={record.rank}
            className="pb-4 last:border-b-0"
            style={{
              borderBottom: `1px solid var(--glass-border)`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'var(--status-danger)',
                    backgroundOpacity: '0.1',
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--status-danger)' }}
                  >
                    #{record.rank}
                  </span>
                </div>
                {/* Photo Display */}
                {record.photo_url ? (
                  <img
                    src={record.photo_url}
                    alt={record.name}
                    className="w-8 h-8 rounded-full object-cover border"
                    style={{ borderColor: 'var(--status-danger)' }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--background-elevated)' }}
                  />
                )}
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {record.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {record.days_present ?? record.votes_cast} / {record.total_days ?? record.total_possible} posėdžių dienų
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold"
                  style={{ color: 'var(--status-danger)' }}
                >
                  {record.participation_pct}%
                </p>
              </div>
            </div>

            {/* Progress Bar with semantic colors */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--background-elevated)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${record.participation_pct}%`,
                  backgroundColor:
                    record.participation_pct >= 80
                      ? 'var(--status-success)'
                      : record.participation_pct >= 50
                      ? 'var(--status-warning)'
                      : 'var(--status-danger)',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 pt-4"
        style={{
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Last updated: {new Date(data.generated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AbsenteeismCard;
