import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
      // Add connection options to prevent premature disconnections
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
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

  // Remove existing listeners to prevent duplicates
  socketInstance.off("room-joined");
  socketInstance.off("room-not-available");

  // Listen for room join response
  socketInstance.on("room-joined", () => {
    console.log(`Successfully joined room ${roomId}`);
    onSuccess?.();
  });

  socketInstance.on("room-not-available", (message: string) => {
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

  // Remove existing listeners to prevent duplicates
  socketInstance.off("room-exists");
  socketInstance.off("room-not-exists");

  // Listen for room existence response
  socketInstance.on("room-exists", () => {
    console.log(`Room ${roomId} exists`);
    onExists?.();
  });

  socketInstance.on("room-not-exists", () => {
    console.log(`Room ${roomId} does not exist`);
    onNotExists?.();
  });

  // Ensure socket is connected before checking room
  if (socketInstance.connected) {
    socketInstance.emit("check-room", { roomId });
  } else {
    socketInstance.on("connect", () => {
      console.log("Socket connected, checking room existence...");
      socketInstance.emit("check-room", { roomId });
    });
  }
};

// export const changeLanguage = (language: string, roomId: string) => {
//   const socketInstance = getSocket();
//   socketInstance.on("language-changed", (language: string) => {
//     console.log(`Language changed to ${language}`);
//   });
//   socketInstance.emit("change-language", { language, roomId });
// };

// Additional utility function to check room status via HTTP endpoint
export const checkRoomStatus = async (roomId: string) => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"
      }/api/rooms/${roomId}`
    );
    const data = await response.json();
    console.log("Room status:", data);
    return data;
  } catch (error) {
    console.error("Error checking room status:", error);
    return null;
  }
};

// WebRTC Signaling Functions
export const sendCallRequest = (roomId: string, fromUserId: string) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-request", { roomId, fromUserId });
};

export const sendCallAccept = (roomId: string, fromUserId: string) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-accept", { roomId, fromUserId });
};

export const sendCallReject = (roomId: string, fromUserId: string) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-reject", { roomId, fromUserId });
};

export const sendCallEnd = (roomId: string, fromUserId: string) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-end", { roomId, fromUserId });
};

export const sendCallOffer = (
  roomId: string,
  offer: RTCSessionDescriptionInit,
  fromUserId: string
) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-offer", { roomId, offer, fromUserId });
};

export const sendCallAnswer = (
  roomId: string,
  answer: RTCSessionDescriptionInit,
  fromUserId: string
) => {
  const socketInstance = getSocket();
  socketInstance.emit("call-answer", { roomId, answer, fromUserId });
};

export const sendIceCandidate = (
  roomId: string,
  candidate: RTCIceCandidateInit,
  fromUserId: string
) => {
  const socketInstance = getSocket();
  socketInstance.emit("ice-candidate", { roomId, candidate, fromUserId });
};
