"use client";

import React, { createContext, useContext } from "react";
import { WorkspaceDetails, WorkspacePermission } from "@/lib/workspace-auth";

interface WorkspaceContextProps extends WorkspaceDetails {
  activeWorkspaces: Array<{
    id: string;
    name: string;
    slug: string;
    is_owner: boolean;
  }>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | null>(null);

export function WorkspaceProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: WorkspaceContextProps;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
