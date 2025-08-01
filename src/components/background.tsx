"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { CreateRoom } from "./create-room-form";

// Animated Moving Lines Component
function AnimatedLines({
  cyanParticles,
  blueParticles,
}: {
  cyanParticles?: number;
  blueParticles?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(cyanParticles)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full glow-cyan-soft animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
        {[...Array(blueParticles)].map((_, i) => (
          <div
            key={`blue-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full glow-blue-soft animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedLinesClientOnly({ cyanParticles, blueParticles }: { cyanParticles: number; blueParticles: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AnimatedLines cyanParticles={cyanParticles} blueParticles={blueParticles} />;
}

export function GridBackground() {
  return (
    <div className="relative flex h-[50rem] w-full items-center justify-center bg-black overflow-hidden px-4">
      {/* Grid Background */}
      <div
        className={cn(
          "absolute inset-0 z-0 ml-9",
          "[background-size:101px_100px]",
          "[background-image:linear-gradient(to_right,#262626_1.5px,transparent_1.5px),linear-gradient(to_bottom,#262626_1.5px,transparent_1.5px)]"
        )}  
      />

      {/* Animated Moving Lines */}
      <AnimatedLinesClientOnly cyanParticles={25} blueParticles={25} />

      {/* Radial Gradient Mask */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />

      {/* Content */}
      <div className="ml-5 relative z-20 text-center max-w-2xl">
        {/* Subheading */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="inline-block rounded-full bg-green-600/20 text-green-400 text-sm font-medium px-3 py-1">
            New
          </span>
          <span className="text-neutral-400 text-sm">
            Collaborative coding made simple
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-2xl md:text-7xl font-semibold text-white mb-4 leading-tight">
          Code Together, <span className="text-blue-400">In Real-Time</span>
        </h1>

        {/* Description */}
        <p className="text-neutral-400 mb-6 text-sm sm:text-base">
          Create collaborative coding sessions with audio, video, and text chat.
          Run code in multiple languages and share your work instantly.
        </p>

        {/* Call to action form */}
        <div className="flex justify-center">
          <CreateRoom />
        </div>
      </div>
    </div>
  );
}
