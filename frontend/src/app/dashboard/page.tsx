"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/config";
import { CreditCard, Send, ShieldCheck, LogOut, RefreshCw, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function Dashboard() {
  const { token, kycStatus, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchWallet();
  }, [isAuthenticated, token, router]);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">RemitFlow</span>
            </div>
            <div className="flex items-center gap-4">
              {kycStatus === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <Link href="/kyc" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors border border-amber-200">
                  Verify Identity
                </Link>
              )}
              <button onClick={logout} className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Wallet className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <p className="text-blue-200 font-medium mb-2">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">${(wallet?.balance || 0).toFixed(2)}</span>
              <span className="text-blue-300 font-medium">USD</span>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Link href="/add-funds" className="bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                <CreditCard className="h-5 w-5" /> Add Funds
              </Link>
              <Link href="/send-money" className="bg-blue-800/50 text-white backdrop-blur-sm border border-blue-700/50 px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 hover:border-blue-500/50">
                <Send className="h-5 w-5" /> Send Money
              </Link>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <button onClick={fetchWallet} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {wallet?.transactions?.length > 0 ? (
              wallet.transactions.map((tx: any) => {
                const isIncoming = ['DEPOSIT', 'TRANSFER_IN'].includes(tx.type);
                
                return (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={
                        "h-12 w-12 rounded-full flex items-center justify-center " +
                        (isIncoming ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")
                      }>
                        {isIncoming ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{tx.description || tx.type}</p>
                        <p className="text-sm text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={
                      "font-bold " + 
                      (isIncoming ? "text-emerald-600" : "text-slate-900")
                    }>
                      {isIncoming ? "+" : "-"}${tx.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-slate-300" />
                </div>
                <p>No transactions yet.</p>
                <p className="text-sm mt-1">Add funds to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
