import { Check, CheckCircle2, Landmark, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { GIG_APPS, type GigApp } from '../lib/types';
import { Button, cx, Logo } from '../components/ui';
import { inr } from '../lib/format';
import { PLANS } from '../lib/catalog';

const DELIVERY: GigApp[] = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto'];

export default function Onboarding() {
  const { lang, setLang, completeOnboarding, w, t } = useApp();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [apps, setApps] = useState<GigApp[]>(['Swiggy', 'Blinkit']);
  const [linking, setLinking] = useState(false);
  const [done, setDone] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneOk = phone.replace(/\D/g, '').length === 10;
  const otpOk = otp.every((d) => /\d/.test(d));

  useEffect(() => {
    if (otpSent) otpRefs.current[0]?.focus();
  }, [otpSent]);

  const verify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep(1);
    }, 900);
  };

  const link = () => {
    setLinking(true);
    setTimeout(() => {
      setLinking(false);
      setDone(true);
      setTimeout(() => completeOnboarding(phone.replace(/(\d{5})(\d{5})/, '$1 $2'), apps), 1300);
    }, 1400);
  };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="anim-pop size-20 rounded-full bg-good-bg text-good grid place-items-center mb-5">
          <CheckCircle2 className="size-11" />
        </div>
        <h1 className="text-2xl font-semibold">You're covered, Ravi!</h1>
        <p className="text-muted mt-2">AutoPay linked. Cover switches on automatically each day you log in to {apps.join(' or ')}.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-5 pt-3 pb-6">
      <div className="flex items-center justify-between">
        <Logo className="text-lg" />
        <div className="flex bg-white rounded-full border border-line p-1 text-sm font-semibold" role="group" aria-label="Language">
          {(['en', 'hi'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={cx('px-3 py-1.5 rounded-full cursor-pointer', lang === l ? 'bg-ink text-cream' : 'text-muted')}>
              {l === 'en' ? 'EN' : 'हिं'}
            </button>
          ))}
        </div>
      </div>

      {/* progress */}
      <div className="flex gap-1.5 mt-5" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-saffron' : 'bg-line')} />
        ))}
      </div>
      <p className="text-xs text-muted mt-2">Step {step + 1} of 3</p>

      {step === 0 && (
        <div className="flex-1 flex flex-col mt-6">
          <h1 className="text-[28px] leading-tight font-semibold">{t('tagline')}</h1>
          <p className="text-muted mt-2">Insurance from {inr(3)}/day, savings from every order and help when things go wrong. Works with every gig app.</p>

          {!otpSent ? (
            <div className="mt-8">
              <label htmlFor="phone" className="text-sm font-semibold">Mobile number</label>
              <div className="mt-2 flex items-center bg-white rounded-2xl border border-line focus-within:border-teal px-4 h-14">
                <span className="text-muted font-semibold mr-2">+91</span>
                <input
                  id="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98390 41726"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 bg-transparent outline-none text-lg tracking-wide"
                />
              </div>
              <button onClick={() => setPhone('9839041726')} className="text-xs text-teal font-semibold mt-2 cursor-pointer">Use demo number</button>
            </div>
          ) : (
            <div className="mt-8">
              <p className="text-sm font-semibold">Enter the 4-digit OTP sent to +91 {phone}</p>
              <p className="text-xs text-muted">Demo: any 4 digits work</p>
              <div className="flex gap-3 mt-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    aria-label={`OTP digit ${i + 1}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(-1);
                      const next = [...otp];
                      next[i] = v;
                      setOtp(next);
                      if (v && i < 3) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="size-16 text-center text-2xl font-semibold bg-white rounded-2xl border border-line focus:border-teal outline-none"
                  />
                ))}
              </div>
              <button onClick={() => { setOtpSent(false); setOtp(['', '', '', '']); }} className="text-xs text-teal font-semibold mt-3 cursor-pointer">Change number</button>
            </div>
          )}

          <div className="mt-auto pt-8">
            {!otpSent ? (
              <Button className="w-full" disabled={!phoneOk} onClick={() => setOtpSent(true)}>
                <Smartphone className="size-4" /> Send OTP
              </Button>
            ) : (
              <Button className="w-full" disabled={!otpOk} loading={verifying} onClick={verify}>
                {verifying ? 'Verifying…' : 'Verify & continue'}
              </Button>
            )}
            <button onClick={() => completeOnboarding('', [])} className="w-full text-center text-xs text-muted mt-3 py-2 cursor-pointer underline">Skip onboarding (demo)</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 flex flex-col mt-6">
          <h1 className="text-2xl font-semibold">Which apps do you work on?</h1>
          <p className="text-muted mt-1 text-sm">Pick all that apply. Your cover and savings follow you across all of them.</p>
          {[
            { label: 'Delivery', list: DELIVERY },
            { label: 'Home services', list: GIG_APPS.filter((a) => !DELIVERY.includes(a)) },
          ].map((g) => (
            <div key={g.label} className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.list.map((a) => {
                  const on = apps.includes(a);
                  return (
                    <button
                      key={a}
                      aria-pressed={on}
                      onClick={() => setApps(on ? apps.filter((x) => x !== a) : [...apps, a])}
                      className={cx('min-h-12 px-4 rounded-2xl border text-[15px] font-semibold inline-flex items-center gap-2 transition cursor-pointer', on ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}
                    >
                      {on && <Check className="size-4 text-saffron" />}
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-auto pt-8">
            <Button className="w-full" disabled={!apps.length} onClick={() => setStep(2)}>
              {t('continue')} · {apps.length} selected
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col mt-6">
          <h1 className="text-2xl font-semibold">Link earnings with UPI AutoPay</h1>
          <p className="text-muted mt-1 text-sm">So we can charge cover only on days you work and save a little from each order.</p>

          <div className="mt-5 bg-white rounded-3xl border border-line overflow-hidden">
            <div className="bg-teal-light px-4 py-3 flex items-center gap-2 text-sm font-semibold text-teal">
              <Landmark className="size-4" /> UPI AutoPay mandate (mock)
            </div>
            <dl className="divide-y divide-line text-sm">
              {[
                ['Pay to', 'GigKavach Wallet'],
                ['From', w.worker.upiId],
                ['Frequency', 'Only on active days'],
                ['Max per debit', inr(300)],
                ['Purpose', `Cover ${inr(PLANS[w.plan].perDay)}/day + auto-save`],
                ['Valid till', 'Cancel anytime'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-3 gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex gap-2"><ShieldCheck className="size-5 text-good shrink-0" /> No charge on days you don't log in</li>
            <li className="flex gap-2"><Lock className="size-5 text-good shrink-0" /> You own the wallet, not the platform. Change apps, keep your cover.</li>
          </ul>
          <p className="text-[11px] text-muted mt-4">Prototype only: no real UPI mandate, bank or insurer is contacted.</p>

          <div className="mt-auto pt-6">
            <Button variant="saffron" className="w-full" loading={linking} onClick={link}>
              {linking ? 'Approving in UPI app…' : 'Approve AutoPay'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
