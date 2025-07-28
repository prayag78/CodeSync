"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { CreateRoom } from "./create-room-form";

export function GridBackground() {
  return (
    <div className="relative flex h-[50rem] w-full items-center justify-center bg-black overflow-hidden px-4">
      {/* Grid Background */}
      <div
        className={cn(
          "absolute inset-0 z-0",
          "[background-size:55px_55px]",
          "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

      {/* Radial Gradient Mask */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" />

      {/* Content */}
      <div className="relative z-20 text-center max-w-2xl">
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
