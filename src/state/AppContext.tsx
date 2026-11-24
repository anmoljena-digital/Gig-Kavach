import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ADVANCE_CAP, ADVANCE_FEE, ALLOCATION, PLANS, WEATHER_RULES } from '../lib/catalog';
import { DICT, type TKey } from '../lib/i18n';
import { addDays, inr, tsOn, uid } from '../lib/format';
import { roundUpOf, seedState } from '../lib/mockData';
import type { AppState, BenefitId, BenefitStatus, Claim, ClaimStatus, ClaimType, GigApp, Lang, PlanId, Txn, WeatherKind, WorkerState } from '../lib/types';

const STORAGE_KEY = 'gigkavach-demo-v1';

export interface Toast {
  id: string;
  kind: 'success' | 'info' | 'warn';
  title: string;
  body?: string;
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* ignore corrupt / blocked storage */
  }
  return seedState();
}

/** Current wall-clock time placed on the simulated "today". */
function nowOn(today: string): string {
  const n = new Date();
  return tsOn(today, n.getHours(), n.getMinutes());
}

function splitIntoSavings(s: WorkerState['savings'], amount: number): WorkerState['savings'] {
  return {
    gold: s.gold + amount * ALLOCATION.gold,
    mf: s.mf + amount * ALLOCATION.mf,
    nps: s.nps + amount * ALLOCATION.nps,
  };
}

function pushTxn(w: WorkerState, t: Omit<Txn, 'id' | 'ts'> & { ts?: string }): WorkerState {
  return { ...w, txns: [{ id: uid('t'), ts: t.ts ?? nowOn(w.today), ...t }, ...w.txns] };
}

/** Starting the first order of a day switches cover on and charges the day's premium. */
function ensureActiveToday(w: WorkerState): { w: WorkerState; activated: boolean } {
  const idx = w.days.findIndex((d) => d.date === w.today);
  const day = w.days[idx];
  if (day && day.active) return { w, activated: false };
  const plan = PLANS[w.plan];
  const days = [...w.days];
  days[idx] = { ...day, active: true, premium: plan.perDay, plan: w.plan };
  let next: WorkerState = { ...w, days, wallet: w.wallet - plan.perDay };
  next = pushTxn(next, { type: 'premium', amount: -plan.perDay, title: `Daily cover · ${plan.name}`, sub: 'Charged because you logged in today' });
  return { w: next, activated: true };
}

