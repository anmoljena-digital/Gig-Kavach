# GigKavach – clickable prototype

One wallet the gig worker owns, portable across Zomato, Swiggy, Blinkit, Zepto, Urban Company, Snabbit and Pronto.
Three pillars: **Protect** (micro-insurance from ₹3/active day + parametric weather payouts), **Grow** (round-ups and
auto-save into gold, mutual funds and NPS), **Bounce back** (emergency fund, earnings advance, government benefits finder),
plus a **B2B platform dashboard** for a fictional aggregator, *QuickBasket*.

> College fintech assignment demo. **Mock data only.** No real payments, KYC, UPI mandates, insurer or bank APIs.

## Run it

Needs Node 18+.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Other scripts: `npm run build` (type-check + production build), `npm run preview`.

## Routes

| Route | What |
|---|---|
| `/` | Landing page: "Open worker app" / "Open platform dashboard" |
| `/app` | Worker app in a 390×844 phone frame (full-screen on a real phone) |
| `/app/protect`, `/app/protect/claim`, `/app/weather` | Plans, cover calendar, claims, claim flow, weather payouts |
| `/app/grow`, `/app/bounce`, `/app/activity`, `/app/profile` | Savings, safety net, transaction history, settings |
| `/platform` | QuickBasket B2B dashboard (desktop layout) |

## Tech

React 18 + Vite + TypeScript + Tailwind CSS v4, Recharts, lucide-react, React Router.
All state lives in one React context (`src/state/AppContext.tsx`) and is saved to `localStorage`.
"Reset demo" (Profile tab or the Demo controls panel) restores the seed data.

```
src/
  lib/types.ts       data model (DayRecord, Txn, Claim, WeatherEvent, PlatformWorker…)
  lib/mockData.ts    deterministic seed: Ravi Kumar's 60 days + QuickBasket fleet
  lib/catalog.ts     plans, weather triggers, claim types, govt schemes, assumptions
  lib/i18n.ts        English / Hindi labels
  lib/format.ts      ₹ Indian number formatting (₹1,20,000), dates
  state/AppContext   state, actions, toasts, localStorage persistence
  components/        phone frame + tab bar, demo controls, shared UI
  screens/           worker app screens
  pages/             landing + platform dashboard
```

**Seed persona:** Ravi Kumar, 26, Lucknow. Rides for Swiggy + Blinkit, roughly ₹20,000/month, on the Plus plan (₹4/day).
History covers the last 60 days relative to today: about one rest day a week, so cover is paused on those days. It also includes
weather events (one rain payout, two bad-air payouts, three readings below trigger), one paid hospital claim and one accident
claim in review.

**Key rules modelled**
- Premium is charged only on days the worker logs in (first order of the day switches cover on).
- Weather payouts are parametric: fixed amount when the reading crosses the trigger (rain ≥ 50 mm, temp ≥ 45 °C, AQI ≥ 300), and only on active-cover days.
- Round-up rounds each order up to the next ₹5. Savings split 30% gold / 50% MF / 20% NPS.
- Projection uses an **assumed** 8% p.a. return, labelled as such in the UI.
- Advance is capped at 30% of the last 7 days' earnings, with a flat ₹10 fee.
- SS Code tracker: contribution = min(rate × turnover, 5% × worker payouts), rate adjustable 1–2%.

## 2-minute demo script

Start with **Reset demo** so everyone sees the same numbers. On a laptop, the Demo controls panel sits to the right of the phone.

1. **(0:00) Landing** → click **Open worker app**.
2. **(0:10) Onboarding** → **Use demo number** → **Send OTP** → type any 4 digits → **Verify & continue** →
   add **Zepto** to the pre-selected Swiggy + Blinkit → **Continue** → read the mock UPI AutoPay mandate → **Approve AutoPay**.
3. **(0:35) Home** → point out today's earnings, the green **Cover active today** pill, wallet, savings and the bad-air payout card.
4. **(0:45) Demo controls → Simulate rain event** → the toast says "Heavy rain in Lucknow · +₹150", the home card and wallet update. No claim needed.
5. **(0:55) Demo controls → Skip a day** → the pill turns to **Cover paused today**, ₹0 charged. Then **Simulate new order** → the
   toast says cover switched on and ₹4 charged, and a round-up goes into savings.
6. **(1:10) Protect tab** → tap **Basic / Plus / Max** to compare. Scroll to the **cover calendar** (striped days = paused, not billed).
   Tap **File a claim** → *Accident injury* → bill ₹3,200 → upload the photo placeholder → **Submit** → the status timeline moves to "Under review".
7. **(1:25) Demo controls → Approve accident claim** → the claim is paid and the toast shows the money in the wallet.
8. **(1:35) Grow tab** → donut split, toggle round-up, drag the **daily auto-save** slider and watch the 8%-assumption projection change.
9. **(1:45) Bounce back tab** → **Withdraw** → ₹500 → **Confirm**. Show the advance cap (30% of last week) and **Help me register** for e-Shram.
10. **(1:55) Profile** → switch to **हिंदी**. Then **Platform dashboard** → **Top up cover** → **Confirm top-up**. KPIs and the table update.
    Drag the SS Code **notified rate** to 2% to show the 5% cap kicking in.
