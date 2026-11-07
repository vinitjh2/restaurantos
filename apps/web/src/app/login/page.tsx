'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Utensils, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRestaurantStore } from '@/stores/restaurant-store';
import { offlineStorage } from '@/lib/offline/offline-storage';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('owner@bawarchiroyale.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { setOrganization, setBranch } = useRestaurantStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Cache session for robust offline authentication
        if (data.user && data.organization) {
          await offlineStorage.cacheSession({
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            organizationId: data.organization.id,
            organizationSlug: data.organization.slug || 'bawarchi-royale',
            assignedBranchId: data.user.assignedBranchId,
            cachedAt: Date.now(),
          });
        }

        if (data.organization?.id) {
          setOrganization(data.organization.id);
        }
        if (data.organization?.branches?.[0]?.id) {
          setBranch(data.organization.branches[0].id);
        }
        if (data.user?.role === 'PLATFORM_OWNER') {
          router.push('/platform-admin');
        } else {
          router.push(redirectPath);
        }
      } else {
        setErrorMessage(data.error || 'Failed to log in');
      }
    } catch (err: any) {
      // Offline fallback: Check for authorized cached session
      const cached = await offlineStorage.getCachedSession(email);
      if (cached) {
        setOrganization(cached.organizationId);
        if (cached.assignedBranchId) setBranch(cached.assignedBranchId);
        router.push(redirectPath);
        return;
      }
      setErrorMessage(err.message || 'Network error during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="w-full max-w-md space-y-8 z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-lg shadow-orange-500/20 mb-2">
          <Utensils className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">RestaurantOS</h1>
        <p className="text-xs text-slate-400">
          Enterprise Cloud Multi-Tenant Restaurant Platform & POS
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Sign In to Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your restaurant branch, POS terminals, and live orders
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Demo Logins:
          </div>
          <button
            type="button"
            onClick={() => handleDemoQuickFill('superadmin@restaurantos.io', 'AdminPassword123!')}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-indigo-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-600 flex items-center justify-between"
          >
            <div className="text-left">
              <span className="font-bold text-indigo-400 block">Platform Super Admin (Software Owner)</span>
              <span className="text-[10px] text-slate-500">superadmin@restaurantos.io</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            type="button"
            onClick={() => handleDemoQuickFill('owner@bawarchiroyale.com', 'Password123!')}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-between"
          >
            <div className="text-left">
              <span className="font-bold text-orange-400 block">Restaurant Owner (Tenant)</span>
              <span className="text-[10px] text-slate-500">owner@bawarchiroyale.com</span>
            </div>
            <Sparkles className="w-4 h-4 text-orange-500" />
          </button>
        </div>
      </div>

      {/* Register CTA */}
      <div className="text-center text-xs text-slate-400">
        Want to register a new restaurant?{' '}
        <Link href="/register" className="text-orange-400 font-bold hover:underline">
          Register your business here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
