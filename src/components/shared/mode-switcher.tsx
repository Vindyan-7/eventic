"use client";

import { useRouter } from "next/navigation";
import { useAppModeStore } from "@/store/app-mode";
import { Button } from "@/components/ui/button";

interface Props {
  isOrganizer: boolean;
}

export function ModeSwitcher({
  isOrganizer,
}: Props) {
  const router = useRouter();

  const { mode, setMode } =
    useAppModeStore();

  if (!isOrganizer) {
    return null;
  }

  function switchToPersonal() {
    setMode("personal");

    router.push("/dashboard");
  }

  function switchToOrganization() {
    setMode("organization");

    router.push("/org");
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border p-1">
      <Button
        size="sm"
        variant={
          mode === "personal"
            ? "default"
            : "ghost"
        }
        onClick={switchToPersonal}
      >
        Personal
      </Button>

      <Button
        size="sm"
        variant={
          mode === "organization"
            ? "default"
            : "ghost"
        }
        onClick={switchToOrganization}
      >
        Organization
      </Button>
    </div>
  );
}