import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Vote, TrendingUp, Calendar, ExternalLink, AlertTriangle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { api, MpDetail, MpVoteRecord, MpSummary } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RadarAttributeChart } from '../components/RadarAttributeChart';
import { getPartyColor, getPartyShort } from '../utils/partyColors';

const VoteBadge = ({ choice }: { choice: string }) => {
    const colors: Record<string, string> = {
        'Už': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Prieš': 'bg-red-500/10 text-red-400 border-red-500/20',
        'Susilaikė': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Nedalyvavo': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${colors[choice] || colors['Nedalyvavo']}`}>
            {choice}
        </span>
    );
};

const MpProfileView = ({ mpId }: { mpId: string }) => {
    const [mp, setMp] = useState<MpDetail | null>(null);
    const [votes, setVotes] = useState<MpVoteRecord[]>([]);
    const [mpSummary, setMpSummary] = useState<MpSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mpId) return;
        setLoading(true);
        setError(null);

        Promise.all([
            api.getMp(mpId),
            api.getMpVotes(mpId, 50),
            api.getMps(),
        ])
            .then(([mpData, votesData, allMps]) => {
                setMp(mpData);
                setVotes(votesData);
                const found = allMps.find(m => m.id === mpId);
                setMpSummary(found ?? null);
            })
            .catch(err => {
                console.error('Failed to load MP', err);
                setError('Nepavyko užkrauti profilio. Bandykite dar kartą.');
            })
            .finally(() => setLoading(false));
    }, [mpId]);

    if (loading) {
        return (
            <Card className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
                Kraunamas profilis...
            </Card>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground self-start" onClick={() => window.location.hash = '#/dashboard/mps'}>
                    <ArrowLeft className="w-4 h-4" />
                    Grįžti
                </Button>
                <div className="p-4 border border-destructive/30 bg-destructive/10 rounded-xl flex items-center gap-3 text-destructive">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            </div>
        );
    }

    if (!mp) {
        return (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground mb-4">Narys nerastas</p>
                <Button variant="ghost" onClick={() => window.location.hash = '#/dashboard/mps'}>← Grįžti</Button>
            </Card>
        );
    }

    const attendance = mpSummary?.attendance ?? 0;
    const voteCount = mp.vote_count ?? 0;

    const voteDistribution = votes.reduce((acc, v) => {
        const c = v.choice || 'Nedalyvavo';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(voteDistribution).reduce((a, b) => a + b, 0) || 1;
    const forPct = ((voteDistribution['Už'] ?? 0) / total) * 100;
    const againstPct = ((voteDistribution['Prieš'] ?? 0) / total) * 100;
    const abstainPct = ((voteDistribution['Susilaikė'] ?? 0) / total) * 100;

    const radarData = [
        { label: 'Dalyvavimas', value: Math.min(attendance, 100) },
        { label: 'Už', value: forPct },
        { label: 'Prieš', value: againstPct },
        { label: 'Susilaikė', value: abstainPct },
        { label: 'Aktyvumas', value: Math.min((voteCount / 2509) * 100, 100) },
    ];

    const partyColor = getPartyColor(mp.party);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground self-start" onClick={() => window.location.hash = '#/dashboard/mps'}>
                <ArrowLeft className="w-4 h-4" />
                Grįžti
            </Button>

            {/* Profile Header */}
            <Card className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                    <img
                        src={mp.photo}
                        alt={mp.name}
                        className="w-28 h-28 rounded-2xl object-cover bg-muted shadow-xl ring-4 ring-background group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%239CA3AF" font-size="40">${mp.name.charAt(0)}</text></svg>`; }}
                    />
                    {mp.active && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background">
                            AKTYVUS
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold mb-2">{mp.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                        <span
                            className="px-3 py-1 rounded-full text-white text-xs font-bold"
                            style={{ backgroundColor: partyColor }}
                        >
                            {getPartyShort(mp.party)}
                        </span>
                        <span className="text-muted-foreground">{mp.party || 'Nežinoma'}</span>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    icon={ExternalLink}
                    onClick={() => window.open(`https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1&p_a=seimo_narys&p_asm_id=${mp.seimas_id || ''}`, '_blank')}
                >
                    LRS profilis
                </Button>
            </Card>

            {/* Stats + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="p-6 flex flex-col items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Balsavimo profilis
                        </h3>
                        <RadarAttributeChart
                            data={radarData}
                            size={240}
                            color={partyColor}
                        />
                    </Card>
                </div>
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
                    <StatBlock label="Viso balsavimų" value={voteCount.toString()} icon={Vote} />
                    <StatBlock label="Dalyvavimas" value={`${attendance.toFixed(1)}%`} icon={TrendingUp} />
                    <StatBlock label="Frakcija" value={getPartyShort(mp.party)} icon={Building2} />
                    <StatBlock label="Statusas" value={mp.active ? 'Aktyvus' : 'Neaktyvus'} icon={Calendar} />

                    {/* Vote distribution mini-chart */}
                    <div className="col-span-2">
                        <Card className="p-4">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3">Balsavimų pasiskirstymas</div>
                            <div className="flex h-6 rounded-full overflow-hidden bg-muted">
                                {forPct > 0 && <div className="h-full bg-green-500 flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${forPct}%` }}>{forPct > 10 && `${forPct.toFixed(0)}%`}</div>}
                                {againstPct > 0 && <div className="h-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${againstPct}%` }}>{againstPct > 10 && `${againstPct.toFixed(0)}%`}</div>}
                                {abstainPct > 0 && <div className="h-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${abstainPct}%` }}>{abstainPct > 10 && `${abstainPct.toFixed(0)}%`}</div>}
                            </div>
                            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Už ({voteDistribution['Už'] ?? 0})</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Prieš ({voteDistribution['Prieš'] ?? 0})</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Susilaikė ({voteDistribution['Susilaikė'] ?? 0})</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Voting Record */}
            <Card className="p-0 overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Vote className="w-4 h-4 text-primary" />
                        Balsavimo istorija
                    </h2>
                    <span className="text-[10px] text-muted-foreground">{votes.length} įrašai</span>
                </div>

                {votes.length > 0 ? (
                    <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                        {votes.map((vote, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/20 transition-colors gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate pr-4">{vote.title}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {vote.date}
                                    </div>
                                </div>
                                <div className="self-end sm:self-center">
                                    <VoteBadge choice={vote.choice} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        Balsavimo duomenų šiai kadencijai nėra.
                    </div>
                )}
            </Card>

            {/* Compare CTA */}
            <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                <h3 className="text-xl font-bold mb-2">Palyginti veiklą</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
                    Analizuokite kaip {mp.name} balsuoja lyginant su kitais Seimo nariais.
                </p>
                <Button variant="primary" size="lg" onClick={() => window.location.hash = '#/dashboard/compare'}>
                    Palyginti narius
                </Button>
            </Card>
        </motion.div>
    );
};

function StatBlock({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <Card className="flex items-center gap-3 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
                <div className="font-bold text-lg">{value}</div>
            </div>
        </Card>
    );
}

export default MpProfileView;