interface Ctx {
  state: AppState;
  w: WorkerState;
  lang: Lang;
  t: (k: TKey) => string;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  // derived
  todayRecord: WorkerState['days'][number] | undefined;
  coverActive: boolean;
  totalSavings: number;
  lastWeekEarnings: number;
  advanceCap: number;
  // worker actions
  completeOnboarding: (phone: string, apps: GigApp[]) => void;
  setLang: (l: Lang) => void;
  setPlan: (p: PlanId) => void;
  setApps: (apps: GigApp[]) => void;
  setNominee: (name: string, relation: string) => void;
  toggleRoundUp: () => void;
  setAutoSave: (n: number) => void;
  simulateOrder: () => void;
  simulateWeather: (kind?: WeatherKind) => void;
  approveClaim: () => void;
  skipDay: () => void;
  fileClaim: (type: ClaimType, description: string, amount: number, photo: boolean) => string;
  advanceClaim: (id: string, status: ClaimStatus, note: string) => void;
  withdrawEmergency: (amount: number) => void;
  addToEmergency: (amount: number) => void;
  takeAdvance: (amount: number) => void;
  setBenefit: (id: BenefitId, s: BenefitStatus) => void;
  resetDemo: () => void;
  // platform actions
  topUpAll: (perDay: number, includeUncovered: boolean) => { workers: number; amount: number };
  setSscRate: (rate: number) => void;
  paySscMonth: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable (private mode) — demo still works in memory */
    }
  }, [state]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dismissToast = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid('toast');
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      timers.current.push(window.setTimeout(() => dismissToast(id), 4000));
    },
    [dismissToast],
  );

  const updW = useCallback((fn: (w: WorkerState) => WorkerState) => setState((s) => ({ ...s, worker: fn(s.worker) })), []);

  const w = state.worker;
  const lang = w.lang;
  const t = useCallback((k: TKey) => DICT[lang][k] ?? DICT.en[k], [lang]);

  const todayRecord = w.days.find((d) => d.date === w.today);
  const coverActive = !!todayRecord?.active;
  const totalSavings = Math.round(w.savings.gold + w.savings.mf + w.savings.nps);
  const lastWeekEarnings = useMemo(() => {
    const from = addDays(w.today, -7);
    return w.days.filter((d) => d.date >= from && d.date < w.today).reduce((a, d) => a + d.earnings, 0);
  }, [w.days, w.today]);
  const advanceCap = Math.max(0, Math.floor((lastWeekEarnings * ADVANCE_CAP) / 50) * 50 - w.advanceOutstanding);

  // ---------------- worker actions ----------------
  const completeOnboarding = (phone: string, apps: GigApp[]) =>
    updW((w) => ({ ...w, onboarded: true, upiLinked: true, worker: { ...w.worker, phone: phone || w.worker.phone, apps: apps.length ? apps : w.worker.apps } }));

  const setLang = (l: Lang) => updW((w) => ({ ...w, lang: l }));
  const setApps = (apps: GigApp[]) => updW((w) => ({ ...w, worker: { ...w.worker, apps } }));
  const setNominee = (name: string, relation: string) => updW((w) => ({ ...w, worker: { ...w.worker, nominee: { name, relation } } }));
  const toggleRoundUp = () => updW((w) => ({ ...w, roundUp: !w.roundUp }));
  const setAutoSave = (n: number) => updW((w) => ({ ...w, autoSave: n }));

  const setPlan = (p: PlanId) => {
    updW((w) => ({ ...w, plan: p }));
    toast({ kind: 'success', title: `Switched to ${PLANS[p].name}`, body: `${inr(PLANS[p].perDay)} per active day, starting tomorrow. Today's cover stays as is.` });
  };

  const simulateOrder = () => {
    const apps = w.worker.apps.length ? w.worker.apps : (['Swiggy'] as GigApp[]);
    const app = apps[Math.floor(Math.random() * apps.length)];
    const amount = 34 + Math.floor(Math.random() * 23);
    const ru = w.roundUp ? roundUpOf(amount) || 5 : 0;
    const { w: base, activated } = ensureActiveToday(w);
    let next = base;
    const days = next.days.map((d) => (d.date === next.today ? { ...d, orders: d.orders + 1, earnings: d.earnings + amount } : d));
    next = { ...next, days, wallet: next.wallet + amount - ru };
    next = pushTxn(next, { type: 'earning', amount, title: `${app} earnings`, sub: '1 order' });
    if (ru > 0) {
      next = pushTxn(next, { type: 'roundup', amount: -ru, title: 'Round-up savings', sub: `${inr(amount)} → ${inr(amount + ru)}` });
      next = { ...next, savings: splitIntoSavings(next.savings, ru) };
    }
    updW(() => next);
    toast({
      kind: 'success',
      title: `New ${app} order · +${inr(amount)}`,
      body: [activated ? `First order today: cover switched on (${inr(PLANS[w.plan].perDay)} charged).` : '', ru ? `${inr(ru)} rounded up into savings.` : ''].filter(Boolean).join(' '),
    });
  };

  const simulateWeather = (kind: WeatherKind = 'rain') => {
    const rule = WEATHER_RULES[kind];
    const reading = kind === 'rain' ? 60 + Math.floor(Math.random() * 30) : kind === 'heat' ? 46 + Math.floor(Math.random() * 3) : 320 + Math.floor(Math.random() * 90);
    const payout = coverActive ? PLANS[w.plan].weather : 0;
    updW((w) => {
      let next: WorkerState = {
        ...w,
        weather: [{ id: uid('w'), date: w.today, kind, city: w.worker.city, reading, threshold: rule.threshold, triggered: true, payout, source: kind === 'aqi' ? 'CPCB station, Talkatora' : 'IMD Amausi AWS' }, ...w.weather],
      };
      if (payout > 0) {
        next = { ...next, wallet: next.wallet + payout };
        next = pushTxn(next, { type: 'payout', amount: payout, title: kind === 'rain' ? 'Rain payout' : kind === 'aqi' ? 'Bad-air payout' : 'Heatwave payout', sub: `Auto-credited · ${reading} ${rule.unit} in ${w.worker.city}` });
      }
      return next;
    });
    if (payout > 0) toast({ kind: 'success', title: `${rule.label} in ${w.worker.city} · +${inr(payout)}`, body: `${reading} ${rule.unit} crossed the ${rule.threshold} ${rule.unit} trigger. Payout credited, no claim needed.` });
    else toast({ kind: 'warn', title: `${rule.label} detected, but cover is paused`, body: 'Payouts only apply on days you are logged in. Take an order to switch cover on.' });
  };

  const approveClaim = () => {
    const pending = w.claims.find((c) => c.status === 'submitted' || c.status === 'review');
    const nowTs = nowOn(w.today);
    updW((w) => {
      let claims = [...w.claims];
      let claim: Claim;
      if (pending) {
        claim = pending;
      } else {
        claim = { id: `CLM-${24300 + claims.length}`, type: 'accident', description: 'Minor accident while on delivery (demo)', amount: 3500, status: 'review', filedOn: nowTs, photo: true, timeline: [{ status: 'submitted', ts: nowTs, note: 'Bills and photo uploaded' }, { status: 'review', ts: nowTs, note: 'Checking bills with insurer' }] };
        claims = [claim, ...claims];
      }
      const approved: Claim = {
        ...claim,
        status: 'paid',
        timeline: [...claim.timeline, { status: 'approved', ts: nowTs, note: `${inr(claim.amount)} approved by insurer` }, { status: 'paid', ts: nowTs, note: 'Sent to your GigKavach wallet' }],
      };
      claims = claims.map((c) => (c.id === claim.id ? approved : c));
      let next: WorkerState = { ...w, claims, wallet: w.wallet + claim.amount };
      next = pushTxn(next, { type: 'payout', amount: claim.amount, title: 'Claim payout · Accident', sub: claim.id });
      return next;
    });
    toast({ kind: 'success', title: `Claim approved · +${inr(pending?.amount ?? 3500)}`, body: 'Money is in your wallet. Settled in under 48 hours.' });
  };

  const skipDay = () => {
    updW((w) => {
      let next = w;
      const today = w.days.find((d) => d.date === w.today);
      // close today: auto-save runs at end of every active day
      if (today?.active && w.autoSave > 0) {
        next = pushTxn(next, { type: 'autosave', amount: -w.autoSave, title: 'Daily auto-save', sub: 'Split into Gold, MF & NPS', ts: tsOn(w.today, 22, 30) });
        next = { ...next, wallet: next.wallet - w.autoSave, savings: splitIntoSavings(next.savings, w.autoSave) };
      }
      const tomorrow = addDays(w.today, 1);
      return { ...next, today: tomorrow, days: [...next.days, { date: tomorrow, active: false, orders: 0, earnings: 0, premium: 0, plan: w.plan }] };
    });
    toast({ kind: 'info', title: 'Moved to the next day', body: 'Not logged in yet, so cover is paused and ₹0 charged. Simulate an order to switch it on.' });
  };

  const fileClaim = (type: ClaimType, description: string, amount: number, photo: boolean) => {
    const id = `CLM-${24300 + Math.floor(Math.random() * 600)}`;
    const ts = nowOn(w.today);
    updW((w) => ({ ...w, claims: [{ id, type, description, amount, status: 'submitted', filedOn: ts, photo, timeline: [{ status: 'submitted', ts, note: photo ? 'Photo and details uploaded' : 'Details submitted' }] }, ...w.claims] }));
    return id;
  };

  const advanceClaim = (id: string, status: ClaimStatus, note: string) =>
    updW((w) => ({ ...w, claims: w.claims.map((c) => (c.id === id ? { ...c, status, timeline: [...c.timeline, { status, ts: nowOn(w.today), note }] } : c)) }));

  const withdrawEmergency = (amount: number) => {
    updW((w) => pushTxn({ ...w, emergencyFund: w.emergencyFund - amount, wallet: w.wallet + amount }, { type: 'withdrawal', amount, title: 'Emergency fund withdrawal', sub: 'Instant, no questions asked' }));
    toast({ kind: 'success', title: `${inr(amount)} moved to your wallet`, body: 'Available instantly for UPI.' });
  };

  const addToEmergency = (amount: number) => {
    updW((w) => pushTxn({ ...w, emergencyFund: w.emergencyFund + amount, wallet: w.wallet - amount }, { type: 'autosave', amount: -amount, title: 'Added to emergency fund', sub: 'From wallet' }));
    toast({ kind: 'success', title: `${inr(amount)} added to emergency fund` });
  };

  const takeAdvance = (amount: number) => {
    updW((w) => pushTxn({ ...w, wallet: w.wallet + amount, advanceOutstanding: w.advanceOutstanding + amount + ADVANCE_FEE }, { type: 'advance', amount, title: 'Earnings advance', sub: `Repaid from next 5 days' earnings · ${inr(ADVANCE_FEE)} flat fee` }));
    toast({ kind: 'success', title: `${inr(amount)} advance credited`, body: `Repay ${inr(amount + ADVANCE_FEE)} automatically over 5 working days.` });
  };

  const setBenefit = (id: BenefitId, s: BenefitStatus) => updW((w) => ({ ...w, benefits: { ...w.benefits, [id]: s } }));

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(seedState());
    setToasts([]);
    toast({ kind: 'info', title: 'Demo reset', body: 'Fresh mock data for Ravi Kumar and QuickBasket.' });
  };

  // ---------------- platform actions ----------------
  const topUpAll = (perDay: number, includeUncovered: boolean) => {
    const p = state.platform;
    const eligible = p.workers.filter((x) => x.daysActive30 > 0 && (x.cover !== 'none' || includeUncovered));
    // estimate: remaining days in month × avg 0.8 active ratio, scaled from sample to whole fleet
    const daysLeft = 30 - new Date().getDate() + 1;
    const fleetScale = 14260 / p.workers.length;
    const amount = Math.round(eligible.length * fleetScale * perDay * daysLeft * 0.8);
    const workers = Math.round(eligible.length * fleetScale);
    setState((s) => ({
      ...s,
      platform: {
        ...s.platform,
        premiumsThisMonth: s.platform.premiumsThisMonth + amount,
        topUps: [{ ts: new Date().toISOString(), workers, amount, perDay }, ...s.platform.topUps],
        workers: s.platform.workers.map((x) => {
          if (!(x.daysActive30 > 0 && (x.cover !== 'none' || includeUncovered))) return x;
          const plan: PlanId = x.plan === 'basic' || !x.plan ? (perDay >= 2 ? 'max' : 'plus') : x.plan === 'plus' && perDay >= 1 ? 'max' : x.plan;
          return { ...x, toppedUp: true, cover: x.cover === 'none' ? 'active' : x.cover, plan };
        }),
      },
    }));
    toast({ kind: 'success', title: `Cover topped up for ${workers.toLocaleString('en-IN')} workers`, body: `Est. ${inr(amount)} for the rest of this month, billed only on active days.` });
    return { workers, amount };
  };

  const setSscRate = (rate: number) =>
    setState((s) => {
      const { turnoverFY, workerPayoutsFY, monthly } = s.platform.ssc;
      const annual = Math.min((turnoverFY * rate) / 100, workerPayoutsFY * 0.05);
      const seasonal = [0.9, 0.92, 0.95, 1.0, 0.98, 1.02, 1.12, 1.08, 1.04, 0.98, 0.97, 1.04];
      return {
        ...s,
        platform: { ...s.platform, ssc: { ...s.platform.ssc, rate, monthly: monthly.map((m, i) => (m.paid > 0 ? m : { ...m, due: Math.round(((annual / 12) * seasonal[i]) / 1000) * 1000 })) } },
      };
    });

  const paySscMonth = () => {
    const m = state.platform.ssc.monthly.find((x) => x.paid === 0);
    if (!m) return;
    setState((s) => ({ ...s, platform: { ...s.platform, ssc: { ...s.platform.ssc, monthly: s.platform.ssc.monthly.map((x) => (x.month === m.month ? { ...x, paid: x.due } : x)) } } }));
    toast({ kind: 'success', title: `${m.month} contribution paid`, body: `${inr(m.due)} sent to the Social Security Fund (mock).` });
  };

  const value: Ctx = {
    state, w, lang, t, toasts, toast, dismissToast,
    todayRecord, coverActive, totalSavings, lastWeekEarnings, advanceCap,
    completeOnboarding, setLang, setPlan, setApps, setNominee, toggleRoundUp, setAutoSave,
    simulateOrder, simulateWeather, approveClaim, skipDay, fileClaim, advanceClaim,
    withdrawEmergency, addToEmergency, takeAdvance, setBenefit, resetDemo,
    topUpAll, setSscRate, paySscMonth,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
