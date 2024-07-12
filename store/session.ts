import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSessionStore = create(
  persist(
    (set, get) => ({
      session: undefined,
      setSession: (data) => {
        console.log(data);
        set({ session: data });
      },
    }),
    {
      name: "session",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
