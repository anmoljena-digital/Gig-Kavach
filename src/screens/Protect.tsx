import { Check, ChevronLeft, ChevronRight, CloudRain, FileText, Minus, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { CLAIM_TYPES, PLANS, type Plan } from '../lib/catalog';
import { fmtDay, fmtDateTime, inr, inrCompact, isoDate, parseDate } from '../lib/format';
import type { Claim, PlanId } from '../lib/types';
import { Button, Card, Empty, Pill, ScreenHeader, SectionTitle, Sheet, cx } from '../components/ui';
import { ClaimTimeline, claimPill } from '../components/ClaimTimeline';

function features(p: Plan): [string, string | null][] {
  return [
    ['Accident cover', inrCompact(p.accident)],
    ['Accident medical bills', `up to ${inr(p.accidentMedical)}`],
    ['Hospital cash', `${inr(p.hospitalCash)}/day`],
    ['Term life', p.life ? inrCompact(p.life) : null],
    ['Phone / bike damage', p.device ? `up to ${inr(p.device)}` : null],
    ['Weather payout', `${inr(p.weather)}/event`],
  ];
}

export default function Protect() {
  const { w, t, setPlan, coverActive } = useApp();
  const nav = useNavigate();
  const [sel, setSel] = useState<PlanId>(w.plan);
  const [openClaim, setOpenClaim] = useState<Claim | null>(null);
  const plan = PLANS[sel];

  return (
    <div>
      <ScreenHeader title={t('protect')} sub={coverActive ? `${PLANS[w.plan].name} cover is active today` : 'Cover paused today – no charge'} />
      <div className="px-4">
        <h2 className="text-[15px] font-semibold px-1 mb-2">{t('choosePlan')}</h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Plans">
          {(Object.values(PLANS) as Plan[]).map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={sel === p.id}
              onClick={() => setSel(p.id)}
              className={cx('relative rounded-3xl border-2 p-3 text-left transition cursor-pointer min-h-24', sel === p.id ? 'border-ink bg-ink text-cream' : 'border-line bg-white')}
            >
              {w.plan === p.id && <span className={cx('absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full', 'bg-saffron text-ink')}>YOURS</span>}
              <p className="font-heading font-semibold">{p.name}</p>
              <p className="font-heading text-2xl font-semibold mt-1">
                {inr(p.perDay)}
                <span className={cx('text-xs font-normal', sel === p.id ? 'text-cream/70' : 'text-muted')}>{t('perDay')}</span>
              </p>
            </button>
          ))}
        </div>

        <Card className="mt-3">
          <ul className="space-y-2.5">
            {features(plan).map(([k, v]) => (
              <li key={k} className="flex items-center gap-3 text-sm">
                {v ? <Check className="size-4 text-good shrink-0" /> : <Minus className="size-4 text-[#B5AE9F] shrink-0" />}
                <span className={cx('flex-1', !v && 'text-muted')}>{k}</span>
                <span className={cx('font-semibold', !v && 'text-muted font-normal')}>{v ?? 'Not included'}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">≈ {inr(plan.perDay * 26)}/month if you work 26 days. Billing pauses automatically on days you don't log in.</p>
          {sel !== w.plan ? (
            <Button className="w-full mt-3" onClick={() => setPlan(sel)}>
              {t('switchPlan')} · {inr(plan.perDay)}{t('perDay')}
            </Button>
          ) : (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-good min-h-12 rounded-2xl bg-good-bg">
              <ShieldCheck className="size-4" /> {t('currentPlan')}
            </div>
          )}
        </Card>

        <Link to="/app/weather" className="mt-3 flex items-center gap-3 rounded-3xl bg-white border border-line p-4">
          <span className="size-10 rounded-2xl bg-teal-light text-teal grid place-items-center"><CloudRain className="size-5" /></span>
          <div className="flex-1">
            <p className="font-semibold text-sm">{t('weather')}</p>
            <p className="text-xs text-muted">Rain, heat & bad air: paid automatically</p>
          </div>
          <ChevronRight className="size-5 text-muted" />
        </Link>

        <CoverCalendar />

        <SectionTitle action={<Button variant="ghost" className="min-h-10 px-3 text-sm" onClick={() => nav('/app/protect/claim')}><FileText className="size-4" /> {t('fileClaim')}</Button>}>{t('claims')}</SectionTitle>
        {w.claims.length === 0 ? (
          <Card>
            <Empty icon={<ShieldCheck className="size-6" />} title="No claims yet" body="We hope you never need one. If you do, it takes 2 minutes." action={<Button onClick={() => nav('/app/protect/claim')}>{t('fileClaim')}</Button>} />
          </Card>
        ) : (
          <div className="space-y-2">
            {w.claims.map((c) => (
              <Card key={c.id} onClick={() => setOpenClaim(c)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{CLAIM_TYPES[c.type].label} · {inr(c.amount)}</p>
                    <p className="text-xs text-muted truncate">{c.description}</p>
                    <p className="text-[11px] text-muted mt-1">{c.id} · filed {fmtDateTime(c.filedOn)}</p>
                  </div>
                  {claimPill(c.status)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!openClaim} onClose={() => setOpenClaim(null)} title={openClaim ? `${CLAIM_TYPES[openClaim.type].label} claim` : ''}>
        {openClaim && (
          <>
            {(() => {
              const live = w.claims.find((c) => c.id === openClaim.id) ?? openClaim;
              return (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-heading text-2xl font-semibold">{inr(live.amount)}</p>
                    {claimPill(live.status)}
                  </div>
                  <p className="text-sm text-muted mb-4">{live.description}</p>
                  <ClaimTimeline claim={live} />
                  {(live.status === 'review' || live.status === 'submitted') && (
                    <p className="text-xs text-muted mt-4 bg-white rounded-2xl p-3 border border-line">Demo tip: use <b>Demo controls → Approve accident claim</b> to settle this.</p>
                  )}
                </>
              );
            })()}
          </>
        )}
      </Sheet>
    </div>
  );
}

function CoverCalendar() {
  const { w, t } = useApp();
  const today = parseDate(w.today);
  const [offset, setOffset] = useState(0);
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const dayMap = useMemo(() => new Map(w.days.map((d) => [d.date, d])), [w.days]);
  const earliest = w.days[0]?.date ?? w.today;
  const canPrev = isoDate(first) > earliest;

  const cells: (string | null)[] = [];
  const lead = (first.getDay() + 6) % 7; // Monday first
  for (let i = 0; i < lead; i++) cells.push(null);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(new Date(first.getFullYear(), first.getMonth(), d)));

  const monthDays = cells.filter(Boolean).map((d) => dayMap.get(d!)).filter(Boolean);
  const activeN = monthDays.filter((d) => d!.active).length;
  const pausedN = monthDays.filter((d) => !d!.active).length;
  const charged = monthDays.reduce((a, d) => a + (d!.premium || 0), 0);

  return (
    <>
      <SectionTitle>{t('coverCalendar')}</SectionTitle>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <button aria-label="Previous month" disabled={!canPrev} onClick={() => setOffset((o) => o - 1)} className="size-10 rounded-full grid place-items-center hover:bg-cream disabled:opacity-30 cursor-pointer"><ChevronLeft className="size-5" /></button>
          <p className="font-semibold">{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          <button aria-label="Next month" disabled={offset >= 0} onClick={() => setOffset((o) => o + 1)} className="size-10 rounded-full grid place-items-center hover:bg-cream disabled:opacity-30 cursor-pointer"><ChevronRight className="size-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted font-semibold mb-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const rec = dayMap.get(d);
            const isToday = d === w.today;
            return (
              <div
                key={d}
                title={rec ? `${fmtDay(d)} · ${rec.active ? `Active · ${inr(rec.premium)} charged` : 'Paused · ₹0'}` : fmtDay(d)}
                className={cx(
                  'aspect-square rounded-xl flex flex-col items-center justify-center text-xs leading-none',
                  rec?.active && 'bg-teal text-white',
                  rec && !rec.active && 'bg-[repeating-linear-gradient(135deg,#EEEAE0_0_4px,#F7F4EC_4px_8px)] text-muted',
                  !rec && 'text-[#B5AE9F]',
                  isToday && 'ring-2 ring-saffron ring-offset-1',
                )}
              >
                <span className="font-semibold">{parseDate(d).getDate()}</span>
                {rec && <span className="text-[9px] mt-0.5 opacity-90">{rec.active ? `₹${rec.premium}` : '–'}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-teal" /> {t('active')} ({activeN})</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-[repeating-linear-gradient(135deg,#DDD7C9_0_2px,#F7F4EC_2px_4px)] border border-line" /> {t('paused')} ({pausedN})</span>
          <span className="ml-auto font-semibold">Charged {inr(charged)}</span>
        </div>
        {pausedN > 0 && <p className="text-[11px] text-muted mt-2"><Pill tone="good" className="mr-1">Saved {inr(pausedN * PLANS[w.plan].perDay)}</Pill> by not paying on {pausedN} days off.</p>}
      </Card>
    </>
  );
}
