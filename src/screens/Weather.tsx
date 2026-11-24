import { CloudRain, Loader2, Radar, Thermometer, Wind } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { PLANS, WEATHER_RULES } from '../lib/catalog';
import { fmtDay, inr } from '../lib/format';
import type { WeatherKind } from '../lib/types';
import { Button, Card, Empty, Pill, ScreenHeader, SectionTitle, cx } from '../components/ui';

const ICON: Record<WeatherKind, typeof CloudRain> = { rain: CloudRain, heat: Thermometer, aqi: Wind };

export default function Weather() {
  const { w, t, simulateWeather, coverActive } = useApp();
  const [kind, setKind] = useState<WeatherKind>('rain');
  const [checking, setChecking] = useState(false);
  const plan = PLANS[w.plan];
  const paid = w.weather.filter((e) => e.payout > 0);
  const totalPaid = paid.reduce((a, e) => a + e.payout, 0);

  const run = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      simulateWeather(kind);
    }, 1300);
  };

  return (
    <div>
      <ScreenHeader title={t('weather')} back sub={`${w.worker.city} · checked every 30 min`} />
      <div className="px-4">
        <Card className="bg-ink text-cream border-0">
          <p className="text-sm text-cream/70">Paid to you automatically</p>
          <p className="font-heading text-3xl font-semibold">{inr(totalPaid)}</p>
          <p className="text-xs text-cream/70 mt-1">{paid.length} events · no forms, no claims</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(Object.keys(WEATHER_RULES) as WeatherKind[]).map((k) => {
              const Icon = ICON[k];
              return (
                <div key={k} className="rounded-2xl bg-white/10 p-2.5">
                  <Icon className="size-4 text-saffron" />
                  <p className="text-xs font-semibold mt-1">{WEATHER_RULES[k].label}</p>
                  <p className="text-[10px] text-cream/70 leading-snug">{WEATHER_RULES[k].desc}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-cream/60 mt-3">{plan.name} plan pays {inr(plan.weather)} per event, on days your cover is active.</p>
        </Card>

        <Card className="mt-3">
          <div className="flex items-center gap-2">
            <Radar className="size-5 text-teal" />
            <p className="font-semibold text-sm flex-1">Demo: {t('simulateWeather')}</p>
            {!coverActive && <Pill tone="warn">Cover paused</Pill>}
          </div>
          <div className="flex gap-2 mt-3" role="radiogroup" aria-label="Event type">
            {(Object.keys(WEATHER_RULES) as WeatherKind[]).map((k) => (
              <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cx('flex-1 min-h-11 rounded-2xl text-sm font-semibold border cursor-pointer', kind === k ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>
                {WEATHER_RULES[k].label}
              </button>
            ))}
          </div>
          <Button variant="saffron" className="w-full mt-3" onClick={run} disabled={checking}>
            {checking ? <><Loader2 className="size-4 animate-spin" /> Reading {kind === 'aqi' ? 'CPCB' : 'IMD'} feed…</> : `Simulate ${WEATHER_RULES[kind].label.toLowerCase()} in ${w.worker.city}`}
          </Button>
        </Card>

        <SectionTitle>Trigger history</SectionTitle>
        {w.weather.length === 0 ? (
          <Card><Empty icon={<CloudRain className="size-6" />} title="No weather events yet" body="We'll list every reading that crosses a trigger here." /></Card>
        ) : (
          <div className="space-y-2">
            {w.weather.map((e) => {
              const rule = WEATHER_RULES[e.kind];
              const Icon = ICON[e.kind];
              const pct = Math.min(100, (e.reading / (e.threshold * 1.5)) * 100);
              const thrPct = (1 / 1.5) * 100;
              return (
                <Card key={e.id}>
                  <div className="flex items-start gap-3">
                    <span className={cx('size-10 rounded-2xl grid place-items-center shrink-0', e.triggered ? 'bg-teal text-white' : 'bg-cream text-muted')}>
                      <Icon className="size-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">{rule.label} · {e.city}</p>
                        {e.payout > 0 ? <Pill tone="good">+{inr(e.payout)}</Pill> : e.triggered ? <Pill tone="warn">Cover paused</Pill> : <Pill>Below trigger</Pill>}
                      </div>
                      <p className="text-xs text-muted">{e.date === w.today ? 'Today' : fmtDay(e.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {e.source}</p>
                      <div className="mt-3">
                        <div className="relative h-2 rounded-full bg-[#EEEAE0]">
                          <div className={cx('absolute inset-y-0 left-0 rounded-full', e.triggered ? 'bg-teal' : 'bg-[#B5AE9F]')} style={{ width: `${pct}%` }} />
                          <div className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${thrPct}%` }} aria-hidden />
                        </div>
                        <div className="flex justify-between text-[11px] mt-1.5">
                          <span>Reading <b>{e.reading} {rule.unit}</b></span>
                          <span className="text-muted">Trigger {e.threshold} {rule.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-muted mt-4 px-1">Readings are mock values styled on IMD and CPCB station data. Parametric payouts are fixed amounts, triggered by the reading alone.</p>
      </div>
    </div>
  );
}
