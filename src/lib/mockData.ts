import { ALLOCATION, PLANS } from './catalog';
import { addDays, isoDate, parseDate, tsOn } from './format';
import type { AppState, Claim, DayRecord, PlatformState, PlatformWorker, Txn, WeatherEvent, WorkerState } from './types';

/** Deterministic PRNG so every "Reset demo" gives the same story. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (r: () => number, a: number, b: number) => Math.round(a + r() * (b - a));

/** Simulate a day's orders. Returns per-order earnings so round-ups are exact. */
export function simulateOrders(r: () => number, count: number): number[] {
  return Array.from({ length: count }, () => between(r, 34, 56));
}

export const roundUpOf = (amount: number) => (5 - (amount % 5)) % 5; // round each order up to the next ₹5

function seedWorker(): WorkerState {
  const r = mulberry32(2611);
  const today = isoDate(new Date());
  const planId = 'plus' as const;
  const plan = PLANS[planId];
  const autoSave = 20;
  const days: DayRecord[] = [];
  const txns: Txn[] = [];
  let roundUps = 0;
  let autoSaved = 0;


  for (let i = 59; i >= 0; i--) {
    const date = addDays(today, -i);
    const dow = parseDate(date).getDay();
    // Ravi takes most Tuesdays off and the odd extra day.
    const active = i === 0 ? true : !(dow === 2 && r() < 0.85) && r() > 0.07;
    if (!active) {
      days.push({ date, active: false, orders: 0, earnings: 0, premium: 0, plan: planId });
      continue;
    }
    const orderCount = i === 0 ? 9 : between(r, 13, 23);
    const orders = simulateOrders(r, orderCount);
    const swiggyN = Math.round(orderCount * 0.6);
    const swiggy = orders.slice(0, swiggyN).reduce((a, b) => a + b, 0);
    const blinkit = orders.slice(swiggyN).reduce((a, b) => a + b, 0);
    const ru = orders.reduce((a, o) => a + roundUpOf(o), 0);
    const earnings = swiggy + blinkit;
    days.push({ date, active: true, orders: orderCount, earnings, premium: plan.perDay, plan: planId });


    const endHour = i === 0 ? 14 : 22;
    txns.push({ id: `p_${date}`, ts: tsOn(date, 7, 55), type: 'premium', amount: -plan.perDay, title: `Daily cover · ${plan.name}`, sub: 'Charged because you logged in today' });
    txns.push({ id: `es_${date}`, ts: tsOn(date, endHour, 10), type: 'earning', amount: swiggy, title: 'Swiggy earnings', sub: `${swiggyN} orders` });
    txns.push({ id: `eb_${date}`, ts: tsOn(date, endHour, 12), type: 'earning', amount: blinkit, title: 'Blinkit earnings', sub: `${orderCount - swiggyN} orders` });
    txns.push({ id: `r_${date}`, ts: tsOn(date, endHour, 15), type: 'roundup', amount: -ru, title: 'Round-up savings', sub: `${orderCount} orders rounded to next ₹5` });
    roundUps += ru;
    if (i !== 0) {
      txns.push({ id: `a_${date}`, ts: tsOn(date, 22, 30), type: 'autosave', amount: -autoSave, title: 'Daily auto-save', sub: 'Split into Gold, MF & NPS' });
      autoSaved += autoSave;
    }
  }

  // Weather history in Lucknow (late monsoon → winter smog season)
  const w = (daysAgo: number, kind: WeatherEvent['kind'], reading: number, threshold: number, source: string): WeatherEvent => {
    const triggered = reading >= threshold;
    return { id: `w_${daysAgo}_${kind}`, date: addDays(today, -daysAgo), kind, city: 'Lucknow', reading, threshold, triggered, payout: triggered ? plan.weather : 0, source };
  };
  const weather: WeatherEvent[] = [
    w(4, 'aqi', 276, 300, 'CPCB station, Talkatora'),
    w(9, 'aqi', 388, 300, 'CPCB station, Talkatora'),
    w(18, 'aqi', 342, 300, 'CPCB station, Lalbagh'),
    w(47, 'rain', 38, 50, 'IMD Amausi AWS'),
    w(54, 'rain', 72, 50, 'IMD Amausi AWS'),
    w(57, 'heat', 37, 45, 'IMD Amausi AWS'),
  ];
  for (const e of weather.filter((e) => e.triggered)) {
    txns.push({
      id: `wp_${e.id}`,
      ts: tsOn(e.date, 19, 5),
      type: 'payout',
      amount: e.payout,
      title: e.kind === 'rain' ? 'Rain payout' : e.kind === 'aqi' ? 'Bad-air payout' : 'Heatwave payout',
      sub: `Auto-credited · ${e.reading} ${e.kind === 'aqi' ? 'AQI' : e.kind === 'rain' ? 'mm' : '°C'} in Lucknow`,
    });
  }

  const claims: Claim[] = [
    {
      id: 'CLM-24081',
      type: 'hospital',
      description: 'Admitted 2 days for dengue at Balrampur Hospital',
      amount: plan.hospitalCash * 2,
      status: 'paid',
      filedOn: tsOn(addDays(today, -41), 11, 20),
      photo: true,
      timeline: [
        { status: 'submitted', ts: tsOn(addDays(today, -41), 11, 20), note: 'Discharge summary uploaded' },
        { status: 'review', ts: tsOn(addDays(today, -41), 15, 5), note: 'Hospital records verified' },
        { status: 'approved', ts: tsOn(addDays(today, -40), 10, 40), note: '2 days × ₹750 hospital cash' },
        { status: 'paid', ts: tsOn(addDays(today, -40), 10, 42), note: 'Sent to wallet' },
      ],
    },
    {
      id: 'CLM-24217',
      type: 'accident',
      description: 'Bike skidded on wet road near Hazratganj, wrist sprain + X-ray',
      amount: 4200,
      status: 'review',
      filedOn: tsOn(addDays(today, -2), 9, 15),
      photo: true,
      timeline: [
        { status: 'submitted', ts: tsOn(addDays(today, -2), 9, 15), note: 'Bills and photo uploaded' },
        { status: 'review', ts: tsOn(addDays(today, -2), 13, 30), note: 'Checking bills with insurer' },
      ],
    },
  ];
  txns.push({ id: 'cp_24081', ts: claims[0].timeline[3].ts, type: 'payout', amount: claims[0].amount, title: 'Claim payout · Hospital cash', sub: claims[0].id });

  // Emergency fund was used once
  txns.push({ id: 'wd_1', ts: tsOn(addDays(today, -40), 18, 0), type: 'withdrawal', amount: 1000, title: 'Emergency fund withdrawal', sub: 'Medicines' });

  txns.sort((a, b) => b.ts.localeCompare(a.ts));

  const totalSaved = roundUps + autoSaved;
  const gain = 1.012; // small mark-to-market gain on the mock portfolio
  return {
    onboarded: false,
    lang: 'en',
    today,
    worker: {
      name: 'Ravi Kumar',
      age: 26,
      city: 'Lucknow',
      phone: '98390 41726',
      apps: ['Swiggy', 'Blinkit'],
      upiId: 'ravi.k@okaxis',
      nominee: { name: 'Sunita Devi', relation: 'Mother' },
    },
    upiLinked: false,
    plan: planId,
    wallet: 3460,
    emergencyFund: 2400,
    savings: {
      gold: Math.round(totalSaved * ALLOCATION.gold * gain),
      mf: Math.round(totalSaved * ALLOCATION.mf * gain),
      nps: Math.round(totalSaved * ALLOCATION.nps),
    },
    roundUp: true,
    autoSave,
    advanceOutstanding: 0,
    days,
    txns,
    claims,
    weather,
    benefits: { eshram: 'not_registered', pmjay: 'not_registered', pmsby: 'registered' },
  };
}

