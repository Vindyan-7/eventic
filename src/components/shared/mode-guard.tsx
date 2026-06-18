"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppModeStore } from "@/store/app-mode";

interface Props {
  isOrganizer: boolean;
}

export function ModeGuard({
  isOrganizer,
}: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const { mode } =
    useAppModeStore();

  useEffect(() => {
    if (!isOrganizer) return;

    const isOrgRoute =
      pathname.startsWith("/org");

    const isDashboardRoute =
      pathname.startsWith("/dashboard");

    if (
      mode === "organization" &&
      isDashboardRoute
    ) {
      router.replace("/org");
    }

    if (
      mode === "personal" &&
      isOrgRoute
    ) {
      router.replace("/dashboard");
    }
  }, [
    mode,
    pathname,
    router,
    isOrganizer,
  ]);

  return null;
}