"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useStore } from "@/hooks/store";
import {
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { syncUser } from "@/actions/user";
import { joinRoomLogic } from "@/hooks/joinroom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { roomId, setRoomId } = useStore();
  const [isJoining, setIsJoining] = useState(false);
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isSignedIn) {
      syncUser();
    }
  }, [isSignedIn]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast("Please enter a room ID");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in.");
      return;
    }

    setIsJoining(true);

    try {
      await joinRoomLogic({
        roomId,
        userId: user.id,
        setRoomId,
        router,
      });
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <nav className="fixed top-4 md:left-1/2 md:transform md:-translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[800px] mx-4 ">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl" />

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/icon0.svg"
              alt="CodeSync Logo"
              width={180}
              height={200}
              className="mb-1"
            />  
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 text-sm absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="#features"
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              Features
            </Link>

            <Dialog>
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
                      if (e.key === "Enter") handleJoinRoom();
                    }}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    className="w-full"
                    disabled={isJoining}
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
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default">Sign In</Button>
              </SignInButton>
            </SignedOut>

            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
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
          <div className="md:hidden pb-3">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-md rounded-lg mt-2 border border-white/20">
              <Link
                href="#features"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Dialog>
                <DialogTrigger
                  asChild
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <button className="ml-2 p-1">Join Room</button>
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
                        if (e.key === "Enter") handleJoinRoom();
                      }}
                    />
                    <Button
                      onClick={handleJoinRoom}
                      className="w-full"
                      disabled={isJoining}
                    >
                      {isJoining ? "Joining..." : "Join Room"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <div className="pt-4 pb-2 border-t border-white/20">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="default" className="mr-1">
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button variant="default">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="ml-3">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
