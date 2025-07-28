import { create } from "zustand";

interface Store {
  roomId: string;
  setRoomId: (roomId: string) => void;
}

export const useStore = create<Store>((set) => ({
  roomId: "",
  setRoomId: (roomId: string) => set({ roomId }),
}));
