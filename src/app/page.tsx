'use client'

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const Page = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [userId] = useState<string>("user" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
    });

    newSocket.on("receive-message", (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on("language-changed", (lang: string) => {
      setLanguage(lang);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (socket && roomId) {
      socket.emit("join-room", { roomId, userId });
      setJoinedRoom(roomId);
      setRoomId("");
    }
  };

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
      setMessages(prev => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center h-screen gap-4 text-gray-700"
    >
      <h1 className="text-xl font-bold">Room Chat</h1>

      {!joinedRoom && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="p-2 border"
          />
          <button
            type="button"
            onClick={joinRoom}
            className="ml-2 bg-blue-500 p-2"
          >
            Join
          </button>
        </div>
      )}

      {joinedRoom && (
        <>
          <div>Room: <b>{joinedRoom}</b> | User: <b>{userId}</b></div>

          <div>
            <label className="mr-2">Language:</label>
            <select value={language} onChange={handleLanguageChange} className="p-2 border">
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 border"
            />
            <button type="submit" className="ml-2 bg-green-500 p-2 text-sm text-gray-700">
              Send
            </button>
          </div>

          <div className="border p-4 w-1/2 h-1/2 overflow-y-auto text-sm text-gray-700">
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        </>
      )}
    </form>
  );
};

export default Page;
