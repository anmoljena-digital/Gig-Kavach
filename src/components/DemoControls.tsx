import { Bike, CalendarPlus, ChevronDown, CloudRain, FlaskConical, RotateCcw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { fmtDay, inr } from '../lib/format';
import { cx } from './ui';

/** Floating panel for presenting the flows live. Sits outside the phone on desktop. */
export function DemoControls() {
  const { w, coverActive, simulateOrder, simulateWeather, approveClaim, skipDay, resetDemo } = useApp();
  const [open, setOpen] = useState(() => window.innerWidth >= 900);
  const [confirmReset, setConfirmReset] = useState(false);
  const pending = w.claims.some((c) => c.status === 'submitted' || c.status === 'review');

  const items = [
    { label: 'Simulate new order', hint: 'Earnings + round-up', icon: Bike, onClick: simulateOrder },
    { label: 'Simulate rain event', hint: 'Parametric payout', icon: CloudRain, onClick: () => simulateWeather('rain') },
    { label: 'Approve accident claim', hint: pending ? 'Approves pending claim' : 'Creates + approves one', icon: ShieldCheck, onClick: approveClaim },
    { label: 'Skip a day', hint: 'Day starts with cover paused', icon: CalendarPlus, onClick: skipDay },
  ];

  return (
    <div className="fixed z-[70] right-3 bottom-[84px] sm:bottom-4 sm:right-4 w-[min(270px,calc(100vw-24px))]">
      <div className="bg-white/95 backdrop-blur rounded-3xl border border-line shadow-2xl overflow-hidden">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center gap-2 px-4 py-3 bg-ink text-cream cursor-pointer">
          <FlaskConical className="size-4 text-saffron" />
          <span className="font-semibold text-sm flex-1 text-left">Demo controls</span>
          <ChevronDown className={cx('size-4 transition', !open && 'rotate-180')} />
        </button>
        {open && (
          <div className="p-2">
            <div className="px-2 pt-1 pb-2 text-[11px] text-muted flex justify-between">
              <span>Sim date: <b className="text-ink">{fmtDay(w.today, { weekday: 'short', day: 'numeric', month: 'short' })}</b></span>
              <span>Wallet: <b className="text-ink">{inr(w.wallet)}</b></span>
            </div>
            <div className="px-2 pb-2">
              <span className={cx('text-[11px] font-semibold', coverActive ? 'text-good' : 'text-warn')}>● Cover {coverActive ? 'active' : 'paused'} today</span>
            </div>
            {items.map(({ label, hint, icon: Icon, onClick }) => (
              <button key={label} onClick={onClick} className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-cream text-left cursor-pointer min-h-12">
                <span className="size-9 rounded-xl bg-teal-light text-teal grid place-items-center shrink-0">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-[11px] text-muted">{hint}</span>
                </span>
              </button>
            ))}
            <div className="border-t border-line mt-1 pt-1">
              {confirmReset ? (
                <div className="flex gap-2 p-2">
                  <button onClick={() => { resetDemo(); setConfirmReset(false); }} className="flex-1 rounded-xl bg-bad text-white text-sm font-semibold py-2 cursor-pointer">Reset everything</button>
                  <button onClick={() => setConfirmReset(false)} className="rounded-xl border border-line text-sm px-3 cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)} className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-cream text-left cursor-pointer text-sm font-semibold text-bad">
                  <RotateCcw className="size-4 ml-2.5 mr-1.5" /> Reset demo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
