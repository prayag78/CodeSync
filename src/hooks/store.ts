import { create } from "zustand";

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

interface Store {
  roomId: string;
  setRoomId: (roomId: string) => void;
  currentUser: User;
  participants: User[];
  addParticipant: (participant: User) => void;
}

export const useStore = create<Store>((set) => ({
  roomId: "",
  setRoomId: (roomId: string) => set({ roomId }),
  currentUser: {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: "Anonymous User",
    color: "bg-blue-500",
  },
  participants: [],
  addParticipant: (participant: User) =>
    set((state) => ({
      participants: [
        ...state.participants.filter((p) => p.id !== participant.id),
        participant,
      ],
    })),
}));
