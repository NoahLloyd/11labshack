"use client";

import { BookOpen, Check, Sparkles, Mic, Star, Crown } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Saga",
    features: [
      "Access to 2 classic stories",
      "Basic voice interactions",
      "3 story sessions per day",
      "Standard AI narrator voice",
      "Basic learning activities",
    ],
    cta: "Get Started",
    popular: false,
    priceId: null,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "Unlock the full Saga experience",
    features: [
      "Access to ALL stories",
      "Unlimited voice interactions",
      "Unlimited story sessions",
      "Premium AI narrator voices",
      "Advanced learning activities",
      "Progress tracking & reports",
      "Create your own stories",
      "Early access to new tales",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro_monthly",
  },
];

export default function PricingPage() {
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) {
      window.location.href = "/";
      return;
    }

    if (!isSignedIn) {
      return;
    }

    setLoading(priceId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          userEmail: user?.emailAddresses[0]?.emailAddress,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Checkout error:", error);
        alert("Something went wrong. Please try again.");
        return;
      }

      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-sm">
            <div className="px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold">Saga</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/#library"
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Library
                </Link>
                <Link
                  href="/pricing"
                  className="px-3 py-1.5 text-sm text-gray-900 bg-gray-100 rounded-lg font-medium"
                >
                  Pricing
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
                      Get started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready. All plans include
            access to our voice-powered storytelling experience.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl border-2 ${
                  plan.popular
                    ? "border-violet-500 shadow-xl shadow-violet-100"
                    : "border-gray-200"
                } p-8 transition-all hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.popular ? "bg-violet-100" : "bg-gray-100"
                      }`}
                    >
                      {plan.popular ? (
                        <Star className="w-5 h-5 text-violet-600 fill-current" />
                      ) : (
                        <Mic className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-gray-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular
                            ? "bg-violet-100 text-violet-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <SignedOut>
                  <SignUpButton mode="modal">
                    <button
                      className={`w-full py-4 rounded-full font-semibold transition-all ${
                        plan.popular
                          ? "bg-violet-600 text-white hover:bg-violet-700"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <button
                    onClick={() => handleCheckout(plan.priceId)}
                    disabled={loading === plan.priceId}
                    className={`w-full py-4 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {loading === plan.priceId ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </SignedIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.",
              },
              {
                q: "Is there a free trial?",
                a: "Our Free plan lets you try Saga with limited features. Upgrade to Pro when you're ready for the full experience.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through our secure payment partner, Stripe.",
              },
              {
                q: "Can I switch plans?",
                a: "Absolutely! You can upgrade to Pro at any time, or downgrade back to Free when your billing period ends.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">Saga</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Saga. Voice-powered stories for curious kids.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
