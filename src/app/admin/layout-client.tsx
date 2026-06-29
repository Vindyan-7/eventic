"use client";

import { useState } from "react";
import { AdminUser } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminNavbar } from "@/components/admin/navbar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Props {
  admin: AdminUser;
  children: React.ReactNode;
}

export function AdminLayoutClient({ admin, children }: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
          <AdminSidebar role={admin.role} />
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300">
            <div className="relative w-64 flex flex-col bg-neutral-950 border-r border-neutral-900 animate-in slide-in-from-left duration-250">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-400 hover:text-white"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AdminSidebar role={admin.role} onNavigate={() => setMobileSidebarOpen(false)} className="border-r-0 h-full" />
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar admin={admin} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
