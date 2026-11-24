import { Home, Shield, Sprout, LifeBuoy, UserRound, Signal, Wifi, BatteryFull } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { cx, Toasts } from './ui';

/** Phone-sized frame on desktop, full screen on a real phone. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full w-full flex items-center justify-center sm:py-4">
      <div className="relative w-full h-[100dvh] sm:w-[390px] sm:h-[min(844px,calc(100dvh-32px))] sm:rounded-[48px] sm:border-[10px] sm:border-ink sm:shadow-[0_30px_80px_-20px_rgba(19,38,43,.55)] bg-cream overflow-hidden flex flex-col">
        <StatusBar />
        {children}
        <Toasts />
      </div>
    </div>
  );
}

function StatusBar() {
  const time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: false });
  return (
    <div className="hidden sm:flex shrink-0 h-9 items-center justify-between px-7 text-[13px] font-semibold bg-cream">
      <span>{time}</span>
      <span className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-6 rounded-full bg-ink" aria-hidden />
      <span className="flex items-center gap-1.5" aria-hidden>
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </span>
    </div>
  );
}

export function WorkerLayout({ children }: { children: ReactNode }) {
  const { t } = useApp();
  const loc = useLocation();
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [loc.pathname]);

  const tabs = [
    { to: '/app', label: t('home'), icon: Home, end: true },
    { to: '/app/protect', label: t('protect'), icon: Shield },
    { to: '/app/grow', label: t('grow'), icon: Sprout },
    { to: '/app/bounce', label: t('bounce'), icon: LifeBuoy },
    { to: '/app/profile', label: t('profile'), icon: UserRound },
  ];

  return (
    <>
      <div ref={scroller} className="flex-1 overflow-y-auto no-scrollbar pb-20 sm:pb-4">
        {children}
      </div>
      <nav className="shrink-0 bg-white border-t border-line grid grid-cols-5 pb-[max(env(safe-area-inset-bottom),6px)] sm:pb-3" aria-label="Main">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cx('flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-14 text-[11px] font-semibold transition', isActive ? 'text-ink' : 'text-muted')}
          >
            {({ isActive }) => (
              <>
                <span className={cx('grid place-items-center w-12 h-7 rounded-full transition', isActive && 'bg-saffron/25')}>
                  <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="leading-tight text-center">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
