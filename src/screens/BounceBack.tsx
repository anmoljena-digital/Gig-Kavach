import { CheckCircle2, Clock, FileCheck2, HandCoins, Landmark, LifeBuoy, Plus, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { ADVANCE_CAP, ADVANCE_FEE, BENEFITS } from '../lib/catalog';
import { inr } from '../lib/format';
import type { BenefitId } from '../lib/types';
import { Button, Card, Pill, ScreenHeader, SectionTitle, Sheet, cx } from '../components/ui';

export default function BounceBack() {
  const { w, t, withdrawEmergency, addToEmergency, takeAdvance, lastWeekEarnings, advanceCap, setBenefit } = useApp();
  const loc = useLocation();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [wAmt, setWAmt] = useState(500);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [adv, setAdv] = useState(() => Math.min(500, advanceCap));
  const [advOpen, setAdvOpen] = useState(false);
  const [benefit, setBenefitOpen] = useState<BenefitId | null>(null);

  useEffect(() => {
    if (!loc.hash) return;
    const el = document.getElementById(loc.hash.slice(1));
    setTimeout(() => el?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [loc.hash]);

  useEffect(() => {
    setAdv((a) => Math.max(0, Math.min(a || 500, advanceCap)));
  }, [advanceCap]);

  const closeAll = () => {
    setWithdrawOpen(false);
    setAdvOpen(false);
    setBenefitOpen(null);
    setDone(null);
    setBusy(false);
  };

  const doWithdraw = () => {
    setBusy(true);
    setTimeout(() => {
      withdrawEmergency(wAmt);
      setBusy(false);
      setDone(`${inr(wAmt)} is in your wallet`);
    }, 900);
  };

  const doAdvance = () => {
    setBusy(true);
    setTimeout(() => {
      takeAdvance(adv);
      setBusy(false);
      setDone(`${inr(adv)} advance credited`);
    }, 1000);
  };

  const doRegister = (id: BenefitId) => {
    setBusy(true);
    setTimeout(() => {
      setBenefit(id, 'applied');
      setBusy(false);
      setDone('Application started');
    }, 1200);
  };

  const chips = [500, 1000, w.emergencyFund].filter((v, i, a) => v > 0 && v <= w.emergencyFund && a.indexOf(v) === i);

  return (
    <div>
      <ScreenHeader title={t('bounce')} sub="Help for tough days" />
      <div className="px-4">
        {/* Emergency fund */}
        <Card className="bg-ink text-cream border-0">
          <div className="flex items-center gap-2 text-sm text-cream/70">
            <LifeBuoy className="size-4 text-saffron" /> {t('emergency')}
          </div>
          <p className="font-heading text-[36px] font-semibold tabular-nums">{inr(w.emergencyFund)}</p>
          <p className="text-xs text-cream/70">Your money, any time. No questions, no fees.</p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="saffron"
              className="flex-1"
              disabled={w.emergencyFund <= 0}
              onClick={() => {
                setWAmt(Math.min(500, w.emergencyFund));
                setWithdrawOpen(true);
              }}
            >
              <Zap className="size-4" /> {t('withdraw')}
            </Button>
            <Button variant="outline" className="bg-white/10 text-cream border-white/20 hover:border-white/40" onClick={() => addToEmergency(100)} disabled={w.wallet < 100}>
              <Plus className="size-4" /> ₹100
            </Button>
          </div>
          {w.emergencyFund <= 0 && <p className="text-xs text-saffron mt-2">Fund is empty. Add a little on good days and it'll be here when you need it.</p>}
        </Card>

        {/* Advance */}
        <div id="advance" className="scroll-mt-20" />
        <SectionTitle>{t('advance')}</SectionTitle>
        <Card>
          <div className="flex items-start gap-3">
            <span className="size-10 rounded-2xl bg-[#E6E1F1] text-[#5A3F8C] grid place-items-center shrink-0"><HandCoins className="size-5" /></span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Up to {inr(advanceCap)} available now</p>
              <p className="text-xs text-muted">{Math.round(ADVANCE_CAP * 100)}% of last week's earnings ({inr(lastWeekEarnings)}). Flat {inr(ADVANCE_FEE)} fee, no interest.</p>
            </div>
          </div>
          {w.advanceOutstanding > 0 && (
            <div className="mt-3 rounded-2xl bg-cream px-3 py-2 text-xs flex items-center gap-2">
              <Clock className="size-4 text-muted" /> {inr(w.advanceOutstanding)} being repaid from your next 5 days' earnings
            </div>
          )}
          {advanceCap >= 100 ? (
            <>
              <div className="flex items-end justify-between mt-4">
                <span className="text-sm text-muted">Amount</span>
                <span className="font-heading text-2xl font-semibold tabular-nums">{inr(adv)}</span>
              </div>
              <input type="range" min={100} max={advanceCap} step={50} value={Math.max(100, adv)} onChange={(e) => setAdv(Number(e.target.value))} aria-label="Advance amount" className="w-full h-8" />
              <div className="flex justify-between text-[11px] text-muted -mt-1"><span>₹100</span><span>{inr(advanceCap)}</span></div>
              <Button className="w-full mt-3" onClick={() => setAdvOpen(true)}>Get {inr(adv)} now</Button>
            </>
          ) : (
            <p className="text-sm text-muted mt-3">You've used this week's limit. It refreshes as you complete more orders.</p>
          )}
        </Card>

        {/* Benefits */}
        <div id="benefits" className="scroll-mt-20" />
        <SectionTitle action={<Pill tone="teal">{Object.values(w.benefits).filter((s) => s === 'registered').length}/3 registered</Pill>}>{t('benefits')}</SectionTitle>
        <div className="space-y-2">
          {(Object.keys(BENEFITS) as BenefitId[]).map((id) => {
            const b = BENEFITS[id];
            const s = w.benefits[id];
            return (
              <Card key={id}>
                <div className="flex items-start gap-3">
                  <span className={cx('size-10 rounded-2xl grid place-items-center shrink-0', s === 'registered' ? 'bg-good-bg text-good' : 'bg-cream text-teal')}>
                    {s === 'registered' ? <CheckCircle2 className="size-5" /> : <Landmark className="size-5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-muted leading-snug mt-0.5">{b.what}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Pill tone="good">✓ {t('eligible')}</Pill>
                      {s === 'registered' && <Pill tone="good">{t('registered')}</Pill>}
                      {s === 'not_registered' && <Pill tone="bad">{t('notRegistered')}</Pill>}
                      {s === 'applied' && <Pill tone="warn"><Clock className="size-3" /> Applied · pending</Pill>}
                    </div>
                  </div>
                </div>
                {s === 'not_registered' && (
                  <Button variant="outline" className="w-full mt-3" onClick={() => setBenefitOpen(id)}>
                    {t('helpRegister')}
                  </Button>
                )}
                {s === 'applied' && (
                  <button onClick={() => setBenefit(id, 'registered')} className="w-full text-xs text-teal font-semibold mt-3 py-2 cursor-pointer">Demo: mark as registered</button>
                )}
              </Card>
            );
          })}
        </div>
        <p className="text-[11px] text-muted mt-3 px-1">Eligibility shown is indicative, based on your age, income and work type. Final eligibility is decided by the government portal.</p>
      </div>

      {/* Withdraw sheet */}
      <Sheet open={withdrawOpen} onClose={closeAll} title={done ? 'Done!' : 'Withdraw from emergency fund'}>
        {done ? (
          <Success text={done} sub="Use it right away via UPI from your GigKavach wallet." onClose={closeAll} />
        ) : (
          <>
            <p className="text-sm text-muted">How much do you need?</p>
            <div className="flex gap-2 mt-3">
              {chips.map((v) => (
                <button key={v} onClick={() => setWAmt(v)} aria-pressed={wAmt === v} className={cx('flex-1 min-h-12 rounded-2xl font-semibold border cursor-pointer', wAmt === v ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>
                  {v === w.emergencyFund ? `All · ${inr(v)}` : inr(v)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-white border border-line p-3 mt-4 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted">To</span><span className="font-semibold">GigKavach wallet</span></div>
              <div className="flex justify-between"><span className="text-muted">Fee</span><span className="font-semibold text-good">₹0</span></div>
              <div className="flex justify-between"><span className="text-muted">Left in fund</span><span className="font-semibold">{inr(w.emergencyFund - wAmt)}</span></div>
            </div>
            <Button variant="saffron" className="w-full mt-4" loading={busy} onClick={doWithdraw}>{busy ? 'Moving money…' : `${t('confirm')} · ${inr(wAmt)}`}</Button>
          </>
        )}
      </Sheet>

      {/* Advance sheet */}
      <Sheet open={advOpen} onClose={closeAll} title={done ? 'Done!' : 'Confirm advance'}>
        {done ? (
          <Success text={done} sub={`We'll recover ${inr(adv + ADVANCE_FEE)} in small parts from your next 5 working days.`} onClose={closeAll} />
        ) : (
          <>
            <div className="rounded-2xl bg-white border border-line p-3 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted">You get</span><span className="font-semibold">{inr(adv)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Flat fee</span><span className="font-semibold">{inr(ADVANCE_FEE)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Interest</span><span className="font-semibold text-good">₹0</span></div>
              <div className="flex justify-between border-t border-line pt-1.5"><span className="text-muted">Repay</span><span className="font-semibold">{inr(adv + ADVANCE_FEE)} over 5 days (~{inr(Math.ceil((adv + ADVANCE_FEE) / 5))}/day)</span></div>
            </div>
            <p className="text-xs text-muted mt-3">Capped at 30% of last week's earnings so repayment never eats more than a small slice of a day's pay. Mock offer, no lender involved.</p>
            <Button className="w-full mt-4" loading={busy} onClick={doAdvance}>{busy ? 'Crediting…' : `${t('confirm')} · ${inr(adv)}`}</Button>
          </>
        )}
      </Sheet>

      {/* Benefit sheet */}
      <Sheet open={!!benefit} onClose={closeAll} title={benefit ? (done ? 'Application started' : BENEFITS[benefit].name) : ''}>
        {benefit && (done ? (
          <Success text="We've started your application" sub="A GigKavach Saathi will call you within 24 hours to finish Aadhaar OTP. (Mock)" onClose={closeAll} />
        ) : (
          <>
            <p className="text-sm">{BENEFITS[benefit].what}</p>
            <p className="text-xs text-muted mt-2"><b>Who can join:</b> {BENEFITS[benefit].eligibility}</p>
            <p className="text-sm font-semibold mt-4 mb-2">Keep these ready</p>
            <div className="flex flex-wrap gap-1.5">{BENEFITS[benefit].docs.map((d) => <Pill key={d} tone="teal"><FileCheck2 className="size-3" /> {d}</Pill>)}</div>
            <p className="text-sm font-semibold mt-4 mb-2">Steps</p>
            <ol className="space-y-2">
              {BENEFITS[benefit].steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm"><span className="size-6 rounded-full bg-ink text-cream text-xs font-semibold grid place-items-center shrink-0">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <Button variant="saffron" className="w-full mt-5" loading={busy} onClick={() => doRegister(benefit)}>{busy ? 'Pre-filling your details…' : 'Start registration'}</Button>
          </>
        ))}
      </Sheet>
    </div>
  );
}

function Success({ text, sub, onClose }: { text: string; sub: string; onClose: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="anim-pop size-16 rounded-full bg-good-bg text-good grid place-items-center mx-auto mb-3"><CheckCircle2 className="size-9" /></div>
      <p className="font-semibold text-lg">{text}</p>
      <p className="text-sm text-muted mt-1">{sub}</p>
      <Button className="w-full mt-5" onClick={onClose}>Done</Button>
    </div>
  );
}
