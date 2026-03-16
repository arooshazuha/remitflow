"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Mail } from "lucide-react";

export default function SendMoney() {
  const { token, kycStatus, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kycStatus !== 'APPROVED') {
      router.push('/kyc');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/wallet/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientEmail, amount: parseFloat(amount) })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
               <Send className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Send Money</h2>
              <p className="text-slate-500">Transfer instantly worldwide</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-12 animate-in zoom-in duration-500">
               <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="h-12 w-12 text-emerald-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Transfer Complete!</h3>
               <p className="text-slate-500 mb-8 text-lg">Your funds have been sent instantly.</p>
               <Link href="/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                 Return to Dashboard
               </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-slate-400" />
                   </div>
                   <input
                     type="email"
                     required
                     className="pl-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                     placeholder="recipient@example.com"
                     value={recipientEmail}
                     onChange={e => setRecipientEmail(e.target.value)}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    className="pl-8 block w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-lg font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-500">
                 Fee: <strong className="text-slate-900">$0.00</strong> (Promotional rate)
              </div>

              <button
                type="submit"
                disabled={loading || kycStatus !== 'APPROVED' || !recipientEmail || !amount}
                className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl shadow hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? "Processing Transfer..." : "Send Instantly"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
