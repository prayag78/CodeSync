"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/store";
import { disconnectSocket, getSocket } from "@/lib/socket-client";
import { joinRoom } from "@/lib/socket-client";

export function CreateRoom() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { setRoomId } = useStore();
  const [userId] = useState<string>("user" + Math.floor(Math.random() * 1000));
  // const [joinedRoom, setJoinedRoom] = useState<string>("");

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Generate a random room ID
      const roomId = Math.random().toString(36).substring(2, 15);
      setRoomId(roomId);

      // Add timeout for server response
      const timeout = setTimeout(() => {
        setIsCreating(false);
        console.error("Connection timeout. Please try again.");
      }, 5000);

      joinRoom(
        roomId,
        userId,
        () => {
          clearTimeout(timeout);
          setIsCreating(false);
          router.push(`/editor/${roomId}`);
        },
        // Error callback
        (errorMessage: string) => {
          clearTimeout(timeout);
          setIsCreating(false);
          console.error("Failed to create room:", errorMessage);
        },
        true // isCreating = true
      );
    } catch (error) {
      console.error("Failed to create room:", error);
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <Button onClick={handleCreateRoom}>
      {isCreating ? "Creating..." : "Create Room"}
    </Button>
  );
}
