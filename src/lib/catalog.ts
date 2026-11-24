import type { BenefitId, ClaimType, PlanId, WeatherKind } from './types';

export interface Plan {
  id: PlanId;
  name: string;
  perDay: number;
  accident: number; // accidental death / disability sum insured
  accidentMedical: number; // accident medical expenses
  hospitalCash: number; // ₹ per day in hospital (up to 10 days)
  life: number; // term life cover, 0 = not included
  device: number; // phone / bike damage, 0 = not included
  weather: number; // ₹ per parametric weather event
}

export const PLANS: Record<PlanId, Plan> = {
  basic: { id: 'basic', name: 'Basic', perDay: 3, accident: 200000, accidentMedical: 10000, hospitalCash: 500, life: 0, device: 0, weather: 100 },
  plus: { id: 'plus', name: 'Plus', perDay: 4, accident: 300000, accidentMedical: 15000, hospitalCash: 750, life: 200000, device: 0, weather: 150 },
  max: { id: 'max', name: 'Max', perDay: 5, accident: 500000, accidentMedical: 25000, hospitalCash: 1000, life: 500000, device: 15000, weather: 200 },
};

export const WEATHER_RULES: Record<WeatherKind, { label: string; labelHi: string; unit: string; threshold: number; desc: string }> = {
  rain: { label: 'Heavy rain', labelHi: 'भारी बारिश', unit: 'mm', threshold: 50, desc: '≥ 50 mm rainfall in 24 hrs' },
  heat: { label: 'Heatwave', labelHi: 'लू', unit: '°C', threshold: 45, desc: '≥ 45 °C max temperature' },
  aqi: { label: 'Severe air', labelHi: 'ज़हरीली हवा', unit: 'AQI', threshold: 300, desc: 'AQI ≥ 300 for 6+ hrs' },
};

export const CLAIM_TYPES: Record<ClaimType, { label: string; labelHi: string; desc: string; requires?: PlanId[] }> = {
  accident: { label: 'Accident injury', labelHi: 'दुर्घटना', desc: 'Medical bills after a road or work accident' },
  hospital: { label: 'Hospital stay', labelHi: 'अस्पताल', desc: 'Daily cash for each day admitted (24 hrs+)' },
  phone: { label: 'Phone damage', labelHi: 'फ़ोन', desc: 'Screen or water damage to your work phone', requires: ['max'] },
  bike: { label: 'Bike damage', labelHi: 'बाइक', desc: 'Repairs after an accident while on duty', requires: ['max'] },
};

export const BENEFITS: Record<BenefitId, { name: string; nameHi: string; what: string; eligibility: string; steps: string[]; docs: string[] }> = {
  eshram: {
    name: 'e-Shram card',
    nameHi: 'ई-श्रम कार्ड',
    what: 'National ID for unorganised & gig workers. Gateway to welfare schemes and ₹2 lakh accident cover under PMSBY.',
    eligibility: 'Age 16–59, not an EPFO/ESIC member, not an income-tax payer',
    steps: ['We pre-fill your details from GigKavach', 'Verify Aadhaar-linked mobile with OTP', 'Pick occupation: “Delivery / gig worker”', 'Download your UAN card'],
    docs: ['Aadhaar', 'Aadhaar-linked mobile', 'Bank account'],
  },
  pmjay: {
    name: 'Ayushman Bharat PM-JAY',
    nameHi: 'आयुष्मान भारत',
    what: 'Free hospital treatment up to ₹5 lakh per family per year at empanelled hospitals.',
    eligibility: 'Based on SECC data / state lists; many platform workers now eligible',
    steps: ['Check eligibility with Aadhaar or ration card', 'e-KYC at a CSC or the Ayushman app', 'Get your Ayushman card'],
    docs: ['Aadhaar', 'Ration card (if any)'],
  },
  pmsby: {
    name: 'PM Suraksha Bima (PMSBY)',
    nameHi: 'पीएम सुरक्षा बीमा',
    what: '₹2 lakh accident cover for ₹20 a year, auto-debited from your bank.',
    eligibility: 'Age 18–70 with a savings bank account',
    steps: ['Give consent for ₹20/year auto-debit', 'Add nominee', 'Bank confirms enrolment by SMS'],
    docs: ['Bank account', 'Aadhaar'],
  },
};

export const ASSUMED_RETURN = 0.08; // 8% p.a. — illustrative assumption only
export const ALLOCATION = { gold: 0.3, mf: 0.5, nps: 0.2 };
export const ADVANCE_CAP = 0.3; // 30% of last 7 days' earnings
export const ADVANCE_FEE = 10; // flat ₹ fee (mock)

export const SERIES_COLORS = { gold: '#C98A1E', mf: '#009A93', nps: '#6B4FA0' };
