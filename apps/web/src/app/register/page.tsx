'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Utensils,
  CreditCard,
  CheckCircle2,
  Coffee,
  Flame,
  Cake,
  GitFork,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/formatters';
import { useRestaurantStore } from '@/stores/restaurant-store';

const BUSINESS_TYPES = [
  { id: 'RESTAURANT', name: 'Fine Dining / Casual Restaurant', desc: 'Table floor plans, captain ordering, bar stations', icon: Utensils },
  { id: 'CAFE', name: 'Cafe & Quick Service (QSR)', desc: 'Fast counter billing, takeaway tokens, 58mm receipts', icon: Coffee },
  { id: 'CLOUD_KITCHEN', name: 'Cloud / Ghost Kitchen', desc: 'Delivery orders, multi-brand menus, KDS dispatch', icon: Flame },
  { id: 'BAKERY', name: 'Bakery & Dessert Parlour', desc: 'Weight-based billing, pre-orders, bakery KDS', icon: Cake },
  { id: 'MULTI_CHAIN', name: 'Multi-Branch Chain', desc: 'Central base kitchen, branch transfers, master P&L', icon: GitFork },
];

interface PublicPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxBranches: number;
  maxEmployees: number;
}

const FALLBACK_PLANS: PublicPlan[] = [
  { id: 'starter', code: 'STARTER', name: 'Starter', description: 'Ideal for small standalone cafes, food trucks and kiosks', monthlyPrice: 499, annualPrice: 4990, maxBranches: 1, maxEmployees: 5 },
  { id: 'growth', code: 'GROWTH', name: 'Growth', description: 'Perfect for growing restaurants and busy cloud kitchens', monthlyPrice: 999, annualPrice: 9990, maxBranches: 3, maxEmployees: 20 },
  { id: 'pro', code: 'PRO', name: 'Pro', description: 'Full-scale restaurant management with multi-branch, accounting & KDS', monthlyPrice: 2499, annualPrice: 23990, maxBranches: 10, maxEmployees: 100 },
  { id: 'enterprise', code: 'ENTERPRISE', name: 'Enterprise', description: 'Unlimited scale for enterprise restaurant chains & large franchises', monthlyPrice: 3999, annualPrice: 38390, maxBranches: 999, maxEmployees: 9999 },
];

