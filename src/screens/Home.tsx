import { Bell, ChevronRight, CloudRain, FileText, HandCoins, Landmark, LifeBuoy, ListOrdered, ShieldCheck, ShieldOff, Wind, Thermometer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useApp } from '../state/AppContext';
import { addDays, fmtDay, inr } from '../lib/format';
import { PLANS, WEATHER_RULES } from '../lib/catalog';
import { Card, Pill, SectionTitle, cx } from '../components/ui';
import { TxnRow } from '../components/TxnRow';

export default function Home() {
  const { w, t, todayRecord, coverActive, totalSavings } = useApp();
  const nav = useNavigate();
  const hour = new Date().getHours();
  const greet = hour < 12 ? t('greetingMorning') : hour < 17 ? t('greetingAfternoon') : t('greetingEvening');
  const plan = PLANS[w.plan];

  const latestWeather = w.weather.find((e) => e.triggered && e.date >= addDays(w.today, -14));
  const WIcon = latestWeather?.kind === 'aqi' ? Wind : latestWeather?.kind === 'heat' ? Thermometer : CloudRain;

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(w.today, i - 6);
    const d = w.days.find((x) => x.date === date);
    return { date, label: fmtDay(date, { weekday: 'narrow' }), earnings: d?.earnings ?? 0, active: !!d?.active, isToday: date === w.today };
  });
  const weekTotal = week.reduce((a, d) => a + d.earnings, 0);

  const actions = [
    { label: t('fileClaim'), icon: FileText, to: '/app/protect/claim' },
    { label: t('weather'), icon: CloudRain, to: '/app/weather' },
    { label: t('emergency'), icon: LifeBuoy, to: '/app/bounce' },
    { label: t('getAdvance'), icon: HandCoins, to: '/app/bounce#advance' },
    { label: t('activity'), icon: ListOrdered, to: '/app/activity' },
    { label: t('benefits'), icon: Landmark, to: '/app/bounce#benefits' },
  ];

  return (
    <div className="px-4">
      <header className="flex items-center justify-between pt-3 pb-4">
        <div>
          <p className="text-sm text-muted">{greet},</p>
          <h1 className="text-2xl font-semibold">{w.worker.name.split(' ')[0]} 👋</h1>
        </div>
        <button aria-label="Notifications" onClick={() => nav('/app/activity')} className="relative size-11 rounded-full bg-white border border-line grid place-items-center cursor-pointer">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-saffron" />
        </button>
      </header>

      {/* Hero */}
      <section className="rounded-[28px] bg-ink text-cream p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-teal/40" aria-hidden />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-sm text-cream/70">{t('todaysEarnings')}</p>
            <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', coverActive ? 'bg-[#2E7D57] text-white' : 'bg-saffron text-ink')}>
              {coverActive ? <ShieldCheck className="size-3.5" /> : <ShieldOff className="size-3.5" />}
              {coverActive ? t('coverActive') : t('coverPaused')}
            </span>
          </div>
          <p className="font-heading text-[40px] font-semibold mt-1 tabular-nums">{inr(todayRecord?.earnings ?? 0)}</p>
          <p className="text-sm text-cream/70">
            {todayRecord?.orders ?? 0} {t('orders')} · {w.worker.apps.join(' + ')}
          </p>
          <p className="text-xs text-cream/60 mt-1">
            {coverActive ? `${plan.name} plan · ${inr(plan.perDay)} charged today` : 'No charge today. Cover starts with your first order.'}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Link to="/app/activity" className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/15">
              <p className="text-xs text-cream/70">{t('walletBalance')}</p>
              <p className="font-heading text-xl font-semibold tabular-nums">{inr(w.wallet)}</p>
            </Link>
            <Link to="/app/grow" className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/15">
              <p className="text-xs text-cream/70">{t('totalSaved')}</p>
              <p className="font-heading text-xl font-semibold tabular-nums text-saffron">{inr(totalSavings)}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Weather alert */}
      {latestWeather ? (
        <Link to="/app/weather" className="mt-4 flex items-center gap-3 rounded-3xl bg-[#E5EFEF] border border-teal/20 p-4">
          <span className="size-12 rounded-2xl bg-teal text-white grid place-items-center shrink-0">
            <WIcon className="size-6" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] leading-snug">
              {WEATHER_RULES[latestWeather.kind].label} in {latestWeather.city} – {latestWeather.payout > 0 ? `${inr(latestWeather.payout)} payout credited` : 'cover was paused'}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {latestWeather.reading} {WEATHER_RULES[latestWeather.kind].unit} on {latestWeather.date === w.today ? 'today' : fmtDay(latestWeather.date)} · no claim needed
            </p>
          </div>
          <ChevronRight className="size-5 text-muted" />
        </Link>
      ) : (
        <Link to="/app/weather" className="mt-4 flex items-center gap-3 rounded-3xl bg-white border border-line p-4">
          <CloudRain className="size-6 text-teal" />
          <p className="text-sm flex-1">Clear skies in {w.worker.city}. We'll pay you automatically if weather turns bad.</p>
        </Link>
      )}

      <SectionTitle>{t('quickActions')}</SectionTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map(({ label, icon: Icon, to }) => (
          <Link key={label} to={to} className="bg-white rounded-3xl border border-line/70 p-3 min-h-24 flex flex-col items-center justify-center gap-2 text-center hover:border-teal/50">
            <span className="size-10 rounded-2xl bg-cream grid place-items-center text-teal">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      <SectionTitle action={<Pill tone="teal">{inr(weekTotal)}</Pill>}>Last 7 days</SectionTitle>
      <Card>
        <div className="h-28" role="img" aria-label={`Earnings last 7 days, total ${inr(weekTotal)}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="22%">
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5C6B6E' }} />
              <Tooltip
                cursor={{ fill: 'rgba(47,111,115,.08)' }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="bg-ink text-cream text-xs rounded-xl px-3 py-2 shadow">
                      <p className="font-semibold">{fmtDay(payload[0].payload.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p>{payload[0].payload.active ? inr(payload[0].payload.earnings) : 'Day off · cover paused'}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="earnings" radius={[4, 4, 0, 0]} fill="#2F6F73" minPointSize={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle action={<Link to="/app/activity" className="text-sm font-semibold text-teal">{t('seeAll')}</Link>}>{t('recentActivity')}</SectionTitle>
      <Card className="py-0">
        <ul className="divide-y divide-line">
          {w.txns.slice(0, 5).map((x) => (
            <TxnRow key={x.id} t={x} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
