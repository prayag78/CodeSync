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
  setCurrentUser: (user: User) => void;
  participants: User[];
  setParticipants: (participants: User[]) => void;
  addParticipant: (participant: User) => void;
  removeParticipant: (participantId: string) => void;
}

export const useStore = create<Store>((set) => ({
  roomId: "",
  setRoomId: (roomId: string) => set({ roomId }),
  currentUser: {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: "Anonymous User",
    color: "bg-blue-500",
  },
  setCurrentUser: (user: User) => set({ currentUser: user }),
  participants: [],
  setParticipants: (participants: User[]) => set({ participants }),
  addParticipant: (participant: User) =>
    set((state) => ({
      participants: [
        ...state.participants.filter((p) => p.id !== participant.id),
        participant,
      ],
    })),
  removeParticipant: (participantId: string) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),
  clearParticipants: () => set({ participants: [] }),
}));
