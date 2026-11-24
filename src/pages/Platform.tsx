import { ArrowLeft, CheckCircle2, Clock, Info, Search, ShieldCheck, Sparkles, Users, Wallet, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../state/AppContext';
import { PLANS } from '../lib/catalog';
import { PLATFORM_TOTALS } from '../lib/mockData';
import { inr, inrCompact, num } from '../lib/format';
import type { PlatformWorker } from '../lib/types';
import { Button, Logo, Pill, Toasts, cx } from '../components/ui';

export default function Platform() {
  const { state, topUpAll, setSscRate, paySscMonth } = useApp();
  const p = state.platform;
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | PlatformWorker['cover']>('all');
  const [modal, setModal] = useState(false);

  const coveredRatio = p.workers.filter((x) => x.cover !== 'none').length / p.workers.length;
  const covered = Math.round(PLATFORM_TOTALS.activeWorkers * coveredRatio);
  const toppedUp = p.workers.filter((x) => x.toppedUp).length;

  const rows = useMemo(
    () => p.workers.filter((x) => (status === 'all' || x.cover === status) && (!q || `${x.name} ${x.id} ${x.city} ${x.zone}`.toLowerCase().includes(q.toLowerCase()))),
    [p.workers, q, status],
  );

  const kpis = [
    { label: 'Active workers covered', value: num(covered), sub: `${Math.round(coveredRatio * 100)}% of ${num(PLATFORM_TOTALS.activeWorkers)} active`, icon: Users },
    { label: 'Premiums paid this month', value: inrCompact(p.premiumsThisMonth), sub: 'Only on days workers logged in', icon: Wallet },
    { label: 'Claims settled (FY)', value: num(p.claimsSettled), sub: '96% approved', icon: ShieldCheck },
    { label: 'Avg settlement time', value: `${p.avgSettlementHrs} hrs`, sub: 'Weather payouts: instant', icon: Clock },
  ];

  return (
    <div className="min-h-full bg-cream">
      <Toasts inPhone={false} />
      <header className="bg-ink text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-4">
          <Link to="/" aria-label="Back to landing" className="size-10 rounded-full grid place-items-center hover:bg-white/10"><ArrowLeft className="size-5" /></Link>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-xl font-semibold">{p.name} <span className="text-cream/60 font-normal text-sm">· Worker welfare</span></p>
            <p className="text-xs text-cream/60 flex items-center gap-1.5">Powered by <Logo light className="text-xs [&_svg]:size-4" /></p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-saffron text-ink text-xs font-semibold px-3 py-1">Fictional aggregator · mock data</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="bg-white rounded-3xl border border-line p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-muted font-semibold">{label}</p>
                <Icon className="size-4 text-teal hidden sm:block" />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-semibold mt-2 tabular-nums">{value}</p>
              <p className="text-[11px] sm:text-xs text-muted mt-1">{sub}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl border border-line p-5 flex flex-col md:flex-row md:items-center gap-4">
          <span className="size-12 rounded-2xl bg-saffron/20 text-saffron-dark grid place-items-center shrink-0"><Sparkles className="size-6" /></span>
          <div className="flex-1">
            <p className="font-semibold">Top up cover for all active workers</p>
            <p className="text-sm text-muted">Pay part of the daily premium to upgrade every active worker's plan. Billed only on days they log in. {p.topUps[0] && <span className="text-good font-semibold">Last top-up: {num(p.topUps[0].workers)} workers, +{inr(p.topUps[0].perDay)}/day.</span>}</p>
          </div>
          <Button variant="saffron" onClick={() => setModal(true)}>Top up cover</Button>
        </section>

        <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6 items-start">
          <section className="bg-white rounded-3xl border border-line overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-line">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Workers</h2>
                <p className="text-xs text-muted">Sample of {p.workers.length} riders across hubs · {toppedUp} topped up</p>
              </div>
              <label className="flex items-center gap-2 h-11 rounded-2xl border border-line px-3 bg-cream/50 focus-within:border-teal">
                <Search className="size-4 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID, city" className="bg-transparent outline-none text-sm w-full sm:w-44" aria-label="Search workers" />
              </label>
            </div>
            <div className="flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar">
              {(['all', 'active', 'paused', 'none'] as const).map((s) => (
                <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s} className={cx('shrink-0 min-h-9 px-3.5 rounded-full text-sm font-semibold border cursor-pointer', status === s ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>
                  {s === 'all' ? 'All' : s === 'active' ? 'Cover active' : s === 'paused' ? 'Paused today' : 'No cover'} <span className="opacity-60">({s === 'all' ? p.workers.length : p.workers.filter((x) => x.cover === s).length})</span>
                </button>
              ))}
            </div>
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead className="sticky top-0 bg-cream text-left text-xs text-muted uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Worker</th>
                    <th className="px-3 py-2.5 font-semibold">Hub</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Active days (30d)</th>
                    <th className="px-3 py-2.5 font-semibold text-right">Payouts (30d)</th>
                    <th className="px-3 py-2.5 font-semibold">Plan</th>
                    <th className="px-5 py-2.5 font-semibold">Cover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((x) => (
                    <tr key={x.id} className="hover:bg-cream/50">
                      <td className="px-5 py-3"><p className="font-semibold">{x.name}</p><p className="text-xs text-muted">{x.id}</p></td>
                      <td className="px-3 py-3"><p>{x.city}</p><p className="text-xs text-muted">{x.zone}</p></td>
                      <td className="px-3 py-3 text-right tabular-nums">{x.daysActive30}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{inr(x.payout30)}</td>
                      <td className="px-3 py-3">{x.plan ? <span className="font-semibold">{PLANS[x.plan].name}</span> : <span className="text-muted">–</span>}{x.toppedUp && <Pill tone="saffron" className="ml-1.5">Topped up</Pill>}</td>
                      <td className="px-5 py-3">
                        {x.cover === 'active' && <Pill tone="good"><CheckCircle2 className="size-3" /> Active</Pill>}
                        {x.cover === 'paused' && <Pill tone="neutral"><Clock className="size-3" /> Paused today</Pill>}
                        {x.cover === 'none' && <Pill tone="bad"><X className="size-3" /> No cover</Pill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <p className="text-center text-sm text-muted py-10">No workers match “{q}”. Try another name or hub.</p>}
            </div>
          </section>

          <SscTracker onRate={setSscRate} onPay={paySscMonth} />
        </div>
      </main>

      {modal && <TopUpModal onClose={() => setModal(false)} onConfirm={topUpAll} uncovered={p.workers.filter((x) => x.cover === 'none').length} sample={p.workers.length} />}
    </div>
  );
}

function SscTracker({ onRate, onPay }: { onRate: (r: number) => void; onPay: () => void }) {
  const { state } = useApp();
  const { turnoverFY, workerPayoutsFY, rate, monthly } = state.platform.ssc;
  const byRate = (turnoverFY * rate) / 100;
  const cap = workerPayoutsFY * 0.05;
  const annual = Math.min(byRate, cap);
  const capBinds = byRate > cap;
  const paidYTD = monthly.reduce((a, m) => a + m.paid, 0);
  const nextDue = monthly.find((m) => m.paid === 0);
  const data = monthly.map((m) => ({ ...m, value: m.paid || m.due, state: m.paid ? 'Paid' : m === nextDue ? 'Due now' : 'Upcoming' }));
  const fill = (s: string) => (s === 'Paid' ? '#2F6F73' : s === 'Due now' ? '#C98A1E' : '#CFC8B8');

  return (
    <section className="bg-white rounded-3xl border border-line p-5">
      <h2 className="font-semibold text-lg">Social Security Code contribution</h2>
      <p className="text-xs text-muted">Code on Social Security, 2020: aggregators pay 1–2% of annual turnover, capped at 5% of amounts paid to gig workers.</p>

      <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div className="rounded-2xl bg-cream p-3"><dt className="text-xs text-muted">Annual turnover (FY)</dt><dd className="font-heading text-lg font-semibold">{inrCompact(turnoverFY)}</dd></div>
        <div className="rounded-2xl bg-cream p-3"><dt className="text-xs text-muted">Paid to gig workers (FY)</dt><dd className="font-heading text-lg font-semibold">{inrCompact(workerPayoutsFY)}</dd></div>
      </dl>

      <div className="mt-4">
        <div className="flex justify-between text-sm"><label htmlFor="rate" className="font-semibold">Notified rate</label><span className="font-heading font-semibold">{rate.toFixed(2)}%</span></div>
        <input id="rate" type="range" min={1} max={2} step={0.25} value={rate} onChange={(e) => onRate(Number(e.target.value))} className="w-full h-8" />
        <div className="flex justify-between text-[11px] text-muted -mt-1"><span>1%</span><span>2%</span></div>
      </div>

      <div className="mt-3 rounded-2xl border border-line divide-y divide-line text-sm">
        <div className="flex justify-between px-3 py-2"><span className="text-muted">{rate}% of turnover</span><span className={cx('tabular-nums', capBinds && 'line-through text-muted')}>{inrCompact(byRate)}</span></div>
        <div className="flex justify-between px-3 py-2"><span className="text-muted">Cap: 5% of worker payouts</span><span className={cx('tabular-nums', !capBinds && 'text-muted')}>{inrCompact(cap)}</span></div>
        <div className="flex justify-between px-3 py-2 font-semibold"><span>Annual contribution</span><span className="tabular-nums">{inrCompact(annual)}</span></div>
      </div>
      <p className={cx('text-xs mt-2 flex gap-1.5', capBinds ? 'text-warn' : 'text-muted')}><Info className="size-3.5 shrink-0 mt-0.5" />{capBinds ? 'The 5% cap applies at this rate.' : 'Below the 5% cap at this rate.'}</p>

      <div className="flex items-end justify-between mt-5">
        <div>
          <p className="text-xs text-muted">Paid this FY</p>
          <p className="font-heading text-xl font-semibold">{inrCompact(paidYTD)} <span className="text-sm text-muted font-normal">of {inrCompact(annual)}</span></p>
        </div>
        <div className="flex gap-3 text-[11px]">
          {['Paid', 'Due now', 'Upcoming'].map((s) => <span key={s} className="flex items-center gap-1"><span className="size-2.5 rounded-sm" style={{ background: fill(s) }} />{s}</span>)}
        </div>
      </div>
      <div className="h-44 mt-2" role="img" aria-label="Monthly contributions this financial year">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 14, right: 0, left: 0, bottom: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="#EEEAE0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#5C6B6E' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tickFormatter={(v) => `${(v / 1e7).toFixed(1)}`} tick={{ fontSize: 10, fill: '#5C6B6E' }} axisLine={false} tickLine={false} width={30} label={{ value: '₹ Cr', position: 'insideTopLeft', offset: 0, dy: -4, fontSize: 10, fill: '#5C6B6E' }} />
            <Tooltip
              cursor={{ fill: 'rgba(47,111,115,.08)' }}
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className="bg-ink text-cream text-xs rounded-xl px-3 py-2 shadow">
                    <p className="font-semibold">{payload[0].payload.month} · {payload[0].payload.state}</p>
                    <p>{inr(payload[0].payload.value)}</p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => <Cell key={d.month} fill={fill(d.state)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {nextDue ? (
        <Button className="w-full mt-4" onClick={onPay}>Pay {nextDue.month} contribution · {inrCompact(nextDue.due)}</Button>
      ) : (
        <p className="mt-4 text-sm text-good font-semibold text-center">All contributions for this FY are paid.</p>
      )}
    </section>
  );
}

function TopUpModal({ onClose, onConfirm, uncovered, sample }: { onClose: () => void; onConfirm: (perDay: number, inc: boolean) => { workers: number; amount: number }; uncovered: number; sample: number }) {
  const [perDay, setPerDay] = useState(1);
  const [inc, setInc] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ workers: number; amount: number } | null>(null);
  const daysLeft = 30 - new Date().getDate() + 1;
  const uncoveredFleet = Math.round((uncovered / sample) * PLATFORM_TOTALS.activeWorkers);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Top up cover">
      <button aria-label="Close" className="absolute inset-0 bg-ink/50 cursor-default" onClick={onClose} />
      <div className="anim-sheet relative w-full max-w-md bg-cream rounded-3xl p-6">
        {result ? (
          <div className="text-center">
            <div className="anim-pop size-16 rounded-full bg-good-bg text-good grid place-items-center mx-auto mb-3"><CheckCircle2 className="size-9" /></div>
            <p className="font-semibold text-lg">{num(result.workers)} workers topped up</p>
            <p className="text-sm text-muted mt-1">Estimated {inr(result.amount)} for the rest of this month. Workers get an in-app notification.</p>
            <Button className="w-full mt-5" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Top up cover for all active workers</h2>
            <p className="text-sm text-muted mt-1">QuickBasket pays the extra. Workers keep their own wallet and plan.</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { v: 1, t: '+₹1/day', d: 'Basic → Plus: adds ₹2 L life cover' },
                { v: 2, t: '+₹2/day', d: 'Up to Max: phone & bike cover' },
              ].map((o) => (
                <button key={o.v} onClick={() => setPerDay(o.v)} aria-pressed={perDay === o.v} className={cx('rounded-2xl border-2 p-3 text-left cursor-pointer', perDay === o.v ? 'border-ink bg-white' : 'border-line bg-white/60')}>
                  <p className="font-heading font-semibold">{o.t}</p>
                  <p className="text-xs text-muted">{o.d}</p>
                </button>
              ))}
            </div>
            <label className="flex items-start gap-3 mt-4 text-sm cursor-pointer">
              <input type="checkbox" checked={inc} onChange={(e) => setInc(e.target.checked)} className="mt-1 size-4 accent-[#2F6F73]" />
              <span>Also give Basic cover to ~{num(uncoveredFleet)} active workers with no cover today</span>
            </label>
            <p className="text-xs text-muted mt-3">Estimate assumes 80% of workers are active on each of the {daysLeft} days left this month.</p>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                variant="saffron"
                className="flex-1"
                loading={busy}
                onClick={() => {
                  setBusy(true);
                  setTimeout(() => setResult(onConfirm(perDay, inc)), 900);
                }}
              >
                {busy ? 'Processing…' : 'Confirm top-up'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
