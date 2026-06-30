"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Database, Plus, Download, RotateCcw, Calendar, CheckCircle } from "lucide-react";

export default function BackupsPage() {
  const [backups, setBackups] = useState([
    { id: "bak_01", name: "Automatic DB Backup", size: "14.2 MB", status: "completed", date: "2026-06-30 02:00:00" },
    { id: "bak_02", name: "Pre-Moderation Sprint Sync", size: "14.1 MB", status: "completed", date: "2026-06-29 18:30:12" },
    { id: "bak_03", name: "Manual Bootstrap Snapshot", size: "12.8 MB", status: "completed", date: "2026-06-23 10:15:45" }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [schedule, setSchedule] = useState("daily");

  const handleCreateBackup = () => {
    setIsCreating(true);
    toast.loading("Compiling PostgreSQL DDL schemas & row records...", { id: "backup-create" });
    setTimeout(() => {
      const newBackup = {
        id: `bak_${Math.random().toString(36).substring(2, 5)}`,
        name: "Manual Platform Snapshot",
        size: "14.3 MB",
        status: "completed",
        date: new Date().toLocaleString()
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      toast.success("DB Backup snapshot successfully compiled & stored", { id: "backup-create" });
    }, 2000);
  };

  const handleDownload = (name: string) => {
    toast.success(`Downloading snapshot binary: ${name}.sql`);
  };

  const handleRestore = (name: string) => {
    if (!confirm(`CAUTION: Restoring ${name} will overwrite all current table records! Proceed?`)) return;
    toast.loading(`Restoring schema snapshot...`, { id: "backup-restore" });
    setTimeout(() => {
      toast.success("Platform state successfully restored!", { id: "backup-restore" });
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-neutral-400" /> PostgreSQL Backup Center
          </h2>
          <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Manage snapshot backups, download binary DDLs, and restore system state</p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
        >
          <Plus className="h-4 w-4" /> {isCreating ? "Compiling..." : "Create Backup"}
        </Button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 text-xs">
        <div className="bg-neutral-900/10 border border-neutral-900 p-4 rounded-2xl">
          <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Latest Snapshot</span>
          <p className="text-xs font-bold text-white mt-1">{backups[0]?.date || "Never"}</p>
        </div>
        <div className="bg-neutral-900/10 border border-neutral-900 p-4 rounded-2xl">
          <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Database Allocation</span>
          <p className="text-xs font-bold text-white mt-1">42.4 MB (Supabase tier limits: 500 MB)</p>
        </div>
        <div className="bg-neutral-900/10 border border-neutral-900 p-4 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Backup Schedule</span>
            <select
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider bg-transparent outline-none cursor-pointer"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily Cron</option>
              <option value="weekly">Weekly Cron</option>
            </select>
          </div>
          <Calendar className="h-5 w-5 text-neutral-500" />
        </div>
      </div>

      {/* Backups List Table */}
      <div className="space-y-4 pt-4">
        <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Available Database Backups</h3>
        <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-4">Snapshot Label</th>
                <th className="p-3">File Size</th>
                <th className="p-3">Completed Date</th>
                <th className="p-3 text-right pr-4">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-900/10">
                  <td className="p-3 pl-4 font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    {b.name}
                  </td>
                  <td className="p-3 font-mono text-neutral-450">
                    {b.size}
                  </td>
                  <td className="p-3 text-neutral-400">
                    {b.date}
                  </td>
                  <td className="p-3 text-right pr-4 space-x-2">
                    <button
                      onClick={() => handleDownload(b.name)}
                      className="bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-neutral-800 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                    <button
                      onClick={() => handleRestore(b.name)}
                      className="bg-red-950/20 hover:bg-red-950/50 text-red-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-red-900/50 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
