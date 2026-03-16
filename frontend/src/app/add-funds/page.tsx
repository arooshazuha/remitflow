"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import Link from "next/link";
import { ArrowLeft, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe (Replace with a real publishable key if testing beyond locally mock workflows without real stripe keys)
// For this demo where we only simulate stripe or rely on basic test keys
const MOCK_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = MOCK_STRIPE_PUBLISHABLE_KEY.startsWith('pk_') ? loadStripe(MOCK_STRIPE_PUBLISHABLE_KEY) : null;

function CheckoutForm({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required' 
    });

    if (submitError) {
      setError(submitError.message || "An unexpected error occurred.");
      setLoading(false);
    } else {
      // Payment simulated successfully without redirect
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
           <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      <button 
        disabled={!stripe || loading} 
        className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>
    </form>
  );
}

export default function AddFunds() {
  const { token, kycStatus, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    // Wait for context to load
  }, [isAuthenticated, router]);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kycStatus !== 'APPROVED') {
      router.push('/kyc');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setClientSecret(data.clientSecret);
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
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
               <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Funds</h2>
              <p className="text-slate-500">Deposit money securely</p>
            </div>
          </div>

          {!clientSecret ? (
            <form onSubmit={handleCreateIntent} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border-l-4 border-red-500">
                  {error}
                </div>
              )}
              {kycStatus !== 'APPROVED' && (
                 <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-sm flex items-start gap-4 mb-4">
                 <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                 <div>
                   <p className="font-semibold mb-1">Identity Verification Required</p>
                   <p className="mb-2">You need to complete KYC before adding funds.</p>
                   <Link href="/kyc" className="px-4 py-2 bg-amber-200 text-amber-900 rounded-lg text-xs font-bold inline-block hover:bg-amber-300">Verify Now</Link>
                 </div>
               </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    className="pl-8 block w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-lg font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || kycStatus !== 'APPROVED'}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? "Preparing Express Checkout..." : "Continue to Payment"}
              </button>
            </form>
          ) : success ? (
            <div className="text-center py-12 animate-in zoom-in duration-500">
               <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="h-12 w-12 text-emerald-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Deposit Successful!</h3>
               <p className="text-slate-500 mb-8 text-lg">Your funds are being added to your wallet.</p>
               <Link href="/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                 Return to Dashboard
               </Link>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-slate-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-slate-200">
                 <span className="text-slate-500">Amount to deposit:</span>
                 <span className="text-xl font-bold">${parseFloat(amount).toFixed(2)}</span>
               </div>
               
               {clientSecret.startsWith('pi_mock_secret_') ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-sm flex items-start gap-4 mb-4">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Demo Mode Active</p>
                        <p>No valid Stripe keys were detected. Proceeding with a simulated payout.</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                         // Mocking a successful webhook ping locally
                         try {
                           await fetch(`${API_URL}/api/wallet/mock-deposit`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ amount: parseFloat(amount) })
                           });
                         } catch (e) {}
                         setSuccess(true);
                      }}
                      className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl shadow hover:bg-blue-700 transition-all"
                    >
                      Simulate Payment
                    </button>
                  </div>
               ) : (
                 <Elements options={{ clientSecret }} stripe={stripePromise}>
                   <CheckoutForm clientSecret={clientSecret} onSuccess={() => setSuccess(true)} />
                 </Elements>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
