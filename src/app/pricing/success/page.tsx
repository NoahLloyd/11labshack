"use client";

import { BookOpen, CheckCircle, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

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
              <div className="flex items-center gap-2">
                <SignedOut>
                  <Link
                    href="/pricing"
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
                  >
                    Get started
                  </Link>
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

      {/* Success Content */}
      <div className="pt-28 pb-24 px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="h-8 bg-gray-200 rounded-lg mb-4 w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Pro Member
              </div>

              <h1 className="text-3xl font-bold mb-4">
                Welcome to Saga Pro! 🎉
              </h1>

              <p className="text-gray-600 mb-8">
                Your subscription is now active. You have unlimited access to
                all stories, premium voices, and advanced features.
              </p>

              <div className="space-y-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-violet-700 transition-all w-full"
                >
                  Start Exploring Stories
                </Link>

                <p className="text-sm text-gray-500">
                  Need help? Contact us at support@saga.com
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
            <div className="h-8 bg-gray-200 rounded-lg mb-4 w-48" />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