const FIRST = ['Aarav', 'Imran', 'Suresh', 'Pooja', 'Rahul', 'Mohit', 'Deepak', 'Faizan', 'Anjali', 'Vikas', 'Sanjay', 'Kiran', 'Arjun', 'Neha', 'Ravi', 'Salman', 'Manoj', 'Prakash', 'Rekha', 'Ajay', 'Gaurav', 'Nitin', 'Sunil', 'Tarun'];
const LAST = ['Yadav', 'Khan', 'Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Ansari', 'Reddy', 'Nair', 'Das', 'Mishra', 'Kumar', 'Shaikh', 'Joshi'];
const HUBS: [string, string][] = [
  ['Bengaluru', 'HSR Layout'], ['Bengaluru', 'Indiranagar'], ['Pune', 'Kothrud'], ['Pune', 'Baner'],
  ['Hyderabad', 'Madhapur'], ['Delhi NCR', 'Sector 29'], ['Delhi NCR', 'Saket'], ['Lucknow', 'Gomti Nagar'],
];

function seedPlatform(): PlatformState {
  const r = mulberry32(77);
  const workers: PlatformWorker[] = Array.from({ length: 48 }, (_, i) => {
    const [city, zone] = HUBS[between(r, 0, HUBS.length - 1)];
    const roll = r();
    const cover: PlatformWorker['cover'] = roll < 0.66 ? 'active' : roll < 0.86 ? 'paused' : 'none';
    const daysActive30 = cover === 'none' ? between(r, 4, 22) : between(r, 12, 28);
    const plans = ['basic', 'basic', 'plus', 'plus', 'max'] as const;
    return {
      id: `QB-${String(10231 + i * 7)}`,
      name: `${FIRST[between(r, 0, FIRST.length - 1)]} ${LAST[between(r, 0, LAST.length - 1)]}`,
      city,
      zone,
      daysActive30,
      payout30: daysActive30 * between(r, 620, 980),
      cover,
      plan: cover === 'none' ? null : plans[between(r, 0, plans.length - 1)],
      toppedUp: false,
    };
  });

  const turnoverFY = 1_200_00_00_000; // ₹1,200 Cr
  const workerPayoutsFY = 420_00_00_000; // ₹420 Cr
  const rate = 1.5;
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const now = new Date();
  // FY month index (Apr = 0)
  const fyIdx = (now.getMonth() + 9) % 12;
  const annual = Math.min((turnoverFY * rate) / 100, workerPayoutsFY * 0.05);
  const seasonal = [0.9, 0.92, 0.95, 1.0, 0.98, 1.02, 1.12, 1.08, 1.04, 0.98, 0.97, 1.04];
  const monthly = months.map((m, i) => {
    const due = Math.round(((annual / 12) * seasonal[i]) / 1000) * 1000;
    return { month: m, due, paid: i < fyIdx ? due : 0 };
  });

  return {
    name: 'QuickBasket',
    workers,
    premiumsThisMonth: 38_42_600,
    claimsSettled: 412,
    avgSettlementHrs: 31,
    topUps: [],
    ssc: { turnoverFY, workerPayoutsFY, rate, monthly },
  };
}

export const PLATFORM_TOTALS = { activeWorkers: 14_260 };

export function seedState(): AppState {
  return { worker: seedWorker(), platform: seedPlatform() };
}
