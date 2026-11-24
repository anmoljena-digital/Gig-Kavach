import { Bike, Camera, CheckCircle2, HeartPulse, Hospital, ImageIcon, Lock, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { CLAIM_TYPES, PLANS } from '../lib/catalog';
import { inr } from '../lib/format';
import type { ClaimType } from '../lib/types';
import { Button, Card, ScreenHeader, cx } from '../components/ui';
import { ClaimTimeline } from '../components/ClaimTimeline';

const ICONS: Record<ClaimType, typeof Bike> = { accident: HeartPulse, hospital: Hospital, phone: Smartphone, bike: Bike };

export default function ClaimFlow() {
  const { w, t, fileClaim, advanceClaim } = useApp();
  const nav = useNavigate();
  const plan = PLANS[w.plan];
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ClaimType | null>(null);
  const [desc, setDesc] = useState('');
  const [hospDays, setHospDays] = useState(2);
  const [bill, setBill] = useState('');
  const [photo, setPhoto] = useState<'none' | 'uploading' | 'done'>('none');
  const [submitting, setSubmitting] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);

  const limit = type === 'hospital' ? plan.hospitalCash * 10 : type === 'accident' ? plan.accidentMedical : plan.device;
  const amount = type === 'hospital' ? hospDays * plan.hospitalCash : Math.min(Number(bill) || 0, limit);
  const claim = w.claims.find((c) => c.id === claimId);

  // After submit, the mock insurer picks it up for review
  useEffect(() => {
    if (!claimId) return;
    const id = setTimeout(() => advanceClaim(claimId, 'review', 'Assigned to claims team'), 2200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  const upload = () => {
    setPhoto('uploading');
    setTimeout(() => setPhoto('done'), 1100);
  };

  const submit = () => {
    if (!type) return;
    setSubmitting(true);
    setTimeout(() => {
      const id = fileClaim(type, desc || CLAIM_TYPES[type].desc, amount, photo === 'done');
      setClaimId(id);
      setSubmitting(false);
      setStep(3);
    }, 1200);
  };

  const steps = ['Type', 'Details', 'Photo', 'Status'];

  return (
    <div>
      <ScreenHeader title={t('fileClaim')} back="/app/protect" sub={`${plan.name} plan · Claim ${Math.min(step + 1, 4)} of 4`} />
      <div className="px-4">
        <div className="flex gap-1.5 mb-5">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={cx('h-1.5 rounded-full', i <= step ? 'bg-saffron' : 'bg-line')} />
              <p className={cx('text-[10px] mt-1 font-semibold', i <= step ? 'text-ink' : 'text-muted')}>{s}</p>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3">What happened?</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(CLAIM_TYPES) as ClaimType[]).map((k) => {
                const ct = CLAIM_TYPES[k];
                const locked = ct.requires && !ct.requires.includes(w.plan);
                const Icon = ICONS[k];
                return (
                  <button
                    key={k}
                    disabled={locked}
                    onClick={() => setType(k)}
                    aria-pressed={type === k}
                    className={cx('relative rounded-3xl border-2 p-4 text-left min-h-32 transition cursor-pointer disabled:cursor-not-allowed', type === k ? 'border-ink bg-white' : 'border-line bg-white', locked && 'opacity-55')}
                  >
                    <Icon className="size-7 text-teal" />
                    <p className="font-semibold mt-2 text-sm">{ct.label}</p>
                    <p className="text-[11px] text-muted mt-0.5 leading-snug">{ct.desc}</p>
                    {locked && <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-muted"><Lock className="size-3" /> MAX</span>}
                  </button>
                );
              })}
            </div>
            {w.plan !== 'max' && <p className="text-xs text-muted mt-3">Phone & bike damage are part of the Max plan ({inr(PLANS.max.perDay)}/day).</p>}
            <Button className="w-full mt-6" disabled={!type} onClick={() => setStep(1)}>{t('continue')}</Button>
          </>
        )}

        {step === 1 && type && (
          <>
            <h2 className="text-lg font-semibold mb-3">{CLAIM_TYPES[type].label}: tell us a little</h2>
            <label className="text-sm font-semibold" htmlFor="desc">What happened? (optional)</label>
            <textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder={type === 'hospital' ? 'e.g. Admitted for fever at KGMU' : 'e.g. Bike skidded near Charbagh while delivering'} className="mt-2 w-full rounded-2xl border border-line bg-white p-3 outline-none focus:border-teal text-[15px]" />
            {type === 'hospital' ? (
              <div className="mt-4">
                <p className="text-sm font-semibold">Days in hospital</p>
                <div className="flex items-center gap-3 mt-2">
                  <button aria-label="Fewer days" onClick={() => setHospDays((d) => Math.max(1, d - 1))} className="size-12 rounded-2xl bg-white border border-line text-xl font-semibold cursor-pointer">−</button>
                  <span className="font-heading text-2xl font-semibold w-10 text-center">{hospDays}</span>
                  <button aria-label="More days" onClick={() => setHospDays((d) => Math.min(10, d + 1))} className="size-12 rounded-2xl bg-white border border-line text-xl font-semibold cursor-pointer">+</button>
                  <span className="text-sm text-muted">× {inr(plan.hospitalCash)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="text-sm font-semibold" htmlFor="bill">Bill amount</label>
                <div className="mt-2 flex items-center bg-white rounded-2xl border border-line focus-within:border-teal px-4 h-14">
                  <span className="text-muted font-semibold mr-1">₹</span>
                  <input id="bill" inputMode="numeric" value={bill} onChange={(e) => setBill(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="3,500" className="flex-1 bg-transparent outline-none text-lg" />
                </div>
                <p className="text-xs text-muted mt-1">Covered up to {inr(limit)} on your plan.</p>
              </div>
            )}
            <Card className="mt-4 bg-teal-light border-0">
              <p className="text-xs text-teal font-semibold">You'll receive</p>
              <p className="font-heading text-2xl font-semibold">{inr(amount)}</p>
            </Card>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button className="flex-1" disabled={amount <= 0} onClick={() => setStep(2)}>{t('continue')}</Button>
            </div>
          </>
        )}

        {step === 2 && type && (
          <>
            <h2 className="text-lg font-semibold mb-1">Add a photo</h2>
            <p className="text-sm text-muted mb-3">{type === 'hospital' ? 'Discharge summary or admission slip' : 'Bill, prescription or photo of the damage'}</p>
            {photo === 'done' ? (
              <div className="relative rounded-3xl overflow-hidden border border-line bg-[linear-gradient(135deg,#DCE8E6,#F3E3C4)] h-44 grid place-items-center">
                <div className="text-center">
                  <ImageIcon className="size-10 text-teal mx-auto" />
                  <p className="text-sm font-semibold mt-1">IMG_2041.jpg · 1.2 MB</p>
                  <p className="text-xs text-good font-semibold">✓ Uploaded (placeholder)</p>
                </div>
                <button aria-label="Remove photo" onClick={() => setPhoto('none')} className="absolute top-3 right-3 size-9 rounded-full bg-white grid place-items-center cursor-pointer"><X className="size-4" /></button>
              </div>
            ) : (
              <button onClick={upload} disabled={photo === 'uploading'} className="w-full h-44 rounded-3xl border-2 border-dashed border-teal/40 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer">
                {photo === 'uploading' ? (
                  <>
                    <div className="w-40 h-2 rounded-full bg-line overflow-hidden"><div className="h-full w-2/3 bg-teal animate-pulse rounded-full" /></div>
                    <p className="text-sm text-muted">Uploading…</p>
                  </>
                ) : (
                  <>
                    <Camera className="size-8 text-teal" />
                    <p className="font-semibold">Tap to take or upload a photo</p>
                    <p className="text-xs text-muted">Mock upload, nothing leaves your device</p>
                  </>
                )}
              </button>
            )}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" variant="saffron" loading={submitting} onClick={submit}>
                {submitting ? 'Submitting…' : `${t('submit')} claim · ${inr(amount)}`}
              </Button>
            </div>
            {photo !== 'done' && <p className="text-xs text-muted mt-2 text-center">You can submit without a photo; review may take longer.</p>}
          </>
        )}

        {step === 3 && claim && (
          <>
            <div className="text-center mb-5">
              <div className="anim-pop size-16 rounded-full bg-good-bg text-good grid place-items-center mx-auto mb-3"><CheckCircle2 className="size-9" /></div>
              <h2 className="text-xl font-semibold">Claim submitted</h2>
              <p className="text-sm text-muted">{claim.id} · {inr(claim.amount)}</p>
            </div>
            <Card>
              <ClaimTimeline claim={claim} />
            </Card>
            <p className="text-xs text-muted mt-3 text-center">Demo: press <b>Approve accident claim</b> in Demo controls to see the payout land.</p>
            <Button className="w-full mt-5" onClick={() => nav('/app/protect')}>Done</Button>
          </>
        )}
      </div>
    </div>
  );
}
