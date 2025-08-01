"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/store";
import { getSocket } from "@/lib/socket-client";
import { useUser } from "@clerk/nextjs";
import { joinRoomLogic } from "@/hooks/joinroom";
import { toast } from "sonner";
import { Input } from "./ui/input";

export function JoinRoom() {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const { roomId, setRoomId } = useStore();
  const { user } = useUser();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
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
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleJoinRoom();
        }}
        className="w-full"
      />
      <Button onClick={handleJoinRoom} className="w-full" disabled={isJoining}>
        {isJoining ? "Joining..." : "Join Room"}
      </Button>
    </div>
  );
}
