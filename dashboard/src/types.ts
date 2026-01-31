export interface MP {
  id: string;
  name: string;
  party: string;
  photo: string;
  active?: boolean;
  seimas_id?: string;
  term_start?: string;
  vote_count?: number;
  attendance?: number;
  loyalty?: number;
}

export interface Vote {
  id: string;
  date: string;
  title: string;
  result?: string;
  choice?: string; // For MP context
}

export interface ActivityItem {
  name: string;
  action: string;
  context: string;
  time: string;
}
