"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminUser } from "@/lib/admin/auth";
import { adminSignOut } from "@/app/admin/login/actions";
import {
  Bell,
  Search,
  LogOut,
  Menu,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "./ui";

interface NavbarProps {
  admin: AdminUser;
  onOpenMobileSidebar: () => void;
}

export function AdminNavbar({ admin, onOpenMobileSidebar }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Create simple breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  async function handleLogout() {
    const res = await adminSignOut();
    if (res.success) {
      router.replace(res.redirectTo);
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-neutral-950 border-b border-neutral-900 h-16 flex items-center justify-between px-6 font-sans">
      <div className="flex items-center gap-4">
        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-neutral-400 hover:text-white"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <span>Admin</span>
          {pathSegments.slice(1).map((seg, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-neutral-600" />
              <span className={idx === pathSegments.length - 2 ? "text-white" : ""}>
                {seg.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Placeholder */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search console..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            disabled
          />
        </div>

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white relative" disabled>
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-white rounded-full" />
        </Button>

        <div className="h-6 w-px bg-neutral-800" />

        {/* User Info & Role */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block leading-none mb-1">
              {admin.full_name || admin.email?.split("@")[0]}
            </span>
            <AdminBadge role={admin.role} className="text-[9px] px-1.5 py-px" />
          </div>

          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 text-white font-extrabold text-xs">
            {admin.email?.charAt(0).toUpperCase()}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-red-400 cursor-pointer"
            title="Log Out Console"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
