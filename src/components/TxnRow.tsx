import { ArrowDownToLine, Bike, CloudRain, Coins, HandCoins, PiggyBank, Shield, Sparkles } from 'lucide-react';
import type { Txn, TxnType } from '../lib/types';
import { fmtTime, signedInr } from '../lib/format';
import { cx } from './ui';

export const TXN_META: Record<TxnType, { icon: typeof Bike; tone: string; label: string }> = {
  earning: { icon: Bike, tone: 'bg-teal-light text-teal', label: 'Earning' },
  premium: { icon: Shield, tone: 'bg-[#EEEAE0] text-ink', label: 'Premium' },
  roundup: { icon: Coins, tone: 'bg-saffron/20 text-saffron-dark', label: 'Round-up' },
  autosave: { icon: PiggyBank, tone: 'bg-saffron/20 text-saffron-dark', label: 'Auto-save' },
  payout: { icon: CloudRain, tone: 'bg-good-bg text-good', label: 'Payout' },
  withdrawal: { icon: ArrowDownToLine, tone: 'bg-[#E6E1F1] text-[#5A3F8C]', label: 'Withdrawal' },
  advance: { icon: HandCoins, tone: 'bg-[#E6E1F1] text-[#5A3F8C]', label: 'Advance' },
  topup: { icon: Sparkles, tone: 'bg-good-bg text-good', label: 'Top-up' },
};

export function TxnRow({ t }: { t: Txn }) {
  const meta = TXN_META[t.type];
  const Icon = t.type === 'payout' && t.title.startsWith('Claim') ? Shield : meta.icon;
  const isSaving = t.type === 'roundup' || t.type === 'autosave';
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={cx('size-10 rounded-2xl grid place-items-center shrink-0', meta.tone)}>
        <Icon className="size-[18px]" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{t.title}</p>
        <p className="text-xs text-muted truncate">{fmtTime(t.ts)}{t.sub ? ` · ${t.sub}` : ''}</p>
      </div>
      <div className="text-right">
        <p className={cx('text-sm font-semibold tabular-nums', t.amount > 0 ? 'text-good' : 'text-ink')}>{signedInr(t.amount)}</p>
        {isSaving && <p className="text-[10px] text-saffron-dark font-semibold">to savings</p>}
      </div>
    </li>
  );
}
