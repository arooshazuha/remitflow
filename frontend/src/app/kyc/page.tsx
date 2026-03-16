"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCircle, CreditCard, Flag } from "lucide-react";

export default function KYC() {
  const { token, kycStatus, isAuthenticated, login } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (kycStatus === 'APPROVED') router.push("/dashboard");
  }, [isAuthenticated, kycStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/kyc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, idNumber, country })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "KYC verification failed");

      setSuccess(true);
      
      // Update local storage and context
      const userId = localStorage.getItem("userId") || "";
      const email = localStorage.getItem("email") || "";
      login(token as string, userId, email, "APPROVED");
      
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (kycStatus === 'APPROVED') return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Verify Your Identity</h2>
            <p className="text-blue-100 mt-2">Required for international transfers</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Verification Complete!</h3>
                <p className="text-slate-500 mt-2">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      required
                      type="text"
                      className="pl-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Government ID Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      required
                      type="text"
                      className="pl-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Passport or SSN"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country of Residence</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Flag className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      className="pl-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                    >
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                  >
                    {loading ? "Verifying..." : "Submit Verification"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6">
          Your data is securely encrypted. We complete these checks to comply with international Anti-Money Laundering (AML) regulations.
        </p>
      </div>
    </div>
  );
}
