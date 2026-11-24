// ---------- Mock data model for GigKavach ----------
// Everything is local mock data. No real payments, KYC, insurer or bank APIs.

export type Lang = 'en' | 'hi';

export const GIG_APPS = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Urban Company', 'Snabbit', 'Pronto'] as const;
export type GigApp = (typeof GIG_APPS)[number];

export type PlanId = 'basic' | 'plus' | 'max';

/** One calendar day of the worker's history. Cover + billing only run on active days. */
export interface DayRecord {
  date: string; // YYYY-MM-DD
  active: boolean; // logged in to at least one gig app
  orders: number;
  earnings: number; // ₹ gross from platforms
  premium: number; // ₹ charged for cover that day (0 when paused)
  plan: PlanId;
}

export type TxnType =
  | 'earning'
  | 'premium'
  | 'roundup'
  | 'autosave'
  | 'payout' // weather / claim payouts
  | 'withdrawal' // emergency fund -> wallet
  | 'advance'
  | 'topup'; // platform-funded cover top-up

export interface Txn {
  id: string;
  ts: string; // ISO timestamp
  type: TxnType;
  amount: number; // positive = money in to wallet/savings, negative = money out
  title: string;
  sub?: string;
}

export type ClaimType = 'accident' | 'hospital' | 'phone' | 'bike';
export type ClaimStatus = 'submitted' | 'review' | 'approved' | 'paid' | 'rejected';

export interface ClaimStep {
  status: ClaimStatus;
  ts: string;
  note: string;
}

export interface Claim {
  id: string;
  type: ClaimType;
  description: string;
  amount: number;
  status: ClaimStatus;
  filedOn: string;
  photo: boolean;
  timeline: ClaimStep[];
}

export type WeatherKind = 'rain' | 'heat' | 'aqi';

export interface WeatherEvent {
  id: string;
  date: string; // YYYY-MM-DD
  kind: WeatherKind;
  city: string;
  reading: number;
  threshold: number;
  triggered: boolean;
  payout: number;
  source: string;
}

export interface Savings {
  gold: number;
  mf: number;
  nps: number;
}

export type BenefitId = 'eshram' | 'pmjay' | 'pmsby';
export type BenefitStatus = 'registered' | 'not_registered' | 'applied';

export interface Worker {
  name: string;
  age: number;
  city: string;
  phone: string;
  apps: GigApp[];
  upiId: string;
  nominee: { name: string; relation: string };
}

export interface WorkerState {
  onboarded: boolean;
  lang: Lang;
  today: string; // simulated "today" (YYYY-MM-DD); "Skip a day" advances it
  worker: Worker;
  upiLinked: boolean;
  plan: PlanId;
  wallet: number;
  emergencyFund: number;
  savings: Savings;
  roundUp: boolean;
  autoSave: number; // ₹ per active day
  advanceOutstanding: number;
  days: DayRecord[];
  txns: Txn[];
  claims: Claim[];
  weather: WeatherEvent[];
  benefits: Record<BenefitId, BenefitStatus>;
}

// ---------- Platform (B2B) ----------
export interface PlatformWorker {
  id: string;
  name: string;
  city: string;
  zone: string;
  daysActive30: number;
  payout30: number; // ₹ earnings paid out by the platform in 30 days
  cover: 'active' | 'paused' | 'none';
  plan: PlanId | null;
  toppedUp: boolean;
}

export interface PlatformState {
  name: string;
  workers: PlatformWorker[];
  premiumsThisMonth: number;
  claimsSettled: number;
  avgSettlementHrs: number;
  topUps: { ts: string; workers: number; amount: number; perDay: number }[];
  ssc: {
    turnoverFY: number; // ₹ aggregator annual turnover
    workerPayoutsFY: number; // ₹ paid to gig workers in the FY
    rate: number; // 1–2 %
    monthly: { month: string; due: number; paid: number }[];
  };
}

export interface AppState {
  worker: WorkerState;
  platform: PlatformState;
}
