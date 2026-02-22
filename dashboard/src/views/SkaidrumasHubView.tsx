import React from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Database, Radio, Search, ShieldAlert } from 'lucide-react';
import { api, DashboardStats, HeroesVillainsResponse, MpSummary, VoteSummary } from '../services/api';

type SourceStatus = {
  name: string;
  detail: string;
  state: 'active' | 'partial';
};

const SOURCES: SourceStatus[] = [
  { name: 'data.gov.lt API', detail: 'Viešieji rinkiniai ir registrai', state: 'active' },
  { name: 'Seimas XML API', detail: 'Balsavimai, posėdžiai, pataisos', state: 'active' },
  { name: 'VMI + VRK', detail: 'Deklaracijos ir finansiniai duomenys', state: 'active' },
  { name: 'Registrų Centras', detail: 'Įmonių ir ryšių duomenys', state: 'active' },
  { name: 'Rekvizitai', detail: 'Papildomas kontekstas (dalinis)', state: 'partial' },
  { name: 'OpenSanctions / ICIJ', detail: 'Tarptautiniai ryšiai ir PEP', state: 'active' },
];

export default function SkaidrumasHubView() {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [mps, setMps] = React.useState<MpSummary[]>([]);
  const [votes, setVotes] = React.useState<VoteSummary[]>([]);
  const [accountability, setAccountability] = React.useState<HeroesVillainsResponse | null>(null);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([api.getStats(), api.getMps(), api.getVotes(8, 0), api.getHeroesVillains(10)])
      .then(([s, m, v, hv]) => {
        setStats(s);
        setMps(m);
        setVotes(v);
        setAccountability(hv);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredMps = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mps
      .filter((mp) => mp.name.toLowerCase().includes(q) || (mp.party || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [mps, query]);

  const riskyMps = React.useMemo(
    () => [...mps].sort((a, b) => (a.attendance ?? 0) - (b.attendance ?? 0)).slice(0, 6),
    [mps],
  );

  const tickerItems = React.useMemo(() => {
    const lowAttendanceCount = mps.filter((m) => (m.attendance ?? 0) < 60).length;
    const newestVote = votes[0]?.title ?? 'Nėra naujausių įrašų';
    return [
      `Seimo nariai: ${stats?.total_mps ?? '—'}`,
      `Balsavimai: ${stats?.historical_votes ?? '—'}`,
      `Žemas lankomumas (<60%): ${lowAttendanceCount}`,
      `Naujausias balsavimas: ${newestVote}`,
    ];
  }, [stats, mps, votes]);

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Kraunama „Skaidrumas Hub“...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Lietuvos valstybinis skaidrumas</p>
        <h1 className="text-4xl md:text-5xl font-black leading-tight">
          Neįmanoma būti <span className="text-primary">suktam</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Viešoji atskaitomybės platforma: balsavimai, dalyvavimas, deklaracijos ir ryšiai vienoje vietoje.
        </p>
        <div className="mt-6 relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ieškoti parlamento nario arba frakcijos..."
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        {filteredMps.length > 0 && (
          <div className="mt-3 grid gap-2 max-w-xl">
            {filteredMps.map((mp) => (
              <button
                key={mp.id}
                onClick={() => navigate(`/dashboard/mps/${mp.id}`)}
                className="text-left rounded-md border border-border px-3 py-2 hover:bg-muted/40"
              >
                <div className="font-medium text-sm">{mp.name}</div>
                <div className="text-xs text-muted-foreground">{mp.party || 'Nežinoma'} · {mp.attendance}% lankomumas</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary border-b border-border bg-primary/5">
          Gyvai
        </div>
        <div className="flex overflow-hidden whitespace-nowrap">
          <div className="animate-[scroll_35s_linear_infinite] py-2">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-block px-8 text-sm text-muted-foreground border-r border-border">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Įspėjimai</h2>
          </div>
          <div className="space-y-2">
            {riskyMps.slice(0, 5).map((mp) => (
              <div key={mp.id} className="rounded-md border border-border p-3">
                <div className="text-sm font-semibold">{mp.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Žemas lankomumas: {mp.attendance}% · {mp.party || 'Nežinoma frakcija'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skaidrumo indeksas</h2>
          </div>
          <div className="space-y-2">
            {riskyMps.map((mp) => {
              const risk = Math.round(100 - (mp.attendance ?? 0));
              return (
                <div key={mp.id} className="flex items-center justify-between border-b border-border/60 py-2">
                  <div>
                    <div className="text-sm font-medium">{mp.name}</div>
                    <div className="text-xs text-muted-foreground">{mp.party || 'Nežinoma'}</div>
                  </div>
                  <span className="text-sm font-mono text-primary">{risk}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Balsavimų srautas</h2>
          </div>
          <div className="space-y-2">
            {votes.map((vote) => (
              <button
                key={vote.id}
                onClick={() => navigate(`/dashboard/votes/${vote.id}`)}
                className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/30"
              >
                <div className="text-sm font-medium line-clamp-2">{vote.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{vote.date}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top 10 herojai</h2>
            </div>
            <span className="text-xs text-muted-foreground">7 d.</span>
          </div>
          <div className="space-y-2">
            {(accountability?.heroes ?? []).map((item) => (
              <button
                key={`hero-${item.id}`}
                onClick={() => navigate(`/dashboard/mps/${item.id}`)}
                className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">#{item.rank} {item.name}</div>
                  <div className="text-xs text-emerald-400 font-mono">{item.integrity_score}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{item.party || 'Nežinoma'} · {item.attendance}% lankomumas</div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {item.hero_evidence.slice(0, 3).map((evidence) => (
                    <li key={`${item.id}-${evidence}`}>• {evidence}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top 10 stebėsena</h2>
            </div>
            <span className="text-xs text-muted-foreground">7 d.</span>
          </div>
          <div className="space-y-2">
            {(accountability?.watchlist ?? []).map((item) => (
              <button
                key={`watch-${item.id}`}
                onClick={() => navigate(`/dashboard/mps/${item.id}`)}
                className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">#{item.rank} {item.name}</div>
                  <div className="text-xs text-rose-400 font-mono">{item.risk_score}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{item.party || 'Nežinoma'} · {item.attendance}% lankomumas</div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {item.watch_evidence.slice(0, 3).map((evidence) => (
                    <li key={`${item.id}-${evidence}`}>• {evidence}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Duomenų šaltiniai</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {SOURCES.map((source) => (
            <div key={source.name} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{source.name}</span>
                <span className={source.state === 'active' ? 'text-emerald-400 text-xs' : 'text-amber-400 text-xs'}>
                  {source.state === 'active' ? 'aktyvus' : 'dalinis'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{source.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
