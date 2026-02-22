import { API_URL as ConfigApiUrl } from "../config";

const API_BASE = `${import.meta.env.VITE_API_URL || ConfigApiUrl}/api`;

// ── Response types matching backend ──────────────────────────────────────────

export interface DashboardStats {
  total_mps: number;
  historical_votes: string;
  individual_votes: string;
  accuracy: string;
}

export interface ActivityItem {
  name: string;
  action: string;
  context: string;
  time: string;
}

export interface MpSummary {
  id: string;
  name: string;
  normalized_name: string;
  party: string;
  is_active: boolean;
  photo_url: string;
  vote_count: number;
  attendance: number;
  vote_mode: string | null;
}

export interface MpDetail {
  id: string;
  name: string;
  party: string;
  photo: string;
  active: boolean;
  seimas_id: number | null;
  vote_count: number;
}

export interface MpVoteRecord {
  title: string;
  date: string;
  choice: string;
}

export interface VoteSummary {
  id: string;
  date: string;
  title: string;
  result: string | null;
}

export interface VoteDetail {
  id: string;
  date: string;
  title: string;
  description: string | null;
  url: string | null;
  result_type: string | null;
  stats: Record<string, number>;
  party_stats: Record<string, Record<string, number>>;
  votes: { name: string; party: string; choice: string }[];
}

export interface ComparisonResult {
  mps: { id: string; name: string; party: string; photo: string }[];
  alignment_matrix: number[][];
  divergent_votes: {
    vote_id: string;
    title: string;
    date: string;
    votes: Record<string, string>;
  }[];
}

export interface AccountabilityPerson {
  id: string;
  name: string;
  party: string | null;
  photo_url: string | null;
  attendance: number;
  vote_count: number;
  risk_score: number;
  integrity_score: number;
  risk_signals_7d: { high: number; medium: number; low: number };
  hero_evidence: string[];
  watch_evidence: string[];
  rank: number;
}

export interface HeroesVillainsResponse {
  generated_at: string;
  window_days: number;
  heroes: AccountabilityPerson[];
  watchlist: AccountabilityPerson[];
}

// ── Request helper ───────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail);
  }

  return response.json();
}

// ── Public API ───────────────────────────────────────────────────────────────

export const api = {
  getStats: () => request<DashboardStats>("/stats"),

  getActivity: () => request<ActivityItem[]>("/activity"),

  getMps: () => request<MpSummary[]>("/mps"),

  getMp: (id: string) => request<MpDetail>(`/mps/${id}`),

  getMpVotes: (id: string, limit = 20) =>
    request<MpVoteRecord[]>(`/mps/${id}/votes?limit=${limit}`),

  getVotes: (limit = 50, offset = 0) =>
    request<VoteSummary[]>(`/votes?limit=${limit}&offset=${offset}`),

  getVote: (id: string) => request<VoteDetail>(`/votes/${id}`),

  compareMps: (ids: string[]) =>
    request<ComparisonResult>(`/mps/compare?ids=${ids.join(",")}`),

  getHeroesVillains: (limit = 10) =>
    request<HeroesVillainsResponse>(`/accountability/heroes-villains?limit=${limit}`),
};
