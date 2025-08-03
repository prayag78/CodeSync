import { joinRoom, checkRoomExists } from "@/lib/socket-client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

export async function joinRoomLogic({
  roomId,
  userId,
  setRoomId,
  router,
}: {
  roomId: string;
  userId: string;
  setRoomId: (id: string) => void;
  router: AppRouterInstance;
}) {
  try {
    //console.log(`Attempting to join room with ID: ${roomId}`);
    setRoomId(roomId);

    // First check if the room exists
    return new Promise((resolve, reject) => {
      checkRoomExists(
        roomId,
        // Room exists - proceed to join
        () => {
          //console.log(`Room ${roomId} exists, joining...`);

          const timeout = setTimeout(() => {
            toast.error("Connection timeout. Please try again.");
            reject(new Error("Connection timeout"));
          }, 5000);

          joinRoom(
            roomId,
            userId,
            () => {
              //console.log(`Successfully joined room ${roomId}`);
              clearTimeout(timeout);
              router.push(`/editor`);
              resolve(true);
            },
            (errorMessage: string) => {
              console.error(`Failed to join room ${roomId}: ${errorMessage}`);
              clearTimeout(timeout);
              toast.error(errorMessage);
              reject(new Error(errorMessage));
            },
            false // isCreating = false (joining existing room)
          );
        },
        // Room doesn't exist
        () => {
          //console.log(`Room ${roomId} does not exist`);
          toast.error("Room does not exist. Please check the room ID.");
          reject(new Error("Room does not exist"));
        }
      );
    });
  } catch (err) {
    console.error("Error in joinRoomLogic:", err);
    toast.error("Failed to join room.");
    throw err;
  }
}