export default function RegisterRestaurantPage() {
  const [step, setStep] = useState(1);

  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [businessType, setBusinessType] = useState('RESTAURANT');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [plans, setPlans] = useState<PublicPlan[]>(FALLBACK_PLANS);
  const [subscriptionPlan, setSubscriptionPlan] = useState('GROWTH');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setOrganization, setBranch } = useRestaurantStore();

  useEffect(() => {
    fetch('/api/plans/public')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
          const hasGrowth = data.plans.some((p: PublicPlan) => p.code === 'GROWTH');
          if (!hasGrowth) setSubscriptionPlan(data.plans[0].code);
        }
      })
      .catch(() => {});
  }, []);

  const selectedPlanObj = plans.find((p) => p.code === subscriptionPlan) || plans[0];
  const payableAmount =
    billingCycle === 'ANNUAL' ? selectedPlanObj.annualPrice : selectedPlanObj.monthlyPrice;

  const handleRegisterAndPay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName,
          businessType,
          ownerName,
          email,
          password,
          phone,
          branchName: branchName.trim() || `${restaurantName.trim()} — Main Outlet`,
          city: city.trim(),
          state: state.trim(),
          gstin: gstin.trim(),
          fssaiNumber: fssaiNumber.trim(),
          subscriptionPlan,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.organization?.id) setOrganization(data.organization.id);
        if (data.branch?.id) setBranch(data.branch.id);

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        window.location.href = data.fallbackUrl || '/subscription?paymentRequired=1';
      } else {
        setErrorMessage(data.error || 'Failed to register restaurant');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-amber-500/40 flex items-center justify-center font-bold overflow-hidden p-0.5">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-black">Dine<span className="text-amber-500">Sutra</span></h1>
            <p className="text-xs text-slate-400">Commercial SaaS Onboarding · SutraUniverse</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step === s
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                  : step > s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Step Area */}
      <div className="max-w-2xl mx-auto w-full my-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: BUSINESS FORMAT */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Step 1 of 4</span>
              <h2 className="text-2xl font-black text-white mt-1">Select Your Restaurant Business Format</h2>
              <p className="text-xs text-slate-400 mt-1">We tailor POS channels, KDS stations, and inventory workflows to your format.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Restaurant / Business Name</label>
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g. Royal Spice Kitchen or Aroma Cafe"
                className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Primary Operation Model</label>
              <div className="space-y-2.5">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = businessType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setBusinessType(type.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-950/20 shadow-md shadow-orange-500/10'
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-orange-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-white block">{type.name}</span>
                        <span className="text-xs text-slate-400">{type.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              disabled={!restaurantName.trim()}
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm gap-2 mt-4"
            >
              <span>Continue to Owner Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* STEP 2: OWNER ACCOUNT */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Step 2 of 4</span>
              <h2 className="text-2xl font-black text-white mt-1">Create Owner Master Account</h2>
              <p className="text-xs text-slate-400 mt-1">This master login controls multi-branch analytics, staff compensation, and billing.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Owner Full Name</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter owner full name"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourrestaurant.com"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Account Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="h-11 px-4 border-slate-800 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                disabled={!ownerName.trim() || !email.trim() || password.length < 8}
                onClick={() => setStep(3)}
                className="flex-1 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm gap-2"
              >
                <span>Continue to Outlet Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: FLAGSHIP OUTLET */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Step 3 of 4</span>
              <h2 className="text-2xl font-black text-white mt-1">Configure Initial Outlet</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your main restaurant location. Additional branches can be added anytime.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder={`${restaurantName || 'Restaurant'} — Main Outlet`}
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai / Bengaluru"
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra / Karnataka"
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="Enter 15-char GSTIN if registered"
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">FSSAI License (Optional)</label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    placeholder="14-digit FSSAI number"
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="h-11 px-4 border-slate-800 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm gap-2"
              >
                <span>Choose Subscription Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBSCRIPTION PLAN + PHONEPE CHECKOUT */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Step 4 of 4</span>
                <h2 className="text-2xl font-black text-white mt-1">Select Plan &amp; Pay via PhonePe</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Instant platform activation after payment via UPI, PhonePe, Cards, or NetBanking.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    billingCycle === 'MONTHLY' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('ANNUAL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    billingCycle === 'ANNUAL' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Annual (Save)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => {
                const isSelected = subscriptionPlan === plan.code;
                const displayPrice =
                  billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <div
                    key={plan.code}
                    onClick={() => setSubscriptionPlan(plan.code)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{plan.name}</span>
                        {plan.code === 'GROWTH' && (
                          <Badge className="bg-orange-600 text-white text-[10px] px-2 py-0.5">Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{plan.description}</p>
                      <p className="text-[11px] text-slate-500">
                        Up to {plan.maxBranches >= 999 ? 'Unlimited' : plan.maxBranches} Outlets ·{' '}
                        {plan.maxEmployees >= 9999 ? 'Unlimited' : plan.maxEmployees} Staff
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-white">{formatINR(displayPrice)}</span>
                      <span className="text-xs text-slate-500 block">
                        /{billingCycle === 'ANNUAL' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Secured by <strong>PhonePe Payment Gateway (SutraUniverse)</strong>. Account activates automatically on payment confirmation.
              </span>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="h-11 px-4 border-slate-800 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                disabled={isLoading}
                onClick={handleRegisterAndPay}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? 'Opening PhonePe Checkout...'
                    : `Pay ${formatINR(payableAmount)} via PhonePe & Launch`}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 max-w-md mx-auto">
        Already registered?{' '}
        <Link href="/login" className="text-orange-400 font-bold hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
