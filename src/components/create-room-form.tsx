"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/store";
import { getSocket } from "@/lib/socket-client";
import { useUser } from "@clerk/nextjs";
import { createRoomLogic } from "@/hooks/createroom";
import { toast } from "sonner";

export function CreateRoom() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { setRoomId } = useStore();
  const { user } = useUser();

  const handleCreateRoom = async () => {
    if (!user?.id) {
      toast("User not authenticated");
      return;
    }

    setIsCreating(true);
    try {
      await createRoomLogic({
        userId: user.id,
        setRoomId,
        router,
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
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
    <button
      onClick={handleCreateRoom}
      disabled={isCreating}
      className="relative inline-block overflow-hidden rounded-md px-4 py-2 font-semibold text-gray-100  hover:text-gray-900 text-sm uppercase tracking-wider transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Base background */}
      <span className="absolute inset-0 bg-gray-900 rounded-full -z-20" />

      {/* Hover overlay */}
      <span className="absolute inset-0 w-0 bg-gray-100 rounded-full transition-all duration-300 group-hover:w-full -z-10" />

      {/* Text */}
      <span className="relative z-10">
        {isCreating ? "Creating..." : "Create Room"}
      </span>
    </button>
  );
}
