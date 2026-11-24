import { ReceiptText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import type { TxnType } from '../lib/types';
import { fmtDay, inr, isoDate } from '../lib/format';
import { Button, Card, Empty, ScreenHeader, Skeleton, cx } from '../components/ui';
import { TxnRow } from '../components/TxnRow';

const FILTERS: { id: string; label: string; types: TxnType[] | null }[] = [
  { id: 'all', label: 'All', types: null },
  { id: 'earn', label: 'Earnings', types: ['earning'] },
  { id: 'prem', label: 'Premiums', types: ['premium'] },
  { id: 'save', label: 'Savings', types: ['roundup', 'autosave'] },
  { id: 'pay', label: 'Payouts', types: ['payout', 'topup'] },
  { id: 'wd', label: 'Withdrawals', types: ['withdrawal', 'advance'] },
];

export default function Activity() {
  const { w, t } = useApp();
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(40);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(id);
  }, []);

  const f = FILTERS.find((x) => x.id === filter)!;
  const list = useMemo(() => (f.types ? w.txns.filter((x) => f.types!.includes(x.type)) : w.txns), [w.txns, f]);
  const total = list.reduce((a, x) => a + x.amount, 0);

  const groups = useMemo(() => {
    const g: { date: string; items: typeof list }[] = [];
    for (const x of list.slice(0, limit)) {
      const d = isoDate(new Date(x.ts));
      const last = g[g.length - 1];
      if (last && last.date === d) last.items.push(x);
      else g.push({ date: d, items: [x] });
    }
    return g;
  }, [list, limit]);

  return (
    <div>
      <ScreenHeader title={t('activity')} back sub={`${list.length} transactions · last 60 days`} />
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2 sticky top-[68px] z-10 bg-cream">
        {FILTERS.map((x) => (
          <button key={x.id} onClick={() => { setFilter(x.id); setLimit(40); }} aria-pressed={filter === x.id} className={cx('shrink-0 min-h-10 px-4 rounded-full text-sm font-semibold border cursor-pointer', filter === x.id ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>
            {x.id === 'all' ? t('all') : x.label}
          </button>
        ))}
      </div>
      <div className="px-4 pt-2">
        {filter !== 'all' && list.length > 0 && (
          <p className="text-xs text-muted mb-2 px-1">Total {f.label.toLowerCase()}: <b className="text-ink">{inr(Math.abs(total))}</b></p>
        )}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center"><Skeleton className="size-10" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-2.5 w-1/3" /></div></div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <Card><Empty icon={<ReceiptText className="size-6" />} title={`No ${f.label.toLowerCase()} yet`} body="When something happens, it shows up here instantly." /></Card>
        ) : (
          <>
            {groups.map((g) => (
              <section key={g.date} className="mb-3">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide px-1 mb-1">{g.date === w.today ? 'Today' : fmtDay(g.date, { weekday: 'short', day: 'numeric', month: 'short' })}</h3>
                <Card className="py-0">
                  <ul className="divide-y divide-line">{g.items.map((x) => <TxnRow key={x.id} t={x} />)}</ul>
                </Card>
              </section>
            ))}
            {limit < list.length && <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 60)}>Show more</Button>}
          </>
        )}
      </div>
    </div>
  );
}
