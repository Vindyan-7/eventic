import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode =
  | "personal"
  | "organization";

interface AppModeStore {
  mode: AppMode;

  setMode: (
    mode: AppMode
  ) => void;
}

export const useAppModeStore =
  create<AppModeStore>()(
    persist(
      (set) => ({
        mode: "personal",

        setMode: (mode) =>
          set({
            mode,
          }),
      }),
      {
        name: "eventic-app-mode",
      }
    )
  );