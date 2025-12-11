"use client";

import { BookOpen, Sparkles, Plus, Play, Clock, Star, Mic } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const stories = [
  {
    id: "red-riding-hood",
    title: "Little Red Riding Hood",
    author: "Classic Tale",
    cover: "from-red-500 to-rose-700",
    accent: "bg-red-500",
    duration: "15-20 min",
    age: "4-8",
    featured: true,
    description:
      "A brave girl, a cunning wolf, and a grandmother who needs saving. Make choices that change the story.",
  },
  {
    id: "three-pigs",
    title: "The Three Little Pigs",
    author: "Classic Tale",
    cover: "from-amber-500 to-orange-600",
    accent: "bg-amber-500",
    duration: "12-15 min",
    age: "3-7",
    featured: false,
    description:
      "Build houses, outsmart the wolf, and learn what it takes to stay safe.",
  },
  {
    id: "jack-beanstalk",
    title: "Jack and the Beanstalk",
    author: "Classic Tale",
    cover: "from-emerald-500 to-green-700",
    accent: "bg-emerald-500",
    duration: "18-22 min",
    age: "5-9",
    featured: false,
    description:
      "Climb the magical beanstalk and discover what treasures await in the clouds.",
  },
  {
    id: "goldilocks",
    title: "Goldilocks",
    author: "Classic Tale",
    cover: "from-yellow-400 to-amber-500",
    accent: "bg-yellow-500",
    duration: "10-15 min",
    age: "3-6",
    featured: false,
    description: "Explore the bears' house and find out what's just right.",
  },
  {
    id: "hansel-gretel",
    title: "Hansel & Gretel",
    author: "Classic Tale",
    cover: "from-violet-500 to-purple-700",
    accent: "bg-violet-500",
    duration: "20-25 min",
    age: "6-10",
    featured: false,
    description:
      "Navigate the enchanted forest and escape the witch's candy house.",
  },
];

export default function Home() {
  const featuredStory = stories.find((s) => s.featured);
  const otherStories = stories.filter((s) => !s.featured);

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F6F1]/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              StoryPlay
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#library"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Library
            </a>
            <a
              href="#create"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Create
            </a>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
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
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-violet-600" />
            <span className="text-sm font-medium text-violet-600">
              Voice-powered interactive stories
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-xl">
            Classic tales reimagined as interactive voice experiences. Pick a
            story and start talking.
          </p>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Book Cover */}
                <div
                  className={`bg-gradient-to-br ${featuredStory.cover} p-12 flex items-center justify-center min-h-[400px] relative overflow-hidden`}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-8 w-32 h-32 border-4 border-white rounded-full" />
                    <div className="absolute bottom-12 right-12 w-24 h-24 border-4 border-white rotate-45" />
                  </div>
                  <div className="text-center text-white relative z-10">
                    <div className="w-32 h-44 bg-white/20 backdrop-blur-sm rounded-lg mx-auto mb-6 flex items-center justify-center border-2 border-white/30 shadow-2xl">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      {featuredStory.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {featuredStory.author}
                    </p>
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-10 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6 w-fit">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Featured Story
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {featuredStory.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {featuredStory.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredStory.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Ages {featuredStory.age}
                      </span>
                    </div>
                  </div>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all group w-fit">
                        <Play className="w-5 h-5" />
                        Start this story
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/story/red-riding-hood"
                      className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all group w-fit"
                    >
                      <Play className="w-5 h-5" />
                      Start this story
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Story Library */}
      <section id="library" className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Story Library</h2>
            <span className="text-sm text-gray-500">
              {stories.length} stories available
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherStories.map((story) => (
              <div
                key={story.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
              >
                {/* Book Cover */}
                <div
                  className={`bg-gradient-to-br ${story.cover} p-6 h-48 flex items-center justify-center relative`}
                >
                  <div className="w-20 h-28 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-105 transition-transform">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {story.age} yrs
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-5">
                  <h3 className="font-semibold mb-1 group-hover:text-violet-600 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{story.author}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {story.duration}
                  </div>
                </div>
              </div>
            ))}

            {/* Create Your Own Card */}
            <div
              id="create"
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden hover:border-violet-400 hover:from-violet-50 hover:to-fuchsia-50 transition-all cursor-pointer"
            >
              <div className="h-full flex flex-col items-center justify-center p-6 text-center min-h-[320px]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md group-hover:bg-violet-100 transition-all">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-violet-600 transition-colors" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-violet-600 transition-colors">
                  Create Your Own
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Design a custom story with your own characters and adventures
                </p>
                <div className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-4 h-4" />
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - compact */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-10 md:p-14 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How it works</h2>
              <p className="text-gray-400">
                Start your adventure in three simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                {
                  num: "1",
                  title: "Pick a story",
                  desc: "Choose from our library of interactive tales",
                },
                {
                  num: "2",
                  title: "Start talking",
                  desc: "Use your voice to make choices and guide the adventure",
                },
                {
                  num: "3",
                  title: "Shape the story",
                  desc: "Every choice leads to new paths and endings",
                },
              ].map((step) => (
                <div key={step.num}>
                  <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.num}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-md flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">StoryPlay</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 StoryPlay. Voice-powered stories for curious kids.
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
