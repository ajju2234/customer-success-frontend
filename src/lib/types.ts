export type Role = "admin" | "manager" | "csm";
export type CustomerStatus = "prospect" | "active" | "at_risk" | "churned";
export type InteractionType = "meeting" | "call" | "email" | "note";
export type Sentiment = "positive" | "neutral" | "negative";
export type InsightStatus = "success" | "fallback";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  health_score: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  interaction_id: string;
  summary: string;
  sentiment: Sentiment;
  action_items: string[];
  risks: string[];
  model: string | null;
  status: InsightStatus;
  created_at: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  user_id: string | null;
  type: InteractionType;
  title: string;
  notes: string | null;
  meeting_date: string;
  created_at: string;
  updated_at: string;
  insight: Insight | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardMetrics {
  total_customers: number;
  customers_by_status: Record<string, number>;
  at_risk_count: number;
  total_interactions: number;
  sentiment_breakdown: Record<string, number>;
  open_risks_count: number;
  interactions_over_time: { date: string; count: number }[];
  recent_interactions: {
    id: string;
    title: string;
    type: string;
    customer_name: string;
    meeting_date: string;
    sentiment: Sentiment | null;
  }[];
  scope: string;
  cached: boolean;
}
