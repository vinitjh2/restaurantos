'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Utensils,
  Store,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Coffee,
  Flame,
  Cake,
  GitFork,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestaurantStore } from '@/stores/restaurant-store';

const BUSINESS_TYPES = [
  { id: 'RESTAURANT', name: 'Fine Dining / Casual Restaurant', desc: 'Table floor plans, captain ordering, bar stations', icon: Utensils },
  { id: 'CAFE', name: 'Cafe & Quick Service (QSR)', desc: 'Fast counter billing, takeaway tokens, 58mm receipts', icon: Coffee },
  { id: 'CLOUD_KITCHEN', name: 'Cloud / Ghost Kitchen', desc: 'Delivery orders, multi-brand menus, KDS dispatch', icon: Flame },
  { id: 'BAKERY', name: 'Bakery & Dessert Parlour', desc: 'Weight-based billing, pre-orders, bakery KDS', icon: Cake },
  { id: 'MULTI_CHAIN', name: 'Multi-Branch Chain', desc: 'Central base kitchen, branch transfers, master P&L', icon: GitFork },
];

const SUBSCRIPTION_PLANS = [
  { id: 'STARTER', name: 'Starter Plan', price: '₹999', period: '/ month', desc: 'Single outlet, POS billing, basic stock, 3 staff accounts.' },
  { id: 'PROFESSIONAL', name: 'Professional Plan', price: '₹2,499', period: '/ month', desc: 'Single outlet, POS, full KDS, BOM recipes, payroll, unlimited staff.', recommended: true },
  { id: 'ENTERPRISE', name: 'Enterprise Multi-Branch', price: '₹4,999', period: '/ month', desc: 'Multi-branch chain, cross-branch transfers, centralized analytics, offline sync.' },
];

export default function RegisterRestaurantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form state
  const [restaurantName, setRestaurantName] = useState('');
  const [businessType, setBusinessType] = useState('RESTAURANT');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [gstin, setGstin] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('PROFESSIONAL');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setOrganization, setBranch } = useRestaurantStore();

  const handleRegister = async () => {
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
          branchName: branchName || `${restaurantName} — Flagship`,
          city,
          state,
          gstin: gstin || '29AABCU9603R1ZM',
          fssaiNumber: fssaiNumber || '11223344000123',
          subscriptionPlan,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.organization?.id) setOrganization(data.organization.id);
        if (data.branch?.id) setBranch(data.branch.id);
        router.push('/');
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
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black">RESTAURANT<span className="text-orange-500">OS</span></h1>
            <p className="text-xs text-slate-400">Commercial SaaS Onboarding Wizard</p>
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
                placeholder="e.g. Copper Chimney or Blue Tokai Roasters"
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
                  placeholder="e.g. Vikram Singhania"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Phone Number (For OTP & Alert SMS)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
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
                <span>Continue to Flagship Outlet</span>
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
              <h2 className="text-2xl font-black text-white mt-1">Configure Initial Flagship Outlet</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your main restaurant location. Additional branches can be added later.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder={`e.g. ${restaurantName || 'Restaurant'} — Flagship Indiranagar`}
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
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
                    placeholder="29AABCU9603R1ZM"
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-4 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">FSSAI License (14 Digits)</label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    placeholder="11223344000123"
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

        {/* STEP 4: SUBSCRIPTION PLAN */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">Step 4 of 4</span>
              <h2 className="text-2xl font-black text-white mt-1">Select SaaS Subscription Tier</h2>
              <p className="text-xs text-slate-400 mt-1">All tiers include a 30-day full access free trial. Cancel or switch anytime.</p>
            </div>

            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isSelected = subscriptionPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSubscriptionPlan(plan.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{plan.name}</span>
                        {plan.recommended && (
                          <Badge className="bg-orange-600 text-white text-[10px] px-2 py-0.5">Most Popular</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{plan.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500 block">{plan.period}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="h-11 px-4 border-slate-800 text-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                disabled={isLoading}
                onClick={handleRegister}
                className="flex-1 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/30 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Creating Your RestaurantOS Tenant...' : 'Launch My Restaurant Platform'}</span>
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
