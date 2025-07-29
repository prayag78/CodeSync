"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/store";
import { getSocket } from "@/lib/socket-client";
import { joinRoom, checkRoomExists } from "@/lib/socket-client";

export function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setRoomId: setStoreRoomId } = useStore();
  const [userId] = useState<string>("user" + Math.floor(Math.random() * 1000));

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      console.log(`Attempting to join room: ${roomId}`);

      const socket = getSocket();

      // Check if socket is connected
      if (!socket.connected) {
        console.log("Socket not connected, waiting for connection...");
        setError("Connecting to server... Please try again in a moment.");
        setIsJoining(false);
        return;
      }

      // First check if the room exists
      checkRoomExists(
        roomId,
        // Room exists callback
        () => {
          console.log(`Room ${roomId} exists, attempting to join...`);
          // Room exists, try to join
          const timeout = setTimeout(() => {
            setIsJoining(false);
            setError("Connection timeout. Please try again.");
          }, 5000);

          joinRoom(
            roomId,
            userId,
            () => {
              console.log(`Successfully joined room ${roomId}`);
              clearTimeout(timeout);
              setIsJoining(false);
              setStoreRoomId(roomId);
              router.push(`/editor`);
            },
            (errorMessage: string) => {
              console.log(`Failed to join room ${roomId}: ${errorMessage}`);
              clearTimeout(timeout);
              setIsJoining(false);
              setError(errorMessage);
            },
            false // isCreating = false
          );
        },
        // Room doesn't exist callback
        () => {
          console.log(`Room ${roomId} does not exist`);
          setIsJoining(false);
          setError("Room does not exist. Please check the room ID.");
        }
      );
    } catch (error) {
      console.error("Failed to join room:", error);
      setIsJoining(false);
      setError("Failed to join room. Please try again.");
    }
  };

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    return () => {
      // Don't disconnect when component unmounts if user is in a room
      // disconnectSocket();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleJoinRoom();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleJoinRoom} disabled={isJoining}>
          {isJoining ? "Joining..." : "Join Room"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
