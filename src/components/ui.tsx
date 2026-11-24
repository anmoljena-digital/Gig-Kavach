import { ArrowLeft, CheckCircle2, Info, Loader2, TriangleAlert, X } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

type BtnVariant = 'primary' | 'saffron' | 'ghost' | 'outline' | 'danger';
export function Button({ variant = 'primary', className, loading, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean }) {
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-ink text-cream hover:bg-[#1d3940]',
    saffron: 'bg-saffron text-ink hover:bg-[#f0b252]',
    ghost: 'bg-transparent text-teal hover:bg-teal-light',
    outline: 'bg-white text-ink border border-line hover:border-teal',
    danger: 'bg-bad text-white hover:opacity-90',
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cx('min-h-12 px-5 rounded-2xl font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer', styles[variant], className)}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={cx('block w-full text-left rounded-3xl border border-line/70 p-4', !/(^|\s)bg-/.test(className ?? '') && 'bg-white', ' shadow-[0_1px_0_rgba(19,38,43,.04)]', onClick && 'cursor-pointer hover:border-teal/50 transition', className)}>
      {children}
    </Tag>
  );
}

type PillTone = 'good' | 'warn' | 'bad' | 'neutral' | 'teal' | 'saffron';
export function Pill({ tone = 'neutral', children, className }: { tone?: PillTone; children: ReactNode; className?: string }) {
  const tones: Record<PillTone, string> = {
    good: 'bg-good-bg text-good',
    warn: 'bg-warn-bg text-warn',
    bad: 'bg-bad-bg text-bad',
    neutral: 'bg-[#EEEAE0] text-muted',
    teal: 'bg-teal-light text-teal',
    saffron: 'bg-saffron/20 text-saffron-dark',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>{children}</span>;
}

export function ScreenHeader({ title, back, right, sub }: { title: string; back?: boolean | string; right?: ReactNode; sub?: string }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur px-4 pt-3 pb-3 flex items-center gap-2">
      {back && (
        <button aria-label="Back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className="size-11 -ml-2 grid place-items-center rounded-full hover:bg-black/5 cursor-pointer">
          <ArrowLeft className="size-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold leading-tight truncate">{title}</h1>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2 px-1">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="mx-auto size-14 rounded-2xl bg-teal-light text-teal grid place-items-center mb-3">{icon}</div>
      <p className="font-semibold">{title}</p>
      {body && <p className="text-sm text-muted mt-1">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-2xl bg-[#E9E4D8]', className)} />;
}

/** Bottom sheet modal, rendered inside the phone frame. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-ink/50 cursor-default" onClick={onClose} />
      <div className="anim-sheet relative w-full bg-cream rounded-t-[28px] p-5 pb-7 max-h-[88%] overflow-y-auto no-scrollbar">
        <div className="mx-auto w-10 h-1.5 rounded-full bg-line mb-4" />
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="size-10 -mr-2 -mt-1 grid place-items-center rounded-full hover:bg-black/5 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={cx('relative w-14 h-8 rounded-full transition cursor-pointer shrink-0', on ? 'bg-teal' : 'bg-[#CFC8B8]')}>
      <span className={cx('absolute top-1 size-6 rounded-full bg-white shadow transition-all', on ? 'left-7' : 'left-1')} />
    </button>
  );
}

export function Toasts({ inPhone = true }: { inPhone?: boolean }) {
  const { toasts, dismissToast } = useApp();
  return (
    <div className={cx(inPhone ? 'absolute top-3 left-3 right-3' : 'fixed top-4 right-4 w-[360px] max-w-[calc(100vw-32px)]', 'z-[60] flex flex-col gap-2 pointer-events-none')} aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'warn' ? TriangleAlert : Info;
        return (
          <div key={t.id} className="anim-toast pointer-events-auto bg-ink text-cream rounded-2xl px-4 py-3 shadow-xl flex gap-3 items-start">
            <Icon className={cx('size-5 shrink-0 mt-0.5', t.kind === 'success' ? 'text-[#7FD4A6]' : t.kind === 'warn' ? 'text-saffron' : 'text-[#9CC9CB]')} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.body && <p className="text-xs text-cream/75 mt-0.5">{t.body}</p>}
            </div>
            <button aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-cream/60 hover:text-cream cursor-pointer">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-heading font-bold', className)}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill={light ? '#F6F3EC' : '#13262B'} />
        <path d="M16 6l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V9z" fill="#E8A33D" />
        <path d="M12.5 16.2l2.4 2.4 4.8-5" stroke={light ? '#13262B' : '#13262B'} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        Gig<span className="text-saffron">Kavach</span>
      </span>
    </span>
  );
}
