import { Building2, Check, ChevronRight, Languages, Landmark, ListOrdered, RotateCcw, Smartphone, UserRoundCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { GIG_APPS, type GigApp } from '../lib/types';
import { PLANS } from '../lib/catalog';
import { Button, Card, Pill, ScreenHeader, SectionTitle, Sheet, cx } from '../components/ui';

export default function Profile() {
  const { w, t, lang, setLang, setApps, setNominee, resetDemo } = useApp();
  const [sheet, setSheet] = useState<'apps' | 'nominee' | 'reset' | null>(null);
  const [apps, setLocalApps] = useState<GigApp[]>(w.worker.apps);
  const [nom, setNom] = useState(w.worker.nominee);

  const open = (s: typeof sheet) => {
    setLocalApps(w.worker.apps);
    setNom(w.worker.nominee);
    setSheet(s);
  };

  return (
    <div>
      <ScreenHeader title={t('profile')} />
      <div className="px-4">
        <Card className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-saffron text-ink grid place-items-center font-heading text-2xl font-semibold">RK</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">{w.worker.name}</p>
            <p className="text-sm text-muted">{w.worker.age} · {w.worker.city} · +91 {w.worker.phone}</p>
            <div className="flex gap-1.5 mt-1.5"><Pill tone="teal">{PLANS[w.plan].name} cover</Pill>{w.upiLinked && <Pill tone="good">AutoPay on</Pill>}</div>
          </div>
        </Card>

        <SectionTitle>Settings</SectionTitle>
        <Card className="py-1">
          <Row icon={<Languages className="size-5" />} label={t('language')}>
            <div className="flex bg-cream rounded-full p-1 text-sm font-semibold" role="group" aria-label="Language">
              {(['en', 'hi'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cx('px-3 py-1.5 rounded-full cursor-pointer min-w-12', lang === l ? 'bg-ink text-cream' : 'text-muted')}>
                  {l === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </Row>
          <Row icon={<Smartphone className="size-5" />} label={t('linkedApps')} sub={w.worker.apps.join(', ')} onClick={() => open('apps')} />
          <Row icon={<UserRoundCheck className="size-5" />} label={t('nominee')} sub={`${w.worker.nominee.name} (${w.worker.nominee.relation})`} onClick={() => open('nominee')} />
          <Row icon={<Landmark className="size-5" />} label="UPI AutoPay" sub={`${w.worker.upiId} · only on active days`} />
          <Link to="/app/activity"><Row icon={<ListOrdered className="size-5" />} label={t('activity')} sub="All transactions" chevron /></Link>
        </Card>

        <SectionTitle>Demo</SectionTitle>
        <Card className="py-1">
          <Link to="/platform"><Row icon={<Building2 className="size-5" />} label="Platform dashboard" sub="QuickBasket B2B view" chevron /></Link>
          <Row icon={<RotateCcw className="size-5 text-bad" />} label={<span className="text-bad">{t('resetDemo')}</span>} sub="Restore Ravi's 60-day mock history" onClick={() => setSheet('reset')} />
        </Card>
        <p className="text-[11px] text-muted text-center mt-5">GigKavach prototype · college fintech demo · mock data only</p>
      </div>

      <Sheet open={sheet === 'apps'} onClose={() => setSheet(null)} title={t('linkedApps')}>
        <p className="text-sm text-muted mb-3">Your cover and savings work across all of these.</p>
        <div className="flex flex-wrap gap-2">
          {GIG_APPS.map((a) => {
            const on = apps.includes(a);
            return (
              <button key={a} aria-pressed={on} onClick={() => setLocalApps(on ? apps.filter((x) => x !== a) : [...apps, a])} className={cx('min-h-12 px-4 rounded-2xl border font-semibold inline-flex items-center gap-2 cursor-pointer', on ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>
                {on && <Check className="size-4 text-saffron" />}{a}
              </button>
            );
          })}
        </div>
        <Button className="w-full mt-5" disabled={!apps.length} onClick={() => { setApps(apps); setSheet(null); }}>Save</Button>
      </Sheet>

      <Sheet open={sheet === 'nominee'} onClose={() => setSheet(null)} title={t('nominee')}>
        <label className="text-sm font-semibold" htmlFor="nn">Name</label>
        <input id="nn" value={nom.name} onChange={(e) => setNom({ ...nom, name: e.target.value })} className="mt-1 mb-3 w-full h-12 rounded-2xl border border-line bg-white px-4 outline-none focus:border-teal" />
        <p className="text-sm font-semibold mb-2">Relation</p>
        <div className="flex flex-wrap gap-2">
          {['Mother', 'Father', 'Spouse', 'Sibling', 'Child'].map((r) => (
            <button key={r} onClick={() => setNom({ ...nom, relation: r })} aria-pressed={nom.relation === r} className={cx('min-h-11 px-4 rounded-2xl border font-semibold text-sm cursor-pointer', nom.relation === r ? 'bg-ink text-cream border-ink' : 'bg-white border-line')}>{r}</button>
          ))}
        </div>
        <Button className="w-full mt-5" disabled={!nom.name.trim()} onClick={() => { setNominee(nom.name.trim(), nom.relation); setSheet(null); }}>Save nominee</Button>
      </Sheet>

      <Sheet open={sheet === 'reset'} onClose={() => setSheet(null)} title="Reset the demo?">
        <p className="text-sm text-muted">This clears everything you did in the demo and reloads the mock data. You'll see onboarding again.</p>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={() => setSheet(null)}>{t('cancel')}</Button>
          <Button variant="danger" className="flex-1" onClick={() => { setSheet(null); resetDemo(); }}>{t('resetDemo')}</Button>
        </div>
      </Sheet>
    </div>
  );
}

function Row({ icon, label, sub, children, onClick, chevron }: { icon: ReactNode; label: ReactNode; sub?: string; children?: ReactNode; onClick?: () => void; chevron?: boolean }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={cx('w-full flex items-center gap-3 py-3 min-h-14 text-left border-b border-line last:border-0', onClick && 'cursor-pointer')}>
      <span className="text-teal">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {sub && <span className="block text-xs text-muted truncate">{sub}</span>}
      </span>
      {children}
      {(onClick || chevron) && !children && <ChevronRight className="size-5 text-muted" />}
    </Tag>
  );
}
