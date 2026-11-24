import { Check } from 'lucide-react';
import type { Claim, ClaimStatus } from '../lib/types';
import { fmtDateTime } from '../lib/format';
import { cx, Pill } from './ui';

const STEPS: { status: ClaimStatus; label: string }[] = [
  { status: 'submitted', label: 'Submitted' },
  { status: 'review', label: 'Under review' },
  { status: 'approved', label: 'Approved' },
  { status: 'paid', label: 'Paid to wallet' },
];

export function claimPill(status: ClaimStatus) {
  const map: Record<ClaimStatus, [string, 'good' | 'warn' | 'bad' | 'teal' | 'neutral']> = {
    submitted: ['Submitted', 'teal'],
    review: ['In review', 'warn'],
    approved: ['Approved', 'good'],
    paid: ['Paid', 'good'],
    rejected: ['Rejected', 'bad'],
  };
  const [label, tone] = map[status];
  return <Pill tone={tone}>{label}</Pill>;
}

export function ClaimTimeline({ claim }: { claim: Claim }) {
  const currentIdx = STEPS.findIndex((s) => s.status === claim.status);
  return (
    <ol className="relative">
      {STEPS.map((s, i) => {
        const entry = claim.timeline.find((x) => x.status === s.status);
        const done = !!entry;
        const isNext = i === currentIdx + 1;
        return (
          <li key={s.status} className="flex gap-3 pb-5 last:pb-0 relative">
            {i < STEPS.length - 1 && <span className={cx('absolute left-[15px] top-8 bottom-0 w-0.5', done && claim.timeline.some((x) => x.status === STEPS[i + 1].status) ? 'bg-good' : 'bg-line')} aria-hidden />}
            <span className={cx('size-8 rounded-full grid place-items-center shrink-0 border-2', done ? 'bg-good border-good text-white' : isNext ? 'border-saffron bg-white' : 'border-line bg-white')}>
              {done ? <Check className="size-4" /> : isNext ? <span className="size-2.5 rounded-full bg-saffron animate-pulse" /> : null}
            </span>
            <div className="pt-1 min-w-0">
              <p className={cx('text-sm font-semibold', !done && 'text-muted')}>{s.label}</p>
              {entry ? (
                <p className="text-xs text-muted">{fmtDateTime(entry.ts)} · {entry.note}</p>
              ) : isNext ? (
                <p className="text-xs text-warn">{s.status === 'review' ? 'Starting shortly…' : s.status === 'approved' ? 'Usually within 48 hours' : 'Instant after approval'}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
