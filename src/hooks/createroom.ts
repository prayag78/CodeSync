// create-room.ts
import { joinRoom } from "@/lib/socket-client";
import { createRoom } from "@/actions/user";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

export async function createRoomLogic({
  userId,
  setRoomId,
  router,
}: {
  userId: string;
  setRoomId: (id: string) => void;
  router: AppRouterInstance;
}) {
  try {
    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 15);
    console.log(`Creating room with ID: ${roomId}`);
    setRoomId(roomId);

    const timeout = setTimeout(() => {
      toast.error("Connection timeout. Please try again.");
    }, 5000);

    const room = await createRoom(roomId, userId);
    if (!room) {
      toast.error("Failed to create room in database.");
      return;
    }

    joinRoom(
      roomId,
      userId,
      () => {
        console.log(`Successfully created and joined room ${roomId}`);
        clearTimeout(timeout);
        toast.success(`Successfully created room ${roomId}`);
        router.push(`/editor`);
      },
      (errorMessage: string) => {
        console.error(`Failed to create room ${roomId}: ${errorMessage}`);
        clearTimeout(timeout);
        toast.error(errorMessage);
      },
      true // isCreating = true (creating new room)
    );
  } catch (err) {
    console.error("Error in createRoomLogic:", err);
    toast.error("Failed to create room.");
  }
}
