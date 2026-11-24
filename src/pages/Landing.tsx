import { ArrowRight, Building2, CloudRain, LifeBuoy, ShieldCheck, Smartphone, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui';

export default function Landing() {
  return (
    <div className="min-h-full bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <header className="flex items-center justify-between">
          <Logo className="text-xl" />
          <span className="text-xs font-semibold text-muted bg-white border border-line rounded-full px-3 py-1.5">Prototype · mock data</span>
        </header>

        <section className="mt-10 sm:mt-16 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="text-saffron-dark font-semibold text-sm tracking-wide uppercase">For delivery riders & home-service pros</p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.08] mt-3">
              One wallet the worker owns, across every gig app.
            </h1>
            <p className="text-muted text-lg mt-4 max-w-xl">
              Insurance from ₹3 per active day, savings from every order, and a safety net for bad weeks. It works across Zomato, Swiggy, Blinkit, Zepto, Urban Company, Snabbit and Pronto.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/app" className="min-h-14 px-6 rounded-2xl bg-ink text-cream font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#1d3940]">
                <Smartphone className="size-5" /> Open worker app <ArrowRight className="size-4" />
              </Link>
              <Link to="/platform" className="min-h-14 px-6 rounded-2xl bg-white border border-line text-ink font-semibold inline-flex items-center justify-center gap-2 hover:border-teal">
                <Building2 className="size-5" /> Open platform dashboard
              </Link>
            </div>
            <p className="text-xs text-muted mt-4">Demo persona: Ravi Kumar, 26, Lucknow. Rides for Swiggy + Blinkit, earns about ₹20,000/month.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, title: 'Protect', body: 'Accident, hospital cash and life cover. Pauses on days off.' },
              { icon: CloudRain, title: 'Weather payouts', body: 'Heavy rain, heatwave or bad AQI? Paid automatically.' },
              { icon: Sprout, title: 'Grow', body: 'Round-ups into gold, mutual funds and NPS from ₹10/day.' },
              { icon: LifeBuoy, title: 'Bounce back', body: 'Emergency fund, small advances and govt benefits.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-3xl border border-line p-4">
                <span className="size-10 rounded-2xl bg-teal-light text-teal grid place-items-center"><Icon className="size-5" /></span>
                <p className="font-heading font-semibold mt-3">{title}</p>
                <p className="text-sm text-muted mt-1">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-xs text-muted border-t border-line pt-4">
          College fintech assignment demo. No real payments, KYC, insurer or bank APIs are used. QuickBasket is a fictional aggregator.
        </footer>
      </div>
    </div>
  );
}
