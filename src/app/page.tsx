"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GridBackground } from "@/components/background";
import { Navbar } from "@/components/navbar";
import { Users, Zap, Globe, Play, Lock, Code, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateRoomForm } from "@/components/create-room-form";
import { cn } from "@/lib/utils";

const Page = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [userId] = useState<string>("user" + Math.floor(Math.random() * 1000));

  // useEffect(() => {
  //   const newSocket = io("http://localhost:8000");
  //   setSocket(newSocket);

  //   newSocket.on("connect", () => {
  //     console.log("Connected:", newSocket.id);
  //   });

  //   newSocket.on("receive-message", (msg: string) => {
  //     setMessages((prev) => [...prev, msg]);
  //   });

  //   newSocket.on("language-changed", (lang: string) => {
  //     setLanguage(lang);
  //   });

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  // const joinRoom = () => {
  //   if (socket && roomId) {
  //     socket.emit("join-room", { roomId, userId });
  //     setJoinedRoom(roomId);
  //     setRoomId("");
  //   }
  // };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socket && joinedRoom) {
      socket.emit("change-language", { roomId: joinedRoom, language: newLang });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && joinedRoom) {
      socket.emit("send-message", { roomId: joinedRoom, message });
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    // <form
    //   onSubmit={handleSubmit}
    //   className="flex flex-col items-center justify-center h-screen gap-4 text-gray-700"
    // >
    //   <h1 className="text-xl font-bold">Room Chat</h1>

    //   {!joinedRoom && (
    //     <div className="flex items-center gap-2">
    //       <input
    //         type="text"
    //         placeholder="Room ID"
    //         value={roomId}
    //         onChange={(e) => setRoomId(e.target.value)}
    //         className="p-2 border"
    //       />
    //       <button
    //         type="button"
    //         onClick={joinRoom}
    //         className="ml-2 bg-blue-500 p-2"
    //       >
    //         Join
    //       </button>
    //     </div>
    //   )}

    //   {joinedRoom && (
    //     <>
    //       <div>Room: <b>{joinedRoom}</b> | User: <b>{userId}</b></div>

    //       <div>
    //         <label className="mr-2">Language:</label>
    //         <select value={language} onChange={handleLanguageChange} className="p-2 border">
    //           <option value="c">C</option>
    //           <option value="cpp">C++</option>
    //           <option value="javascript">JavaScript</option>
    //           <option value="typescript">TypeScript</option>
    //         </select>
    //       </div>

    //       <div>
    //         <input
    //           type="text"
    //           placeholder="Message"
    //           value={message}
    //           onChange={(e) => setMessage(e.target.value)}
    //           className="p-2 border"
    //         />
    //         <button type="submit" className="ml-2 bg-green-500 p-2 text-sm text-gray-700">
    //           Send
    //         </button>
    //       </div>

    //       <div className="border p-4 w-1/2 h-1/2 overflow-y-auto text-sm text-gray-700">
    //         {messages.map((msg, i) => (
    //           <div key={i}>{msg}</div>
    //         ))}
    //       </div>
    //     </>
    //   )}
    // </form>
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
              <div className="p-3 mb-4 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Collaboration</h3>
              <p className="mt-2 text-muted-foreground">
                Code together with multiple users in real-time with operational
                transforms for conflict-free editing.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center rounded-xl transition-all hover:shadow-md bg-gray-800 text-gray-100">
              <div className="p-3 mb-4 rounded-full bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Multiple Languages</h3>
              <p className="mt-2 text-muted-foreground">
                Support for JavaScript, Python, Java, C++, and more with syntax
                highlighting and intelligent code completion.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 text-center rounded-xl transition-all hover:shadow-md bg-gray-800 text-gray-100">
              <div className="p-3 mb-4 rounded-full bg-primary/10">
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
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background">
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
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background">
                <h3 className="mb-2 text-xl font-bold">Invite Collaborators</h3>
                <p className="text-muted-foreground">
                  Share your room ID with teammates to start collaborating
                  instantly.
                </p>
              </div>
            </div>
            <div className="flex relative flex-col items-center text-center">
              <div className="flex absolute top-0 left-1/2 justify-center items-center w-10 h-10 text-xl font-bold rounded-full -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                3
              </div>
              <div className="p-6 pt-10 rounded-xl border shadow-sm bg-background">
                <h3 className="mb-2 text-xl font-bold">Code Together</h3>
                <p className="text-muted-foreground">
                  Write, run, and debug code in real-time with your team using
                  our powerful editor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
