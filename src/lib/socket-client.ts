import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (
  roomId: string,
  userId: string,
  onSuccess?: () => void,
  onError?: (message: string) => void,
  isCreating: boolean = false
) => {
  const socketInstance = getSocket();

  // Listen for room join response
  socketInstance.once("room-joined", () => {
    console.log(`Successfully joined room ${roomId}`);
    onSuccess?.();
  });

  socketInstance.once("room-not-available", (message: string) => {
    console.log(`Room ${roomId} is not available: ${message}`);
    onError?.(message);
  });

  socketInstance.emit("join-room", { roomId, userId, isCreating });
};

export const checkRoomExists = (
  roomId: string,
  onExists?: () => void,
  onNotExists?: () => void
) => {
  const socketInstance = getSocket();

  // Listen for room existence response
  socketInstance.once("room-exists", () => {
    console.log(`Room ${roomId} exists`);
    onExists?.();
  });

  socketInstance.once("room-not-exists", () => {
    console.log(`Room ${roomId} does not exist`);
    onNotExists?.();
  });

  socketInstance.emit("check-room", { roomId });
};
