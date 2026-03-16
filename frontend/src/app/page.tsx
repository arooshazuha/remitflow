"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6">
      <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
            <Globe className="h-10 w-10 text-blue-300" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Send Money <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Across Borders
          </span>
        </h1>
        
        <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
          The secure, instant, and compliant platform for global remittances. Experience the future of cross-border payments with our PCI-DSS compliant demo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-blue-900 font-semibold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2">
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 text-white font-semibold backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 mt-16 border-t border-white/10">
          <div className="flex flex-col items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <h3 className="font-semibold text-lg">PCI-DSS Secure</h3>
            <p className="text-sm text-blue-200">Bank-grade security and tokenized card handling.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            <h3 className="font-semibold text-lg">Instant Payouts</h3>
            <p className="text-sm text-blue-200">Real-time ledger updates and instant webhook confirmations.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Globe className="h-8 w-8 text-blue-400" />
            <h3 className="font-semibold text-lg">Global Reach</h3>
            <p className="text-sm text-blue-200">Built-in KYC/AML checks for international transfers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
