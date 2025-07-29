"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { joinRoom } from "@/lib/socket-client";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/store";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { roomId, setRoomId } = useStore(); 
  const [userId] = useState<string>("user" + Math.floor(Math.random() * 1000));
  const [error, setError] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    setError("");
    setIsJoining(true);

    // Add timeout for server response
    const timeout = setTimeout(() => {
      setIsJoining(false);
      setError("Connection timeout. Please try again.");
    }, 5000);

    joinRoom(
      roomId,
      userId,
      // Success callback
      () => {
        clearTimeout(timeout);
        setIsJoining(false);
        router.push(`/editor`);
      },
      // Error callback
      (errorMessage: string) => {
        clearTimeout(timeout);
        setIsJoining(false);
        setError(errorMessage);
      },
      false // isCreating = false (joining existing room)
    );
  };

  return (
    <nav className="fixed top-4 md:left-1/2 md:transform md:-translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[800px] mx-4 ">
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl" />

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-400" />
            <span className="text-sm font-bold text-white">CodeSync</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <Link
              href="#features"
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              Features
            </Link>

            <Dialog
              onOpenChange={(open) => {
                if (open) {
                  setError("");
                  setIsJoining(false);
                }
              }}
            >
              <DialogTrigger
                asChild
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <button>Join Room</button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleJoinRoom();
                      }
                    }}
                  />
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                      {error}
                    </div>
                  )}
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining}
                    className="w-full"
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Link
              href="#how-it-works"
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              How it Works
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-1 text-sm">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md rounded-lg mt-2 border border-white/20">
              <Link
                href="#features"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <div className="pt-4 pb-2 border-t border-white/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
