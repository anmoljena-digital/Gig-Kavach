import { Coins, Info, Landmark, LineChart as LineIcon, PiggyBank } from 'lucide-react';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../state/AppContext';
import { ASSUMED_RETURN, SERIES_COLORS } from '../lib/catalog';
import { addDays, inr, inrCompact } from '../lib/format';
import { Card, Pill, ScreenHeader, SectionTitle, Toggle } from '../components/ui';

const GOLD_PER_GRAM = 7860; // mock 24K price

export default function Grow() {
  const { w, t, totalSavings, toggleRoundUp, setAutoSave } = useApp();
  const { gold, mf, nps } = w.savings;

  const split = [
    { key: 'gold', name: 'Gold', value: Math.round(gold), color: SERIES_COLORS.gold },
    { key: 'mf', name: 'Mutual fund', value: Math.round(mf), color: SERIES_COLORS.mf },
    { key: 'nps', name: 'NPS pension', value: Math.round(nps), color: SERIES_COLORS.nps },
  ];

  const { avgRoundUp, last30Saved } = useMemo(() => {
    const from = addDays(w.today, -30);
    const recent = w.txns.filter((x) => x.ts.slice(0, 10) >= from);
    const ru = recent.filter((x) => x.type === 'roundup').reduce((a, x) => a - x.amount, 0);
    const as = recent.filter((x) => x.type === 'autosave').reduce((a, x) => a - x.amount, 0);
    const activeDays = w.days.filter((d) => d.date >= from && d.active).length || 1;
    return { avgRoundUp: Math.round(ru / activeDays), last30Saved: ru + as };
  }, [w.txns, w.days, w.today]);

  const perDay = w.autoSave + (w.roundUp ? avgRoundUp : 0);
  const monthly = perDay * 26;

  const projection = useMemo(() => {
    const r = ASSUMED_RETURN / 12;
    const rows = [];
    let value = totalSavings;
    let invested = totalSavings;
    for (let m = 0; m <= 120; m++) {
      if (m % 6 === 0) rows.push({ year: m / 12, invested: Math.round(invested), value: Math.round(value) });
      value = value * (1 + r) + monthly;
      invested += monthly;
    }
    return rows;
  }, [totalSavings, monthly]);

  const at = (y: number) => projection.find((p) => p.year === y)!;

  return (
    <div>
      <ScreenHeader title={t('grow')} sub="Save a little from every order" />
      <div className="px-4">
        <Card className="bg-ink text-cream border-0">
          <p className="text-sm text-cream/70">{t('totalSaved')}</p>
          <p className="font-heading text-[36px] font-semibold tabular-nums">{inr(totalSavings)}</p>
          <p className="text-xs text-cream/70">+{inr(last30Saved)} in the last 30 days · <span className="text-saffron font-semibold">{inr(perDay)}/working day</span></p>
        </Card>

        <SectionTitle>{t('savingsSplit')}</SectionTitle>
        <Card>
          <div className="flex items-center gap-4">
            <div className="relative size-32 shrink-0" role="img" aria-label={`Savings split: ${split.map((s) => `${s.name} ${inr(s.value)}`).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={split} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="100%" paddingAngle={2} stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {split.map((s) => <Cell key={s.key} fill={s.color} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="bg-ink text-cream text-xs rounded-xl px-3 py-2 shadow">
                          <p className="font-semibold">{payload[0].name}</p>
                          <p>{inr(Number(payload[0].value))} · {Math.round((Number(payload[0].value) / totalSavings) * 100)}%</p>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
                <div>
                  <p className="text-[10px] text-muted">3 places</p>
                  <p className="font-heading font-semibold text-sm">{inrCompact(totalSavings)}</p>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5 min-w-0">
              {split.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span className="size-3 rounded-sm shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-right">
                    <span className="font-semibold tabular-nums block">{inr(s.value)}</span>
                    <span className="text-[11px] text-muted">{Math.round((s.value / totalSavings) * 100)}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-muted">
            <div className="rounded-2xl bg-cream p-2.5"><Coins className="size-4 text-[#C98A1E] mb-1" />{(gold / GOLD_PER_GRAM).toFixed(3)} g 24K gold</div>
            <div className="rounded-2xl bg-cream p-2.5"><LineIcon className="size-4 text-[#009A93] mb-1" />Liquid 70% · Nifty 50 index 30%</div>
            <div className="rounded-2xl bg-cream p-2.5"><Landmark className="size-4 text-[#6B4FA0] mb-1" />Pension from age 60 · min ₹99</div>
          </div>
        </Card>

        <SectionTitle>How you save</SectionTitle>
        <Card>
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-2xl bg-saffron/20 text-saffron-dark grid place-items-center shrink-0"><Coins className="size-5" /></span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('roundUp')}</p>
              <p className="text-xs text-muted">₹47 order → ₹50, ₹3 saved. Avg {inr(avgRoundUp)}/day</p>
            </div>
            <Toggle on={w.roundUp} onChange={toggleRoundUp} label={t('roundUp')} />
          </div>
          <div className="border-t border-line my-4" />
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-2xl bg-saffron/20 text-saffron-dark grid place-items-center shrink-0"><PiggyBank className="size-5" /></span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t('dailyAutoSave')}</p>
              <p className="text-xs text-muted">Every active day at 10:30 pm</p>
            </div>
            <p className="font-heading text-xl font-semibold tabular-nums">{inr(w.autoSave)}</p>
          </div>
          <input type="range" min={10} max={200} step={10} value={w.autoSave} onChange={(e) => setAutoSave(Number(e.target.value))} aria-label="Daily auto-save amount" className="w-full mt-4 h-8" />
          <div className="flex justify-between text-[11px] text-muted -mt-1">
            <span>₹10</span>
            <span>₹200</span>
          </div>
        </Card>

        <SectionTitle>{t('whatBecomes')}</SectionTitle>
        <Card>
          <p className="text-xs text-muted">Saving {inr(monthly)}/month ({inr(perDay)} × 26 days) on top of today's {inr(totalSavings)}</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[1, 5, 10].map((y) => (
              <div key={y} className="rounded-2xl bg-cream p-2.5">
                <p className="text-[11px] text-muted">In {y} yr{y > 1 ? 's' : ''}</p>
                <p className="font-heading font-semibold tabular-nums">{inrCompact(at(y).value)}</p>
                <p className="text-[10px] text-muted">you put {inrCompact(at(y).invested)}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs mt-4">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#009A93]" /> Could become</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#8A8F86] [background:repeating-linear-gradient(90deg,#8A8F86_0_4px,transparent_4px_6px)]" /> You put in</span>
          </div>
          <div className="h-44 mt-2" role="img" aria-label={`Projection: ${inr(at(10).value)} after 10 years at an assumed 8% return`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#009A93" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#009A93" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEEAE0" vertical={false} />
                <XAxis dataKey="year" type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickFormatter={(v) => `${v}y`} tick={{ fontSize: 11, fill: '#5C6B6E' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => (v >= 1e5 ? `${(v / 1e5).toFixed(1)}L` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : `${v}`)} tick={{ fontSize: 10, fill: '#5C6B6E' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  cursor={{ stroke: '#13262B', strokeDasharray: '3 3' }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-ink text-cream text-xs rounded-xl px-3 py-2 shadow">
                        <p className="font-semibold">After {payload[0].payload.year} yrs</p>
                        <p>Could become: {inr(payload[0].payload.value)}</p>
                        <p className="text-cream/70">You put in: {inr(payload[0].payload.invested)}</p>
                      </div>
                    ) : null
                  }
                />
                <Area type="monotone" dataKey="value" stroke="#009A93" strokeWidth={2} fill="url(#gv)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="invested" stroke="#8A8F86" strokeWidth={2} strokeDasharray="4 2" fill="transparent" activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 items-start mt-3 rounded-2xl bg-warn-bg text-warn p-3 text-xs">
            <Info className="size-4 shrink-0 mt-0.5" />
            <p><b>Assumption:</b> {Math.round(ASSUMED_RETURN * 100)}% yearly return, compounded monthly. This is an illustration, not a promise. Gold and fund values can go down.</p>
          </div>
        </Card>
        <div className="flex justify-center mt-4"><Pill tone="neutral">Prototype · no real investments are made</Pill></div>
      </div>
    </div>
  );
}
