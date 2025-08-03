"use client";

import React from "react";
import { GridBackground } from "@/components/background";
import { Navbar } from "@/components/navbar";
import { Users, Zap, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JoinRoom } from "@/components/join-room-form";
import { CreateRoomTabs } from "@/components/create-room-tabs";

const Page = () => {
  return (
    <div className="flex flex-col">
      <Navbar />

      {/* Hero */}
      <GridBackground />

      {/* Features */}
      <div
        id="features"
        className="z-10 py-20 flex flex-col items-center justify-center"
      >
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl text-gray-700 font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Powerful Features for Developers
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Everything you need to collaborate on code in real-time
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center p-6 text-center rounded-xl transition-all hover:shadow-md bg-gray-800 text-gray-100">
              <div className="p-3 mb-4 rounded-full bg-gray-100 hover:bg-gray-400 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Collaboration</h3>
              <p className="mt-2 text-muted-foreground">
                Code together with multiple users in real-time with operational
                transforms for conflict-free editing.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center rounded-xl transition-all hover:shadow-md bg-gray-800 text-gray-100">
              <div className="p-3 mb-4 rounded-full bg-gray-100 hover:bg-gray-400 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Multiple Languages</h3>
              <p className="mt-2 text-muted-foreground">
                Support for JavaScript, Python, Java, C++, and more with syntax
                highlighting and intelligent code completion.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center rounded-xl transition-all hover:shadow-md bg-gray-800 text-gray-100">
              <div className="p-3 mb-4 rounded-full bg-gray-100 hover:bg-gray-400 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Audio & Video Chat</h3>
              <p className="mt-2 text-muted-foreground">
                Connect with teammates via integrated WebRTC audio and video
                chat for seamless communication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*How it Works*/}
      <div
        id="how-it-works"
        className="z-10 py-20 flex flex-col items-center justify-center"
      >
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl text-gray-700 font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex relative flex-col items-center text-center">
              <div className="flex absolute top-0 left-1/2 justify-center items-center w-10 h-10 text-xl font-bold rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                1
              </div>
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background h-[170px]">
                <h3 className="mb-2 text-xl font-bold">Create a Room</h3>
                <p className="text-muted-foreground">
                  Set up a new coding session with your preferred permissions
                  and settings.
                </p>
              </div>
            </div>
            <div className="flex relative flex-col items-center text-center">
              <div className="flex absolute top-0 left-1/2 justify-center items-center w-10 h-10 text-xl font-bold rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                2
              </div>
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background h-[170px] ">
                <h3 className="mb-2 text-xl font-bold">Invite Collaborators</h3>
                <p className="text-muted-foreground">
                Share your room ID with a teammate to start coding together instantly.
                </p>
              </div>
            </div>
            <div className="flex relative flex-col items-center text-center">
              <div className="flex absolute top-0 left-1/2 justify-center items-center w-10 h-10 text-xl font-bold rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                3
              </div>
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background h-[170px]">
                <h3 className="mb-2 text-xl font-bold">Code Together</h3>
                <p className="text-muted-foreground">
                  Pair up and code in real-time — write, run, and share code
                  instantly in a private 2-person room.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Creation/Joining Section */}
      <div className="z-10 py-20 flex flex-col items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl text-gray-700 font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Start Coding Together
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Create a new room or join an existing one to start collaborating
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">
                      Create a New Room
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Create a new coding session and invite others to join
                    </p>
                    <CreateRoomTabs />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="join" className="mt-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">
                      Join Existing Room
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Enter a room ID to join an existing coding session
                    </p>
                    <JoinRoom />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
